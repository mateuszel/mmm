// Solidgate H2H — Node.js Example Server
//
// Endpoints:
// - POST /charge          — Create a card payment
// - POST /status          — Check order status
// - POST /refund          — Refund an order
// - POST /webhook         — Receive and verify webhooks
// - GET  /                — Test page
//
// Run:
//   npm install express
//   export SOLIDGATE_PUBLIC_KEY="api_pk_..."
//   export SOLIDGATE_SECRET_KEY="api_sk_..."
//   export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
//   export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
//   node server.js
//
// Keys:
//   Get them from https://hub.solidgate.com/ (Settings → API Keys)
//
// NOTE: H2H integration requires PCI DSS certification.

const express = require("express");
const crypto = require("crypto");

// ============================================================
// Configuration
// ============================================================
const PUBLIC_KEY = process.env.SOLIDGATE_PUBLIC_KEY || "";
const SECRET_KEY = process.env.SOLIDGATE_SECRET_KEY || "";
const WH_PUBLIC_KEY = process.env.SOLIDGATE_WEBHOOK_PUBLIC_KEY || "";
const WH_SECRET_KEY = process.env.SOLIDGATE_WEBHOOK_SECRET_KEY || "";
const SOLIDGATE_API = "https://pay.solidgate.com";
const PORT = 3000;

const app = express();
app.disable("x-powered-by");
app.use("/webhook", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Crypto helpers
// ============================================================

function generateSignature(publicKey, secretKey, jsonBody) {
  const data = publicKey + jsonBody + publicKey;
  const hmacHex = crypto.createHmac("sha512", secretKey).update(data).digest("hex");
  return Buffer.from(hmacHex).toString("base64");
}

async function solidgateRequest(method, path, body) {
  const jsonBody = body ? JSON.stringify(body) : "";
  const signature = generateSignature(PUBLIC_KEY, SECRET_KEY, jsonBody);

  // [DEBUG] Remove in production
  console.log(`[DEBUG] ${method} ${path} request:`, jsonBody);

  const resp = await fetch(`${SOLIDGATE_API}${path}`, {
    method,
    headers: {
      merchant: PUBLIC_KEY,
      signature: signature,
      "Content-Type": "application/json",
    },
    body: body ? jsonBody : undefined,
  });

  const data = await resp.json();

  // [DEBUG] Remove in production
  console.log("[DEBUG] response:", method, path, resp.status, JSON.stringify(data));

  if (!resp.ok) throw new Error(JSON.stringify(data));
  return data;
}

// Rate limits: 25 req/s (live), 10 req/s (sandbox). On HTTP 429, retry with exponential backoff.

function verifyWebhookSignature(rawBody, receivedSignature) {
  const data = WH_PUBLIC_KEY + rawBody + WH_PUBLIC_KEY;
  const hmacHex = crypto.createHmac("sha512", WH_SECRET_KEY).update(data).digest("hex");
  const expected = Buffer.from(hmacHex).toString("base64");
  if (expected.length !== receivedSignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSignature));
}

// ============================================================
// Endpoints
// ============================================================

// Test page
app.get("/", (req, res) => {
  res.send(`
    <h1>Solidgate H2H Test</h1>
    <h2>Create Charge</h2>
    <form action="/charge" method="POST">
      <label>Amount (cents): <input name="amount" value="1020"></label><br><br>
      <label>Currency: <input name="currency" value="USD"></label><br><br>
      <label>Card Number: <input name="card_number" value="4067429974719265"></label><br><br>
      <label>Exp Month: <input name="card_exp_month" value="12" size="4"></label>
      <label>Exp Year: <input name="card_exp_year" value="2030" size="6"></label>
      <label>CVV: <input name="card_cvv" value="123" size="4"></label><br><br>
      <label>Cardholder: <input name="card_holder" value="John Doe"></label><br><br>
      <label>Email: <input name="customer_email" value="john@example.com"></label><br><br>
      <label>Customer ID: <input name="customer_account_id" value="cust-001"></label><br><br>
      <button type="submit">Charge</button>
    </form>
    <h2>Check Status</h2>
    <form action="/status" method="POST">
      <label>Order ID: <input name="order_id"></label>
      <button type="submit">Check</button>
    </form>
    <h2>Refund</h2>
    <form action="/refund" method="POST">
      <label>Order ID: <input name="order_id"></label>
      <label>Amount (cents, empty=full): <input name="amount"></label>
      <button type="submit">Refund</button>
    </form>
  `);
});

// Create charge
app.post("/charge", async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "amount must be > 0" });
    }

    const body = {
      amount,
      currency: req.body.currency || "USD",
      card_number: req.body.card_number,
      card_exp_month: req.body.card_exp_month,
      card_exp_year: req.body.card_exp_year,
      card_cvv: req.body.card_cvv,
      card_holder: req.body.card_holder,
      order_id: "order-" + Date.now(),
      order_description: "Test charge",
      customer_email: req.body.customer_email || "test@example.com",
      customer_account_id: req.body.customer_account_id || "cust-" + Date.now(),
      ip_address: req.ip || "127.0.0.1",
      platform: "WEB",
    };

    const data = await solidgateRequest("POST", "/api/v1/charge", body);

    // Handle 3DS: verify_url is set when status is 3ds_verify.
    // Only ever redirect to an https URL the PSP returned
    // to avoid being turned into an open redirect.
    if (data.order?.status === "3ds_verify" && typeof data.verify_url === "string") {
      let verifyUrl;
      try {
        verifyUrl = new URL(data.verify_url);
      } catch {
        return res.status(502).json({ error: "Invalid verify_url from PSP" });
      }
      if (verifyUrl.protocol !== "https:") {
        return res.status(502).json({ error: "Refusing non-https verify_url" });
      }
      return res.redirect(verifyUrl.toString());
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Check status
app.post("/status", async (req, res) => {
  try {
    if (!req.body.order_id) {
      return res.status(400).json({ error: "order_id is required" });
    }
    const data = await solidgateRequest("POST", "/api/v1/status", {
      order_id: req.body.order_id,
    });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Refund
app.post("/refund", async (req, res) => {
  try {
    if (!req.body.order_id) {
      return res.status(400).json({ error: "order_id is required" });
    }
    if (!req.body.amount) {
      return res.status(400).json({ error: "amount is required" });
    }
    const body = { order_id: req.body.order_id, amount: parseInt(req.body.amount) };

    const data = await solidgateRequest("POST", "/api/v1/refund", body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Webhook
app.post("/webhook", (req, res) => {
  if (!Buffer.isBuffer(req.body)) return res.status(400).send("Invalid body");
  const rawBody = req.body.toString("utf-8");
  const signature = req.headers["signature"];
  const eventType = req.headers["solidgate-event-type"];
  const eventId = req.headers["solidgate-event-id"];

  if (typeof signature !== "string") return res.status(400).send("Missing signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(rawBody);

  // [DEBUG] Remove in production
  console.log("[DEBUG] webhook:", eventType, eventId, JSON.stringify(event));

  if (eventType === "card_gate.order.updated") {
    const status = event.order?.status;
    const orderId = event.order?.order_id;
    console.log(`Order ${orderId}: ${status}`);

    // Your business logic here
  }

  res.status(200).send("OK");
});

// ============================================================
// Start
// ============================================================

if (!PUBLIC_KEY || !SECRET_KEY) {
  console.error("SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY must be set.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
