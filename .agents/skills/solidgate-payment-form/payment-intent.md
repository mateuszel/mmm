# Payment Intent

The payment intent is a JSON object describing the payment parameters. It is encrypted with AES-256-CBC (see [authentication.md](authentication.md)) and sent to the frontend SDK as part of `merchantData`.

---

## Required Fields (One-Time Payments)

| Field | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `amount` | integer | >= 0 | Amount in minor currency units (cents) | `1020` (= $10.20) |
| `currency` | string | 3 | ISO 4217 three-letter currency code | `"USD"` |
| `order_id` | string | 255 | Unique order identifier per merchant | `"order-12345"` |
| `order_description` | string | 255 | Human-readable transaction description | `"Premium subscription"` |

## Required Fields (Subscriptions)

For subscriptions, `amount` and `currency` are derived from the product price — do NOT include them.

| Field | Type | Format | Description | Example |
|-------|------|--------|-------------|---------|
| `product_id` | string | UUID v4 | Predefined product identifier from Hub | `"a1b2c3d4-e5f6-..."` |
| `product_price_id` | string | UUID v4 | Price ID for the subscription | `"f7g8h9i0-..."` |
| `customer_account_id` | string | max 100 | Merchant's customer identifier | `"cust-456"` |
| `order_id` | string | 255 | Unique order identifier | `"sub-init-001"` |
| `order_description` | string | 255 | Transaction description | `"Monthly Pro Plan"` |

---

## Card Payment Control Fields

| Field | Type | Values | Description | Example |
|-------|------|--------|-------------|---------|
| `settle_interval` | integer | 0–240 (network-dependent) | Auto-settle delay in hours. Max per scheme: CIT Visa 240, MIT Visa 120, other schemes 144. | `24` |
| `authorization_type` | string | `"final"`, `"estimated"` | Default: `"final"`. `estimated` enables incremental amount changes (incompatible with auto-settle, zero-amount auth, and one-time product/subscription flows). | `"final"` |
| `force3ds` | boolean | — | Force 3DS verification | `true` |
| `retry_attempt` | integer | >= 0 | Payment retry count | `2` |

## Customer Fields

| Field | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `customer_email` | string | 100 | Customer email for receipts. If omitted, the form's email input collects it from the user. | `"john@example.com"` |
| `customer_first_name` | string | 100 | First name | `"John"` |
| `customer_last_name` | string | 100 | Last name | `"Doe"` |
| `customer_phone` | string | 18 | Phone (E.164 format) | `"+14155551234"` |
| `customer_date_of_birth` | string | 10 | Date of birth (YYYY-MM-DD) | `"1990-01-15"` |
| `customer_account_id` | string | 100 | Merchant's customer ID (required for subscriptions) | `"cust-456"` |

## Location / Device Fields

| Field | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `ip_address` | string | 50 | Customer's public IP (IPv4 or IPv6). Strongly recommended for fraud scoring. Private IPs ("10.x", "172.16-31.x", "192.168.x") are rejected. | `"8.8.8.8"` |
| `geo_country` | string | 3 | Customer country (ISO 3166-1 alpha-3). Auto-inferred from `ip_address` if omitted. | `"USA"` |
| `geo_city` | string | 100 | Customer city | `"San Francisco"` |
| `purchase_country` | string | 3 | Country where goods are purchased | `"USA"` |
| `platform` | string | 3 | `"WEB"`, `"MOB"`, `"APP"`. Auto-inferred if omitted. | `"WEB"` |
| `device` | string | 50 | Device description | `"iPhone 15"` |
| `user_agent` | string | 1000 | Browser user agent | — |

## Billing Address

Nested object `billing_address`:

| Field | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `billing_address.address` | string | 100 | Street address | `"123 Main St"` |
| `billing_address.country` | string | 3 | ISO 3166-1 country code | `"USA"` |
| `billing_address.state` | string | 10 | ISO 3166-2 state code | `"CA"` |
| `billing_address.city` | string | 100 | City | `"San Francisco"` |
| `billing_address.zip_code` | string | 10 | Postal code | `"94105"` |

## Subscription / Recurring Fields

Subscription / Pix-Automático recurring details are split across two top-level objects:

- product/coupon identifiers at the top level (`product_id`, `product_price_id`, `coupon_id`)
- token-usage / mandate details inside the nested `future_usage` object (see [§ `future_usage` object](#future_usage-object) below)

| Field | Type | Format | Description | Example |
|-------|------|--------|-------------|---------|
| `product_id` | string | UUID v4 | Product from Solidgate Hub | `"a1b2c3d4-..."` |
| `product_price_id` | string | UUID v4 | Price ID for the subscription | `"f7g8h9i0-..."` |
| `coupon_id` | string | UUID v4 | Discount coupon identifier (only honoured when `product_id` is set) | `"c0up0n1d-..."` |

### `future_usage` object

`future_usage` is an object that holds the token-usage scenario plus (for Pix Automático) the recurring schedule. **Required** for Bizum, Cash App Pay, MB WAY, and Pix Automático buttons.

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `future_usage.payment_type` | string | Yes | Token-usage scenario: `"one-time"` (no token created) or `"recurring"` (creates a recurring mandate, used by Pix Automático). | `"recurring"` |
| `future_usage.billing_period` | object | For Pix Automático | Recurring charge interval. Sub-fields `unit` and `value` are both required when `billing_period` is used. | `{ "unit": "month", "value": 1 }` |
| `future_usage.billing_period.unit` | string | Yes (when `billing_period` set) | One of `day`, `week`, `month`, `year`. | `"month"` |
| `future_usage.billing_period.value` | integer | Yes (when `billing_period` set) | Allowed pairs: `day`+`7`, `week`+`1`, `month`+`1\|3\|6\|12`, `year`+`1`. | `1` |
| `future_usage.max_amount` | integer | For Pix Automático | Maximum allowed amount per recurring charge in minor units (mandate ceiling). | `5000` |

```json
"future_usage": {
  "payment_type": "recurring",
  "max_amount": 5000,
  "billing_period": { "unit": "month", "value": 1 }
}
```

## Digital Wallet Fields

| Field | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `google_pay_merchant_id` | string | 100 | Google Pay merchant ID | `"10911390523550288022"` |
| `google_pay_merchant_name` | string | 255 | Display name for Google Pay sheet | `"My Store"` |
| `apple_pay_merchant_name` | string | 64 | Display name for Apple Pay sheet | `"My Store"` |
| `apple_pay_merchant_domain` | string | — | Verified domain for Apple Pay (must have hosted `apple-developer-merchantid-domain-association` file). Auto-set from Solidgate Hub config. | `"yourdomain.com"` |

## Display & Redirect Fields

| Field | Type | Max Length | Description | Example |
|-------|------|-----------|-------------|---------|
| `language` | string | 3 | Form language (ISO 639-1) | `"en"` |
| `website` | string | 255 | Merchant website URL | `"https://example.com"` |
| `order_items` | string | 255 | UTF-8 encoded items description | `"1x Widget"` |
| `success_url` | string | 255 | Custom redirect URL on success | `"https://example.com/success"` |
| `fail_url` | string | 255 | Custom redirect URL on failure | `"https://example.com/fail"` |

## Other Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `order_number` | integer (int32) | Number of payments by the customer (counter, not display id) | `3` |
| `order_date` | string (max 50) | Date of order creation, format `YYYY-MM-DD HH:MM:SS` | `"2026-05-04 10:30:00"` |
| `order_metadata` | object | Custom key-value pairs (max 10 keys, 380 chars per value) | `{"ref": "abc"}` |
| `traffic_source` | string | Marketing channel | `"google_ads"` |
| `transaction_source` | string | Internal system trigger | `"checkout_v2"` |
| `future_usage` | object | Token-usage scenario; see [§ `future_usage` object](#future_usage-object). Required for Bizum, Cash App Pay, MB WAY (`payment_type: "one-time"`) and Pix Automático (`payment_type: "recurring"` plus `billing_period`/`max_amount`). | — |
| `device_sessions` | array | Anti-fraud session IDs: `[{ "id": "sess-1", "provider": "kount" }]` | — |
| `payment_type_data` | object | Country-specific data nested object. For Pix Brazil: `payment_type_data: { brazil_cpf: "12345678901" }` (11-digit taxpayer ID). | — |
| `industry_data` | object | Industry-specific transaction classification. See [§ `industry_data` object](#industry_data-object). | — |
| `fraudulent` | boolean | **Deprecated.** Was used to flag merchant-side suspicious customer signal. Default `false`. Use modern anti-fraud integration instead. | `false` |

---

## `industry_data` object

Acquirer-side classification data. Currently only `car_rental` is surfaced.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `industry_data.type` | string | Yes | Allowed values: `car_rental` |
| `industry_data.car_rental` | object | Yes (when `type=car_rental`) | Car-rental details (see fields below) |
| `industry_data.car_rental.agreement_number` | string ≤9 | Yes | Rental agreement number |
| `industry_data.car_rental.renter_name` | string ≤26 | Yes | Renter's name |
| `industry_data.car_rental.pick_up_date` | ISO 8601 string | Yes | UTC pickup date/time |
| `industry_data.car_rental.drop_off_date` | ISO 8601 string | Yes | UTC drop-off date/time |
| `industry_data.car_rental.refundability` | string | Yes | `refundable` \| `non_refundable` \| `partially_refundable` |
| `industry_data.car_rental.return_location_id` | string ≤10 | Yes | Agency code / phone / address abbreviation |
| `industry_data.car_rental.pick_up_location` | object | Yes | `{ street_line_1, state, city, country (ISO-3 alpha-3), postal }` (state/city/country/postal required) |
| `industry_data.car_rental.drop_off_location` | object | Yes | Same shape as `pick_up_location` |
| `industry_data.car_rental.distance_limit` | object | Yes | `{ limit (int ≥0), unit ("miles" \| "km"), additional_distance_cost: { amount (int ≥0), currency (ISO-4217) } }` |
| `industry_data.car_rental.rate` | integer ≥0 | No | Daily/weekly rate in minor units |
| `industry_data.car_rental.rate_indicator` | string | No | `D` (daily) \| `W` (weekly) |
| `industry_data.car_rental.days_rented` | string ≤4 | No | Number of rental days |
| `industry_data.car_rental.customer_service_toll_free_number` | string ≤17 | No | Rental company support phone |
| `industry_data.car_rental.rental_class_id` | string ≤4 | No | Rental class code (e.g. `SUV1`) |
| `industry_data.car_rental.tax_exempt_indicator` | string | No | `Y` \| `N` |
| `industry_data.car_rental.fuel_charges` | integer ≥0 | No | In minor units |
| `industry_data.car_rental.insurance_charges` | integer ≥0 | No | In minor units |
| `industry_data.car_rental.no_show_indicator` | string | No | `Y` (no show) \| `N` (picked up) |
| `industry_data.car_rental.one_way_drop_off_charges` | integer ≥0 | No | In minor units |

---

## Minimal Example (One-Time)

```json
{
  "amount": 1020,
  "currency": "USD",
  "order_id": "order-12345",
  "order_description": "Premium subscription"
}
```

## Full Example (One-Time)

```json
{
  "amount": 1020,
  "currency": "USD",
  "order_id": "order-12345",
  "order_description": "Premium subscription",
  "customer_email": "john@example.com",
  "ip_address": "8.8.8.8",
  "geo_country": "USA",
  "platform": "WEB",
  "language": "en",
  "authorization_type": "final",
  "force3ds": true,
  "billing_address": {
    "address": "123 Main St",
    "country": "USA",
    "state": "CA",
    "city": "San Francisco",
    "zip_code": "94105"
  },
  "order_metadata": {
    "campaign": "spring_sale"
  }
}
```

## Subscription Example

```json
{
  "order_id": "sub-init-001",
  "order_description": "Monthly Pro Plan",
  "product_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "product_price_id": "f7g8h9i0-abcd-1234-ef56-7890abcdef12",
  "customer_account_id": "cust-456",
  "customer_email": "john@example.com"
}
```

## APM-Specific Required Fields

When enabling alternative payment method buttons, certain fields must be present in the paymentIntent in addition to the standard required fields. Verified from upstream APM-buttons docs.

| APM | Required paymentIntent fields |
|-----|-------------------------------|
| Apple Pay | `apple_pay_merchant_name` (Hub auto-fills `apple_pay_merchant_domain`) |
| Google Pay | `google_pay_merchant_id` (and `google_pay_merchant_name` recommended) |
| Bizum | `future_usage: { payment_type: "one-time" }` |
| MB WAY | `future_usage: { payment_type: "one-time" }` |
| Cash App Pay | `geo_country: "USA"`, `future_usage: { payment_type: "one-time" }`, `success_url`, `fail_url` |
| Pix QR | (none — only button setup needed) |
| SmartPix | (none — only button setup needed) |
| Pix Automático | `future_usage: { payment_type: "recurring", max_amount: <int>, billing_period: { unit, value } }` |
| Blik | (none — only button setup needed) |
| PayPal | (none — only button setup needed) |
| Click to Pay | (none — but requires Solidgate Acquiring + UCS onboarding) |

See [frontend-sdk.md](frontend-sdk.md) for button params per APM.

---

## Notes

- `order_id` must be unique across all your orders. Duplicate `order_id` returns error `5.06`.
- Amounts are always in **cents** (minor units). $10.20 → `1020`, €5.00 → `500`.
- For subscriptions, `amount` and `currency` come from the product price — omit them.
- The payment intent JSON is encrypted before being sent to the frontend — the customer never sees the raw data.
