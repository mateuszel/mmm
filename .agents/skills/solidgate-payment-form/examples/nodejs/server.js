// Solidgate Payment Form — Node.js example server
//
// Uses the OFFICIAL @solidgate/node-sdk for merchantData generation.
// The SDK computes the correct HMAC-SHA512 signature over the encoded,
// encrypted paymentIntent — getting that right by hand is easy to break.
//
// Endpoints
//   GET  /                     Test page with embedded payment form
//   POST /api/payment-intent   Generate merchantData (signed + encrypted)
//   POST /webhook              Receive and verify webhook notifications
//
// Setup (one-time)
//   1. Get keys from https://hub.solidgate.com/  (Settings → API Keys)
//   2. Export env vars:
//        export SOLIDGATE_PUBLIC_KEY="api_pk_..."
//        export SOLIDGATE_SECRET_KEY="api_sk_..."
//        export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
//        export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
//   3. Install dependencies:
//        npm install express @solidgate/node-sdk
//
// Run
//   node server.js
//
// Then open http://localhost:3000 — fill the form, use test card
// 4067429974719265 (any future expiry, any CVV).

const express = require("express");
const crypto = require("crypto");
const path = require("path");
const solidGate = require("@solidgate/node-sdk");

// ============================================================
// Configuration
// ============================================================
const PUBLIC_KEY = process.env.SOLIDGATE_PUBLIC_KEY || "";
const SECRET_KEY = process.env.SOLIDGATE_SECRET_KEY || "";
const WH_PUBLIC_KEY = process.env.SOLIDGATE_WEBHOOK_PUBLIC_KEY || "";
const WH_SECRET_KEY = process.env.SOLIDGATE_WEBHOOK_SECRET_KEY || "";
const PORT = 3000;

if (!PUBLIC_KEY || !SECRET_KEY) {
  console.error("SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY must be set.");
  console.error('  export SOLIDGATE_PUBLIC_KEY="api_pk_..."');
  console.error('  export SOLIDGATE_SECRET_KEY="api_sk_..."');
  process.exit(1);
}

// One Api instance — reuse it. Constructor is (publicKey, secretKey).
const api = new solidGate.Api(PUBLIC_KEY, SECRET_KEY);

const app = express();
app.disable("x-powered-by");
// Webhook needs the raw body for HMAC verification — register before json().
app.use("/webhook", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// Webhook signature — no SDK helper exists, so verify manually.
// Formula:  base64(hex(HMAC-SHA512(wh_secret, wh_public + raw_body + wh_public)))
// ============================================================
function verifyWebhookSignature(rawBody, receivedSignature) {
  const data = WH_PUBLIC_KEY + rawBody + WH_PUBLIC_KEY;
  const hmacHex = crypto
    .createHmac("sha512", WH_SECRET_KEY)
    .update(data)
    .digest("hex");
  const expected = Buffer.from(hmacHex).toString("base64");
  // Constant-time compare — guards against signature-leak timing attacks.
  if (expected.length !== receivedSignature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(receivedSignature),
  );
}

// ============================================================
// Endpoints
// ============================================================

// Generate merchantData for the frontend SDK.
// The SDK's formMerchantData(intent) returns a FormInitDTO; .toObject()
// produces { merchant, signature, paymentIntent } ready to send to the browser.
app.post("/api/payment-intent", (req, res) => {
  const { amount, currency, order_id, order_description } = req.body;

  if (!amount || !currency || !order_id) {
    return res
      .status(400)
      .json({ error: "amount, currency, and order_id are required" });
  }

  const paymentIntent = {
    amount: parseInt(amount, 10),
    currency,
    order_id,
    order_description: order_description || "Payment",
    platform: "WEB",
  };

  // Carry through optional fields if the caller provided them.
  if (req.body.customer_email)
    paymentIntent.customer_email = req.body.customer_email;
  if (req.body.product_id) paymentIntent.product_id = req.body.product_id;
  if (req.body.payment_type) paymentIntent.payment_type = req.body.payment_type;
  if (req.body.ip_address) paymentIntent.ip_address = req.body.ip_address;

  const merchantData = api.formMerchantData(paymentIntent).toObject();

  console.log("[DEBUG] Generated merchantData for order_id=%s", order_id);
  res.json(merchantData);
});

// Webhook endpoint — verify, then handle.
app.post("/webhook", (req, res) => {
  if (!Buffer.isBuffer(req.body)) return res.status(400).send("Invalid body");
  const rawBody = req.body.toString("utf-8");
  const signature = req.headers["signature"];
  const eventType = req.headers["solidgate-event-type"];
  const eventId = req.headers["solidgate-event-id"];

  if (typeof signature !== "string") return res.status(400).send("Missing signature header");
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(rawBody);
  console.log(`[DEBUG] Webhook [${eventType}] (${eventId})`);

  // Decline info lives at top-level event.error (sibling of order/transactions),
  // NOT inside event.order.
  if (eventType === "card_gate.order.updated") {
    const status = event.order?.status;
    const orderId = event.order?.order_id;

    switch (status) {
      case "settle_ok":
        console.log(`Order ${orderId}: payment captured — fulfill the order`);
        break;
      case "auth_ok":
        console.log(`Order ${orderId}: funds reserved`);
        break;
      case "auth_failed": {
        const code = event.error?.code;
        const userMsg =
          event.error?.recommended_message_for_user ||
          event.error?.messages?.[0] ||
          "";
        console.log(
          `Order ${orderId}: payment failed — code=${code} ${userMsg}`,
        );
        break;
      }
      case "void_ok":
        console.log(`Order ${orderId}: payment voided`);
        break;
      case "refunded":
        // Partial vs full refund: compare event.order.refunded_amount with event.order.amount.
        console.log(
          `Order ${orderId}: refunded ${event.order?.refunded_amount} / ${event.order?.amount}`,
        );
        break;
    }
  }

  if (eventType === "subscription.updated.v2") {
    const sub = event.subscription;
    console.log(`Subscription ${sub?.id}: status = ${sub?.status}`);
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
