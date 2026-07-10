# Alerts

Manage and respond to chargeback prevention alerts.

---

## POST /api/v2/alerts/{id}/update-outcome

Update the response outcome for an alert (e.g., after initially returning `"pending"`).

### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `outcome` | string | Yes | Outcome code (see [SKILL.md](SKILL.md) for full list) |
| `order` | object | No | Order details (order_id, date, amount, currency, address, refund) |
| `customer` | object | No | Customer details (customer_id, name, email, phone) |
| `transactions` | array | No | Transaction details |
| `products` | array | No | Product details |

### Response 200

Returns the updated alert object.

---

## GET /api/v2/alerts/{id}

Get a single alert by ID.

### Response 200

```json
{
  "alert": {
    "id": "a1b2c3d4-...",
    "card_acceptor_id": "123456789012",
    "date": "2024-01-15T10:30:00Z",
    "provider": "ethoca",
    "product": "ethoca",
    "type": "init-refund",
    "outcome": "reversed",
    "amount": "49.99",
    "currency": "USD",
    "descriptor": "MYSTORE*PURCHASE",
    "reason_code": "10.4"
  },
  "transaction": {
    "transaction_merchant_id": "order-12345",
    "date": "2024-01-10T08:00:00Z",
    "amount": "49.99",
    "currency": "USD",
    "card_brand": "visa",
    "bin": "411111",
    "last_four": "1234",
    "arn": "74012345678901234567890"
  },
  "merchant": {
    "id": "497f6eca-...",
    "internal_id": "mid_QWE12345",
    "descriptor": "mystore.com"
  }
}
```

---

## POST /api/v2/alerts/list

Retrieve alerts list with filters and pagination.

### Request

```json
{
  "filter": {
    "ids": ["a1b2c3d4-..."],
    "merchant_ids": ["497f6eca-..."],
    "merchant_internal_ids": ["mid_QWE12345"],
    "order_ids": ["order-12345"],
    "transaction_ids": ["visa-tid-abc"],
    "transaction_merchant_ids": ["order-12345"],
    "created_at_from": "2024-01-01T00:00:00Z",
    "created_at_to": "2024-01-31T23:59:59Z",
    "alert_date_from": "2024-01-01T00:00:00Z",
    "alert_date_to": "2024-01-31T23:59:59Z",
    "currencies": ["USD"],
    "types": ["init-refund", "inquiry"],
    "outcomes": ["reversed", "pending"],
    "providers": ["ethoca", "verifi"],
    "products": ["ethoca", "rdr", "oi", "cdrn"],
    "bin": "411111",
    "last_four": "1234",
    "descriptors": ["mystore.com"]
  },
  "sort": {
    "field": "created_at",
    "direction": "desc"
  },
  "pagination": {
    "method": "token",
    "limit": 100,
    "page_token": ""
  }
}
```

All filter fields are optional. Omit the entire `filter` to get all alerts.

### Pagination

**Token method (recommended):**
```json
{ "method": "token", "limit": 100, "page_token": "" }
```
Response includes `next_page_token` — pass it as `page_token` for the next page.

### Response 200

```json
{
  "items": [
    { "alert": {...}, "transaction": {...}, "merchant": {...} }
  ],
  "pagination": {
    "limit": 100,
    "next_page_token": "eyJ..."
  }
}
```
