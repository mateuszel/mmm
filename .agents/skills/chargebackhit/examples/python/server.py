# ChargebackHit — Python Example Server
#
# Endpoints:
# - POST /webhook    — Handle alert webhooks
# - POST /alerts     — List alerts
# - POST /disputes   — List disputes
# - GET  /           — Test page
#
# Run:
#   pip install flask requests
#   export CHARGEBACKHIT_PUBLIC_KEY="your_public_key"
#   export CHARGEBACKHIT_SECRET_KEY="your_secret_key"
#   python server.py

import base64
import hashlib
import hmac
import json
import os

import requests as http_requests
from flask import Flask, request, jsonify

PUBLIC_KEY = os.environ.get("CHARGEBACKHIT_PUBLIC_KEY", "")
SECRET_KEY = os.environ.get("CHARGEBACKHIT_SECRET_KEY", "")
CBH_API = "https://api.chargebackhit.com"
PORT = 3000

app = Flask(__name__)


def generate_signature(public_key, secret_key, json_body):
    data = (public_key + json_body + public_key).encode("utf-8")
    hmac_hex = hmac.new(secret_key.encode("utf-8"), data, hashlib.sha512).hexdigest()
    return base64.b64encode(hmac_hex.encode("utf-8")).decode("utf-8")


def verify_signature(raw_body, received_signature):
    expected = generate_signature(PUBLIC_KEY, SECRET_KEY, raw_body)
    return hmac.compare_digest(expected, received_signature)


def cbh_request(path, body):
    json_body = json.dumps(body)
    signature = generate_signature(PUBLIC_KEY, SECRET_KEY, json_body)
    resp = http_requests.post(
        f"{CBH_API}{path}",
        headers={"public_key": PUBLIC_KEY, "Signature": signature, "Content-Type": "application/json"},
        data=json_body,
    )
    return resp.json()


@app.route("/")
def index():
    return f"""
    <h1>ChargebackHit Test</h1>
    <h2>List Alerts</h2>
    <form action="/alerts" method="POST">
      <button type="submit">Get Alerts</button>
    </form>
    <h2>List Disputes</h2>
    <form action="/disputes" method="POST">
      <button type="submit">Get Disputes</button>
    </form>
    <p>Webhook URL: <code>POST http://localhost:{PORT}/webhook</code></p>
    """


@app.route("/webhook", methods=["POST"])
def webhook():
    raw_body = request.get_data(as_text=True)
    signature = request.headers.get("Signature", "")

    if not signature or not verify_signature(raw_body, signature):
        return "Invalid signature", 400

    alert = json.loads(raw_body)
    alert_type = alert.get("alert", {}).get("type", "")
    tx_id = alert.get("transaction", {}).get("transaction_merchant_id", "")

    print(f"[WEBHOOK] Alert [{alert_type}]: tx={tx_id}")

    if alert_type == "init-refund":
        return jsonify({"outcome": "reversed"})
    elif alert_type == "inquiry":
        return jsonify({
            "outcome": "acknowledged",
            "order": {"order_id": tx_id},
            "customer": {"email": "customer@example.com"},
        })
    else:
        return jsonify({"outcome": "acknowledged"})


@app.route("/alerts", methods=["POST"])
def alerts():
    data = cbh_request("/api/v2/alerts/list", {
        "pagination": {"method": "token", "limit": 20},
    })
    return jsonify(data)


@app.route("/disputes", methods=["POST"])
def disputes():
    data = cbh_request("/api/v2/disputes/list", {
        "filter": {"status": ["needs-response"]},
        "pagination": {"limit": 20},
    })
    return jsonify(data)


if __name__ == "__main__":
    if not PUBLIC_KEY or not SECRET_KEY:
        print("Set CHARGEBACKHIT_PUBLIC_KEY and CHARGEBACKHIT_SECRET_KEY.")
        exit(1)
    print(f"Server on http://localhost:{PORT}")
    app.run(port=PORT)
