# Authentication

All H2H API requests are authenticated with HMAC-SHA512 signatures sent via HTTP headers.

---

## API Keys

Obtain from Solidgate Hub (https://hub.solidgate.com/):

| Key | Prefix | Used For |
|-----|--------|----------|
| Public key | `api_pk_` | `merchant` header in API calls |
| Secret key | `api_sk_` | HMAC signing. **Never expose publicly.** |
| Webhook public key | `wh_pk_` | `merchant` header in webhooks |
| Webhook secret key | `wh_sk_` | Webhook signature verification. **Never expose publicly.** |

---

## Signature Formula

### POST requests (with JSON body)

```
signature = base64(hex(HMAC-SHA512(secret_key, public_key + json_body + public_key)))
```

### GET requests (no body)

```
signature = base64(hex(HMAC-SHA512(secret_key, public_key + public_key)))
```

---

## HTTP Headers

Every request must include:

| Header | Value |
|--------|-------|
| `merchant` | Your public key (`api_pk_...`) |
| `signature` | Base64-encoded HMAC-SHA512 |
| `Content-Type` | `application/json` |

---

## Implementation Examples

### Node.js

```javascript
const crypto = require("crypto");

function generateSignature(publicKey, secretKey, jsonBody) {
  const data = publicKey + jsonBody + publicKey;
  const hmacHex = crypto.createHmac("sha512", secretKey).update(data).digest("hex");
  return Buffer.from(hmacHex).toString("base64");
}

async function solidgateRequest(method, path, body) {
  const publicKey = process.env.SOLIDGATE_PUBLIC_KEY;
  const secretKey = process.env.SOLIDGATE_SECRET_KEY;
  const jsonBody = body ? JSON.stringify(body) : "";

  const signature = body
    ? generateSignature(publicKey, secretKey, jsonBody)
    : generateSignature(publicKey, secretKey, ""); // GET: pk + pk

  const resp = await fetch(`https://pay.solidgate.com${path}`, {
    method,
    headers: {
      "merchant": publicKey,
      "signature": signature,
      "Content-Type": "application/json",
    },
    body: body ? jsonBody : undefined,
  });

  return resp.json();
}
```

### Python

```python
import hmac, hashlib, base64, json, requests, os

PUBLIC_KEY = os.environ["SOLIDGATE_PUBLIC_KEY"]
SECRET_KEY = os.environ["SOLIDGATE_SECRET_KEY"]

def generate_signature(public_key, secret_key, json_body=""):
    data = public_key + json_body + public_key
    hmac_hex = hmac.new(secret_key.encode(), data.encode(), hashlib.sha512).hexdigest()
    return base64.b64encode(hmac_hex.encode()).decode()

def solidgate_request(method, path, body=None):
    json_body = json.dumps(body) if body else ""
    signature = generate_signature(PUBLIC_KEY, SECRET_KEY, json_body)

    resp = requests.request(
        method,
        f"https://pay.solidgate.com{path}",
        headers={
            "merchant": PUBLIC_KEY,
            "signature": signature,
            "Content-Type": "application/json",
        },
        data=json_body if body else None,
    )
    return resp.json()
```

### Go

```go
import (
    "bytes"
    "crypto/hmac"
    "crypto/sha512"
    "encoding/base64"
    "encoding/hex"
    "encoding/json"
    "net/http"
    "os"
)

func generateSignature(publicKey, secretKey, jsonBody string) string {
    data := publicKey + jsonBody + publicKey
    mac := hmac.New(sha512.New, []byte(secretKey))
    mac.Write([]byte(data))
    hmacHex := hex.EncodeToString(mac.Sum(nil))
    return base64.StdEncoding.EncodeToString([]byte(hmacHex))
}

func solidgateRequest(method, path string, body interface{}) (*http.Response, error) {
    publicKey := os.Getenv("SOLIDGATE_PUBLIC_KEY")
    secretKey := os.Getenv("SOLIDGATE_SECRET_KEY")

    var jsonBody string
    var reqBody *bytes.Reader
    if body != nil {
        b, _ := json.Marshal(body)
        jsonBody = string(b)
        reqBody = bytes.NewReader(b)
    }

    signature := generateSignature(publicKey, secretKey, jsonBody)

    var req *http.Request
    if reqBody != nil {
        req, _ = http.NewRequest(method, "https://pay.solidgate.com"+path, reqBody)
    } else {
        req, _ = http.NewRequest(method, "https://pay.solidgate.com"+path, nil)
    }

    req.Header.Set("merchant", publicKey)
    req.Header.Set("signature", signature)
    req.Header.Set("Content-Type", "application/json")

    return http.DefaultClient.Do(req)
}
```

### PHP

```php
function generateSignature(string $publicKey, string $secretKey, string $jsonBody = ""): string {
    $data = $publicKey . $jsonBody . $publicKey;
    $hmacHex = hash_hmac('sha512', $data, $secretKey);
    return base64_encode($hmacHex);
}

function solidgateRequest(string $method, string $path, ?array $body = null): array {
    $publicKey = getenv('SOLIDGATE_PUBLIC_KEY');
    $secretKey = getenv('SOLIDGATE_SECRET_KEY');
    $jsonBody = $body !== null ? json_encode($body) : "";

    $signature = generateSignature($publicKey, $secretKey, $jsonBody);

    $ch = curl_init("https://pay.solidgate.com" . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "merchant: " . $publicKey,
            "signature: " . $signature,
            "Content-Type: application/json",
        ],
    ]);

    if ($method === "POST" && $body !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);
    }

    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true) ?? [];
}
```

### curl

```bash
PUBLIC_KEY="api_pk_..."
SECRET_KEY="api_sk_..."
BODY='{"amount":1020,"currency":"USD","order_id":"order-123"}'

# Generate signature (requires openssl)
SIGNATURE=$(echo -n "${PUBLIC_KEY}${BODY}${PUBLIC_KEY}" | openssl dgst -sha512 -hmac "$SECRET_KEY" | sed 's/.*= //' | tr -d '\n' | base64)

curl -X POST "https://pay.solidgate.com/api/v1/charge" \
  -H "merchant: $PUBLIC_KEY" \
  -H "signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

---

## Webhook Signature Verification

Webhooks use separate keys (`wh_pk_` / `wh_sk_`). Same HMAC-SHA512 formula:

```
expected = base64(hex(HMAC-SHA512(wh_secret_key, wh_public_key + raw_json_body + wh_public_key)))
```

**Critical:** Use the raw JSON body exactly as received — do NOT re-serialize.

See [webhooks.md](webhooks.md) for full details.
