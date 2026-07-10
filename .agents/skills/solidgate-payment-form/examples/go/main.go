// Solidgate Payment Form — Go example server
//
// Uses the OFFICIAL github.com/solidgate-tech/go-sdk for merchantData
// generation. The SDK computes the correct HMAC-SHA512 signature over
// the encoded, encrypted paymentIntent — getting that right by hand is
// easy to break.
//
// Endpoints
//
//	GET  /                      Test page with embedded payment form
//	POST /api/payment-intent    Generate merchantData (signed + encrypted)
//	POST /webhook               Receive and verify webhook notifications
//
// Setup (one-time)
//  1. Get keys from https://hub.solidgate.com/  (Settings → API Keys).
//  2. Export env vars:
//     export SOLIDGATE_PUBLIC_KEY="api_pk_..."
//     export SOLIDGATE_SECRET_KEY="api_sk_..."
//     export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
//     export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
//  3. Initialise a module and add the SDK:
//     go mod init solidgate-form-example
//     go get github.com/solidgate-tech/go-sdk
//
// Run
//
//	go run main.go
//
// Then open http://localhost:3000 — fill the form, use test card
// 4067429974719265 (any future expiry, any CVV).
package main

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	solidgate "github.com/solidgate-tech/go-sdk"
)

var (
	publicKey   = os.Getenv("SOLIDGATE_PUBLIC_KEY")
	secretKey   = os.Getenv("SOLIDGATE_SECRET_KEY")
	whPublicKey = os.Getenv("SOLIDGATE_WEBHOOK_PUBLIC_KEY")
	whSecretKey = os.Getenv("SOLIDGATE_WEBHOOK_SECRET_KEY")
)

const port = ":3000"

// api is the Solidgate SDK client. The constructor accepts an optional
// base URL pointer; nil falls back to the production endpoint.
var api *solidgate.API

func mustInitAPI() {
	a, err := solidgate.NewAPI(publicKey, secretKey, nil)
	if err != nil {
		log.Fatalf("init Solidgate SDK: %v", err)
	}
	api = a
}

// ============================================================
// Webhook signature — no SDK helper exists, so verify manually.
// Formula:  base64(hex(HMAC-SHA512(wh_secret, wh_public + raw_body + wh_public)))
// ============================================================

func verifyWebhookSignature(rawBody, receivedSignature string) bool {
	data := whPublicKey + rawBody + whPublicKey
	mac := hmac.New(sha512.New, []byte(whSecretKey))
	mac.Write([]byte(data))
	hmacHex := hex.EncodeToString(mac.Sum(nil))
	expected := base64.StdEncoding.EncodeToString([]byte(hmacHex))
	return hmac.Equal([]byte(expected), []byte(receivedSignature))
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

// ============================================================
// Endpoints
// ============================================================

func handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, indexHTML)
}

// handlePaymentIntent uses the official SDK's FormMerchantData to build
// the merchantData object. We marshal our intent to bytes, hand it to
// the SDK, and the SDK returns a FormInitDTO whose fields map straight
// to the {merchant, signature, paymentIntent} object the frontend expects.
func handlePaymentIntent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Amount           int    `json:"amount"`
		Currency         string `json:"currency"`
		OrderID          string `json:"order_id"`
		OrderDescription string `json:"order_description"`
		CustomerEmail    string `json:"customer_email,omitempty"`
		ProductID        string `json:"product_id,omitempty"`
		PaymentType      string `json:"payment_type,omitempty"`
		IPAddress        string `json:"ip_address,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
		return
	}
	if req.Amount == 0 || req.Currency == "" || req.OrderID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "amount, currency, and order_id are required"})
		return
	}

	// Build the intent map. The SDK accepts JSON bytes — preserve any
	// optional fields the caller passed.
	intent := map[string]interface{}{
		"amount":            req.Amount,
		"currency":          req.Currency,
		"order_id":          req.OrderID,
		"order_description": req.OrderDescription,
		"platform":          "WEB",
	}
	if req.CustomerEmail != "" {
		intent["customer_email"] = req.CustomerEmail
	}
	if req.ProductID != "" {
		intent["product_id"] = req.ProductID
	}
	if req.PaymentType != "" {
		intent["payment_type"] = req.PaymentType
	}
	if req.IPAddress != "" {
		intent["ip_address"] = req.IPAddress
	}

	jsonBytes, err := json.Marshal(intent)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "marshal intent"})
		return
	}
	dto, err := api.FormMerchantData(jsonBytes)
	if err != nil {
		log.Printf("[ERROR] FormMerchantData: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "merchantData generation failed"})
		return
	}

	log.Printf("[DEBUG] Generated merchantData for order_id=%s", req.OrderID)
	writeJSON(w, http.StatusOK, map[string]string{
		"merchant":      dto.Merchant,
		"signature":     dto.Signature,
		"paymentIntent": dto.PaymentIntent,
	})
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}
	signature := r.Header.Get("signature")
	if signature == "" {
		http.Error(w, "Missing signature header", http.StatusBadRequest)
		return
	}
	if !verifyWebhookSignature(string(body), signature) {
		log.Println("[ERROR] Invalid webhook signature")
		http.Error(w, "Invalid signature", http.StatusBadRequest)
		return
	}

	eventType := r.Header.Get("solidgate-event-type")
	eventID := r.Header.Get("solidgate-event-id")
	log.Printf("[DEBUG] Webhook [%s] (%s)", eventType, eventID)

	var event map[string]interface{}
	_ = json.Unmarshal(body, &event)
	// Add business logic here. Decline info is at top-level event["error"]
	// (sibling of order/transactions), NOT inside event["order"].

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "OK")
}

func main() {
	if publicKey == "" || secretKey == "" {
		log.Fatal("SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY must be set.\n" +
			"  export SOLIDGATE_PUBLIC_KEY=\"api_pk_...\"\n" +
			"  export SOLIDGATE_SECRET_KEY=\"api_sk_...\"")
	}
	mustInitAPI()

	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/api/payment-intent", handlePaymentIntent)
	http.HandleFunc("/webhook", handleWebhook)

	log.Printf("Server running on http://localhost%s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solidgate Payment Form Test</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    label { display: block; margin: 8px 0 4px; }
    input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { margin-top: 16px; padding: 10px 24px; background: #0066FF; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
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
        form.on("success", () => showStatus("Payment successful!", "success"));
        form.on("fail",    (ev) => showStatus("Failed: " + (ev.error?.message || "Declined"), "error"));
        form.on("error",   (ev) => showStatus("Error: "  + (ev.value?.message || "Unknown"), "error"));
      } catch (err) {
        showStatus("Network error: " + err.message, "error");
      }
    });
  </script>
</body>
</html>`
