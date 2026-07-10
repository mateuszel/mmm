# Authentication

All ChargebackHit API requests are authenticated with HMAC-SHA512 signatures — the same algorithm as Solidgate.

---

## API Keys

Obtain from ChargebackHit HUB dashboard.

| Key | Used For |
|-----|----------|
| Public key | `public_key` header in API calls |
| Secret key | HMAC signing. **Never expose publicly.** |

---

## Signature Formula

```
signature = base64(hex(HMAC-SHA512(secret_key, public_key + json_body + public_key)))
```

### Steps

1. Concatenate: `public_key` + JSON body string + `public_key`
2. Compute HMAC-SHA512 using `secret_key` as the key
3. Convert the binary HMAC to a **hex string** (lowercase)
4. Base64-encode the **hex string** (not the raw bytes)

### HTTP Headers

| Header | Value |
|--------|-------|
| `public_key` | Your public API key |
| `Signature` | Base64-encoded hex HMAC-SHA512 |
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

async function cbhRequest(method, path, body) {
  const publicKey = process.env.CHARGEBACKHIT_PUBLIC_KEY;
  const secretKey = process.env.CHARGEBACKHIT_SECRET_KEY;
  const jsonBody = body ? JSON.stringify(body) : "";

  const resp = await fetch(`https://api.chargebackhit.com${path}`, {
    method,
    headers: {
      public_key: publicKey,
      Signature: generateSignature(publicKey, secretKey, jsonBody),
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

PUBLIC_KEY = os.environ["CHARGEBACKHIT_PUBLIC_KEY"]
SECRET_KEY = os.environ["CHARGEBACKHIT_SECRET_KEY"]

def generate_signature(public_key, secret_key, json_body=""):
    data = (public_key + json_body + public_key).encode("utf-8")
    hmac_hex = hmac.new(secret_key.encode("utf-8"), data, hashlib.sha512).hexdigest()
    return base64.b64encode(hmac_hex.encode("utf-8")).decode("utf-8")

def cbh_request(method, path, body=None):
    json_body = json.dumps(body) if body else ""
    resp = requests.request(
        method,
        f"https://api.chargebackhit.com{path}",
        headers={
            "public_key": PUBLIC_KEY,
            "Signature": generate_signature(PUBLIC_KEY, SECRET_KEY, json_body),
            "Content-Type": "application/json",
        },
        data=json_body if body else None,
    )
    return resp.json()
```

### Go

```go
import (
    "crypto/hmac"
    "crypto/sha512"
    "encoding/base64"
    "encoding/hex"
)

func generateSignature(publicKey, secretKey, jsonBody string) string {
    data := publicKey + jsonBody + publicKey
    mac := hmac.New(sha512.New, []byte(secretKey))
    mac.Write([]byte(data))
    hmacHex := hex.EncodeToString(mac.Sum(nil))
    return base64.StdEncoding.EncodeToString([]byte(hmacHex))
}
```

### PHP

```php
function generateSignature(string $publicKey, string $secretKey, string $jsonBody): string {
    $data = $publicKey . $jsonBody . $publicKey;
    $hmacHex = hash_hmac('sha512', $data, $secretKey); // returns hex by default
    return base64_encode($hmacHex);
}
```

---

## Webhook Signature Verification

Incoming webhooks from ChargebackHit also use this signature. Verify the `Signature` header using the same formula with the raw request body.

See [webhooks.md](webhooks.md) for full details.
