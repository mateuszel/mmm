# AI Prompts for Solidgate Integration

Ready-made prompts for integrating Solidgate payments. Copy a prompt, paste it into your AI tool, and get working code.

Choose your experience level:
- **Beginners** — no code knowledge, use Replit / Lovable / Bolt.new
- **Developers** — working with Cursor, Claude Code, Windsurf, or your own codebase

---

## Before You Start

### API Keys

The AI will ask you for API keys. Get them from [Solidgate Hub](https://hub.solidgate.com/):
- **Public key** (`api_pk_...`) — identifies your merchant account
- **Secret key** (`api_sk_...`) — signs and encrypts payment data
- **Webhook public key** (`wh_pk_...`) — identifies webhooks
- **Webhook secret key** (`wh_sk_...`) — verifies webhook signatures

### Test First

Always start with test/sandbox keys. Switch to production only after everything works.

### Security

AI writes code, but you are responsible for security. Especially:
- Never expose secret keys on the frontend or in git
- Always verify webhook signatures before processing payments
- Use HTTPS in production

### Common Mistakes

| Mistake | Fix |
|---------|-----|
| Wrong amount format | Amounts are in **cents**: $10.20 = `1020`, not `10.20` |
| Skipping webhook verification | Always verify HMAC-SHA512 signature — without it, anyone can fake payment confirmations |
| Duplicate order_id | Each order must have a unique `order_id` — use timestamps or UUIDs |
| Relying only on frontend events | Frontend `success` event is for UX only — always confirm via webhook before fulfilling orders |
| Hardcoded keys in source code | Use environment variables: `SOLIDGATE_PUBLIC_KEY`, `SOLIDGATE_SECRET_KEY`, etc. |

---

## Prompts for Beginners (No Code Experience)

### I Want to Accept Payments (Payment Form)

> Copy this prompt, paste into Replit, Lovable, or Bolt.new.

```
I want to add payment acceptance to my website using Solidgate Payment Form.

TASK:
Write complete working code to accept a payment via an embedded payment form (iframe).

WHAT SHOULD HAPPEN:
1. My website shows a "Pay" button
2. User clicks → my backend generates an encrypted payment intent
3. The Solidgate payment form (iframe) appears on the page
4. User enters card details directly in the secure form (card data NEVER touches my server)
5. After payment, I get a webhook notification with the result
6. I show success or failure to the user

INTEGRATION TYPE: Payment Form (iframe) — NO PCI DSS required.

TECHNICAL DETAILS:
- Backend generates merchantData: { merchant, signature, paymentIntent }
- Signature: base64(hex(HMAC-SHA512(secret_key, public_key + json_body + public_key)))
- PaymentIntent encryption: AES-256-CBC, IV = random 16 bytes, key = first 32 bytes of secret_key
- Frontend loads SDK from: https://cdn.solidgate.com/js/solid-form.js
- Frontend calls: PaymentFormSdk.init({ merchantData, container })
- Webhook verification: base64(hex(HMAC-SHA512(wh_secret_key, wh_public_key + raw_body + wh_public_key)))

TEST DATA:
- Amount: $10.20 (1020 cents)
- Currency: USD
- Order description: "Test payment"
- Test card: 4067429974719265, any future expiry, any 3-digit CVV

MY KEYS:
- Public key: [paste your api_pk_... here]
- Secret key: [paste your api_sk_... here]
- Webhook public key: [paste your wh_pk_... here]
- Webhook secret key: [paste your wh_sk_... here]

Write the complete code:
1. Backend endpoint POST /api/payment-intent — generates merchantData
2. Backend endpoint POST /webhook — verifies HMAC signature, processes payment status
3. Frontend HTML page with the embedded Solidgate form
4. Handle events: success, fail, error
```

---

### My Server Must Know About Payments (Webhooks)

```
I need my server to automatically receive payment status updates from Solidgate.

TASK:
Set up automatic webhook processing with signature verification.

WHAT SHOULD HAPPEN:
1. User pays on the Solidgate payment form
2. Solidgate automatically sends a POST request to my server
3. My server verifies the HMAC-SHA512 signature
4. My server processes the payment status (settle_ok, auth_failed, etc.)
5. My server saves the result to the database
6. My server returns HTTP 200 within 30 seconds

WEBHOOK DETAILS:
- Solidgate sends POST with JSON body
- Headers: signature, merchant (wh_pk_...), solidgate-event-type, solidgate-event-id
- Signature formula: base64(hex(HMAC-SHA512(wh_secret_key, wh_public_key + raw_json_body + wh_public_key)))
- CRITICAL: use raw body bytes for verification — do NOT parse and re-serialize JSON
- Retry: 8 retries over 56 hours if no 2xx response within 30 seconds
- Use solidgate-event-id header for idempotency (deduplicate events)

EVENT TYPES:
- card_gate.order.updated — card payment status changed
- subscription.updated.v2 — subscription status changed
- card_gate.chargeback.received — chargeback notification

TERMINAL STATUSES:
- settle_ok — payment captured, fulfill the order
- auth_ok — funds reserved (for auth-only flow)
- auth_failed — payment declined
- void_ok — authorization cancelled
- refunded — funds returned

MY KEYS:
- Webhook public key: [paste wh_pk_...]
- Webhook secret key: [paste wh_sk_...]

WEBHOOK URL:
https://mysite.com/webhook

Write the complete webhook handler with:
- HMAC-SHA512 signature verification
- Idempotency check (deduplicate by solidgate-event-id)
- Status handling for all terminal statuses
- Error logging
- Database save (use any simple DB)
```

---

### I Want Subscriptions (Recurring Payments)

```
I want to set up recurring subscription payments via Solidgate.

TASK:
Build a subscription payment flow using the Payment Form.

WHAT SHOULD HAPPEN:
1. I create a product in Solidgate Hub (name, price, billing cycle)
2. User sees a "Subscribe" button on my site
3. Payment form appears → user enters card → first payment is charged
4. Solidgate automatically charges the card every billing cycle
5. I receive webhooks for each billing event
6. I can pause, cancel, or update the subscription via API

PAYMENT INTENT FOR SUBSCRIPTIONS:
{
  "order_id": "sub-init-001",
  "order_description": "Monthly Pro Plan",
  "product_id": "<UUID from Solidgate Hub>",
  "product_price_id": "<UUID from Solidgate Hub>",
  "customer_account_id": "my-customer-123",
  "customer_email": "user@example.com"
}
Note: Do NOT include amount/currency — they come from the product price.

SUBSCRIPTION STATUSES:
pending → active → paused / cancelled / redemption / expired

SUBSCRIPTION API (base: https://subscriptions.solidgate.com):
- Cancel: POST /api/v1/subscriptions/{id}/cancel
- Pause: POST /api/v1/subscriptions/{id}/pause
- Resume: POST /api/v1/subscriptions/{id}/resume

WEBHOOK EVENT: subscription.updated.v2

MY KEYS:
- Public key: [paste api_pk_...]
- Secret key: [paste api_sk_...]
- Product ID: [paste from Hub]
- Product Price ID: [paste from Hub]

Write the complete code for:
1. Subscription initialization via Payment Form
2. Webhook handler for subscription.updated.v2
3. API calls to cancel/pause/resume subscription
```

---

## Prompts for Developers

### Payment Form — Full Integration (Cursor / Claude Code)

```
Integrate Solidgate Payment Form into my project.

CONTEXT:
I need to accept card payments via Solidgate's iframe-based Payment Form.
No PCI DSS required — card data stays in Solidgate's iframe.

ARCHITECTURE:
Backend:
- POST /api/payment-intent — generates merchantData (signature + encrypted intent)
- POST /api/webhook — verifies HMAC-SHA512, processes order status updates

Frontend:
- Loads https://cdn.solidgate.com/js/solid-form.js (or @solidgate/react-sdk for React)
- Calls PaymentFormSdk.init({ merchantData, container })
- Subscribes to events: mounted, success, fail, error, verify

CRYPTO:
1. Signature: base64(hex(HMAC-SHA512(secret_key, public_key + JSON.stringify(intent) + public_key)))
2. Encryption: AES-256-CBC(key=secret_key[:32], iv=random(16), data=JSON.stringify(intent))
   Result: base64url(iv + ciphertext)
3. merchantData = { merchant: public_key, signature, paymentIntent: encrypted }

WEBHOOK VERIFICATION:
base64(hex(HMAC-SHA512(wh_secret_key, wh_public_key + raw_body + wh_public_key)))
Headers: signature, merchant, solidgate-event-type, solidgate-event-id

ENV VARS:
SOLIDGATE_PUBLIC_KEY=api_pk_...
SOLIDGATE_SECRET_KEY=api_sk_...
SOLIDGATE_WEBHOOK_PUBLIC_KEY=wh_pk_...
SOLIDGATE_WEBHOOK_SECRET_KEY=wh_sk_...

PAYMENT INTENT REQUIRED FIELDS:
{ amount: 1020, currency: "USD", order_id: "unique-id", order_description: "..." }

TEST CARD: 4067429974719265, any future expiry, any CVV → success
DECLINE CARD: 4553815318053315 → auth_failed
3DS CARD: 497592770594980 → 3DS challenge flow

Implement the full flow. Use existing project patterns for the backend framework.
```

---

### H2H — Direct Card Payments (PCI DSS Required)

```
Integrate Solidgate H2H (Host-to-Host) direct card payments.

CONTEXT:
My server has PCI DSS certification. I collect card data directly and send it to Solidgate API.

BASE URL: https://pay.solidgate.com

ENDPOINTS:
- POST /api/v1/charge — create payment (amount, currency, card_number, card_exp_month, card_exp_year, card_cvv, card_holder, order_id, order_description, customer_email, ip_address)
- POST /api/v1/status — check order status (order_id)
- POST /api/v1/refund — refund payment (order_id, amount?)
- POST /api/v1/void — void authorization (order_id)
- POST /api/v1/settle — capture authorized funds (order_id, amount?)
- POST /api/v1/recurring — MIT token-based charge (recurring_token, amount, currency, order_id, ...)
- POST /api/v1/resign — CIT 1-click charge with CVV (recurring_token, card_cvv, amount, ...)

AUTH HEADERS:
merchant: api_pk_...
signature: base64(hex(HMAC-SHA512(secret_key, public_key + json_body + public_key)))
Content-Type: application/json

3DS FLOW:
If response status=3ds_verify → redirect customer to redirect_url → result comes via webhook

WEBHOOK: same HMAC-SHA512 verification with wh_pk_ and wh_sk_ keys

ENV VARS:
SOLIDGATE_PUBLIC_KEY=api_pk_...
SOLIDGATE_SECRET_KEY=api_sk_...
SOLIDGATE_WEBHOOK_PUBLIC_KEY=wh_pk_...
SOLIDGATE_WEBHOOK_SECRET_KEY=wh_sk_...

TEST CARDS:
- 4067429974719265 → success
- 4553815318053315 → auth_failed
- 5151948477715326 → insufficient funds
- 497592770594980 → 3DS challenge

Implement: charge, status check, refund, webhook handler. Use existing project patterns.
```

---

### Refund & Void Flow

```
I need to handle refunds and voids for Solidgate payments.

TASK:
Implement refund and void functionality for my existing Solidgate integration.

RULES:
- VOID: cancel an authorized (unsettled) payment → order must be in auth_ok status → POST /api/v1/void
- REFUND: return money for a settled payment → order must be in settle_ok status → POST /api/v1/refund
- Partial refund: include "amount" field (in cents) → can do multiple partial refunds
- Full refund: omit "amount" field

AUTH: same HMAC-SHA512 signature as charge (see existing code)

REQUEST BODY: { "order_id": "order-12345" } (+ optional "amount" for partial refund)

STATUSES AFTER:
- void_ok — authorization cancelled
- refunded — full refund
- partial_refunded — partial refund

MY KEYS: [use existing env vars]

Implement:
1. POST /api/refund — full or partial refund
2. POST /api/void — cancel authorization
3. Proper error handling (can't void a settled order, can't refund more than original amount)
```

---

### Google Pay + Apple Pay via Payment Form

```
Add Google Pay and Apple Pay buttons to my Solidgate Payment Form.

GOOGLE PAY:
1. Get merchant ID from Google Pay & Wallet Console
2. Add to paymentIntent: google_pay_merchant_id: "10911390523550288022"
3. Add to form init: googlePayButtonParams: { enabled: true, color: "black", type: "pay" }
4. Test amounts: 100 cents = success, 666 = 3DS challenge, 555 = frictionless 3DS

APPLE PAY:
1. Host domain verification file at /.well-known/apple-developer-merchantid-domain-association
2. Enable Apple Pay in Solidgate Hub
3. Add to paymentIntent: apple_pay_merchant_name: "My Store"
4. Add to form init: applePayButtonParams: { enabled: true, color: "black", type: "pay", integrationType: "js" }
5. integrationType "js" = cross-browser (QR on non-Safari), "css" = Safari only

REACT EXAMPLE (custom containers):
const googleRef = useRef(null);
const appleRef = useRef(null);
<div ref={googleRef} />
<div ref={appleRef} />
<Payment
  merchantData={merchantData}
  googlePayContainerRef={googleRef}
  applePayContainerRef={appleRef}
  googlePayButtonParams={{ enabled: true, color: "black", type: "pay" }}
  applePayButtonParams={{ enabled: true, color: "black", type: "pay" }}
/>

Implement Google Pay and Apple Pay for my existing Payment Form integration.
```

---

## Troubleshooting Prompts

### Something Broke

```
My Solidgate integration returns this error: [paste error here]

ERROR CODES REFERENCE:
- 1.01: Authentication failed — check public_key and signature generation
- 2.01: Invalid data — check required fields in request body
- 2.02-2.18: Specific field validation errors
- 3.xx: Card issuer declined — customer should try different card
- 4.xx: Fraud/anti-fraud block — don't retry
- 5.06: Duplicate order_id — use unique IDs
- 5.07: Rate limit — slow down (max 25 req/sec live, 10 req/sec sandbox)
- 6.xx: Connection error — retry with backoff

SIGNATURE FORMULA:
base64(hex(HMAC-SHA512(secret_key, public_key + json_body + public_key)))

Fix the error in my code.
```

---

## Recommended Order

1. **Start** with "I Want to Accept Payments" — get the basic flow working
2. **Add** "My Server Must Know About Payments" — proper webhook handling
3. **Then** add features as needed: subscriptions, refunds, digital wallets
4. **Always** test with sandbox keys first, then switch to production

---

## Links

| Resource | URL |
|----------|-----|
| Solidgate Hub (Dashboard) | https://hub.solidgate.com/ |
| Documentation | https://docs.solidgate.com/ |
| API Reference | https://api-docs.solidgate.com/ |
| GitHub SDKs | https://github.com/solidgate-tech/ |
| Postman Collection | https://www.postman.com/solidgate/solidgate-api/ |
