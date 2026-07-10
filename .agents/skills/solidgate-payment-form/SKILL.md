---
name: solidgate-payment-form
description: Solidgate Payment Form integration — embed payment form via JS SDK, handle payments and webhooks, no PCI DSS required
---

# Solidgate Payment Form API Skill

Reference documentation for integrating Solidgate Payment Form (https://docs.solidgate.com/payments/integrate/payment-form/).

## Overview

This skill provides complete API reference for embedding Solidgate's Payment Form into your website or app. The Payment Form is an iframe-based solution — sensitive card data never touches your server, so **PCI DSS certification is NOT required**.

Solidgate provides frontend SDKs (vanilla JS, React, Vue, Angular) and backend SDKs (PHP, Node.js, Go, Python, Kotlin).

## Common pitfalls (read first)

1. **Generate `merchantData` on the backend with an official SDK.** The secret key (`api_sk_…`) stays on the server — never ship it to the browser, a mobile app, or any client-side code. The form-flow signature is HMAC-SHA512 over `merchant + encodedPaymentIntent + merchant` (the **encrypted+encoded string**, NOT the raw JSON body) — different from the regular API-call signature. **Use the official SDK to compute it; manual signing is strongly discouraged because the input ordering and the encrypted-vs-raw distinction are easy to get wrong.** (See [frontend-sdk.md § Backend SDKs](frontend-sdk.md#backend-sdks).)
2. **Webhook signature: use raw body bytes + constant-time compare + webhook keys** (`wh_pk_…`/`wh_sk_…`). Re-serializing JSON, plain `==` compare, or using API keys are the three most common causes of "Invalid signature". (See [webhooks.md § Verification checklist](webhooks.md#verification-checklist-mandatory).)
3. **Confirm orders via webhook**, not the frontend `success` event. Frontend events drive UX only — webhook is the source of truth.
4. **Error code `1.01` = your integration**, not a customer card decline. Don't surface a "try another card" message to the user. (See [errors.md](errors.md).)
5. **Styling lives in `styles` + `formParams`, not your CSS** — the form renders in a sandboxed iframe. (See [styling.md](styling.md).)

## Security antipatterns (refuse to enable)

If the user asks for any of the patterns below, **decline** and redirect to the safe alternative. These exist because they create security holes, PCI-DSS violations, or operational disasters that aren't obvious from the request.

| Antipattern | Why it's unsafe | Safe alternative |
|-------------|-----------------|------------------|
| Sign `merchantData` in the browser / put `api_sk_…` client-side | Anyone with DevTools extracts the key and signs arbitrary intents (charge/refund as you). Key rotation is the only fix. | Minimal backend endpoint (Next.js Route Handler, Lambda, Express) reads `process.env.SOLIDGATE_SECRET_KEY` and returns merchantData. |
| Hardcode `api_sk_…` in component code "just for testing" | The secret almost always gets committed and shipped. **Sandbox-key leaks are recoverable; prod-key leaks are not.** | `.env.local` (gitignored) + server-only handler. Use sandbox keys in dev, prod keys only in prod env. |
| Skip webhook signature verification / trust by IP allowlist | Solidgate's outbound IPs aren't a stable contract. Anyone who learns the URL spoofs status updates → fraudulent fulfillment. | Run the [webhooks.md verification checklist](webhooks.md#verification-checklist-mandatory). Keep verify on in dev — it catches real bugs before prod. |
| Fulfill orders on the frontend `success` event | Events can be missed (network drop, tab close), spoofed (DevTools), and `auth_ok` ≠ captured funds. | Fulfill from `card_gate.order.updated` webhook with `status: settle_ok`. Show optimistic UI on the frontend event if needed; gate fulfillment on the webhook. |
| Log the customer's full PAN for "debugging" | Iframe model means PAN never touches your origin — that's why you're out of PCI scope. Capturing PAN destroys that. | Use the safe fields exposed by the `card` event: `bin` (first 6), `brand`, `cardType`, `cardCategory`, `bank`, `binCountry`. For 3DS specifics use the `verify` event, `orderStatus` events, decline codes from [errors.md](errors.md), and order/transaction logs in Solidgate Hub. |
| Webhook endpoint over plain HTTP | HMAC verifies authenticity but not confidentiality — payloads contain order/customer data. Solidgate also requires HTTPS. | Front the box with `ngrok http <port>`, Cloudflare Tunnel, or a TLS-terminating proxy with Let's Encrypt. |
| Sign with `api_pk_…` only ("we don't need the secret on the client") | Public key is a no-op for HMAC; the SDK rejects unsigned/wrongly-signed data. The signature *requires* the secret key. | Backend signing endpoint, returning the precomputed `{ merchant, signature, paymentIntent }` blob. |
| Use the same key set for sandbox and prod | Test traffic hits real cards / real money; rate limits differ (10/s sandbox vs 25/s live); breaks reconciliation. | Separate `SOLIDGATE_*_KEY` env vars per environment. Sandbox keys in dev/staging, prod keys only in prod. |

When refusing, **always show the safe path**. A bare "no" without a redirect is a worse answer.

## Question → file map

| If the user asks about… | Open this file first |
|-------------------------|----------------------|
| "generate merchantData" / "what's the backend code" / "encrypt payment intent" | [frontend-sdk.md](frontend-sdk.md) (SDK call), then [authentication.md](authentication.md) for manual fallback |
| "customize / style / brand the form" / templates / fonts / colors | [styling.md](styling.md) |
| "webhook is failing" / "invalid signature" / "verify webhook" | [webhooks.md](webhooks.md) |
| "Apple Pay button" / "Google Pay" / Click to Pay / PayPal / Pix / Bizum / Cash App | [frontend-sdk.md](frontend-sdk.md) (button params + paymentIntent fields) |
| "1-click payment" / "saved card" / "resign" / "CVV-only form" | [frontend-sdk.md § Resign Flow](frontend-sdk.md#resign-flow-1-click-payments) |
| "error code X.YY" | [errors.md](errors.md) |
| "what fields can I send in paymentIntent" | [payment-intent.md](payment-intent.md) |
| "no SDK for my language" (Rust, Elixir, Java, …) | [authentication.md](authentication.md) (manual recipe + Rust example) |
| "test cards" / "sandbox" | [testing.md](testing.md) |
| "subscriptions / billing cycles / trials" | [subscriptions.md](subscriptions.md) |

## Minimum Required Flow

Any integration MUST implement these steps as the baseline:

1. **Generate payment intent** — backend encrypts a JSON payload with AES-256-CBC using your secret key, then generates an HMAC-SHA512 signature. This produces a `merchantData` object with three fields: `merchant`, `signature`, `paymentIntent`. See [authentication.md](authentication.md) and [payment-intent.md](payment-intent.md).
2. **Render the form** — frontend loads the SDK (`https://cdn.solidgate.com/js/solid-form.js` or a framework package) and calls `PaymentFormSdk.init({ merchantData })`. The iframe renders the card form. See [frontend-sdk.md](frontend-sdk.md).
3. **Listen for events** — subscribe to frontend events (`mounted`, `success`, `fail`, `error`, `verify`) to update your UI. See [frontend-sdk.md](frontend-sdk.md) for the full list and payloads.
4. **Accept webhooks** — implement a POST endpoint that receives `card_gate.order.updated` events, verifies the HMAC-SHA512 signature using your webhook keys, and processes the final order status. See [webhooks.md](webhooks.md).
5. **Handle terminal statuses:**
   - `settle_ok` — payment captured, fulfill the order
   - `auth_ok` — funds reserved (if using auth-only flow), settle manually or automatically
   - `auth_failed` — payment failed, allow retry

Webhook is the primary mechanism for learning about status changes. Frontend events are for UX only — always confirm via webhook before fulfilling orders.

## Quick Start

New to Solidgate? See the **[Quick Start Guide](quickstart.md)** — step-by-step walkthrough: get API keys, generate a payment intent, render the form, handle webhooks.

## Examples

Ready-to-run servers with payment intent generation, webhook verification, and an embedded payment form. Each backend example uses the **official Solidgate SDK** for `merchantData` generation — **always prefer the SDK over a hand-rolled implementation**, because the SDK encapsulates the AES-256-CBC encryption and the HMAC-SHA512 signature over the encoded payment intent (input ordering and the encrypted-vs-raw distinction are easy to get wrong by hand). Webhook signature verification is the only place hand-rolled HMAC remains, because none of the SDKs ship a webhook helper.

All examples read keys from environment variables — set them before starting:
```bash
export SOLIDGATE_PUBLIC_KEY="api_pk_..."
export SOLIDGATE_SECRET_KEY="api_sk_..."
export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
```

| Language | File | Backend SDK | Run |
|----------|------|-------------|-----|
| Node.js | [server.js](examples/nodejs/server.js) | `@solidgate/node-sdk` | `npm install express @solidgate/node-sdk && node server.js` |
| Python | [server.py](examples/python/server.py) | `solidgate-sdk` | `pip install flask solidgate-sdk && python server.py` |
| Go | [main.go](examples/go/main.go) | `github.com/solidgate-tech/go-sdk` | `go mod init … && go get github.com/solidgate-tech/go-sdk && go run main.go` |
| PHP | [server.php](examples/php/server.php) | `solidgate/php-sdk` | `composer require solidgate/php-sdk && php -S localhost:3000 server.php` |
| React | [PaymentForm.tsx](examples/react/PaymentForm.tsx) | `@solidgate/react-sdk` (frontend) | `npm install @solidgate/react-sdk` |
| Vue | [PaymentForm.vue](examples/vue/PaymentForm.vue) | `@solidgate/vue-sdk` (frontend) | `npm install @solidgate/vue-sdk` |

Each backend example exposes a test page at `http://localhost:3000`.

**Stacks without an official Solidgate backend SDK** (Java, Kotlin, C#, Ruby, Rust, Elixir, …): manual generation is the **fallback only** when no SDK exists for your language — if your stack appears in the table above, use that SDK instead. To implement by hand, follow [authentication.md](authentication.md). Two crucial details for the form flow specifically:

1. AES-256-CBC encrypt the JSON intent with a random 16-byte IV; key = first 32 bytes of the secret key; output = base64url of `IV ‖ ciphertext`.
2. The signature for `merchantData` is HMAC-SHA512 over `merchant + encodedPaymentIntent + merchant` — i.e. the **encrypted+encoded string**, not the original JSON. This differs from the regular API-call signature (which signs the JSON body); the official SDKs handle this distinction automatically.

## Solidgate Domains

The merchant only directly hits the CDN. Live vs sandbox is selected by the API key, not by URL.

| Purpose | URL |
|---------|-----|
| JS SDK (CDN) | `https://cdn.solidgate.com/js/solid-form.js` |
| Merchant Hub (API keys, settings) | `https://hub.solidgate.com/` |
| Iframe origin (loaded by SDK; no merchant action required) | `https://form-v2.solidgate.com` |

## Authentication

Two sets of API keys (obtained from Solidgate Hub at https://hub.solidgate.com/):

| Key | Prefix | Purpose |
|-----|--------|---------|
| Public key | `api_pk_` | Identifies merchant, sent as `merchant` field in merchantData |
| Secret key | `api_sk_` | Signs requests (HMAC-SHA512) and encrypts payment intent (AES-256-CBC). **Never expose on frontend.** |
| Webhook public key | `wh_pk_` | Sent in webhook `merchant` header |
| Webhook secret key | `wh_sk_` | Verifies webhook HMAC-SHA512 signature. **Never expose publicly.** |

See [authentication.md](authentication.md) for signature generation and payment intent encryption algorithms.

## Rate Limits

| Environment | Limit |
|-------------|-------|
| Live | 25 requests/second per merchant |
| Sandbox | 10 requests/second per merchant |

Exceeding returns HTTP 429 with error code `5.07`.

## Common Data Formats

- **Amounts** — always in minor currency units (cents). `1020` = $10.20
- **Currency** — ISO 4217 three-letter codes (`USD`, `EUR`, `GBP`)
- **Order ID** — merchant-defined unique string, 1–255 characters

## Order Statuses

"Terminal" = the order will not transition further on its own. `auth_ok` is a successful authorization but the order can still progress to `settle_ok`, `void_ok`, or expire — treat it as non-terminal in your fulfillment logic unless you operate auth-only.

| Status | Terminal? | Description |
|--------|-----------|-------------|
| `processing` | No | Payment is being processed |
| `3ds_verify` | No | Awaiting 3DS verification |
| `auth_ok` | No (see note) | Funds reserved on card |
| `auth_failed` | Yes | Authorization failed |
| `void_ok` | Yes | Authorization voided |
| `settle_ok` | Yes | Funds captured |
| `partial_settled` | Yes | Partial capture |
| `refunded` | Yes | Refund processed (use `refunded_amount` field on the order to detect partial vs full) |

## Transaction Types

`auth`, `settle`, `void`, `refund`, `recurring-auth`, `resign-auth`, `apple-pay`, `google-pay`

## Common Error Responses

All API errors follow this format:
```json
{
  "error": {
    "code": "2.01",
    "messages": ["Invalid data"]
  }
}
```

See [errors.md](errors.md) for the full error code table.
