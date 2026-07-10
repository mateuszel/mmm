# Webhooks

Solidgate sends HTTP POST requests to your `webhook_url` when order or subscription statuses change. Webhooks are the primary mechanism for tracking payment outcomes — always verify the signature before processing.

---

## Webhook Headers

| Header | Description | Example |
|--------|-------------|---------|
| `solidgate-event-id` | Unique event UUID (use for idempotency) | `"550e8400-e29b-41d4-a716-446655440000"` |
| `solidgate-event-created-at` | Event timestamp (ISO 8601) | `"2024-01-15T10:30:00Z"` |
| `solidgate-event-type` | Event classification | `"card_gate.order.updated"` |
| `merchant` | Webhook public key | `"wh_pk_..."` |
| `signature` | HMAC-SHA512 signature of the body | `"base64string..."` |

---

## Event Types

### Card Payments

| Event | Description |
|-------|-------------|
| `card_gate.order.updated` | Card order status changed (auth, settle, void, refund) |
| `card_gate.chargeback.received` | Chargeback notification received |
| `card.network_token.created` | Network token created for card |
| `card.network_token.updated` | Network token status changed |
| `card_gate.prevention_alert.received` | Chargeback risk alert (Ethoca/Verifi) |
| `card_gate.fraud_alert.received` | TC40/SAFE fraud alert |

### Alternative Payment Methods

| Event | Description |
|-------|-------------|
| `alt_gate.order.updated` | APM order status changed |
| `alt_gate.paypal_dispute.received` | PayPal dispute notification |
| `alt_gate.recurring_token.cancelled` | APM recurring token revoked |

### Subscriptions

| Event | Description |
|-------|-------------|
| `subscription.updated.v2` | Subscription status or billing changed |

### Tax

| Event | Description |
|-------|-------------|
| `taxer.tax.calculated` | Tax calculation completed |

---

## Signature Verification

### Verification checklist (MANDATORY)

Run through this list when "Invalid signature" / signature-mismatch errors appear:

1. **Use the raw body bytes** — never `JSON.parse` then `JSON.stringify`. Whitespace and key-ordering changes invalidate the signature. (Express: `express.raw({ type: "*/*" })`. Flask: `request.get_data(as_text=True)`. Go: `io.ReadAll(r.Body)` once, before any decoder.)
2. **Use the webhook keys** (`wh_pk_…` / `wh_sk_…`), NOT the API keys (`api_pk_…` / `api_sk_…`).
3. **Compute** `base64(hex(HMAC-SHA512(wh_secret, wh_public + raw_body + wh_public)))` — base64-encode the **hex string**, not the raw HMAC bytes.
4. **Compare in constant time** — `crypto.timingSafeEqual` (Node), `hmac.compare_digest` (Python), `hmac.Equal` (Go), `hash_equals` (PHP). Plain `==` / `===` leaks timing info.
5. **Verify the `merchant` header matches your `wh_pk_…`** before doing anything else — fail fast on unknown senders.

### Formula

```text
expected = base64(hex(HMAC-SHA512(wh_secret_key, wh_public_key + raw_json_body + wh_public_key)))
```

### Node.js Example

```javascript
const crypto = require("crypto");

function verifyWebhookSignature(whPublicKey, whSecretKey, rawBody, receivedSignature) {
  const data = whPublicKey + rawBody + whPublicKey;
  const hmacHex = crypto.createHmac("sha512", whSecretKey).update(data).digest("hex");
  const expected = Buffer.from(hmacHex).toString("base64");
  // Constant-time compare — guards against signature-leak timing attacks.
  if (expected.length !== receivedSignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSignature));
}

// In Express middleware:
app.post("/webhook", express.raw({ type: "*/*" }), (req, res) => {
  const rawBody = req.body.toString("utf-8");
  const signature = req.headers["signature"];
  const merchant = req.headers["merchant"];

  if (merchant !== process.env.SOLIDGATE_WEBHOOK_PUBLIC_KEY) {
    return res.status(400).send("Unknown merchant");
  }
  if (!verifyWebhookSignature(
    process.env.SOLIDGATE_WEBHOOK_PUBLIC_KEY,
    process.env.SOLIDGATE_WEBHOOK_SECRET_KEY,
    rawBody,
    signature
  )) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(rawBody);
  // Process the event...
  res.status(200).send("OK");
});
```

### Python Example

```python
import hmac
import hashlib
import base64

def verify_webhook_signature(wh_public_key, wh_secret_key, raw_body, received_signature):
    data = wh_public_key + raw_body + wh_public_key
    hmac_hex = hmac.new(
        wh_secret_key.encode("utf-8"),
        data.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()
    expected = base64.b64encode(hmac_hex.encode("utf-8")).decode("utf-8")
    return hmac.compare_digest(expected, received_signature)
```

### Go Example

```go
import (
    "crypto/hmac"
    "crypto/sha512"
    "encoding/base64"
)

func verifyWebhookSignature(whPublicKey, whSecretKey, rawBody, receivedSignature string) bool {
    data := whPublicKey + rawBody + whPublicKey
    mac := hmac.New(sha512.New, []byte(whSecretKey))
    mac.Write([]byte(data))
    hmacHex := hex.EncodeToString(mac.Sum(nil))
    expected := base64.StdEncoding.EncodeToString([]byte(hmacHex))
    return hmac.Equal([]byte(expected), []byte(receivedSignature))
}
```

### PHP Example

```php
function verifyWebhookSignature(string $whPublicKey, string $whSecretKey, string $rawBody, string $receivedSignature): bool {
    $data = $whPublicKey . $rawBody . $whPublicKey;
    $hmacHex = hash_hmac('sha512', $data, $whSecretKey); // hex by default
    $expected = base64_encode($hmacHex);
    return hash_equals($expected, $receivedSignature);
}
```

---

## Retry Schedule

If your endpoint does not respond with HTTP 2xx within **30 seconds**, Solidgate retries with exponential backoff:

| Retry | Delay After Previous |
|-------|---------------------|
| 1 | 15 minutes |
| 2 | 30 minutes |
| 3 | 1 hour |
| 4 | 2 hours |
| 5 | 4 hours |
| 6 | 8 hours |
| 7 | 16 hours |
| 8 | 24 hours |

**Total: 8 retries over ~56 hours.** After that, the webhook is dropped.

---

## Idempotency

Use the `solidgate-event-id` header to deduplicate events. The same event may be delivered more than once (e.g., if your server responded slowly). Store processed event IDs and skip duplicates:

```javascript
const processedEvents = new Set();

app.post("/webhook", express.raw({ type: "*/*" }), (req, res) => {
  const eventId = req.headers["solidgate-event-id"];

  if (processedEvents.has(eventId)) {
    return res.status(200).send("Already processed");
  }

  // ... verify signature, process event ...

  processedEvents.add(eventId);
  res.status(200).send("OK");
});
```

In production, use a persistent store (Redis, database) instead of an in-memory Set.

---

## Webhook Body Examples

Verified webhook body shape (from `api-docs.solidgate.com`):
- `order` — final order state (always present)
- `transactions` — array of transaction operations (always present)
- `error` — sibling of `order`/`transactions` when the order failed/declined (present only on failure). **Note:** decline codes (3.xx/4.xx) live here, NOT inside `order`.

For canonical schemas see [api-docs.solidgate.com](https://api-docs.solidgate.com/#tag/Card-payments/operation/webhook-card-order-status).

### card_gate.order.updated (settle_ok)

Verified field set from `SchemaCardsOrder`:

```json
{
  "order": {
    "order_id": "923bb4e6-4a5f-41ec-81fb-28eb8a152e55",
    "order_description": "Premium package",
    "amount": 1020,
    "currency": "USD",
    "refunded_amount": 0,
    "status": "settle_ok",
    "subscription_id": "83b19018-cbc4-4df0-899a-dda84fd2705e",
    "auth_code": "2w9m8",
    "payment_type": "1-click",
    "customer_email": "example@example.com",
    "descriptor": "google.com",
    "ip_address": "8.8.8.8"
  },
  "transactions": [
    {
      "id": "tx-abc-123",
      "operation": "auth",
      "status": "success",
      "amount": 1020,
      "currency": "USD",
      "created_at": "2026-04-15 10:30:00"
    }
  ]
}
```

Order `status` enum (verified): `processing`, `3ds_verify`, `refunded`, `auth_ok`, `auth_failed`, `settle_ok`, `partial_settled`, `void_ok`.

Order `payment_type` enum (verified): `1-click`, `recurring`, `retry`, `installment`, `rebill`, `moto`.

Transaction `operation` enum (verified): `auth`, `settle`, `void`, `refund`, `recurring-auth`, `resign-auth`, `apple-pay`, `google-pay`.

Transaction `status` enum (verified): `processing`, `success`, `fail`, `verify`.

### card_gate.order.updated (auth_failed with decline)

```json
{
  "order": {
    "order_id": "923bb4e6-4a5f-41ec-81fb-28eb8a152e55",
    "amount": 1020,
    "currency": "USD",
    "refunded_amount": 0,
    "status": "auth_failed",
    "customer_email": "example@example.com",
    "ip_address": "8.8.8.8"
  },
  "transactions": [
    {
      "id": "tx-abc-456",
      "operation": "auth",
      "status": "fail",
      "amount": 1020,
      "currency": "USD",
      "created_at": "2026-04-15 10:30:00",
      "updated_at": "2026-04-15 10:30:01"
    }
  ],
  "error": {
    "code": "3.08",
    "messages": ["Do not honor"],
    "recommended_message_for_user": "Advise the customer to contact their card issuer to resolve potential restrictions."
  }
}
```

### subscription.updated.v2

Verified shape from `SchemaBillingSubscriptionWebhookExtendedUpdateOrder` (top-level requires `callback_type`, `subscription`, `product`, `customer`):

```json
{
  "callback_type": "order_update",
  "subscription": {
    "id": "83b19018-cbc4-4df0-899a-dda84fd2705e",
    "status": "active",
    "started_at": "2026-04-01 10:30:00",
    "updated_at": "2026-04-15 10:30:00",
    "next_charge_at": "2026-05-01 10:30:00",
    "payment_type": "card",
    "trial": false
  },
  "product": { "...": "see API ref" },
  "customer": { "...": "see API ref" },
  "invoices": { "<invoice_id>": { "...": "see API ref" } }
}
```

Subscription `status` enum (verified): `pending`, `active`, `cancelled`, `redemption`, `paused`, `expired`.

Subscription `payment_type` enum (verified): `card`, `paypal-vault`, `mercadopago`, `upi`, `pix`, `gcash`, `alipay`, `mbway`, `wechatpay`.

---

## Best Practices

1. **Always verify the signature** before processing any webhook data
2. **Respond quickly** — do heavy processing asynchronously (queue the event, return 200 immediately)
3. **Handle idempotency** — the same event can arrive multiple times
4. **Use raw body** for signature verification — never re-serialize the JSON
5. **Don't rely solely on webhooks** — implement status polling as a fallback for reconciliation
