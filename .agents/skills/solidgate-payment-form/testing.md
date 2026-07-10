# Testing

Use Solidgate's sandbox environment to test your Payment Form integration without processing real payments.

---

## Sandbox Setup

Use the same base URLs as production — sandbox mode is determined by your API keys. Get test keys from [Solidgate Hub](https://hub.solidgate.com/) (Settings → API Keys → Test environment).

---

## Test Cards

| Card Number | Brand | Scenario |
|-------------|-------|----------|
| `4067429974719265` | Visa | Successful payment (no 3DS) |
| `4532456618142692` | Visa | Successful recurring |
| `4553815318053315` | Visa | Auth failed |
| `5361074849060618` | Mastercard | Settlement failed |
| `5151948477715326` | Mastercard | Insufficient funds (decline code 3.02) |
| `5462413335551193` | Mastercard | Card blocked by issuer (decline code 3.01) |
| `4283184051091165` | Visa | Suspected fraud (decline code 3.10) |
| `497592770594980` | Visa | 3DS Challenge flow |

**For all test cards:**
- **Expiry date**: any future date (e.g., `12/30`)
- **CVV**: any 3 digits (e.g., `123`) or 4 digits for AMEX
- **Cardholder name**: any value

---

## Digital Wallet Test Amounts

When testing Google Pay or Apple Pay, the **amount in cents** determines the behavior:

| Amount (cents) | Scenario |
|----------------|----------|
| `100` | Success (no 3DS) |
| `666` | Success with 3DS Challenge |
| `555` | Success with frictionless 3DS |

---

## Testing Webhooks Locally

Webhooks require a publicly accessible URL. Use a tunnel for local development:

### Using ngrok

```bash
# 1. Start your server
node server.js

# 2. In another terminal, expose port 3000
ngrok http 3000

# 3. Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
# Use it when configuring webhook URL
```

### Using Solidgate Hub

You can also configure a webhook URL in Solidgate Hub (Settings → Webhooks) for testing.

---

## Sandbox Limitations

- Rate limit: **10 requests/second** (vs 25 in production)
- No real money is charged
- Webhooks are delivered to your configured URL
- 3DS flows are simulated
- Digital wallet buttons may require additional setup (Google Pay merchant ID)

---

## Test Checklist

1. **Happy path**: Use card `4067429974719265` → verify `success` event fires → verify webhook received with `settle_ok`
2. **Decline**: Use card `4553815318053315` → verify `fail` event fires with error code → verify webhook with `auth_failed`
3. **Insufficient funds**: Use card `5151948477715326` → verify decline_reason code `3.02` in fail event / webhook
4. **3DS flow**: Use card `497592770594980` → verify `verify` event fires → complete 3DS → verify `success`
5. **Webhook signature**: Verify your signature verification works by checking the HMAC matches
6. **Idempotency**: Send duplicate webhook with same `solidgate-event-id` → verify it's handled once
7. **Form events**: Verify `mounted`, `submit`, `card` (BIN detection), `resize` events fire correctly
