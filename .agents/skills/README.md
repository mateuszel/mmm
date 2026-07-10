# Solidgate AI Skills for Payment Integration

Complete documentation and code examples for integrating with Solidgate payment API. Optimized for LLM models (ChatGPT, Claude, Cursor, Windsurf) with ready-to-run examples in 6 programming languages.

## Three Skills — Choose Your Integration

### Solidgate Payments

| Skill | Directory | PCI DSS | Best For |
|-------|-----------|---------|----------|
| **Payment Form** | [`solidgate-payment-form/`](solidgate-payment-form/) | Not required | Most merchants — embed an iframe, card data never touches your server |
| **Host-to-Host (H2H)** | [`solidgate-h2h/`](solidgate-h2h/) | Required | PCI DSS certified merchants — direct API calls with card data |

> **Not sure which to pick?** Use **Payment Form**. It's simpler, more secure, and covers 90% of use cases.

### ChargebackHit (Chargeback Prevention & Dispute Management)

| Skill | Directory | Best For |
|-------|-----------|----------|
| **ChargebackHit** | [`chargebackhit/`](chargebackhit/) | Chargeback prevention (Ethoca, RDR, CDRN, Order Insight), dispute representment, fraud alerts |

---

## Quick Start

1. Download or clone this repository
2. Read `SKILL.md` in the skill directory you need — it's the main entry point for AI agents
3. Pick a code example in your language
4. Get API keys from [Solidgate Hub](https://hub.solidgate.com/) (Settings → API Keys)
5. Set environment variables and run the example server
6. Integrate into your application

---

## How to Use with AI

### ChatGPT / Claude (web)

Upload `SKILL.md` as a file attachment, or copy its contents into the chat. For deeper context, also upload `authentication.md` and the relevant endpoint docs.

### Cursor / Windsurf / VS Code + Claude Code

Place the extracted skill directory in your workspace root. The AI agent will automatically discover and use the documentation files.

```
your-project/
├── solidgate-payment-form/    ← drop the skill folder here
│   ├── SKILL.md
│   ├── authentication.md
│   ├── ...
├── src/
├── package.json
└── ...
```

### Claude Code (CLI)

Place the skill directory in your project. Claude Code will read the `SKILL.md` and linked files when you ask it to integrate payments.

### Custom AI Agents

Use `SKILL.md` content as part of your system prompt. It contains the minimum required flow, API reference links, and common types.

### RAG Systems

Index all `.md` files from the skill directory. Each file is self-contained with a clear topic boundary.

---

## What's Inside

### Documentation (`.md` files)

| File | Description |
|------|-------------|
| `SKILL.md` | **Main file** — overview, minimum flow, authentication, sections index, common types, error format |
| `authentication.md` | HMAC-SHA512 signature + AES-256-CBC encryption with code examples in 4 languages |
| `quickstart.md` | Step-by-step guide from zero to working payments |
| `webhooks.md` | Event types, signature verification, retry schedule, idempotency |
| `errors.md` | Full error code table (0.xx–7.xx) with retry recommendations |
| `testing.md` | Test cards, sandbox setup, digital wallet test amounts |

**Payment Form additionally:** `payment-intent.md`, `frontend-sdk.md`, `subscriptions.md`

**H2H additionally:** `charges.md`, `order-management.md`, `recurring.md`, `google-pay.md`, `apple-pay.md`, `apm.md`, `subscriptions.md`

### Code Examples

Each example is a single-file server with all essential endpoints, webhook signature verification, and a test HTML page at `http://localhost:3000`.

**Payment Form examples:**

| Language | File | Run |
|----------|------|-----|
| Node.js | `examples/nodejs/server.js` | `npm install express && node server.js` |
| Python | `examples/python/server.py` | `pip install flask cryptography && python server.py` |
| Go | `examples/go/main.go` | `go run main.go` |
| PHP | `examples/php/server.php` | `php -S localhost:3000 server.php` |
| React | `examples/react/PaymentForm.tsx` | `npm install @solidgate/react-sdk` |
| Vue | `examples/vue/PaymentForm.vue` | `npm install @solidgate/vue-sdk` |

**H2H examples:**

| Language | File | Run |
|----------|------|-----|
| Node.js | `examples/nodejs/server.js` | `npm install express && node server.js` |
| Python | `examples/python/server.py` | `pip install flask requests && python server.py` |
| Go | `examples/go/main.go` | `go run main.go` |
| PHP | `examples/php/server.php` | `php -S localhost:3000 server.php` |
| Java | `examples/java/SolidgateServer.java` | `javac SolidgateServer.java && java SolidgateServer` |
| C# | `examples/csharp/Program.cs` | `dotnet run` (.NET 6+) |

All examples read keys from environment variables:
```bash
export SOLIDGATE_PUBLIC_KEY="api_pk_..."
export SOLIDGATE_SECRET_KEY="api_sk_..."
export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
```

### What Every Example Includes

- Payment creation (Payment Form: encrypted paymentIntent generation; H2H: direct charge API call)
- HMAC-SHA512 signature generation and verification
- Webhook endpoint with signature verification
- Terminal status handling: `settle_ok`, `auth_failed`, `auth_ok`
- Debug logging (clearly marked for removal in production)
- Test HTML page at `http://localhost:3000`
