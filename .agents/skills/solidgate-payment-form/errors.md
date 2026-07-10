# Error Codes

Concise reference for code generation. Use this to decide how to handle errors in the integration you're building. For the full 62-code list, link out: https://docs.solidgate.com/payments/payments-insights/error-codes/

---

## Two error shapes

**API errors** — returned in HTTP responses (4xx/5xx) when something is wrong with the request:
```json
{ "error": { "code": "5.06", "messages": ["Duplicate order"] } }
```

**Decline reasons** — webhook body has `error` as a top-level sibling of `order`/`transactions` when the issuer or anti-fraud rejects an authorized request. Verified from `api-docs.solidgate.com`:
```json
{
  "error": {
    "code": "3.08",
    "messages": ["Do not honor"],
    "recommended_message_for_user": "Advise the customer to contact their card issuer..."
  }
}
```

Use `error.recommended_message_for_user` for end-user UX text (it's localized) and `error.code` for branching.

The code prefix tells you which it is:

| Range | Where it appears | Cause |
|-------|------------------|-------|
| `0.xx`, `1.xx`, `2.xx`, `5.xx`, `6.xx`, `7.xx` | API HTTP error response | Request / config / system |
| `3.xx`, `4.xx` | Webhook body's top-level `error.code` | Issuer or anti-fraud declined |
| `8.xx` | Subscription webhook body's `cancel_code` | Subscription cancellation reason — see [subscriptions.md](subscriptions.md#cancellation-reason-codes) |

---

## Retry decision rules

This is what the AI integration code needs to implement.

| Range | Retry policy |
|-------|--------------|
| `0.xx`, `1.xx` | Don't retry — surface to caller. `1.01` means signature/keys are wrong; check integration. |
| `2.xx` | Don't retry with the same payload. The data is invalid; let the caller fix it. |
| `3.xx` | Don't auto-retry — the issuer declined. UX should ask the customer for a different card or to contact their bank. Exception: subscription smart-retry handles `3.02`/`3.03` automatically. |
| `4.xx` | Don't retry. Exception: `4.08` (AVS mismatch) is retryable if the caller corrects the billing address. |
| `5.03`, `5.07`, `6.xx` | Retry with exponential backoff (max 3 attempts). `5.07` is rate limit (HTTP 429) — back off at least 1s. |
| `5.06` | Don't retry — `order_id` collision. Generate a fresh unique id (UUID v4). Do **not** use timestamps: they collide under concurrency and are guessable. |
| Other `5.xx`, `7.xx` | Don't retry. Configuration / wallet errors that need integration changes. |

---

## Codes you'll actually reference in code

These are the codes that typically drive branching in integration logic or UX text:

| Code | Meaning | What the code should do |
|------|---------|------------------------|
| `1.01` | Authentication failed (bad signature/keys) | Log loudly — your signature generation is wrong, not a customer issue |
| `2.06` | Invalid CVV | Show "Please re-enter your CVV" |
| `2.08` | Invalid card number | Show "Card number is incorrect" |
| `2.09` | Invalid / expired card date | Show "Card has expired or date is invalid" |
| `3.02` | Insufficient funds | Show "Insufficient funds — try another card" |
| `3.04` | Generic issuer decline | Show "Card was declined — try another card or contact your bank" |
| `3.13` | Customer cancelled | Show "Payment cancelled" |
| `4.08` | AVS mismatch | Re-prompt for billing address |
| `5.06` | Duplicate `order_id` | Bug — fix `order_id` generation |
| `5.07` | Rate limit (HTTP 429) | Back off and retry |

For codes not in this table, fall back to the retry policy above and surface the upstream `messages[0]` text to logs (not to customers — it's not localized).

---

## Implementation skeleton

```javascript
// API error
if (response.error) {
  const code = response.error.code;
  const range = code.split(".")[0];

  if (["0", "1", "2", "4"].includes(range)) throw new Error(`Solidgate ${code}: not retryable`);
  if (range === "5" && code !== "5.03" && code !== "5.07") throw new Error(`Solidgate ${code}: not retryable`);
  // 5.03, 5.07, 6.xx → retry with backoff
  return retry();
}

// Webhook decline (top-level "error" sibling of order/transactions)
if (event.error?.code) {
  const code = event.error.code;
  const userMessage = event.error.recommended_message_for_user;
  // 3.xx / 4.xx — show userMessage, don't auto-retry (except 4.08)
  showDeclineMessage(code, userMessage);
}
```
