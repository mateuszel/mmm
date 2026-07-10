# Merchants & CAIDs

Manage merchant identifiers and Card Acceptor IDs.

---

## GET /api/v2/merchants/{id}

Get a merchant by ID.

### Response 200

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "internal_id": "mid_QWE12345",
  "descriptor": "mystore.com",
  "name": "[MyStore][Purchase]"
}
```

---

## PATCH /api/v2/merchants/{id}

Update a merchant's `internal_id`.

### Request

```json
{
  "internal_id": "mid_NEW12345"
}
```

---

## POST /api/v2/merchants/list

Get filtered merchant list.

### Request

```json
{
  "filter": {
    "ids": ["497f6eca-..."],
    "internal_ids": ["mid_QWE12345"]
  },
  "pagination": {
    "method": "offset",
    "limit": 100,
    "offset": 0
  }
}
```

---

## GET /api/v2/caids/{id}

Get a CAID (Card Acceptor ID) by ID.

### Response 200

```json
{
  "id": "c1a2b3d4-...",
  "merchant_id": "497f6eca-...",
  "internal_id": "caid_001",
  "card_acceptor_id": "123456789012",
  "acquirer_bin": "411111",
  "descriptor": "MYSTORE*PURCHASE",
  "mcc": "5732",
  "status": "active",
  "products": ["ethoca", "rdr"]
}
```

---

## PATCH /api/v2/caids/{id}

Update a CAID's `internal_id`.

### Request

```json
{
  "internal_id": "caid_NEW001"
}
```

---

## POST /api/v2/caids/list

Get filtered CAID list.

### Request

```json
{
  "filter": {
    "merchant_ids": ["497f6eca-..."],
    "statuses": ["active"],
    "descriptors": ["mystore.com"],
    "psp_names": ["Stripe"],
    "caids": ["123456789012"],
    "bins": ["411111"]
  },
  "pagination": {
    "method": "token",
    "limit": 100,
    "page_token": ""
  }
}
```
