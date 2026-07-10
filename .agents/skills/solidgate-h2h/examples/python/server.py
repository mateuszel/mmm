# Solidgate H2H — Python Example Server
#
# Endpoints:
# - POST /charge    — Create a card payment
# - POST /status    — Check order status
# - POST /refund    — Refund an order
# - POST /webhook   — Receive and verify webhooks
# - GET  /          — Test page
#
# Run:
#   pip install flask requests
#   export SOLIDGATE_PUBLIC_KEY="api_pk_..."
#   export SOLIDGATE_SECRET_KEY="api_sk_..."
#   export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
#   export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
#   python server.py
#
# NOTE: H2H integration requires PCI DSS certification.

import base64
import hashlib
import hmac
import json
import os
import time

import requests as http_requests
from flask import Flask, request, jsonify

# ============================================================
# Configuration
# ============================================================
PUBLIC_KEY = os.environ.get("SOLIDGATE_PUBLIC_KEY", "")
SECRET_KEY = os.environ.get("SOLIDGATE_SECRET_KEY", "")
WH_PUBLIC_KEY = os.environ.get("SOLIDGATE_WEBHOOK_PUBLIC_KEY", "")
WH_SECRET_KEY = os.environ.get("SOLIDGATE_WEBHOOK_SECRET_KEY", "")
SOLIDGATE_API = "https://pay.solidgate.com"
PORT = 3000

app = Flask(__name__)

# ============================================================
# Crypto helpers
# ============================================================

def generate_signature(public_key: str, secret_key: str, json_body: str) -> str:
    data = public_key + json_body + public_key
    hmac_hex = hmac.new(secret_key.encode(), data.encode(), hashlib.sha512).hexdigest()
    return base64.b64encode(hmac_hex.encode()).decode()


def solidgate_request(method: str, path: str, body: dict = None) -> dict:
    json_body = json.dumps(body) if body else ""
    signature = generate_signature(PUBLIC_KEY, SECRET_KEY, json_body)

    # [DEBUG] Remove in production
    print(f"[DEBUG] {method} {path} request: {json_body}")

    resp = http_requests.request(
        method,
        f"{SOLIDGATE_API}{path}",
        headers={
            "merchant": PUBLIC_KEY,
            "signature": signature,
            "Content-Type": "application/json",
        },
        data=json_body if body else None,
    )

    # [DEBUG] Remove in production
    print(f"[DEBUG] {method} {path} response ({resp.status_code}): {resp.text}")

    if resp.status_code != 200:
        raise RuntimeError(resp.text)
    return resp.json()

# Rate limits: 25 req/s (live), 10 req/s (sandbox). On HTTP 429, retry with exponential backoff.

def verify_webhook_signature(raw_body: str, received_signature: str) -> bool:
    data = WH_PUBLIC_KEY + raw_body + WH_PUBLIC_KEY
    hmac_hex = hmac.new(WH_SECRET_KEY.encode(), data.encode(), hashlib.sha512).hexdigest()
    expected = base64.b64encode(hmac_hex.encode()).decode()
    return hmac.compare_digest(expected, received_signature)


# ============================================================
# Endpoints
# ============================================================

@app.route("/")
def index():
    return """
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
      <label>Customer Account ID: <input name="customer_account_id" value=""></label><br><br>
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
      <label>Amount (cents, required): <input name="amount"></label>
      <button type="submit">Refund</button>
    </form>
    """


@app.route("/charge", methods=["POST"])
def charge():
    try:
        amount = int(request.form.get("amount", 0))
        if amount <= 0:
            return jsonify({"error": "amount must be > 0"}), 400

        body = {
            "amount": amount,
            "currency": request.form.get("currency", "USD"),
            "card_number": request.form["card_number"],
            "card_exp_month": request.form["card_exp_month"],
            "card_exp_year": request.form["card_exp_year"],
            "card_cvv": request.form["card_cvv"],
            "card_holder": request.form.get("card_holder", ""),
            "order_id": f"order-{int(time.time() * 1000)}",
            "order_description": "Test charge",
            "customer_email": request.form.get("customer_email", "test@example.com"),
            "customer_account_id": request.form.get("customer_account_id", f"cust-{int(time.time() * 1000)}"),
            "ip_address": request.remote_addr or "127.0.0.1",
            "platform": "WEB",
        }

        data = solidgate_request("POST", "/api/v1/charge", body)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/status", methods=["POST"])
def status():
    try:
        order_id = request.form.get("order_id", "")
        if not order_id:
            return jsonify({"error": "order_id is required"}), 400
        data = solidgate_request("POST", "/api/v1/status", {"order_id": order_id})
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/refund", methods=["POST"])
def refund():
    try:
        order_id = request.form.get("order_id", "")
        if not order_id:
            return jsonify({"error": "order_id is required"}), 400
        amount = request.form.get("amount", "")
        if not amount:
            return jsonify({"error": "amount is required"}), 400
        body = {"order_id": order_id, "amount": int(amount)}
        data = solidgate_request("POST", "/api/v1/refund", body)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/webhook", methods=["POST"])
def webhook():
    raw_body = request.get_data(as_text=True)
    signature = request.headers.get("signature", "")
    event_type = request.headers.get("solidgate-event-type", "")
    event_id = request.headers.get("solidgate-event-id", "")

    if not signature:
        return "Missing signature", 400

    if not verify_webhook_signature(raw_body, signature):
        print("[ERROR] Invalid webhook signature")
        return "Invalid signature", 400

    event = json.loads(raw_body)

    # [DEBUG] Remove in production
    print(f"[DEBUG] Webhook [{event_type}] ({event_id}): {json.dumps(event)}")

    # Your business logic here

    return "OK", 200


if __name__ == "__main__":
    if not PUBLIC_KEY or not SECRET_KEY:
        print("SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY must be set.")
        exit(1)
    print(f"Server running on http://localhost:{PORT}")
    app.run(port=PORT)
