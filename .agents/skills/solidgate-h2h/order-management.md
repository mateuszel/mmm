# Order Management

Refund, void, settle, increment, check status, and retrieve ARN codes for existing orders.

---

## POST /api/v1/refund

Refund a settled payment (full or partial).

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `order_id` | string | Yes | Order ID to refund | `"order-12345"` |
| `amount` | integer | Yes | Refund amount in cents (minimum 1) | `500` |
| `refund_reason_code` | string | No | Reason code for the refund (for categorization) | `"customer_request"` |

### Response 200

```json
{
  "order": {
    "order_id": "order-12345",
    "amount": 1020,
    "refunded_amount": 500,
    "currency": "USD",
    "status": "partial_refunded"
  },
  "transaction": {
    "id": "trx-003",
    "operation": "refund",
    "status": "success",
    "amount": 500,
    "currency": "USD",
    "created_at": "2024-01-15 12:00:00",
    "updated_at": "2024-01-15 12:00:05"
  },
  "transactions": {
    "trx-003": {
      "id": "trx-003",
      "operation": "refund",
      "status": "success",
      "amount": 500,
      "currency": "USD"
    }
  }
}
```

### curl

```bash
BODY='{"order_id":"order-12345","amount":500}'
SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://pay.solidgate.com/api/v1/refund" \
  -H "merchant: $PUBLIC_KEY" \
  -H "signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

### Notes

- `amount` is **required** — specify the exact refund amount in cents
- For a full refund, set `amount` equal to the original settled amount
- Multiple partial refunds are allowed until the full amount is refunded
- Refund can only be performed on settled orders (`settle_ok`)

---

## POST /api/v1/void

Cancel an authorized (unsettled) payment. Releases the hold on the customer's card.

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `order_id` | string | Yes | Order ID to void | `"order-12345"` |

### Response 200

```json
{
  "order": {
    "order_id": "order-12345",
    "amount": 1020,
    "currency": "USD",
    "status": "void_ok"
  },
  "transaction": {
    "id": "trx-003",
    "operation": "void",
    "status": "success",
    "amount": 1020,
    "currency": "USD"
  }
}
```

### Notes

- Can only void orders with status `auth_ok` (authorized but not yet settled)
- After voiding, the hold is released and the order cannot be settled

---

## POST /api/v1/settle

Capture authorized funds. Used when `type=auth` was specified during charge.

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `order_id` | string | Yes | Order ID to settle | `"order-12345"` |
| `amount` | integer | Yes | Settle amount in cents (minimum 1) | `800` |

### Response 200

```json
{
  "order": {
    "order_id": "order-12345",
    "amount": 1020,
    "currency": "USD",
    "status": "partial_settled"
  },
  "transaction": {
    "id": "trx-003",
    "operation": "settle",
    "status": "success",
    "amount": 800,
    "currency": "USD"
  }
}
```

### Notes

- `amount` is **required** — specify the exact amount to capture in cents
- For a full settle, set `amount` equal to the authorized amount
- Partial settle: specify `amount` less than the authorized amount
- Can only settle orders with status `auth_ok`
- Partial settlement closes the remaining authorized amount

---

## POST /api/v1/increment

Add to an existing authorization amount (incremental authorization). Useful for hotel/rental scenarios where the final amount is unknown at the time of initial authorization.

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `order_id` | string | Yes | Order ID to increment | `"order-12345"` |
| `amount` | integer | Yes | Additional amount in cents to add (minimum 1) | `500` |

### Response 200

**Note:** This endpoint returns `IncrementAuthResponse`, not the standard `SpOrderStatusResponse`.

```json
{
  "transaction": {
    "id": "trx-004",
    "status": "success",
    "amount": 500,
    "currency": "USD"
  }
}
```

### Notes

- The response only contains a `transaction` object (no `order` wrapper)
- The `amount` is the **increment** to add, not the new total
- Can only increment orders with status `auth_ok`
- The issuer may decline an increment if it exceeds the cardholder's available credit

---

## POST /api/v1/status

Check the current status of an order. Use as a fallback when webhook is missed.

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `order_id` | string | Yes | Order ID to check | `"order-12345"` |

### Response 200

```json
{
  "order": {
    "order_id": "order-12345",
    "amount": 1020,
    "currency": "USD",
    "status": "settle_ok",
    "marketing_amount": 1020,
    "marketing_currency": "USD",
    "processing_amount": 1020,
    "processing_currency": "USD",
    "descriptor": "MERCHANT*ORDER",
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
      "card_type": "CREDIT",
      "country": "USA",
      "bank": "Chase"
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
      "amount": 1020,
      "currency": "USD"
    },
    "trx-002": {
      "id": "trx-002",
      "operation": "settle",
      "status": "success",
      "amount": 1020,
      "currency": "USD"
    }
  },
  "three_ds": {
    "eci": "05",
    "flow": "frictionless"
  }
}
```

**Note:** `transactions` is a **map** (keyed by transaction ID), not an array.

---

## POST /api/v1/arn-code

Retrieve Acquirer Reference Numbers (ARN) for a settled order. ARN is used for chargeback disputes and reconciliation.

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `order_id` | string | Yes | Order ID | `"order-12345"` |

### Response 200

**Note:** This endpoint returns `ArnCodesResponse`, not the standard `SpOrderStatusResponse`.

```json
{
  "arn_codes": [
    {
      "amount_refunded": 0,
      "arn_code": "74012345678901234567890",
      "currency": "USD",
      "transaction_status": "success",
      "sp_transaction_id": "trx-002",
      "created_at": "2024-01-15 10:30:05"
    }
  ]
}
```

---

## Operation Summary

| Operation | Endpoint | From Status | To Status |
|-----------|----------|-------------|-----------|
| Charge (sale) | `POST /api/v1/charge` | — | `settle_ok` or `3ds_verify` or `auth_failed` |
| Charge (auth) | `POST /api/v1/charge` (type=auth) | — | `auth_ok` or `3ds_verify` or `auth_failed` |
| Increment | `POST /api/v1/increment` | `auth_ok` | `auth_ok` (with increased amount) |
| Settle | `POST /api/v1/settle` | `auth_ok` | `settle_ok` or `partial_settled` |
| Void | `POST /api/v1/void` | `auth_ok` | `void_ok` |
| Refund | `POST /api/v1/refund` | `settle_ok` | `refunded` or `partial_refunded` |
