# Solidgate H2H — Quick Start

Step-by-step guide: get API keys, make a charge, check status, handle webhooks, refund.

**Note:** H2H integration requires PCI DSS certification. If you don't have it, use the [Payment Form](../solidgate-payment-form/SKILL.md) instead.

---

## 1. Get API Keys

1. Sign up at [Solidgate Hub](https://hub.solidgate.com/)
2. Navigate to **Settings → API Keys**
3. Copy your keys and store in environment variables:

```bash
export SOLIDGATE_PUBLIC_KEY="api_pk_7b197..."
export SOLIDGATE_SECRET_KEY="api_sk_a1b2c..."
export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
```

---

## 2. Make a Charge

```bash
PUBLIC_KEY="$SOLIDGATE_PUBLIC_KEY"
SECRET_KEY="$SOLIDGATE_SECRET_KEY"

BODY='{
  "amount": 1020,
  "currency": "USD",
  "card_number": "4067429974719265",
  "card_exp_month": "12",
  "card_exp_year": "2030",
  "card_cvv": "123",
  "card_holder": "John Doe",
  "order_id": "order-001",
  "order_description": "Test payment",
  "customer_email": "john@example.com",
  "customer_account_id": "cust-001",
  "ip_address": "8.8.8.8",
  "platform": "WEB"
}'

SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://pay.solidgate.com/api/v1/charge" \
  -H "merchant: $PUBLIC_KEY" \
  -H "signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

**Response:**
```json
{
  "order": {
    "order_id": "order-001",
    "amount": 1020,
    "currency": "USD",
    "status": "settle_ok"
  },
  "transaction": {
    "id": "trx-001",
    "operation": "settle",
    "status": "success",
    "amount": 1020,
    "currency": "USD",
    "card_token": {
      "token": "tok_abc123..."
    }
  }
}
```

**Key fields:**
| Field | Description |
|-------|-------------|
| `order.status` | `settle_ok` = payment captured, `3ds_verify` = need 3DS redirect, `auth_failed` = declined |
| `transaction.card_token.token` | Recurring token for future charges (store securely) |
| `error` | Error object (present if payment failed) |

> Full field reference: [charges.md](charges.md)

---

## 3. Handle 3DS (If Required)

If the response has `order.status = "3ds_verify"`, redirect the customer to `verify_url`:

```json
{
  "order": {
    "order_id": "order-001",
    "status": "3ds_verify"
  },
  "verify_url": "https://acs.bank.com/3ds?id=..."
}
```

After 3DS verification, the final result arrives via webhook.

---

## 4. Check Status

```bash
BODY='{"order_id":"order-001"}'
SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://pay.solidgate.com/api/v1/status" \
  -H "merchant: $PUBLIC_KEY" \
  -H "signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

> Full reference: [order-management.md](order-management.md)

---

## 5. Handle Webhooks

After payment, Solidgate POSTs to your webhook URL with the order status.

### Verify the signature:

```javascript
const crypto = require("crypto");

app.post("/webhook", express.raw({ type: "*/*" }), (req, res) => {
  const rawBody = req.body.toString("utf-8");
  const signature = req.headers["signature"];
  const whPublicKey = process.env.SOLIDGATE_WEBHOOK_PUBLIC_KEY;
  const whSecretKey = process.env.SOLIDGATE_WEBHOOK_SECRET_KEY;

  const data = whPublicKey + rawBody + whPublicKey;
  const hmacHex = crypto.createHmac("sha512", whSecretKey).update(data).digest("hex");
  const expected = Buffer.from(hmacHex).toString("base64");

  // Use timing-safe comparison
  if (expected.length !== signature.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(rawBody);
  const status = event.order?.status;

  if (status === "settle_ok") {
    // Payment captured — fulfill the order
    // Recurring token: event.transaction?.card_token?.token
  } else if (status === "auth_failed") {
    // Payment failed — check event.error for details
    // User-friendly message: event.error?.recommended_message_for_user
  }

  res.status(200).send("OK");
});
```

> Full reference: [webhooks.md](webhooks.md)

---

## 6. Refund

`amount` is **required** — specify the exact amount to refund in cents:

```bash
BODY='{"order_id":"order-001","amount":1020}'
SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://pay.solidgate.com/api/v1/refund" \
  -H "merchant: $PUBLIC_KEY" \
  -H "signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

For partial refund, set `amount` to a value less than the original (e.g., `"amount": 500` for $5.00).

> Full reference: [order-management.md](order-management.md)

---

## 7. Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4067429974719265` | Successful payment (no 3DS) |
| `4553815318053315` | Auth failed |
| `5151948477715326` | Insufficient funds (code 3.04) |
| `497592770594980` | 3DS Challenge flow |

Expiry: any future date. CVV: any 3 digits.

> Full test card list: [testing.md](testing.md)

---

## Ready-to-Run Examples

| Language | File | Run |
|----------|------|-----|
| Node.js | [examples/nodejs/server.js](examples/nodejs/server.js) | `npm install express && node server.js` |
| Python | [examples/python/server.py](examples/python/server.py) | `pip install flask requests && python server.py` |
| Go | [examples/go/main.go](examples/go/main.go) | `go run main.go` |
| PHP | [examples/php/server.php](examples/php/server.php) | `php -S localhost:3000 server.php` |
