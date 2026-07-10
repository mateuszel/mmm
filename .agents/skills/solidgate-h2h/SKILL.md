---
name: solidgate-h2h
description: Solidgate Host-to-Host API — direct card payments, recurring, refunds, digital wallets. Requires PCI DSS certification.
---

# Solidgate Host-to-Host (H2H) API Skill

Reference documentation for integrating Solidgate via direct API calls (https://docs.solidgate.com/payments/integrate/host-to-host/).

## Overview

This skill provides complete API reference for Host-to-Host integration with Solidgate's payment gateway. H2H means your server collects card data directly and sends it to Solidgate's API. **PCI DSS certification is required.**

If you don't have PCI DSS, use the [Payment Form](../solidgate-payment-form/SKILL.md) integration instead.

## Minimum Required Flow

Any H2H integration MUST implement these steps as the baseline:

1. **Collect card data** on your server (requires PCI DSS certification)
2. **Create a charge** — `POST https://pay.solidgate.com/api/v1/charge` with card details, amount, currency. See [charges.md](charges.md)
3. **Handle 3DS** — if response `order.status=3ds_verify`, redirect customer to `verify_url`, then receive the result via webhook
4. **Accept webhook** — `POST webhook_url` receives `card_gate.order.updated` events. Verify HMAC-SHA512 signature. See [webhooks.md](webhooks.md)
5. **Handle terminal statuses:**
   - `settle_ok` — payment captured, fulfill the order
   - `auth_ok` — funds reserved (settle manually via `/api/v1/settle`)
   - `auth_failed` — payment failed, show error to user

Webhook is the primary mechanism for learning about status changes. Status polling (`/api/v1/status`) is a fallback.

## Quick Start

New to H2H? See the **[Quick Start Guide](quickstart.md)** — step-by-step walkthrough: get API keys, make a charge, check status, handle webhooks.

## Examples

Ready-to-run servers with charge, status check, webhook verification, and refund endpoints.

All examples read keys from environment variables:
```bash
export SOLIDGATE_PUBLIC_KEY="api_pk_..."
export SOLIDGATE_SECRET_KEY="api_sk_..."
export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
```

| Language | File | Framework | Run |
|----------|------|-----------|-----|
| Node.js | [server.js](examples/nodejs/server.js) | Express | `npm install express && node server.js` |
| Python | [server.py](examples/python/server.py) | Flask | `pip install flask requests && python server.py` |
| Go | [main.go](examples/go/main.go) | net/http | `go run main.go` |
| PHP | [server.php](examples/php/server.php) | Built-in | `php -S localhost:3000 server.php` |
| Java | [SolidgateServer.java](examples/java/SolidgateServer.java) | JDK HttpServer | `javac SolidgateServer.java && java SolidgateServer` |
| C# | [Program.cs](examples/csharp/Program.cs) | ASP.NET Minimal | `dotnet run` |

Each example includes: charge with signature, webhook HMAC verification, status check, and refund.

## Base URL

```
https://pay.solidgate.com
```

All endpoints are relative to this base URL.

## Authentication

All requests require two HTTP headers:

| Header | Value |
|--------|-------|
| `merchant` | Public key (`api_pk_...`) |
| `signature` | `base64(HMAC-SHA512(secret_key, public_key + json_body + public_key))` |

For GET requests (no body): `base64(HMAC-SHA512(secret_key, public_key + public_key))`

See [authentication.md](authentication.md) for implementation in all languages.

## Sections

| Section | File | Description |
|---------|------|-------------|
| Authentication | [authentication.md](authentication.md) | HMAC-SHA512 signature generation |
| Charges | [charges.md](charges.md) | `POST /api/v1/charge` — create a payment |
| Recurring | [recurring.md](recurring.md) | `POST /api/v1/recurring` (MIT) and `POST /api/v1/resign` (1-click) |
| Order Management | [order-management.md](order-management.md) | Refund, void, settle, increment, status, ARN codes |
| Google Pay | [google-pay.md](google-pay.md) | `POST /api/v1/google-pay` — H2H Google Pay |
| Apple Pay | [apple-pay.md](apple-pay.md) | `POST /api/v1/apple-pay` — H2H Apple Pay |
| APM | [apm.md](apm.md) | Alternative Payment Methods (PayPal, Pix, Blik, etc.) |
| Webhooks | [webhooks.md](webhooks.md) | Event types, signature verification, retry schedule |
| Subscriptions | [subscriptions.md](subscriptions.md) | Subscription API (subscriptions.solidgate.com) |
| Error Codes | [errors.md](errors.md) | Full error code table (0.xx–7.xx) |
| Testing | [testing.md](testing.md) | Test cards, sandbox, digital wallet test amounts |

## Rate Limits

| Environment | Limit |
|-------------|-------|
| Live | 25 requests/second per merchant |
| Sandbox | 10 requests/second per merchant |

Exceeding returns HTTP 429 with error code `5.07`.

## Common Data Formats

- **Amounts** — always in minor currency units (cents). `1020` = $10.20
- **Currency** — ISO 4217 three-letter codes (`USD`, `EUR`, `GBP`)
- **Order ID** — merchant-defined unique string, 1-100 characters
- **Content-Type** — `application/json` for all requests

## Order Statuses

| Status | Type | Description |
|--------|------|-------------|
| `processing` | Non-final | Payment is being processed |
| `3ds_verify` | Non-final | Awaiting 3DS verification |
| `auth_ok` | Non-final | Funds reserved on card |
| `auth_failed` | Final | Authorization failed |
| `void_ok` | Final | Authorization voided |
| `settle_ok` | Final | Funds captured |
| `partial_settled` | Final | Partial capture |
| `refunded` | Final | Full refund completed |
| `partial_refunded` | Final | Partial refund completed |

## Transaction Types

`auth`, `settle`, `void`, `refund`, `recurring-auth`, `resign-auth`, `apple-pay`, `google-pay`

## Payment Types

### Customer-Initiated (CIT)
- `1-click` — customer present, uses saved token + CVV
- `moto` — mail/telephone order

### Merchant-Initiated (MIT)
- `recurring` — regular subscription charge
- `retry` — retry of failed recurring
- `installment` — installment payment
- `rebill` — re-billing

## Response Structure

All API responses share the same structure:

```json
{
  "order": { "order_id": "...", "status": "...", "amount": 1020, "currency": "USD", ... },
  "transaction": { "id": "...", "operation": "auth", "status": "success", "card": { ... }, "card_token": { "token": "..." }, ... },
  "transactions": { "<tx_id>": { ... }, "<tx_id>": { ... } },
  "three_ds": { "eci": "05", "flow": "frictionless", "exception": null },
  "error": { "code": "...", "messages": [...], "recommended_message_for_user": "..." },
  "verify_url": "...",
  "redirect_url": "...",
  "order_metadata": { ... },
  "verification_result": { "avs_result": "...", "cvv_result": "..." },
  "routing": { "cascade_steps": [...] }
}
```

- `transactions` is a **map** keyed by transaction ID (not an array)
- `error.messages` is an **array** of strings
- `error.recommended_message_for_user` is a user-friendly message for display
- Recurring token is at `transaction.card_token.token`
- `verify_url` is set for 3DS verification; `redirect_url` is set on terminal statuses for return navigation

See [errors.md](errors.md) for the full error code table.
