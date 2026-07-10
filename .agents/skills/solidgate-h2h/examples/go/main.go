// Solidgate H2H — Go Example Server
//
// Endpoints:
// - POST /charge    — Create a card payment
// - POST /status    — Check order status
// - POST /refund    — Refund an order
// - POST /webhook   — Receive and verify webhooks
// - GET  /          — Test page
//
// Run:
//   export SOLIDGATE_PUBLIC_KEY="api_pk_..."
//   export SOLIDGATE_SECRET_KEY="api_sk_..."
//   export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
//   export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
//   go run main.go
//
// NOTE: H2H integration requires PCI DSS certification.

package main

import (
	"bytes"
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
	"strconv"
	"time"
)

var (
	publicKey   = os.Getenv("SOLIDGATE_PUBLIC_KEY")
	secretKey   = os.Getenv("SOLIDGATE_SECRET_KEY")
	whPublicKey = os.Getenv("SOLIDGATE_WEBHOOK_PUBLIC_KEY")
	whSecretKey = os.Getenv("SOLIDGATE_WEBHOOK_SECRET_KEY")
)

const (
	solidgateAPI = "https://pay.solidgate.com"
	port         = ":3000"
)

func generateSignature(pubKey, secKey, jsonBody string) string {
	data := pubKey + jsonBody + pubKey
	mac := hmac.New(sha512.New, []byte(secKey))
	mac.Write([]byte(data))
	hmacHex := hex.EncodeToString(mac.Sum(nil))
	return base64.StdEncoding.EncodeToString([]byte(hmacHex))
}

func solidgateRequest(method, path string, body map[string]interface{}) (map[string]interface{}, error) {
	jsonBytes, _ := json.Marshal(body)
	jsonBody := string(jsonBytes)
	sig := generateSignature(publicKey, secretKey, jsonBody)

	log.Printf("[DEBUG] %s %s request: %s", method, path, jsonBody)

	req, _ := http.NewRequest(method, solidgateAPI+path, bytes.NewReader(jsonBytes))
	req.Header.Set("merchant", publicKey)
	req.Header.Set("signature", sig)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	log.Printf("[DEBUG] %s %s response (%d): %s", method, path, resp.StatusCode, string(respBytes))

	var result map[string]interface{}
	json.Unmarshal(respBytes, &result)
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API error (%d): %s", resp.StatusCode, string(respBytes))
	}
	return result, nil
}

// Rate limits: 25 req/s (live), 10 req/s (sandbox). On HTTP 429, retry with exponential backoff.

func verifyWebhookSignature(rawBody, receivedSignature string) bool {
	data := whPublicKey + rawBody + whPublicKey
	mac := hmac.New(sha512.New, []byte(whSecretKey))
	mac.Write([]byte(data))
	hmacHex := hex.EncodeToString(mac.Sum(nil))
	expected := base64.StdEncoding.EncodeToString([]byte(hmacHex))
	return hmac.Equal([]byte(expected), []byte(receivedSignature))
}

func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, `<h1>Solidgate H2H Test</h1>
<h2>Create Charge</h2>
<form action="/charge" method="POST">
  <label>Amount (cents): <input name="amount" value="1020"></label><br><br>
  <label>Currency: <input name="currency" value="USD"></label><br><br>
  <label>Card: <input name="card_number" value="4067429974719265"></label><br><br>
  <label>Exp Month: <input name="card_exp_month" value="12" size="4"></label>
  <label>Exp Year: <input name="card_exp_year" value="2030" size="6"></label>
  <label>CVV: <input name="card_cvv" value="123" size="4"></label><br><br>
  <label>Cardholder: <input name="card_holder" value="John Doe"></label><br><br>
  <label>Email: <input name="customer_email" value="john@example.com"></label><br><br>
  <label>Customer Account ID: <input name="customer_account_id" value="customer-123"></label><br><br>
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
  <label>Amount (required): <input name="amount"></label>
  <button type="submit">Refund</button>
</form>`)
}

func handleCharge(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	r.ParseForm()
	amount, _ := strconv.Atoi(r.FormValue("amount"))
	if amount <= 0 {
		jsonResponse(w, 400, map[string]string{"error": "amount must be > 0"})
		return
	}

	body := map[string]interface{}{
		"amount":            amount,
		"currency":          r.FormValue("currency"),
		"card_number":       r.FormValue("card_number"),
		"card_exp_month":    r.FormValue("card_exp_month"),
		"card_exp_year":     r.FormValue("card_exp_year"),
		"card_cvv":          r.FormValue("card_cvv"),
		"card_holder":       r.FormValue("card_holder"),
		"order_id":          fmt.Sprintf("order-%d", time.Now().UnixMilli()),
		"order_description": "Test charge",
		"customer_email":      r.FormValue("customer_email"),
		"customer_account_id": r.FormValue("customer_account_id"),
		"ip_address":          r.RemoteAddr,
		"platform":            "WEB",
	}

	data, err := solidgateRequest("POST", "/api/v1/charge", body)
	if err != nil {
		jsonResponse(w, 400, map[string]string{"error": err.Error()})
		return
	}
	jsonResponse(w, 200, data)
}

func handleStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	r.ParseForm()
	orderID := r.FormValue("order_id")
	if orderID == "" {
		jsonResponse(w, 400, map[string]string{"error": "order_id required"})
		return
	}
	data, err := solidgateRequest("POST", "/api/v1/status", map[string]interface{}{"order_id": orderID})
	if err != nil {
		jsonResponse(w, 400, map[string]string{"error": err.Error()})
		return
	}
	jsonResponse(w, 200, data)
}

func handleRefund(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	r.ParseForm()
	orderID := r.FormValue("order_id")
	if orderID == "" {
		jsonResponse(w, 400, map[string]string{"error": "order_id required"})
		return
	}
	amt := r.FormValue("amount")
	if amt == "" {
		jsonResponse(w, 400, map[string]string{"error": "amount is required"})
		return
	}
	a, _ := strconv.Atoi(amt)
	body := map[string]interface{}{"order_id": orderID, "amount": a}
	data, err := solidgateRequest("POST", "/api/v1/refund", body)
	if err != nil {
		jsonResponse(w, 400, map[string]string{"error": err.Error()})
		return
	}
	jsonResponse(w, 200, data)
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	body, _ := io.ReadAll(r.Body)
	signature := r.Header.Get("signature")
	if signature == "" {
		http.Error(w, "Missing signature", 400)
		return
	}
	if !verifyWebhookSignature(string(body), signature) {
		http.Error(w, "Invalid signature", 400)
		return
	}
	eventType := r.Header.Get("solidgate-event-type")
	log.Printf("[DEBUG] Webhook [%s]: %s", eventType, string(body))
	w.WriteHeader(200)
	fmt.Fprint(w, "OK")
}

func main() {
	if publicKey == "" || secretKey == "" {
		log.Fatal("SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY must be set.")
	}
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/charge", handleCharge)
	http.HandleFunc("/status", handleStatus)
	http.HandleFunc("/refund", handleRefund)
	http.HandleFunc("/webhook", handleWebhook)
	log.Printf("Server running on http://localhost%s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
