---
name: chargebackhit
description: ChargebackHit API — chargeback prevention, dispute management, alert handling, MID enrollment
---

# ChargebackHit API Skill

Reference documentation for integrating with the ChargebackHit API (https://api-docs.chargebackhit.com/).

## Overview

ChargebackHit is a chargeback prevention and dispute management platform. It integrates with card networks (Visa Verifi, Mastercard Ethoca) and 13+ payment processors to prevent chargebacks, resolve disputes, and recover revenue.

**Four pillars:**
- **Prevent** — Real-time transaction insights (Visa Order Insight, Consumer Clarity, Compelling Evidence 3.0)
- **Resolve** — Dispute resolution (RDR, CDRN, Ethoca alerts, PayPal directed refunds)
- **Recover** — Chargeback representment with automated evidence generation
- **Inform** — Fraud & dispute notifications (Visa TC40, dispute notices)

## Minimum Required Flow

1. **Enroll MIDs** — Register your merchant IDs/descriptors for monitoring via `POST /api/v2/import/mids/batch-create`. See [enrollment.md](enrollment.md).
2. **Accept alert webhooks** — ChargebackHit sends POST requests to your webhook URL when alerts are triggered. Verify the HMAC-SHA512 signature. See [webhooks.md](webhooks.md).
3. **Respond with outcome** — Return an outcome (`reversed`, `not-found`, `acknowledged`, etc.) and optional order/customer data. See [alerts.md](alerts.md).
4. **Monitor disputes** — Track disputes and representment status via `POST /api/v2/disputes/list`. See [disputes.md](disputes.md).

## Quick Start

New to ChargebackHit? See the **[Quick Start Guide](quickstart.md)** — step-by-step walkthrough: get API keys, enroll a MID, handle an alert webhook, check disputes.

## Examples

Ready-to-run servers with webhook handling, alert response, and API calls.

All examples read keys from environment variables:
```bash
export CHARGEBACKHIT_PUBLIC_KEY="your_public_key"
export CHARGEBACKHIT_SECRET_KEY="your_secret_key"
```

| Language | File | Framework | Run |
|----------|------|-----------|-----|
| Node.js | [server.js](examples/nodejs/server.js) | Express | `npm install express && node server.js` |
| Python | [server.py](examples/python/server.py) | Flask | `pip install flask requests && python server.py` |
| Go | [main.go](examples/go/main.go) | net/http | `go run main.go` |
| PHP | [server.php](examples/php/server.php) | Built-in | `php -S localhost:3000 server.php` |

Each example includes: HMAC-SHA512 signature generation, webhook handling with verification, alert outcome response, and alert list retrieval.

## Base URL

```
https://api.chargebackhit.com
```

## Authentication

All requests require two HTTP headers:

| Header | Value |
|--------|-------|
| `public_key` | Your public API key |
| `Signature` | `base64(hex(HMAC-SHA512(secret_key, public_key + json_body + public_key)))` |

Same HMAC-SHA512 formula as Solidgate. See [authentication.md](authentication.md) for implementation in all languages.

## Sections

| Section | File | Description |
|---------|------|-------------|
| Authentication | [authentication.md](authentication.md) | HMAC-SHA512 signature generation |
| Alerts | [alerts.md](alerts.md) | Get, list, and update alert outcomes |
| Webhooks | [webhooks.md](webhooks.md) | Alert webhook types, payloads, outcome responses |
| Disputes | [disputes.md](disputes.md) | Dispute tracking and representment |
| Enrollment | [enrollment.md](enrollment.md) | MID/CAID batch enrollment |
| Merchants & CAIDs | [merchants.md](merchants.md) | Merchant and CAID management |
| Error Codes | [errors.md](errors.md) | Error response format and codes |
| Testing | [testing.md](testing.md) | Sandbox alert generation and validation |

## Alert Types

| Type | Category | Description |
|------|----------|-------------|
| `inquiry` | Prevent | Order Insight / Consumer Clarity / CE 3.0 query — return order + customer data |
| `init-refund` | Resolve | Ethoca/CDRN alert — refund requested |
| `resolved` | Resolve | RDR auto-resolved |
| `prevented` | Prevent | Alert prevented at network level |
| `fraud-notification` | Inform | Visa TC40/SAFE fraud alert |
| `dispute-notification` | Inform | Dispute notification from network |

## Outcome Codes

| Outcome | Description |
|---------|-------------|
| `reversed` | Transaction refunded following the alert |
| `previously-reversed` | Already refunded before alert arrived |
| `duplicate` | Refunded due to duplicate alert |
| `decline` | Related transaction was not successful |
| `not-found` | Transaction not found in your system |
| `acknowledged` | Default — no action required |
| `pending` | Temporary — will respond later via API |
| `shipped` | Physical goods already shipped |
| `error` | Processing error |
| `reverse-error` | Unable to process refund |

## Dispute Statuses

| Status | Description |
|--------|-------------|
| `needs-response` | Action required — submit evidence |
| `processing` | Evidence being generated |
| `under-review` | Submitted, under review by PSP |
| `resolved` | Final — outcome is `won`, `lost`, or `rdr` |

## Dispute Stages

`inquiry` → `chargeback` → `pre-arbitration` → `arbitration`

## Supported PSPs

Stripe, PayPal, Adyen, Checkout.com, Worldpay, Nuvei, dLocal, EBANX, RocketGate, Solidgate, Checkout Champ, 29 Next, Sticky.io

## Common Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "constraints": { "field": "error description" }
  }
}
```

See [errors.md](errors.md) for the full error code table.
