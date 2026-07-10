# Solidgate Payment Form — Quick Start

Step-by-step guide: get API keys, generate a payment intent, render the form, handle webhooks.

---

## 1. Get API Keys

1. Sign up at [Solidgate Hub](https://hub.solidgate.com/)
2. Navigate to **Settings → API Keys**
3. Copy your keys:
   - **Public key** (`api_pk_...`) — identifies your merchant account
   - **Secret key** (`api_sk_...`) — signs and encrypts payment data
   - **Webhook public key** (`wh_pk_...`) — identifies webhooks
   - **Webhook secret key** (`wh_sk_...`) — verifies webhook signatures

Store keys in environment variables — never hardcode them:
```bash
export SOLIDGATE_PUBLIC_KEY="api_pk_7b197..."
export SOLIDGATE_SECRET_KEY="api_sk_a1b2c..."
export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
```

---

## 2. Generate Payment Intent (Backend)

Your backend builds a payment intent JSON, AES-256-CBC encrypts it, then signs the **encoded ciphertext** with HMAC-SHA512 and returns `{ merchant, signature, paymentIntent }` to the frontend. **Strongly prefer the official SDK** for whichever language you're in — it gets the (subtle) signature math right automatically.

### Node.js (official SDK)

```bash
npm install @solidgate/node-sdk
```

```javascript
const { randomUUID } = require("node:crypto");
const solidGate = require("@solidgate/node-sdk");

const api = new solidGate.Api(
  process.env.SOLIDGATE_PUBLIC_KEY,
  process.env.SOLIDGATE_SECRET_KEY,
);

const merchantData = api.formMerchantData({
  amount: 1020,
  currency: "USD",
  order_id: `order-${randomUUID()}`,
  order_description: "Test payment",
  platform: "WEB",
}).toObject(); // { merchant, signature, paymentIntent }
```

### Python (official SDK)

```bash
pip install solidgate-sdk
```

```python
import os, uuid
from solidgate import ApiClient

# Constructor accepts public_key / secret_key — positional or keyword.
client = ApiClient(
    public_key=os.environ["SOLIDGATE_PUBLIC_KEY"],
    secret_key=os.environ["SOLIDGATE_SECRET_KEY"],
)

md = client.form_merchant_data({
    "amount": 1020,
    "currency": "USD",
    "order_id": f"order-{uuid.uuid4()}",
    "order_description": "Test payment",
    "platform": "WEB",
})
# md is `solidgate.MerchantData` with attrs payment_intent / merchant / signature.
# No `.to_dict()` exists; convert manually for the frontend (which expects camelCase):
merchant_data = {
    "merchant": md.merchant,
    "signature": md.signature,
    "paymentIntent": md.payment_intent,
}
```

> PHP, Go, and React/Vue SDK examples: see the [examples folder](examples/). Stacks without an official SDK: implement the algorithm by hand following [authentication.md](authentication.md) — the form-flow signature is HMAC-SHA512 over `merchant + encodedPaymentIntent + merchant`.

---

## 3. Render the Payment Form (Frontend)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Checkout</title>
</head>
<body>
  <h1>Complete Your Payment</h1>
  <div id="payment-form"></div>

  <script src="https://cdn.solidgate.com/js/solid-form.js"></script>
  <script>
    // Fetch merchantData from your backend
    fetch("/api/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1020,
        currency: "USD",
        order_id: "order-12345",
        order_description: "Test payment",
      }),
    })
      .then((r) => r.json())
      .then((merchantData) => {
        const form = PaymentFormSdk.init({
          merchantData,
          iframeParams: { containerId: "payment-form" },
        });

        form.on("success", (event) => {
          alert("Payment successful!");
          console.log("Success:", event);
        });

        form.on("fail", (event) => {
          alert("Payment failed: " + event.error?.message);
          console.log("Failed:", event);
        });

        form.on("error", (event) => {
          console.error("Error:", event);
        });
      });
  </script>
</body>
</html>
```

---

## 4. Handle Webhooks (Backend)

After payment, Solidgate sends a POST request to your webhook URL with the order status.

### Node.js (Express)

```javascript
const crypto = require("crypto");

const WH_PUBLIC_KEY = process.env.SOLIDGATE_WEBHOOK_PUBLIC_KEY;
const WH_SECRET_KEY = process.env.SOLIDGATE_WEBHOOK_SECRET_KEY;

// IMPORTANT: Use raw body for signature verification
app.post("/webhook", express.raw({ type: "*/*" }), (req, res) => {
  const rawBody = req.body.toString("utf-8");
  const signature = req.headers["signature"];

  // Verify signature (hex then base64). Webhook signature IS over the raw body
  // bytes — do NOT re-serialize.
  const data = WH_PUBLIC_KEY + rawBody + WH_PUBLIC_KEY;
  const hmacHex = crypto.createHmac("sha512", WH_SECRET_KEY).update(data).digest("hex");
  const expected = Buffer.from(hmacHex).toString("base64");

  // Constant-time compare — guards against signature-leak timing attacks.
  if (
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    console.error("Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  // Process the event
  const event = JSON.parse(rawBody);
  const eventType = req.headers["solidgate-event-type"];

  console.log(`Webhook [${eventType}]:`, JSON.stringify(event));

  if (eventType === "card_gate.order.updated") {
    const status = event.order?.status;
    const orderId = event.order?.order_id;

    if (status === "settle_ok") {
      // Payment captured — fulfill the order
      console.log(`Order ${orderId} paid successfully`);
    } else if (status === "auth_failed") {
      // Payment failed
      console.log(`Order ${orderId} failed`);
    }
  }

  res.status(200).send("OK");
});
```

---

## 5. Test It

1. **Start your server:**
   ```bash
   export SOLIDGATE_PUBLIC_KEY="api_pk_..."
   export SOLIDGATE_SECRET_KEY="api_sk_..."
   export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
   export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
   node server.js
   ```

2. **Open** `http://localhost:3000` — you should see the payment form

3. **Use test card details:**
   | Card Number | Scenario |
   |-------------|----------|
   | `4067429974719265` | Successful payment |
   | `4553815318053315` | Auth failed |
   | `5151948477715326` | Insufficient funds |
   | `497592770594980` | 3DS Challenge flow |

   Expiry: any future date. CVV: any 3 digits.

4. **For webhooks** use [ngrok](https://ngrok.com/) to expose your local server:
   ```bash
   ngrok http 3000
   # Use the https URL as your webhook endpoint
   ```

> Full test card list: [testing.md](testing.md)

---

## Ready-to-Run Examples

Complete working servers on multiple languages — each with payment intent generation, webhook verification, and a test HTML form:

| Language | File | Run |
|----------|------|-----|
| Node.js | [examples/nodejs/server.js](examples/nodejs/server.js) | `npm install express && node server.js` |
| Python | [examples/python/server.py](examples/python/server.py) | `pip install flask solidgate-sdk && python server.py` |
| Go | [examples/go/main.go](examples/go/main.go) | `go run main.go` |
| PHP | [examples/php/server.php](examples/php/server.php) | `php -S localhost:3000 server.php` |

> Full documentation: [SKILL.md](SKILL.md)
