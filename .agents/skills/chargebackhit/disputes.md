# Disputes

Track disputes and chargeback representment status. Disputes are synced from connected PSPs (Stripe, PayPal, Adyen, Checkout.com).

---

## GET /api/v2/disputes/{id}

Get a single dispute by ID.

### Response 200

```json
{
  "id": "d1e2f3a4-...",
  "provider": "stripe",
  "provider_dispute_id": "dp_1234567890",
  "status": "needs-response",
  "stage": "chargeback",
  "outcome": null,
  "reason": "fraudulent",
  "amount": "49.00",
  "currency": "USD",
  "dispute_date": "2024-01-20T00:00:00Z",
  "response_deadline": "2024-02-05T23:59:59Z",
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z",
  "representments": [
    {
      "id": "r1a2b3c4-...",
      "status": "evidence-generation",
      "created_at": "2024-01-20T10:05:00Z",
      "updated_at": "2024-01-20T10:05:00Z",
      "submitted_at": null,
      "enrichment_deadline": "2024-01-25T23:59:59Z"
    }
  ]
}
```

### Dispute Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique dispute ID |
| `provider` | string | PSP: `stripe`, `paypal`, `adyen`, `checkout` |
| `provider_dispute_id` | string | Native PSP dispute ID |
| `status` | string | `needs-response`, `processing`, `under-review`, `resolved` |
| `stage` | string | `inquiry`, `chargeback`, `pre-arbitration`, `arbitration` |
| `outcome` | string | Only when resolved: `won`, `lost`, `rdr` |
| `reason` | string | Reason from PSP |
| `amount` | string | Dispute amount (decimal string) |
| `currency` | string | ISO 4217 |
| `dispute_date` | string | ISO 8601 |
| `response_deadline` | string | ISO 8601 (nullable) |
| `representments` | array | Representment attempts (see below) |

### Representment Statuses

| Status | Description |
|--------|-------------|
| `evidence-generation` | Automated evidence being generated |
| `waiting-for-enrichment` | Needs additional data from merchant |
| `submission-in-progress` | Being submitted to PSP |
| `submission-failed` | Submission to PSP failed |
| `submitted` | Successfully submitted to PSP |

---

## POST /api/v2/disputes/list

Retrieve disputes with filters and pagination.

### Request

```json
{
  "filter": {
    "dispute_date_from": "2024-01-01T00:00:00Z",
    "dispute_date_to": "2024-01-31T23:59:59Z",
    "updated_at_from": "2024-01-01T00:00:00Z",
    "updated_at_to": "2024-01-31T23:59:59Z",
    "status": ["needs-response", "processing"],
    "provider": ["stripe", "paypal"]
  },
  "pagination": {
    "limit": 100,
    "page_token": ""
  }
}
```

**Note:** Disputes list only supports token-based pagination (no offset method).

### Response 200

```json
{
  "items": [
    {
      "id": "d1e2f3a4-...",
      "provider": "stripe",
      "status": "needs-response",
      "stage": "chargeback",
      "amount": "49.00",
      "currency": "USD",
      "dispute_date": "2024-01-20T00:00:00Z",
      "response_deadline": "2024-02-05T23:59:59Z",
      "representments": [...]
    }
  ],
  "pagination": {
    "limit": 100,
    "next_page_token": "eyJ..."
  }
}
```

---

## Dispute Lifecycle

```
needs-response → processing → under-review → resolved (won/lost/rdr)
```

Stages progress: `inquiry` → `chargeback` → `pre-arbitration` → `arbitration`

ChargebackHit automatically generates evidence and submits representments when possible. Track progress via the `representments` array.
