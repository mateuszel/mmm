# Enrollment

Register MIDs (Merchant IDs) and CAIDs (Card Acceptor IDs) for chargeback monitoring.

---

## POST /api/v2/import/mids/batch-create

Enroll one or more MIDs in a single batch request. The request body is an **array** of enrollment objects.

### Products

| Product | Description | Required Fields |
|---------|-------------|-----------------|
| `ethoca` | Mastercard Ethoca alerts | `descriptor` |
| `rdr` | Visa Rapid Dispute Resolution | `descriptor`, `card_acceptor_id`, `acquirer_bin` |
| `oi` | Visa Order Insight | `descriptor`, `card_acceptor_id`, `acquirer_bin`, `support_info_merchant.website_url` |
| `cdrn` | Verifi CDRN alerts | `descriptor` |
| `consumer-clarity` | Visa Consumer Clarity | `descriptor`, `support_info_merchant.website_url` |
| `visa-dispute` | Visa dispute notifications | `descriptor`, `card_acceptor_id`, `acquirer_bin` |
| `visa-fraud` | Visa TC40 fraud notifications | `descriptor`, `card_acceptor_id`, `acquirer_bin` |
| `paypal` | PayPal dispute alerts | `descriptor`, `paypal_merchant_id` |

### Request

```json
[
  {
    "required_products": ["ethoca", "rdr"],
    "merchant_internal_id": "mid_QWE1234",
    "card_acceptor_id": "123456789012",
    "acquirer_bin": "411111",
    "psp_name": "Stripe",
    "mcc": "5732",
    "descriptor": "HeadphonesStore*Purchase",
    "description": "Main store descriptor",
    "arns": ["74012345678901234567890"],
    "support_info_merchant": {
      "website_url": "https://headphonesstore.com"
    }
  },
  {
    "required_products": ["paypal"],
    "merchant_internal_id": "mid_QWE1234",
    "descriptor": "HeadphonesStore",
    "paypal_merchant_id": "PAYPAL123456"
  }
]
```

### Common Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `required_products` | array | Yes | Products to enroll: `ethoca`, `rdr`, `oi`, `cdrn`, `consumer-clarity`, `visa-dispute`, `visa-fraud`, `paypal` |
| `descriptor` | string | Yes | Payment descriptor (as it appears on card statements) |
| `merchant_internal_id` | string | No | Your internal merchant ID |
| `card_acceptor_id` | string | Depends | CAID (required for Visa products) |
| `acquirer_bin` | string | Depends | Acquirer BIN (required for Visa products) |
| `psp_name` | string | No | Payment processor name |
| `mcc` | string | No | Merchant category code |
| `description` | string | No | Internal description |
| `arns` | array | No | Acquirer Reference Numbers |
| `integration_for_matching` | string | No | PSP integration for tx matching: `stripe`, `checkoutchamp`, `29next` |
| `paypal_merchant_id` | string | PayPal only | PayPal merchant ID |

### Response 200

Returns enrollment status for each MID.

---

## POST /api/v2/import/mids/list

Get enrollment list with status tracking.

### Request

```json
{
  "pagination": {
    "method": "offset",
    "limit": 100,
    "offset": 0
  }
}
```

### Enrollment Statuses

| Status | Description |
|--------|-------------|
| `new` | Enrollment submitted |
| `accepted` | Accepted by provider |
| `success` | Successfully enrolled and active |
| `error` | Enrollment failed |
| `rejected` | Rejected by provider |

---

## Disenroll Products

### POST /api/v2/caids/{id}/disenroll

Remove specific products from a CAID.

```json
{
  "products": ["ethoca", "rdr"]
}
```
