# Charges

Create a card payment via the H2H API. Requires PCI DSS certification since your server handles raw card data.

---

## POST /api/v1/charge

Withdraw funds from a card with optional 3DS verification. By default, the payment is auto-settled (captured).

### Request

**Headers:** `merchant`, `signature`, `Content-Type: application/json` — see [authentication.md](authentication.md)

**Body:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `amount` | integer | Yes | Amount in cents (minimum 1) | `1020` |
| `currency` | string | Yes | ISO 4217 currency code (exactly 3 characters) | `"USD"` |
| `card_number` | string | Yes | Card number (PAN) | `"4067429974719265"` |
| `card_exp_month` | string | Yes | Expiry month (MM, zero-padded) | `"12"` |
| `card_exp_year` | string | Yes | Expiry year (YYYY, 4-digit string starting with `2`) | `"2030"` |
| `card_cvv` | string | Yes* | CVV/CVC code (3-4 digits). *Required unless `payment_type` is provided | `"123"` |
| `card_holder` | string | Yes | Cardholder name (2-32 chars, must start and end with alphanumeric) | `"John Doe"` |
| `order_id` | string | Yes | Unique order ID (1-100 chars) | `"order-12345"` |
| `order_description` | string | Yes | Order description (max 255 chars) | `"Premium plan"` |
| `customer_email` | string | Yes | Customer email | `"john@example.com"` |
| `ip_address` | string | Yes | Customer IP (IPv4 or IPv6) | `"8.8.8.8"` |
| `customer_account_id` | string | Yes | Unique customer identifier (max 100 chars) | `"cust-001"` |
| `geo_country` | string | No | Customer country (ISO 3166-1 alpha-2 or alpha-3) | `"USA"` |
| `geo_city` | string | No | Customer city | `"San Francisco"` |
| `platform` | string | No | Platform: `WEB`, `MOB`, `APP` | `"WEB"` |
| `type` | string | No | `auth` (reserve only) or `sale` (auto-settle, default) | `"sale"` |
| `settle_interval` | integer | No | Auto-settle delay in hours (0-120, for `type=auth`) | `24` |
| `authorization_type` | string | No | `final` (default) or `estimated` — affects issuer hold behavior | `"final"` |
| `force3ds` | boolean | No | Force 3DS verification | `true` |
| `payment_type` | string | No | Required if `card_cvv` is omitted: `1-click`, `recurring`, `retry`, `installment`, `rebill`, `moto` | `"moto"` |
| `customer_phone` | string | No | Customer phone (E.164) | `"+14155551234"` |
| `customer_first_name` | string | No | First name (max 100 chars) | `"John"` |
| `customer_last_name` | string | No | Last name (max 100 chars) | `"Doe"` |
| `customer_date_of_birth` | string | No | Date of birth (YYYY-MM-DD) | `"1990-01-15"` |
| `address` | string | No | Street address | `"123 Main St"` |
| `zip_code` | string | No | Postal/ZIP code | `"94105"` |
| `state` | string | No | State/province | `"CA"` |
| `city` | string | No | City | `"San Francisco"` |
| `country` | string | No | Country (ISO 3166-1 alpha-3) | `"USA"` |
| `shipping_address` | object | No | Shipping address: `{ "country", "state", "city", "zip", "address" }` | — |
| `website` | string | No | Merchant website (max 255 chars) | `"https://example.com"` |
| `order_number` | integer | No | Display-friendly order number | `1` |
| `language` | string | No | Language (ISO 639-1) for 3DS pages | `"en"` |
| `callback_url` | string | No | URL for 3DS callback redirect (valid URL, max 255 chars) | `"https://example.com/3ds-callback"` |
| `success_url` | string | No | Redirect URL on success (valid URL, max 255 chars) | `"https://example.com/success"` |
| `fail_url` | string | No | Redirect URL on failure (valid URL, max 255 chars) | `"https://example.com/fail"` |
| `order_metadata` | object | No | Custom key-value metadata (max 10 keys, values max 380 chars) | `{"ref": "abc"}` |
| `order_date` | string | No | Order date (max 50 chars) | `"2024-01-15"` |
| `order_items` | string | No | Order items description (max 255 chars) | `"1x Widget"` |
| `traffic_source` | string | No | Traffic source identifier | `"google_ads"` |
| `transaction_source` | string | No | Transaction source identifier | `"web_checkout"` |
| `fraudulent` | boolean | No | Flag suspicious customers | `true` |
| `scheme_transaction_id` | string | No | Network-level transaction ID for linking transactions | `"abc123"` |
| `transaction_link_id` | string | No | Link to a previous transaction (for network linking) | `"prev-tx-id"` |

#### Browser Fingerprint Fields (recommended for 3DS)

These fields improve 3DS authentication success rates and reduce unnecessary challenges:

| Field | Type | Description |
|-------|------|-------------|
| `user_agent` | string | Browser User-Agent header |
| `header_accept` | string | Browser Accept header |
| `header_accept_language` | string | Browser Accept-Language header |
| `browser_color_depth` | integer | Screen color depth |
| `browser_screen_height` | integer | Screen height in pixels |
| `browser_screen_width` | integer | Screen width in pixels |
| `browser_java_enabled` | boolean | Java plugin enabled |
| `browser_javascript_enabled` | boolean | JavaScript enabled |
| `time_zone_offset` | integer | Timezone offset in minutes |

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
    "ip_address": "8.8.8.8",
    "payment_type": "1-click",
    "payment_method": "card"
  },
  "transaction": {
    "id": "trx-002",
    "operation": "settle",
    "status": "success",
    "amount": 1020,
    "currency": "USD",
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:05",
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
  },
  "order_metadata": {}
}
```

**Key response fields:**

| Field | Type | Description |
|-------|------|-------------|
| `order.order_id` | string | Your order ID |
| `order.amount` | integer | Amount in cents |
| `order.currency` | string | Currency code |
| `order.status` | string | Order status (see SKILL.md) |
| `transactions` | map | Transaction history keyed by transaction ID |
| `transaction` | object | Latest transaction details |
| `transaction.card` | object | Card details (BIN, brand, type, bank) |
| `transaction.card_token.token` | string | Recurring token for future charges (store securely) |
| `three_ds` | object | 3DS authentication details (eci, flow) |
| `order_metadata` | object | Custom metadata if provided |
| `redirect_url` | string | Redirect URL (present on success/failure for return navigation) |
| `verify_url` | string | 3DS verification URL (present when `order.status = "3ds_verify"`) |
| `error` | object | Error details if payment failed |
| `verification_result` | object | AVS/CVV check results (`avs_result`, `cvv_result`) |
| `routing` | object | Payment routing details (cascade steps) |

**Note:** `transactions` is a **map** (object keyed by transaction ID), not an array.

---

## 3DS Flow

If the card requires 3D Secure verification, the response will have `order.status = "3ds_verify"` and `verify_url`:

```json
{
  "order": {
    "order_id": "order-12345",
    "status": "3ds_verify"
  },
  "verify_url": "https://acs.bank.com/3ds?id=..."
}
```

### Steps:

1. Check if `order.status === "3ds_verify"`
2. Redirect the customer to `verify_url`
3. After 3DS, the customer is redirected to your `callback_url` (or a default Solidgate page)
4. Receive the final status via **webhook** (`card_gate.order.updated`)

**Note:** `redirect_url` is set on terminal statuses (success → `success_url`, failure → `fail_url`). `verify_url` is set specifically for the 3DS flow.

---

## curl Example

```bash
PUBLIC_KEY="api_pk_..."
SECRET_KEY="api_sk_..."
BODY='{
  "amount": 1020,
  "currency": "USD",
  "card_number": "4067429974719265",
  "card_exp_month": "12",
  "card_exp_year": "2030",
  "card_cvv": "123",
  "card_holder": "John Doe",
  "order_id": "order-12345",
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

---

## Notes

- `order_id` must be unique across all orders (max 100 chars). Duplicate returns error `5.06`.
- Amounts are always in **cents**. $10.20 → `1020`. Minimum amount is `1`.
- Default `type` is `sale` (auto-settle). Use `type=auth` to only reserve funds and settle later.
- If `force3ds=true`, 3DS will be required regardless of card/issuer settings.
- `card_holder` must be 2-32 characters and start/end with an alphanumeric character.
- `card_exp_year` must be a 4-digit string (e.g., `"2030"`), not an integer.
- `payment_type` is required when `card_cvv` is not provided (e.g., for MOTO transactions).
- Use test cards from [testing.md](testing.md) in sandbox environment.
