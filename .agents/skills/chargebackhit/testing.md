# Testing

ChargebackHit provides sandbox endpoints for generating and validating test alerts.

---

## POST /api/v2/integration/alerts/generate

Generate a sandbox alert for testing your webhook handler.

### Request

Send a mock alert payload matching `SchemaWebhookAlert` format. ChargebackHit will forward it to your registered webhook URL as if it were a real alert.

```json
{
  "alert": {
    "type": "init-refund",
    "provider": "ethoca",
    "product": "ethoca",
    "amount": "49.99",
    "currency": "USD",
    "descriptor": "MYSTORE*PURCHASE"
  },
  "transaction": {
    "transaction_merchant_id": "order-test-001",
    "amount": "49.99",
    "currency": "USD",
    "card_brand": "visa",
    "bin": "411111",
    "last_four": "1234"
  }
}
```

### Use Cases

- Test webhook endpoint connectivity
- Verify signature verification works
- Test different alert types (`inquiry`, `init-refund`, `fraud-notification`, etc.)
- Validate your outcome response format

---

## POST /api/v2/integration/alerts/validate

Validate that your outcome response format is correct before going live.

### Request

Send the response you would return from your webhook handler:

```json
{
  "outcome": "reversed",
  "order": {
    "order_id": "order-test-001",
    "amount": "49.99",
    "currency": "USD"
  }
}
```

### Response 200

Returns validation result — confirms format is correct or lists errors.

---

## Test Checklist

1. **Webhook connectivity**: Generate a test alert → verify your server receives it
2. **Signature verification**: Confirm HMAC-SHA512 check passes on test alerts
3. **inquiry response**: Test returning full order + customer + products data
4. **init-refund response**: Test returning `reversed` outcome with refund details
5. **not-found response**: Test returning `not-found` for unknown transactions
6. **pending → update**: Return `pending`, then update via `POST /api/v2/alerts/{id}/update-outcome`
7. **Validation**: Run `/integration/alerts/validate` on each response type
