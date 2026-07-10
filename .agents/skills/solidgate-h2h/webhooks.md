# Webhooks

Solidgate sends HTTP POST requests to your webhook URL when order or subscription statuses change.

---

## Webhook Headers

| Header | Description | Example |
|--------|-------------|---------|
| `solidgate-event-id` | Unique event UUID (use for idempotency) | `"550e8400-..."` |
| `solidgate-event-created-at` | Event timestamp (ISO 8601) | `"2024-01-15T10:30:00Z"` |
| `solidgate-event-type` | Event classification | `"card_gate.order.updated"` |
| `merchant` | Webhook public key | `"wh_pk_..."` |
| `signature` | HMAC-SHA512 signature | `"base64..."` |

---

## Event Types

### Card Payments

| Event | Description |
|-------|-------------|
| `card_gate.order.updated` | Card order status changed |
| `card_gate.chargeback.received` | Chargeback notification |
| `card.network_token.created` | Network token created |
| `card.network_token.updated` | Network token status changed |
| `card_gate.prevention_alert.received` | Chargeback risk alert |
| `card_gate.fraud_alert.received` | TC40/SAFE fraud alert |

### Alternative Payment Methods

| Event | Description |
|-------|-------------|
| `alt_gate.order.updated` | APM order status changed |
| `alt_gate.paypal_dispute.received` | PayPal dispute |
| `alt_gate.recurring_token.cancelled` | APM recurring token revoked |

### Subscriptions

| Event | Description |
|-------|-------------|
| `subscription.updated.v2` | Subscription status changed |

---

## Signature Verification

```
expected = base64(hex(HMAC-SHA512(wh_secret_key, wh_public_key + raw_json_body + wh_public_key)))
```

**Critical:** Use raw body bytes exactly as received — do NOT re-serialize.

**Security:** Always use **constant-time comparison** for signature verification to prevent timing attacks.

### Node.js

```javascript
const crypto = require("crypto");

function verifyWebhook(whPublicKey, whSecretKey, rawBody, receivedSignature) {
  const data = whPublicKey + rawBody + whPublicKey;
  const hmacHex = crypto.createHmac("sha512", whSecretKey).update(data).digest("hex");
  const expected = Buffer.from(hmacHex).toString("base64");
  // Use timing-safe comparison to prevent timing attacks
  if (expected.length !== receivedSignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSignature));
}
```

### Python

```python
import hmac, hashlib, base64

def verify_webhook(wh_public_key, wh_secret_key, raw_body, received_signature):
    data = wh_public_key + raw_body + wh_public_key
    hmac_hex = hmac.new(wh_secret_key.encode(), data.encode(), hashlib.sha512).hexdigest()
    expected = base64.b64encode(hmac_hex.encode()).decode()
    return hmac.compare_digest(expected, received_signature)
```

### Go

```go
func verifyWebhook(whPublicKey, whSecretKey, rawBody, receivedSignature string) bool {
    data := whPublicKey + rawBody + whPublicKey
    mac := hmac.New(sha512.New, []byte(whSecretKey))
    mac.Write([]byte(data))
    hmacHex := hex.EncodeToString(mac.Sum(nil))
    expected := base64.StdEncoding.EncodeToString([]byte(hmacHex))
    return hmac.Equal([]byte(expected), []byte(receivedSignature))
}
```

### PHP

```php
function verifyWebhook(string $whPublicKey, string $whSecretKey, string $rawBody, string $receivedSignature): bool {
    $data = $whPublicKey . $rawBody . $whPublicKey;
    $hmacHex = hash_hmac('sha512', $data, $whSecretKey);
    $expected = base64_encode($hmacHex);
    return hash_equals($expected, $receivedSignature);
}
```

### Java

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

static boolean verifyWebhook(String whPublicKey, String whSecretKey, String rawBody, String receivedSignature) {
    try {
        String data = whPublicKey + rawBody + whPublicKey;
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(whSecretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexStr = new StringBuilder();
        for (byte b : hash) hexStr.append(String.format("%02x", b));
        String expected = Base64.getEncoder().encodeToString(hexStr.toString().getBytes(StandardCharsets.UTF_8));
        // Use constant-time comparison
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), receivedSignature.getBytes(StandardCharsets.UTF_8));
    } catch (Exception e) {
        return false;
    }
}
```

### C\#

```csharp
using System.Security.Cryptography;
using System.Text;

static bool VerifyWebhook(string whPublicKey, string whSecretKey, string rawBody, string receivedSignature)
{
    var data = Encoding.UTF8.GetBytes(whPublicKey + rawBody + whPublicKey);
    using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(whSecretKey));
    var hashBytes = hmac.ComputeHash(data);
    var hexStr = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
    var expected = Convert.ToBase64String(Encoding.UTF8.GetBytes(hexStr));
    // Use constant-time comparison
    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(expected),
        Encoding.UTF8.GetBytes(receivedSignature));
}
```

---

## Retry Schedule

If your endpoint does not respond with HTTP 2xx within **30 seconds**, retries with exponential backoff:

| Retry | Delay |
|-------|-------|
| 1 | 15 min |
| 2 | 30 min |
| 3 | 1 hour |
| 4 | 2 hours |
| 5 | 4 hours |
| 6 | 8 hours |
| 7 | 16 hours |
| 8 | 24 hours |

Total: 8 retries over ~56 hours.

---

## Body Examples

The webhook body has the same structure as API responses.

### card_gate.order.updated (settle_ok)

```json
{
  "order": {
    "order_id": "order-12345",
    "amount": 1020,
    "currency": "USD",
    "status": "settle_ok",
    "refunded_amount": 0,
    "authorized_amount": 1020,
    "customer_email": "john@example.com",
    "payment_type": "1-click",
    "payment_method": "card"
  },
  "transaction": {
    "id": "trx-002",
    "operation": "settle",
    "status": "success",
    "amount": 1020,
    "currency": "USD",
    "card": {
      "bin": "406742",
      "brand": "VISA",
      "card_type": "CREDIT"
    },
    "card_token": {
      "token": "tok_abc123def456..."
    }
  },
  "transactions": {
    "trx-001": {
      "id": "trx-001",
      "operation": "auth",
      "status": "success",
      "amount": 1020
    },
    "trx-002": {
      "id": "trx-002",
      "operation": "settle",
      "status": "success",
      "amount": 1020
    }
  },
  "three_ds": {
    "eci": "05",
    "flow": "frictionless"
  },
  "order_metadata": {}
}
```

**Note:** The recurring token is at `transaction.card_token.token`.
**Note:** `transactions` is a **map** (keyed by transaction ID), not an array.

### card_gate.order.updated (auth_failed)

```json
{
  "order": {
    "order_id": "order-12345",
    "amount": 1020,
    "currency": "USD",
    "status": "auth_failed"
  },
  "error": {
    "code": "3.04",
    "messages": ["Insufficient funds"],
    "recommended_message_for_user": "The card balance has insufficient funds. Please try a different payment method."
  }
}
```

**Note:** `error.messages` is an **array** of strings. `error.recommended_message_for_user` is suitable for display to the customer.
- `error.messages` is an **array** of strings (not a single `message`)
- `error.recommended_message_for_user` contains a user-friendly message suitable for display

---

## Best Practices

1. **Verify signature** before processing — use constant-time comparison
2. **Respond quickly** (< 30s) — queue heavy processing
3. **Deduplicate** using `solidgate-event-id`
4. **Use raw body** for verification — never re-serialize
5. **Implement status polling** as a fallback
6. **Extract token from `transaction.card_token.token`** — not from `order`
7. **Check `error` at root level** for decline details
