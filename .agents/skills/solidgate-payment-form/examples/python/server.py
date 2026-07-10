# Solidgate Payment Form — Python example server
#
# Uses the OFFICIAL `solidgate-sdk` package
# for merchantData generation. The SDK computes the correct HMAC-SHA512
# signature over the encoded, encrypted paymentIntent — getting that right
# by hand is easy to break.
#
# NOTE: there is also an old `solidgate-card-sdk` package on PyPI (last
# released July 2021, v0.1.0). It is abandoned — DO NOT use it. The
# maintained package built from the official repo is `solidgate-sdk`.
#
# Endpoints
#   GET  /                      Test page with embedded payment form
#   POST /api/payment-intent    Generate merchantData (signed + encrypted)
#   POST /webhook               Receive and verify webhook notifications
#
# Setup (one-time)
#   1. Get keys from https://hub.solidgate.com/  (Settings → API Keys)
#   2. Export env vars:
#        export SOLIDGATE_PUBLIC_KEY="api_pk_..."
#        export SOLIDGATE_SECRET_KEY="api_sk_..."
#        export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
#        export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
#   3. Install dependencies:
#        pip install flask solidgate-sdk
#
# Run
#   python server.py
#
# Then open http://localhost:3000 — fill the form, use test card
# 4067429974719265 (any future expiry, any CVV).

import base64
import hashlib
import hmac
import json
import os
import sys

from flask import Flask, request, jsonify, render_template_string
from solidgate import ApiClient

# ============================================================
# Configuration
# ============================================================
PUBLIC_KEY = os.environ.get("SOLIDGATE_PUBLIC_KEY", "")
SECRET_KEY = os.environ.get("SOLIDGATE_SECRET_KEY", "")
WH_PUBLIC_KEY = os.environ.get("SOLIDGATE_WEBHOOK_PUBLIC_KEY", "")
WH_SECRET_KEY = os.environ.get("SOLIDGATE_WEBHOOK_SECRET_KEY", "")
PORT = 3000

if not PUBLIC_KEY or not SECRET_KEY:
    print("SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY must be set.")
    print('  export SOLIDGATE_PUBLIC_KEY="api_pk_..."')
    print('  export SOLIDGATE_SECRET_KEY="api_sk_..."')
    sys.exit(1)

# One ApiClient instance — reuse it.
# The SDK's __init__ accepts `public_key` and `secret_key` (positional or
# keyword). We pass them as kwargs here for clarity.
client = ApiClient(public_key=PUBLIC_KEY, secret_key=SECRET_KEY)


def merchant_data_to_dict(md) -> dict:
    """Serialize a `solidgate.MerchantData` into the camelCase shape the
    frontend SDK expects. The SDK exposes `payment_intent` (snake_case)
    and has no `.to_dict()` method — convert manually."""
    return {
        "merchant": md.merchant,
        "signature": md.signature,
        "paymentIntent": md.payment_intent,  # rename: payment_intent → paymentIntent
    }


app = Flask(__name__)


# ============================================================
# Webhook signature — no SDK helper exists, so verify manually.
# Formula:  base64(hex(HMAC-SHA512(wh_secret, wh_public + raw_body + wh_public)))
# ============================================================
def verify_webhook_signature(raw_body: str, received_signature: str) -> bool:
    data = WH_PUBLIC_KEY + raw_body + WH_PUBLIC_KEY
    hmac_hex = hmac.new(
        WH_SECRET_KEY.encode("utf-8"),
        data.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()
    expected = base64.b64encode(hmac_hex.encode("utf-8")).decode("utf-8")
    return hmac.compare_digest(expected, received_signature)


# ============================================================
# HTML test page
# ============================================================
INDEX_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solidgate Payment Form Test</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    h1 { font-size: 24px; }
    label { display: block; margin: 8px 0 4px; font-weight: 500; }
    input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { margin-top: 16px; padding: 10px 24px; background: #0066FF; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
    #payment-form { margin-top: 24px; min-height: 300px; }
    #status { margin-top: 16px; padding: 12px; border-radius: 4px; display: none; }
    .success { background: #d4edda; color: #155724; }
    .error   { background: #f8d7da; color: #721c24; }
    .info    { background: #d1ecf1; color: #0c5460; }
  </style>
</head>
<body>
  <h1>Solidgate Payment Form Test</h1>
  <form id="config-form">
    <label>Amount (cents): <input id="amount" value="1020" type="number"></label>
    <label>Currency: <input id="currency" value="USD"></label>
    <label>Description: <input id="description" value="Test payment"></label>
    <button type="submit">Initialize Payment Form</button>
  </form>
  <div id="status"></div>
  <div id="payment-form"></div>

  <script src="https://cdn.solidgate.com/js/solid-form.js"></script>
  <script>
    const statusEl = document.getElementById("status");
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = type;
      statusEl.style.display = "block";
    }

    document.getElementById("config-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      showStatus("Initializing...", "info");
      const orderId = "order-" + crypto.randomUUID();
      try {
        const resp = await fetch("/api/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseInt(document.getElementById("amount").value, 10),
            currency: document.getElementById("currency").value,
            order_id: orderId,
            order_description: document.getElementById("description").value,
          }),
        });
        if (!resp.ok) {
          showStatus("Error: " + (await resp.json()).error, "error");
          return;
        }
        const merchantData = await resp.json();
        document.getElementById("payment-form").innerHTML = "";
        const form = PaymentFormSdk.init({
          merchantData,
          iframeParams: { containerId: "payment-form" },
        });
        form.on("mounted", () => showStatus("Form loaded. Test card: 4067429974719265", "info"));
        form.on("success", () => showStatus("Payment successful! Order: " + orderId, "success"));
        form.on("fail", (ev) => showStatus("Failed: " + (ev.error?.message || "Declined"), "error"));
        form.on("error", (ev) => showStatus("Error: " + (ev.value?.message || "Unknown"), "error"));
        form.on("verify", () => showStatus("3DS verification...", "info"));
      } catch (err) {
        showStatus("Network error: " + err.message, "error");
      }
    });
  </script>
</body>
</html>
"""


# ============================================================
# Endpoints
# ============================================================


@app.route("/")
def index():
    return render_template_string(INDEX_HTML)


@app.route("/api/payment-intent", methods=["POST"])
def payment_intent():
    """Generate merchantData using the official SDK.

    `client.form_merchant_data(intent)` returns a `solidgate.MerchantData`
    instance with attributes `payment_intent` (snake_case), `merchant`,
    and `signature`. We rebuild the dict here to send the frontend the
    `paymentIntent` (camelCase) field name `PaymentFormSdk.init` expects.
    """
    data = request.get_json(silent=True) or {}
    if not data.get("amount") or not data.get("currency") or not data.get("order_id"):
        return jsonify({"error": "amount, currency, and order_id are required"}), 400

    intent = {
        "amount": int(data["amount"]),
        "currency": data["currency"],
        "order_id": data["order_id"],
        "order_description": data.get("order_description", "Payment"),
        "platform": "WEB",
    }
    for field in ("customer_email", "product_id", "payment_type", "ip_address"):
        if data.get(field):
            intent[field] = data[field]

    merchant_data = merchant_data_to_dict(client.form_merchant_data(intent))
    print(f"[DEBUG] Generated merchantData for order_id={data['order_id']}")
    return jsonify(merchant_data)


@app.route("/webhook", methods=["POST"])
def webhook():
    raw_body = request.get_data(as_text=True)
    signature = request.headers.get("signature", "")
    event_type = request.headers.get("solidgate-event-type", "")
    event_id = request.headers.get("solidgate-event-id", "")

    if not signature:
        return "Missing signature header", 400
    if not verify_webhook_signature(raw_body, signature):
        print("[ERROR] Invalid webhook signature")
        return "Invalid signature", 400

    event = json.loads(raw_body)
    print(f"[DEBUG] Webhook [{event_type}] ({event_id})")

    # Decline info lives at top-level event["error"] (sibling of order/transactions),
    # NOT inside event["order"].
    if event_type == "card_gate.order.updated":
        order = event.get("order", {})
        status = order.get("status")
        order_id = order.get("order_id")

        if status == "settle_ok":
            print(f"Order {order_id}: payment captured — fulfill the order")
        elif status == "auth_failed":
            err = event.get("error", {})
            user_msg = (
                err.get("recommended_message_for_user")
                or (err.get("messages") or ["unknown"])[0]
            )
            print(
                f"Order {order_id}: payment failed — code={err.get('code')} {user_msg}"
            )

    if event_type == "subscription.updated.v2":
        sub = event.get("subscription", {})
        print(f"Subscription {sub.get('id')}: status = {sub.get('status')}")

    return "OK", 200


if __name__ == "__main__":
    print(f"Server running on http://localhost:{PORT}")
    app.run(port=PORT)
