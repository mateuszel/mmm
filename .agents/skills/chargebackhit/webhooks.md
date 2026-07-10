# Webhooks

ChargebackHit sends POST requests to your webhook URL when alerts are triggered. This is the primary integration mechanism — your server receives alerts and responds with an outcome.

---

## Webhook Headers

| Header | Description |
|--------|-------------|
| `public_key` | ChargebackHit public key |
| `Signature` | HMAC-SHA512 signature of the body |
| `Content-Type` | `application/json` |

## Signature Verification

```
expected = base64(hex(HMAC-SHA512(secret_key, public_key + raw_json_body + public_key)))
```

**Critical:** Use the raw JSON body exactly as received — do NOT re-serialize.

---

## Webhook Body (SchemaWebhookAlert)

```json
{
  "alert": {
    "id": "a1b2c3d4-...",
    "card_acceptor_id": "123456789012",
    "date": "2024-01-15T10:30:00Z",
    "provider": "ethoca",
    "product": "ethoca",
    "type": "init-refund",
    "outcome": "",
    "acquirer_bin": "411111",
    "amount": "49.99",
    "currency": "USD",
    "mcc": "5732",
    "descriptor": "MYSTORE*PURCHASE",
    "reason_group": "fraud",
    "reason_code": "10.4"
  },
  "transaction": {
    "transaction_merchant_id": "order-12345",
    "transaction_id": "visa-tid-abc",
    "date": "2024-01-10T08:00:00Z",
    "amount": "49.99",
    "currency": "USD",
    "type": "sale",
    "card_brand": "visa",
    "bin": "411111",
    "last_four": "1234",
    "auth_code": "A12345",
    "arn": "74012345678901234567890"
  },
  "merchant": {
    "id": "497f6eca-...",
    "internal_id": "mid_QWE12345",
    "descriptor": "mystore.com",
    "name": "[MyStore][Purchase]"
  }
}
```

---

## Alert Types & Required Responses

### `inquiry` (Prevent)

Order Insight, Consumer Clarity, or Compelling Evidence 3.0 query. **Must return detailed order + customer data.**

```json
{
  "outcome": "acknowledged",
  "order": {
    "order_id": "order-12345",
    "date": "2024-01-10T08:00:00Z",
    "amount": "49.99",
    "currency": "USD",
    "address": {
      "line1": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94105",
      "country_code": "US"
    }
  },
  "customer": {
    "customer_id": "cust-789",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+14155551234"
  },
  "transactions": [
    {
      "transaction_merchant_id": "order-12345",
      "date": "2024-01-10T08:00:00Z",
      "amount": "49.99",
      "currency": "USD",
      "type": "sale",
      "bin": "411111",
      "last_four": "1234"
    }
  ],
  "products": [
    {
      "name": "Wireless Headphones",
      "sku": "WH-001",
      "description": "Premium wireless headphones",
      "url": "https://mystore.com/products/wh-001",
      "quantity": "1"
    }
  ]
}
```

### `init-refund` (Resolve)

Ethoca/CDRN alert requesting a refund. Return outcome indicating whether you refunded.

```json
{
  "outcome": "reversed",
  "order": {
    "order_id": "order-12345",
    "refund": {
      "amount": "49.99",
      "currency": "USD"
    }
  }
}
```

### `resolved` (Resolve)

RDR auto-resolved. Acknowledge receipt.

```json
{
  "outcome": "acknowledged"
}
```

### `prevented` (Prevent)

Alert prevented at network level. Acknowledge receipt.

```json
{
  "outcome": "acknowledged"
}
```

### `fraud-notification` (Inform)

Visa TC40/SAFE fraud alert. Acknowledge and optionally investigate.

```json
{
  "outcome": "acknowledged"
}
```

### `dispute-notification` (Inform)

Dispute notification from network.

```json
{
  "outcome": "acknowledged"
}
```

---

## Outcome Codes

| Outcome | When to Use |
|---------|-------------|
| `reversed` | You refunded the transaction after receiving this alert |
| `previously-reversed` | Transaction was already refunded before the alert |
| `duplicate` | Refunded because this is a duplicate alert |
| `decline` | The original transaction was not successful |
| `not-found` | Transaction not found in your system |
| `acknowledged` | No action needed (default for informational alerts) |
| `pending` | You need more time — will update later via API |
| `shipped` | Physical goods already shipped, cannot refund |
| `error` | Processing error on your side |
| `reverse-error` | Unable to process the refund |

---

## Deferred Response (pending → update later)

If you return `"outcome": "pending"`, update the outcome later via API:

```
POST /api/v2/alerts/{alert_id}/update-outcome
```

See [alerts.md](alerts.md) for the update endpoint.

---

## Response Timing

Your webhook endpoint should respond **quickly**. If processing takes time, return `"outcome": "pending"` immediately and update via API later.
