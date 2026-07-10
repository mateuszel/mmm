# Subscriptions

Create and manage recurring billing through the Payment Form. Products and pricing are configured in Solidgate Hub; the Payment Form handles the initial payment and card tokenization.

---

## Overview

1. **Create a product** in Solidgate Hub (Settings → Products) — define name, price, billing cycle
2. **Include `product_id`** in your payment intent when initializing the form
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

## Payment Intent for Subscriptions

For subscriptions, **omit `amount` and `currency`** — they come from the product's price configured in Hub. Including them when they conflict with the product price will cause the request to be declined.

```json
{
  "order_id": "sub-init-001",
  "order_description": "Monthly Pro Plan",
  "product_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "product_price_id": "f7g8h9i0-abcd-1234-ef56-7890abcdef12",
  "customer_account_id": "cust-456",
  "customer_email": "john@example.com",
  "ip_address": "8.8.8.8"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_id` | string | Yes (or `product_price_id`) | Product UUID from Solidgate Hub |
| `product_price_id` | string | Yes (or `product_id`) | Price UUID from Solidgate Hub |
| `customer_account_id` | string | Yes | Merchant's customer identifier |
| `customer_email` | string | Recommended | Email for subscription notifications |
| `payment_type` | string | Auto | `"recurring"` is auto-determined from `product_id`. Set explicitly only if you need to override. |

The form renders as normal — after successful payment, Solidgate creates the subscription and stores the card token for future billing.

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

When subscription status changes, you receive a `subscription.updated.v2` webhook.

```json
{
  "callback_type": "order_update",
  "subscription": {
    "id": "83b19018-cbc4-4df0-899a-dda84fd2705e",
    "status": "active",
    "started_at": "2026-04-01 10:30:00",
    "updated_at": "2026-04-15 10:30:00",
    "expired_at": "2027-04-01 10:30:00",
    "next_charge_at": "2026-05-01 10:30:00",
    "payment_type": "card",
    "trial": false
  },
  "product": {
    "product_id": "a51ba9fd-3be1-4ef9-b00f-bb85157597f5",
    "name": "Premium plan",
    "amount": 999,
    "currency": "USD",
    "trial": false
  },
  "customer": {
    "customer_account_id": "cust-456",
    "customer_email": "john@example.com"
  },
  "invoices": {
    "<invoice_id>": {
      "id": "...",
      "status": "success",
      "amount": 999,
      "orders": { "<order_id>": { "...": "..." } }
    }
  }
}
```

Verified enums:
- `subscription.status`: `pending`, `active`, `cancelled`, `redemption`, `paused`, `expired`
- `subscription.payment_type`: `card`, `paypal-vault`, `mercadopago`, `upi`, `pix`, `gcash`, `alipay`, `mbway`, `wechatpay`
- `invoice.status`: `processing`, `retry`, `success`, `fail`
- `callback_type`: only value documented is `order_update`

---

## Subscription Management API

Base URL: `https://subscriptions.solidgate.com/api/v1`

> Note: subscription endpoints are served from a *different* host than `pay.solidgate.com`. Mismatching the base URL with the endpoint path triggers a WAF block.

Authentication: same HMAC-SHA512 signature as payment API (see [authentication.md](authentication.md)).

### Available Operations

Verified from `api-docs.solidgate.com`. Most endpoints use **POST** and put `subscription_id` in the request body (not the URL). Pause-schedule operations are the exception — they're RESTful with `subscription_id` in the path.

All paths are relative to `https://subscriptions.solidgate.com/api/v1`.

| Operation | Method | Path | Body |
|-----------|--------|------|------|
| Cancel subscription | POST | `/subscription/cancel` | `{ subscription_id, force?, cancel_code? }` |
| Cancel all subscriptions for a customer | POST | `/subscription/cancel-by-customer` | `{ customer_account_id, force?, cancel_code? }` |
| Restore cancelled subscription | POST | `/subscription/restore` | `{ subscription_id, expired_at?, discount? }` |
| Update subscription | POST | `/subscription/update` | `{ subscription_id, ... }` |
| Update payment token | POST | `/subscription/update-token` | `{ subscription_id, ... }` |
| Switch product | POST | `/subscription/switch-subscription-product` | `{ subscription_id, product_id, ... }` |
| Get subscription status | POST | `/subscription/status` | `{ subscription_id }` |
| Retrieve subscriptions for a customer | POST | `/subscription/list` | `{ customer_account_id }` |
| Retrieve subscriptions (search/filter) | POST | `/subscriptions` | filter object |
| List invoices for a subscription | POST | `/subscription/invoice/list` | `{ subscription_id }` |
| Create pause schedule | POST | `/subscriptions/{subscription_id}/pause-schedule` | `{ pause_at, resume_at? }` |
| Update pause schedule | PATCH | `/subscriptions/{subscription_id}/pause-schedule` | `{ pause_at?, resume_at? }` |
| Resume (delete pause schedule) | DELETE | `/subscriptions/{subscription_id}/pause-schedule` | — |

### Cancel Subscription Example (curl)

```bash
PUBLIC_KEY="api_pk_..."
SECRET_KEY="api_sk_..."
BODY='{"subscription_id":"83b19018-cbc4-4df0-899a-dda84fd2705e","force":true}'

# Solidgate signature: base64(hex(HMAC-SHA512(secret, pk + body + pk)))
HMAC_HEX=$(printf '%s' "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" \
  | openssl dgst -sha512 -hmac "$SECRET_KEY" \
  | awk '{print $NF}')
SIGNATURE=$(printf '%s' "$HMAC_HEX" | base64)

curl -X POST "https://subscriptions.solidgate.com/api/v1/subscription/cancel" \
  -H "merchant: $PUBLIC_KEY" \
  -H "signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

> The signature is `base64(hex(HMAC-SHA512(secret, pk + body + pk)))` — hex-then-base64 (see [authentication.md](authentication.md)). Two `printf '%s'` calls (instead of `echo -n`) avoid shell-specific newline behavior; `awk '{print $NF}'` strips OpenSSL's `(stdin)= ` prefix without including a trailing newline that would corrupt the base64 output.

---

## Cancellation Reason Codes

When a subscription is cancelled, the webhook body includes `cancel_code` and `cancel_message` fields with the reason. These codes are 8.xx (verified enum from upstream — distinct from API error codes).

| Code | Reason | Type |
|------|--------|------|
| `8.01` | Card brand is not supported | Automatic |
| `8.02` | Fraud chargeback received | Automatic |
| `8.03` | Dispute received (e.g. PayPal) | Automatic |
| `8.04` | Fraud alert received | Automatic |
| `8.05` | Fraud decline received | Automatic |
| `8.06` | Cancellation by support | Manual |
| `8.07` | Recurring payment blocked by anti-fraud | Automatic |
| `8.08` | Subscription has expired | Automatic |
| `8.09` | Cancellation after redemption period (all retries failed) | Automatic |
| `8.10` | Card token has expired | Automatic |
| `8.11` | Token revoked by customer | Manual |
| `8.12` | Bank anti-fraud system blocked payment | Automatic |
| `8.13` | Invalid amount (e.g. discount made it invalid) | Automatic |
| `8.14` | Cancellation by customer | Manual |
| `8.15` | Recurring token not found | Automatic |

For UX: surface `cancel_message` to support / customer-facing tooling. For branching: use `cancel_code`. `8.09`, `8.10`, `8.15` indicate the subscription needs the customer to update their payment method.

---

## Smart Retry

When a recurring payment fails, Solidgate automatically retries with configurable logic:

- Up to **3 sequential retry attempts** per failed payment
- Retry schedule is configurable in Hub
- Subscription enters `redemption` status during retries
- After all retries fail, subscription moves to `cancelled` or `expired`

---

## Trial Periods

Conceptual trial type → SDK `payment_action` mapping (enum: `auth_0_amount`, `auth_void`, `auth_settle`):

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
