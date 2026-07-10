# Subscriptions

Create and manage recurring billing via the H2H API. Products and pricing are configured in Solidgate Hub; the initial charge creates the subscription and tokenizes the card for future billing.

---

## Overview

1. **Create a product** in Solidgate Hub (Settings → Products) — define name, price, billing cycle
2. **Include `product_id`** in your H2H charge request to create a subscription
3. **Solidgate handles** recurring billing, retries, and lifecycle automatically
4. **Manage subscriptions** via API (`subscriptions.solidgate.com`) or Solidgate Hub

---

## Product Setup (Solidgate Hub)

Create products in the Hub dashboard. Each product has:

| Field | Description |
|-------|-------------|
| `product_id` | UUID v4, auto-generated |
| Name | Display name |
| Amount | Price in minor units (cents) |
| Currency | ISO 4217 |
| Billing period | `day`, `week`, `month`, `year` |
| Billing interval | Number of periods (e.g., 1 month, 3 months) |
| Trial | `none`, `free` (zero-amount auth), `paid` (one-time charge) |
| Trial duration | Period + interval for trial |

---

## H2H Charge with Subscription

Add subscription-specific fields to your `/api/v1/charge` request:

```json
{
  "amount": 999,
  "currency": "USD",
  "order_id": "sub-init-001",
  "order_description": "Monthly Pro Plan",
  "product_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "payment_type": "recurring",
  "customer_email": "john@example.com",
  "customer_account_id": "cust-001",
  "card_number": "4067429974719265",
  "card_exp_month": "12",
  "card_exp_year": "2030",
  "card_cvv": "123",
  "card_holder": "John Doe",
  "ip_address": "8.8.8.8"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_id` | string | Yes | Product UUID from Solidgate Hub (max 36 chars) |
| `payment_type` | string | Yes | Must be `"recurring"` |
| `customer_email` | string | Yes | Email for subscription notifications |
| `customer_account_id` | string | Yes | Unique customer identifier |

After a successful charge, Solidgate creates the subscription and stores the card token for future billing. The recurring token is returned in `transaction.card_token.token`.

---

## Subscription Statuses

| Status | Description |
|--------|-------------|
| `pending` | Subscription created, awaiting first payment |
| `active` | Subscription is active and billing normally |
| `paused` | Temporarily paused (can be resumed) |
| `cancelled` | Cancelled by merchant or customer |
| `redemption` | In grace period after failed payment |
| `expired` | Subscription ended (completed all cycles or not renewed) |

Lifecycle: `pending` → `active` → `paused` / `cancelled` / `redemption` / `expired`

---

## Subscription Webhook

When subscription status changes, you receive a `subscription.updated.v2` webhook:

```json
{
  "subscription": {
    "subscription_id": "sub-001",
    "product_id": "a1b2c3d4-...",
    "status": "active",
    "customer_email": "john@example.com",
    "amount": 999,
    "currency": "USD",
    "billing_period": "month",
    "next_billing_date": "2024-02-15T00:00:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## Subscription Management API

Base URL: `https://subscriptions.solidgate.com`

Authentication: same HMAC-SHA512 signature as payment API (see [authentication.md](authentication.md)).

### Available Operations

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Get subscription | GET | `/api/v1/subscriptions/{subscription_id}` |
| Update subscription | PATCH | `/api/v1/subscriptions/{subscription_id}` |
| Switch product | POST | `/api/v1/subscriptions/{subscription_id}/switch` |
| Update payment token | POST | `/api/v1/subscriptions/{subscription_id}/update-token` |
| Pause | POST | `/api/v1/subscriptions/{subscription_id}/pause` |
| Resume | POST | `/api/v1/subscriptions/{subscription_id}/resume` |
| Cancel | POST | `/api/v1/subscriptions/{subscription_id}/cancel` |
| Restore | POST | `/api/v1/subscriptions/{subscription_id}/restore` |

### Cancel Subscription Example (curl)

```bash
PUBLIC_KEY="api_pk_..."
SECRET_KEY="api_sk_..."
BODY='{"reason":"customer_request"}'
SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://subscriptions.solidgate.com/api/v1/subscriptions/sub-001/cancel" \
  -H "merchant: $PUBLIC_KEY" \
  -H "signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

---

## Smart Retry

When a recurring payment fails, Solidgate automatically retries with configurable logic:

- Up to **3 concurrent payment attempts** per subscription
- Retry schedule is configurable in Hub
- Subscription enters `redemption` status during retries
- After all retries fail, subscription moves to `cancelled` or `expired`

---

## Trial Periods

| Trial Type | Behavior |
|------------|----------|
| `none` | Full charge immediately |
| `free` | Zero-amount authorization (validates card), then charges after trial ends |
| `paid` | One-time reduced charge for trial period, then regular pricing |

---

## Supported APMs for Subscriptions

Subscriptions support these alternative payment methods:
PayPal, Alipay, GCash, MB WAY, Mercado Pago, UPI, WeChat Pay, Pix

---

## Notes

- A subscription can only be updated **once per billing period**
- Calendar billing (day-of-month alignment) is supported — configure in Hub
- Coupons and discounts can be applied via Hub or API
- Tax calculation integrates with the subscription billing
