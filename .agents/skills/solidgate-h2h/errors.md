# Error Codes

Complete list of Solidgate error codes. Use these to handle declines, display user-friendly messages, and implement retry logic.

---

## Error Response Format

Errors appear in the `error` object of the response:

```json
{
  "order": {
    "order_id": "order-12345",
    "status": "auth_failed"
  },
  "error": {
    "code": "3.04",
    "messages": ["Insufficient funds"],
    "recommended_message_for_user": "The card balance has insufficient funds. Please try a different payment method."
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `error.code` | string | Error code (see tables below) |
| `error.messages` | array | Array of error message strings |
| `error.recommended_message_for_user` | string | User-friendly message suitable for display to the customer |
| `error.merchant_advice_code` | string | Advice code for merchant action (when available) |

**Important:**
- `error.messages` is an **array**, not a single string
- Webhooks use the same response structure
- `recommended_message_for_user` provides a localized, user-friendly message — use it for customer-facing error displays

---

## 0.xx — General Decline

| Code | Description | Retry? |
|------|-------------|--------|
| `0.01` | General decline | Maybe — ask customer to try different card |
| `0.02` | Order expired | No — create a new order |
| `0.04` | Blocked by routing rules | No — check merchant configuration |

## 1.xx — Authentication / Access

| Code | Description | Retry? |
|------|-------------|--------|
| `1.01` | Authentication failed — invalid public key or signature | No — fix your signature generation |
| `1.02` | Access denied — merchant not active or endpoint not allowed | No — contact Solidgate support |

## 2.xx — Validation

| Code | Description | Retry? |
|------|-------------|--------|
| `2.01` | Invalid data — general validation error | No — fix request data |
| `2.02` | Invalid amount | No — check amount is positive integer in cents |
| `2.03` | Invalid currency | No — use ISO 4217 code |
| `2.04` | Invalid CVV | No — ask customer to re-enter |
| `2.05` | Invalid card number | No — ask customer to re-enter |
| `2.06` | Invalid card expiry | No — ask customer to re-enter |
| `2.07` | Invalid IP address | No — check IP format |
| `2.08` | Invalid 3DS flow data | No — check 3DS integration |
| `2.09` | Invalid order_id | No — check order_id format (1-100 chars) |
| `2.10` | Invalid customer email | No — fix email format |
| `2.11` | Invalid phone number | No — fix phone format |
| `2.12` | Invalid subscription data | No — check product_id and subscription fields |
| `2.13` | Invalid coupon | No — check coupon code |
| `2.14` | Invalid product_id | No — check product exists in Hub |
| `2.15` | Invalid geo_country | No — use ISO 3166-1 alpha-3 |
| `2.16` | Invalid platform | No — check platform value |
| `2.17` | Invalid card holder name | No — ask customer to re-enter |
| `2.18` | Invalid order_description | No — check description length |

## 3.xx — Issuer Declines

| Code | Description | Retry? |
|------|-------------|--------|
| `3.01` | Card blocked by issuer | No — ask customer to contact their bank |
| `3.02` | Card expired | No — ask for a different card |
| `3.03` | Limit exceeded | Maybe — try smaller amount or wait |
| `3.04` | Insufficient funds | Maybe — customer may add funds |
| `3.05` | Issuer decline (general) | Maybe — try again later |
| `3.06` | Do not honor | Maybe — ask customer to contact bank |
| `3.07` | Suspected fraud by issuer | No — ask for different card |
| `3.08` | Cancelled recurring by cardholder | No — subscription cancelled |
| `3.09` | Closed account | No — ask for different card |
| `3.10` | Restricted card | No — ask for different card |
| `3.11` | Lost card | No — ask for different card |
| `3.12` | Stolen card | No — ask for different card |
| `3.13` | Invalid PIN | No — ask customer to re-enter |

## 4.xx — Fraud / Anti-fraud

| Code | Description | Retry? |
|------|-------------|--------|
| `4.01` | Blacklisted card/customer | No |
| `4.02` | Stolen card (anti-fraud) | No |
| `4.03` | Lost card (anti-fraud) | No |
| `4.04` | Restricted card (anti-fraud) | No |
| `4.05` | PSP anti-fraud decline | No — adjust risk settings |
| `4.06` | Country blocked | No — check geo restrictions |
| `4.07` | IP blocked | No — check IP restrictions |
| `4.08` | AVS mismatch | No — verify billing address |
| `4.09` | CVV mismatch | No — ask customer to re-enter CVV |

## 5.xx — System / Configuration

| Code | Description | Retry? |
|------|-------------|--------|
| `5.01` | 3DS authentication failed | Maybe — retry without force3ds |
| `5.02` | Invalid or expired token | No — request new token |
| `5.03` | Application error | Yes — retry after delay |
| `5.04` | Merchant configuration error | No — contact Solidgate |
| `5.05` | Unsupported operation | No — check endpoint/method |
| `5.06` | Duplicate order_id | No — use unique order_id |
| `5.07` | Rate limit exceeded | Yes — retry after delay (429) |
| `5.08` | Routing error | No — check routing config |
| `5.09` | Settlement failed | No — contact Solidgate |
| `5.10` | Refund failed | Maybe — retry or contact support |
| `5.11` | Void failed | Maybe — check if order is voidable |
| `5.12` | Merchant not active | No — contact Solidgate |

## 6.xx — Connection

| Code | Description | Retry? |
|------|-------------|--------|
| `6.01` | Unknown decline | Yes — retry after delay |
| `6.02` | Connection error to processor | Yes — retry after delay |
| `6.03` | Processing issue | Yes — retry after delay |

## 7.xx — Payment System

| Code | Description | Retry? |
|------|-------------|--------|
| `7.01` | Token not found | No — token was deleted or expired |
| `7.02` | Google Pay error | No — check Google Pay integration |
| `7.03` | Cascade decline | No — all fallback routes failed |
| `7.04` | Apple Pay error | No — check Apple Pay integration |
| `7.05` | SCA engine error | Yes — retry |
| `7.06` | Network token error | No — check token status |
| `7.07` | Digital wallet processing error | Maybe — retry |

---

## Retry Recommendations

| Category | Action |
|----------|--------|
| `2.xx` (Validation) | Fix the data, do not retry with same payload |
| `3.xx` (Issuer) | Mostly non-retryable; ask customer for different card |
| `4.xx` (Fraud) | Do not retry |
| `5.03`, `5.07`, `6.xx` (Transient) | Retry with exponential backoff (max 3 attempts) |
| `7.xx` (Payment system) | Fix integration, do not blind-retry |
