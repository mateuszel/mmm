// ChargebackHit — Node.js Example Server
//
// Endpoints:
// - POST /webhook        — Handle alert webhooks from ChargebackHit
// - POST /alerts         — List alerts via API
// - POST /disputes       — List disputes via API
// - GET  /               — Test page
//
// Run:
//   npm install express
//   export CHARGEBACKHIT_PUBLIC_KEY="your_public_key"
//   export CHARGEBACKHIT_SECRET_KEY="your_secret_key"
//   node server.js
//
// Keys: Get from ChargebackHit HUB dashboard

const express = require("express");
const crypto = require("crypto");

const PUBLIC_KEY = process.env.CHARGEBACKHIT_PUBLIC_KEY || "";
const SECRET_KEY = process.env.CHARGEBACKHIT_SECRET_KEY || "";
const CBH_API = "https://api.chargebackhit.com";
const PORT = 3000;

const app = express();
app.disable("x-powered-by");
app.use("/webhook", express.raw({ type: "*/*" }));
app.use(express.json());

// ============================================================
// Crypto helpers
// ============================================================

function generateSignature(publicKey, secretKey, jsonBody) {
  const data = publicKey + jsonBody + publicKey;
  const hmacHex = crypto.createHmac("sha512", secretKey).update(data).digest("hex");
  return Buffer.from(hmacHex).toString("base64");
}

function verifySignature(rawBody, receivedSignature) {
  const expected = generateSignature(PUBLIC_KEY, SECRET_KEY, rawBody);
  if (expected.length !== receivedSignature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(receivedSignature)
  );
}

async function cbhRequest(path, body) {
  const jsonBody = JSON.stringify(body);
  const signature = generateSignature(PUBLIC_KEY, SECRET_KEY, jsonBody);

  console.log(`[DEBUG] POST ${path}`);

  const resp = await fetch(`${CBH_API}${path}`, {
    method: "POST",
    headers: {
      public_key: PUBLIC_KEY,
      Signature: signature,
      "Content-Type": "application/json",
    },
    body: jsonBody,
  });

  const data = await resp.json();
  console.log("[DEBUG] Response:", resp.status, JSON.stringify(data).substring(0, 200));
  return data;
}

// ============================================================
// Endpoints
// ============================================================

app.get("/", (req, res) => {
  res.send(`
    <h1>ChargebackHit Test</h1>
    <h2>List Recent Alerts</h2>
    <form action="/alerts" method="POST">
      <label>Type filter: <input name="type" value="init-refund" placeholder="init-refund, inquiry, etc."></label><br><br>
      <button type="submit">Get Alerts</button>
    </form>
    <h2>List Disputes</h2>
    <form action="/disputes" method="POST">
      <label>Status filter: <input name="status" value="needs-response"></label><br><br>
      <button type="submit">Get Disputes</button>
    </form>
    <p>Webhook URL: <code>POST http://localhost:${PORT}/webhook</code></p>
  `);
});

// Handle alert webhooks from ChargebackHit
app.post("/webhook", (req, res) => {
  if (!Buffer.isBuffer(req.body)) return res.status(400).send("Invalid body");
  const rawBody = req.body.toString("utf-8");
  const signature = req.headers["signature"];

  if (typeof signature !== "string" || !verifySignature(rawBody, signature)) {
    console.error("Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const alert = JSON.parse(rawBody);
  const alertType = alert.alert?.type;
  const txId = alert.transaction?.transaction_merchant_id;
  const amount = alert.alert?.amount;
  const currency = alert.alert?.currency;

  console.log(`[WEBHOOK] Alert [${alertType}]: tx=${txId}, amount=${amount} ${currency}`);

  // Respond based on alert type
  switch (alertType) {
    case "init-refund":
      // Ethoca/CDRN: look up transaction, process refund
      console.log(`  → Processing refund for ${txId}`);
      // TODO: Your refund logic here
      return res.json({ outcome: "reversed" });

    case "inquiry":
      // OI/CC/CE3.0: return order + customer data
      console.log(`  → Returning order data for ${txId}`);
      return res.json({
        outcome: "acknowledged",
        order: {
          order_id: txId,
          date: alert.transaction?.date,
          amount: alert.transaction?.amount,
          currency: alert.transaction?.currency,
        },
        customer: {
          // TODO: Look up real customer data
          email: "customer@example.com",
        },
        products: [
          { name: "Product", quantity: "1" },
        ],
      });

    case "fraud-notification":
    case "dispute-notification":
    case "resolved":
    case "prevented":
      console.log(`  → Acknowledged`);
      return res.json({ outcome: "acknowledged" });

    default:
      return res.json({ outcome: "acknowledged" });
  }
});

// List alerts
app.post("/alerts", async (req, res) => {
  try {
    const filter = {};
    if (req.body.type) filter.types = [req.body.type];

    const data = await cbhRequest("/api/v2/alerts/list", {
      filter,
      pagination: { method: "token", limit: 20 },
    });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List disputes
app.post("/disputes", async (req, res) => {
  try {
    const filter = {};
    if (req.body.status) filter.status = [req.body.status];

    const data = await cbhRequest("/api/v2/disputes/list", {
      filter,
      pagination: { limit: 20 },
    });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

if (!PUBLIC_KEY || !SECRET_KEY) {
  console.error("Set CHARGEBACKHIT_PUBLIC_KEY and CHARGEBACKHIT_SECRET_KEY.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Webhook URL: POST http://localhost:${PORT}/webhook`);
});
