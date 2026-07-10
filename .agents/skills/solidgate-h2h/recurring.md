# Recurring Payments

Token-based recurring and 1-click (resign) payments for H2H integration.

---

## Overview

After a successful initial charge, Solidgate returns a `recurring_token` in the transaction response that can be used for subsequent payments without collecting card data again.

Two endpoints:

| Endpoint | Type | CVV Required | Use Case |
|----------|------|-------------|----------|
| `POST /api/v1/recurring` | MIT (Merchant-Initiated) | No | Subscriptions, automatic rebilling |
| `POST /api/v1/resign` | CIT (Customer-Initiated) | Yes (PCI DSS) | 1-click checkout, customer is present |

---

## POST /api/v1/recurring

Charge using a saved token without CVV. The customer does NOT need to be present (Merchant-Initiated Transaction).

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `amount` | integer | Yes | Amount in cents (minimum 1) | `999` |
| `currency` | string | Yes | ISO 4217 | `"USD"` |
| `recurring_token` | string | Yes | Token from initial charge | `"tok_abc123..."` |
| `order_id` | string | Yes | Unique order ID (max 100 chars) | `"sub-billing-002"` |
| `order_description` | string | Yes | Description | `"Monthly subscription"` |
| `customer_email` | string | Yes | Customer email | `"john@example.com"` |
| `ip_address` | string | No | Customer IP (recommended) | `"8.8.8.8"` |
| `platform` | string | No | Platform | `"WEB"` |
| `payment_type` | string | No | MIT type: `recurring`, `retry`, `installment`, `rebill` | `"recurring"` |
| `scheme_transaction_id` | string | No | Network transaction ID from the original charge (for transaction linking) | `"abc123"` |
| `transaction_link_id` | string | No | Link to the original transaction | `"prev-tx-id"` |
| `retry_attempt` | integer | No | Retry attempt number (for `payment_type=retry`) | `1` |

### Response 200

```json
{
  "order": {
    "order_id": "sub-billing-002",
    "amount": 999,
    "currency": "USD",
    "status": "settle_ok",
    "payment_type": "recurring"
  },
  "transaction": {
    "id": "trx-010",
    "operation": "recurring-auth",
    "status": "success",
    "amount": 999,
    "currency": "USD",
    "card_token": {
      "token": "tok_abc123..."
    }
  },
  "transactions": {
    "trx-010": {
      "id": "trx-010",
      "operation": "recurring-auth",
      "status": "success",
      "amount": 999,
      "currency": "USD"
    }
  }
}
```

**Important:** `transactions` is a **map** (keyed by transaction ID), not an array.

### curl

```bash
BODY='{
  "amount": 999,
  "currency": "USD",
  "recurring_token": "tok_abc123...",
  "order_id": "sub-billing-002",
  "order_description": "Monthly subscription",
  "customer_email": "john@example.com",
  "payment_type": "recurring"
}'
SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://pay.solidgate.com/api/v1/recurring" \
  -H "merchant: $PUBLIC_KEY" \
  -H "signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

### Notes

- No 3DS is triggered (MIT transactions are exempt)
- `payment_type` helps card networks understand the transaction purpose
- If the token is expired or revoked, you'll get error `7.01`
- Use `scheme_transaction_id` from the original charge to improve network approval rates

---

## POST /api/v1/resign

1-click payment using a saved token + CVV. The customer IS present (Customer-Initiated Transaction). **Requires PCI DSS** because you handle the CVV.

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `amount` | integer | Yes | Amount in cents (minimum 1) | `1020` |
| `currency` | string | Yes | ISO 4217 | `"USD"` |
| `recurring_token` | string | Yes | Token from initial charge | `"tok_abc123..."` |
| `card_cvv` | string | Yes | CVV (3-4 digits, PCI DSS required) | `"123"` |
| `order_id` | string | Yes | Unique order ID (max 100 chars) | `"order-1click-001"` |
| `order_description` | string | Yes | Description | `"Quick purchase"` |
| `customer_email` | string | Yes | Customer email | `"john@example.com"` |
| `ip_address` | string | Yes | Customer IP | `"8.8.8.8"` |
| `platform` | string | No | Platform | `"WEB"` |
| `force3ds` | boolean | No | Force 3DS | `false` |

### Response 200

Same structure as `/charge` response. May return `3ds_verify` if 3DS is required.

```json
{
  "order": {
    "order_id": "order-1click-001",
    "amount": 1020,
    "currency": "USD",
    "status": "settle_ok"
  },
  "transaction": {
    "id": "trx-015",
    "operation": "resign-auth",
    "status": "success",
    "amount": 1020,
    "currency": "USD"
  }
}
```

If 3DS is triggered, `order.status` will be `"3ds_verify"` and `verify_url` will be present:

```json
{
  "order": {
    "order_id": "order-1click-001",
    "status": "3ds_verify"
  },
  "verify_url": "https://acs.bank.com/3ds?id=..."
}
```

### Notes

- Customer must be present (CIT) — this is a 1-click checkout scenario
- 3DS may be triggered depending on card/issuer requirements
- Handle `3ds_verify` the same way as in `/charge` — redirect to `verify_url` (see [charges.md](charges.md))

---

## Obtaining the Recurring Token

The `recurring_token` is returned in the **`transaction.card_token.token`** field of the webhook or status response after a successful initial charge:

```json
{
  "order": {
    "order_id": "order-12345",
    "status": "settle_ok"
  },
  "transaction": {
    "id": "trx-002",
    "operation": "settle",
    "status": "success",
    "amount": 1020,
    "currency": "USD",
    "card_token": {
      "token": "tok_abc123def456..."
    }
  }
}
```

Store this token securely for future use. The token is tied to the card and merchant.

---

## Token Lifecycle

| Event | Token Status |
|-------|-------------|
| Initial charge succeeds | Token created |
| Recurring charge succeeds | Token remains valid |
| Customer cancels subscription | Token may be revoked (depends on card network) |
| Card expires | Token may still work (network token updates) |
| Card is lost/stolen/replaced | Token invalidated by issuer |

When a token is invalidated, recurring charges will fail with error `7.01` (Token not found). You should prompt the customer to add a new card.
