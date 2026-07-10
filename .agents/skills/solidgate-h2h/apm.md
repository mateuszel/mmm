# Alternative Payment Methods (APM)

Accept payments via PayPal, Pix, Blik, MB WAY, Bizum, and other local payment methods through the H2H API.

---

## Supported APMs

PayPal, Pix, Blik, MB WAY, Bizum, Alipay, GCash, Mercado Pago, UPI, WeChat Pay, and more. Available methods depend on your merchant configuration in Solidgate Hub.

---

## Base URL

APM endpoints use a separate base URL:
```
https://gate.solidgate.com
```

---

## POST /api/v1/apm/init-payment

Initialize an APM payment. Returns a redirect URL where the customer completes the payment.

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `amount` | integer | Yes | Amount in cents | `1020` |
| `currency` | string | Yes | ISO 4217 | `"EUR"` |
| `order_id` | string | Yes | Unique order ID | `"order-apm-001"` |
| `order_description` | string | Yes | Description | `"Payment via PayPal"` |
| `customer_email` | string | Yes | Customer email | `"john@example.com"` |
| `payment_method` | string | Yes | APM method identifier | `"paypal"` |
| `ip_address` | string | No | Customer IP | `"8.8.8.8"` |
| `geo_country` | string | No | Customer country | `"DEU"` |
| `callback_url` | string | No | Return URL after payment | `"https://example.com/return"` |
| `webhook_url` | string | No | Webhook URL | `"https://example.com/webhook"` |

### Response 200

```json
{
  "order": {
    "order_id": "order-apm-001",
    "status": "processing",
    "redirect_url": "https://paypal.com/checkout/..."
  }
}
```

Redirect the customer to `redirect_url`. After payment, they return to `callback_url` and you receive the result via webhook (`alt_gate.order.updated`).

---

## POST /api/v1/apm/recurring

Charge an APM recurring token (for supported APMs like PayPal).

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `amount` | integer | Yes | Amount in cents | `999` |
| `currency` | string | Yes | ISO 4217 | `"EUR"` |
| `recurring_token` | string | Yes | APM recurring token | `"apm_tok_..."` |
| `order_id` | string | Yes | Unique order ID | `"apm-sub-002"` |
| `order_description` | string | Yes | Description | `"Monthly via PayPal"` |
| `customer_email` | string | Yes | Customer email | `"john@example.com"` |

### Response 200

```json
{
  "order": {
    "order_id": "apm-sub-002",
    "amount": 999,
    "currency": "EUR",
    "status": "settle_ok"
  }
}
```

---

## POST /api/v1/apm/revoke-token

Revoke an APM recurring token.

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recurring_token` | string | Yes | Token to revoke |

### Response 200

```json
{
  "status": "ok"
}
```

---

## POST /api/v1/apm/refund

Refund an APM payment.

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `order_id` | string | Yes | Order ID to refund | `"order-apm-001"` |
| `amount` | integer | No | Partial refund amount in cents | `500` |

### Response 200

```json
{
  "order": {
    "order_id": "order-apm-001",
    "status": "refunded",
    "refunded_amount": 500
  }
}
```

---

## POST /api/v1/apm/status

Check APM order status.

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_id` | string | Yes | Order ID |

### Response 200

```json
{
  "order": {
    "order_id": "order-apm-001",
    "amount": 1020,
    "currency": "EUR",
    "status": "settle_ok",
    "payment_method": "paypal"
  }
}
```

---

## APM Webhooks

APM events use the `alt_gate` prefix:

| Event | Description |
|-------|-------------|
| `alt_gate.order.updated` | APM order status changed |
| `alt_gate.paypal_dispute.received` | PayPal dispute notification |
| `alt_gate.recurring_token.cancelled` | APM recurring token revoked |

Signature verification is the same as for card webhooks (see [webhooks.md](webhooks.md)).

---

## Payment Method Identifiers

| Method | Identifier | Currencies | Countries |
|--------|-----------|------------|-----------|
| PayPal | `paypal` | Multi-currency | Global |
| Pix | `pix` | BRL | Brazil |
| Blik | `blik` | PLN | Poland |
| MB WAY | `mbway` | EUR | Portugal |
| Bizum | `bizum` | EUR | Spain |
| Alipay | `alipay` | CNY, USD | China, Global |
| GCash | `gcash` | PHP | Philippines |
| UPI | `upi` | INR | India |
| WeChat Pay | `wechat_pay` | CNY, USD | China, Global |
| Mercado Pago | `mercado_pago` | BRL, ARS, MXN | Latin America |

Check Solidgate Hub for your enabled methods and supported currencies.
