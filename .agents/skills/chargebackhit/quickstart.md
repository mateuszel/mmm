# ChargebackHit — Quick Start

Step-by-step guide: get API keys, handle alert webhooks, check disputes.

---

## 1. Get API Keys

1. Sign up at ChargebackHit HUB
2. Navigate to **Settings → API Keys**
3. Copy your public key and secret key

```bash
export CHARGEBACKHIT_PUBLIC_KEY="your_public_key"
export CHARGEBACKHIT_SECRET_KEY="your_secret_key"
```

---

## 2. Enroll a MID

Register your merchant descriptor for monitoring:

```bash
PUBLIC_KEY="$CHARGEBACKHIT_PUBLIC_KEY"
SECRET_KEY="$CHARGEBACKHIT_SECRET_KEY"

BODY='[{
  "required_products": ["ethoca", "rdr"],
  "descriptor": "HeadphonesStore*Purchase",
  "card_acceptor_id": "123456789012",
  "acquirer_bin": "411111",
  "merchant_internal_id": "mid_001"
}]'

SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://api.chargebackhit.com/api/v2/import/mids/batch-create" \
  -H "public_key: $PUBLIC_KEY" \
  -H "Signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

> Full enrollment docs: [enrollment.md](enrollment.md)

---

## 3. Handle Alert Webhooks

ChargebackHit sends POST requests to your webhook URL when alerts arrive. Your server must verify the signature and respond with an outcome.

### Node.js (Express)

```javascript
const express = require("express");
const crypto = require("crypto");

const PUBLIC_KEY = process.env.CHARGEBACKHIT_PUBLIC_KEY;
const SECRET_KEY = process.env.CHARGEBACKHIT_SECRET_KEY;

const app = express();
app.use("/webhook", express.raw({ type: "*/*" }));

app.post("/webhook", (req, res) => {
  const rawBody = req.body.toString("utf-8");
  const signature = req.headers["signature"];

  // Verify HMAC-SHA512 signature (hex then base64)
  const data = PUBLIC_KEY + rawBody + PUBLIC_KEY;
  const hmacHex = crypto.createHmac("sha512", SECRET_KEY).update(data).digest("hex");
  const expected = Buffer.from(hmacHex).toString("base64");

  if (expected !== signature) {
    return res.status(400).send("Invalid signature");
  }

  const alert = JSON.parse(rawBody);
  const alertType = alert.alert?.type;
  const txId = alert.transaction?.transaction_merchant_id;

  console.log(`Alert [${alertType}]: tx=${txId}`);

  // Respond based on alert type
  if (alertType === "init-refund") {
    // Look up the transaction, process refund, then respond
    res.json({ outcome: "reversed" });
  } else if (alertType === "inquiry") {
    // Return order + customer data
    res.json({
      outcome: "acknowledged",
      order: { order_id: txId, amount: alert.transaction?.amount, currency: alert.transaction?.currency },
      customer: { email: "customer@example.com" },
    });
  } else {
    res.json({ outcome: "acknowledged" });
  }
});

app.listen(3000, () => console.log("Server on http://localhost:3000"));
```

> Full webhook docs: [webhooks.md](webhooks.md)

---

## 4. Check Alerts

```bash
BODY='{"filter":{"types":["init-refund"]},"pagination":{"method":"token","limit":10}}'

SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://api.chargebackhit.com/api/v2/alerts/list" \
  -H "public_key: $PUBLIC_KEY" \
  -H "Signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

> Full alert docs: [alerts.md](alerts.md)

---

## 5. Check Disputes

```bash
BODY='{"filter":{"status":["needs-response"]},"pagination":{"limit":10}}'

SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://api.chargebackhit.com/api/v2/disputes/list" \
  -H "public_key: $PUBLIC_KEY" \
  -H "Signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

> Full dispute docs: [disputes.md](disputes.md)

---

## 6. Test with Sandbox

Generate a test alert to verify your webhook:

```bash
BODY='{"alert":{"type":"init-refund","provider":"ethoca","product":"ethoca","amount":"49.99","currency":"USD","descriptor":"MYSTORE*PURCHASE"},"transaction":{"transaction_merchant_id":"test-001","amount":"49.99","currency":"USD"}}'

SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://api.chargebackhit.com/api/v2/integration/alerts/generate" \
  -H "public_key: $PUBLIC_KEY" \
  -H "Signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

> Full testing docs: [testing.md](testing.md)

---

## Ready-to-Run Examples

| Language | File | Run |
|----------|------|-----|
| Node.js | [examples/nodejs/server.js](examples/nodejs/server.js) | `npm install express && node server.js` |
| Python | [examples/python/server.py](examples/python/server.py) | `pip install flask requests && python server.py` |
| Go | [examples/go/main.go](examples/go/main.go) | `go run main.go` |
| PHP | [examples/php/server.php](examples/php/server.php) | `php -S localhost:3000 server.php` |
