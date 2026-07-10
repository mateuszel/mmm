// ChargebackHit — Go Example Server
//
// Endpoints:
// - POST /webhook    — Handle alert webhooks
// - POST /alerts     — List alerts
// - GET  /           — Test page
//
// Run:
//   export CHARGEBACKHIT_PUBLIC_KEY="your_public_key"
//   export CHARGEBACKHIT_SECRET_KEY="your_secret_key"
//   go run main.go

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
)

var (
	publicKey = os.Getenv("CHARGEBACKHIT_PUBLIC_KEY")
	secretKey = os.Getenv("CHARGEBACKHIT_SECRET_KEY")
)

const cbhAPI = "https://api.chargebackhit.com"

func generateSignature(pubKey, secKey, jsonBody string) string {
	data := pubKey + jsonBody + pubKey
	mac := hmac.New(sha512.New, []byte(secKey))
	mac.Write([]byte(data))
	hmacHex := hex.EncodeToString(mac.Sum(nil))
	return base64.StdEncoding.EncodeToString([]byte(hmacHex))
}

func verifySignature(rawBody, receivedSignature string) bool {
	expected := generateSignature(publicKey, secretKey, rawBody)
	return hmac.Equal([]byte(expected), []byte(receivedSignature))
}

func cbhRequest(path string, body interface{}) (map[string]interface{}, error) {
	jsonBytes, _ := json.Marshal(body)
	sig := generateSignature(publicKey, secretKey, string(jsonBytes))

	req, _ := http.NewRequest("POST", cbhAPI+path, bytes.NewReader(jsonBytes))
	req.Header.Set("public_key", publicKey)
	req.Header.Set("Signature", sig)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	return result, nil
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, `<h1>ChargebackHit Test</h1>
<p>Webhook URL: <code>POST http://localhost:3000/webhook</code></p>
<form action="/alerts" method="POST"><button>Get Alerts</button></form>`)
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	body, _ := io.ReadAll(r.Body)
	rawBody := string(body)
	signature := r.Header.Get("Signature")

	if signature == "" || !verifySignature(rawBody, signature) {
		http.Error(w, "Invalid signature", 400)
		return
	}

	var alert map[string]interface{}
	json.Unmarshal(body, &alert)

	alertObj, _ := alert["alert"].(map[string]interface{})
	alertType, _ := alertObj["type"].(string)
	log.Printf("[WEBHOOK] Alert [%s]", alertType)

	w.Header().Set("Content-Type", "application/json")
	switch alertType {
	case "init-refund":
		json.NewEncoder(w).Encode(map[string]string{"outcome": "reversed"})
	default:
		json.NewEncoder(w).Encode(map[string]string{"outcome": "acknowledged"})
	}
}

func handleAlerts(w http.ResponseWriter, r *http.Request) {
	data, err := cbhRequest("/api/v2/alerts/list", map[string]interface{}{
		"pagination": map[string]interface{}{"method": "token", "limit": 20},
	})
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func main() {
	if publicKey == "" || secretKey == "" {
		log.Fatal("Set CHARGEBACKHIT_PUBLIC_KEY and CHARGEBACKHIT_SECRET_KEY.")
	}
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/webhook", handleWebhook)
	http.HandleFunc("/alerts", handleAlerts)
	log.Println("Server on http://localhost:3000")
	log.Fatal(http.ListenAndServe(":3000", nil))
}
