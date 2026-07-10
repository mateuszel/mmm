# Authentication

Two cryptographic mechanisms are used in Payment Form integration:
1. **HMAC-SHA512 signature** — authenticates API requests and webhook payloads
2. **AES-256-CBC encryption** — encrypts the payment intent for the frontend SDK

> **Use the official Solidgate SDK** (`@solidgate/node-sdk`, `solidgate-sdk` for Python, `github.com/solidgate-tech/go-sdk`, `solidgate/php-sdk`, …) wherever one exists for your language. The SDK encapsulates both algorithms and the form-flow input ordering, which is easy to get wrong by hand. Treat the manual recipes below as a **fallback for stacks without an official SDK** (Java, Kotlin, C#, Ruby, Rust, Elixir, …) or for webhook verification (no SDK ships a webhook helper).

---

## API Keys

Obtain from Solidgate Hub (https://hub.solidgate.com/):

| Key | Prefix | Used For |
|-----|--------|----------|
| Public key | `api_pk_` | `merchant` field in merchantData, `merchant` header in API calls |
| Secret key | `api_sk_` | HMAC signing + AES encryption. **Never expose on frontend.** |
| Webhook public key | `wh_pk_` | Identifies merchant in webhook headers |
| Webhook secret key | `wh_sk_` | Verifies webhook signatures. **Never expose publicly.** |

---

## HMAC-SHA512 Signature

Used for: API request authentication, webhook verification.

### Formula

```
signature = base64(hex(HMAC-SHA512(secret_key, public_key + json_body + public_key)))
```

For GET requests (no body):
```
signature = base64(hex(HMAC-SHA512(secret_key, public_key + public_key)))
```

### Steps

1. Concatenate: `public_key` + JSON body string + `public_key`
2. Compute HMAC-SHA512 using `secret_key` as the key
3. Convert the binary HMAC to a **hex string** (lowercase)
4. Base64-encode the **hex string** (not the raw bytes)

### HTTP Headers

| Header | Value |
|--------|-------|
| `merchant` | Your public key (`api_pk_...`) |
| `signature` | Base64-encoded HMAC-SHA512 |

### Node.js Example

```javascript
const crypto = require("crypto");

function generateSignature(publicKey, secretKey, jsonBody) {
  const data = publicKey + jsonBody + publicKey;
  const hmacHex = crypto.createHmac("sha512", secretKey).update(data).digest("hex");
  return Buffer.from(hmacHex).toString("base64");
}

// Usage
const publicKey = "api_pk_7b197...";
const secretKey = "api_sk_a1b2c...";
const body = JSON.stringify({ amount: 1020, currency: "USD" });
const signature = generateSignature(publicKey, secretKey, body);
// Result: base64 of the hex-encoded HMAC-SHA512
```

### Python Example

```python
import hmac
import hashlib
import base64

def generate_signature(public_key: str, secret_key: str, json_body: str) -> str:
    data = public_key + json_body + public_key
    hmac_hex = hmac.new(
        secret_key.encode("utf-8"),
        data.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()
    return base64.b64encode(hmac_hex.encode("utf-8")).decode("utf-8")
```

### Go Example

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

### PHP Example

```php
function generateSignature(string $publicKey, string $secretKey, string $jsonBody): string {
    $data = $publicKey . $jsonBody . $publicKey;
    $hmacHex = hash_hmac('sha512', $data, $secretKey); // returns hex by default
    return base64_encode($hmacHex);
}
```

---

## AES-256-CBC Encryption (Payment Intent)

Used for: encrypting the payment intent JSON before sending it to the frontend SDK.

### Algorithm

- **Cipher**: AES-256-CBC
- **IV**: Random 16 bytes
- **Key**: First 32 bytes of the secret key (`api_sk_...`)
- **Input**: JSON string of the payment intent
- **Output**: Base64URL-encoded string of (IV + ciphertext), padding (`=`) preserved

### Steps

1. Generate a random 16-byte IV
2. Take the first 32 bytes of your `secret_key` as the AES key
3. Encrypt the payment intent JSON string with AES-256-CBC using the key and IV (PKCS7 padding)
4. Concatenate: IV + ciphertext
5. Base64URL-encode the result — replace `+`→`-`, `/`→`_`. Keep `=` padding (the official SDKs do)

### Node.js Example

```javascript
const crypto = require("crypto");

function encryptPaymentIntent(secretKey, paymentIntent) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(secretKey.substring(0, 32), "utf-8");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(JSON.stringify(paymentIntent), "utf-8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const result = Buffer.concat([iv, encrypted]);
  return result
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
```

### Python Example

```python
import os
import json
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding

def encrypt_payment_intent(secret_key: str, payment_intent: dict) -> str:
    iv = os.urandom(16)
    key = secret_key[:32].encode("utf-8")
    plaintext = json.dumps(payment_intent).encode("utf-8")

    # PKCS7 padding
    padder = padding.PKCS7(128).padder()
    padded = padder.update(plaintext) + padder.finalize()

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded) + encryptor.finalize()

    result = iv + ciphertext
    return base64.urlsafe_b64encode(result).decode("utf-8")
```

### Go Example

```go
import (
    "bytes"
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/base64"
    "encoding/json"
)

func encryptPaymentIntent(secretKey string, paymentIntent map[string]interface{}) (string, error) {
    key := []byte(secretKey[:32])
    plaintext, _ := json.Marshal(paymentIntent)

    // PKCS7 padding
    blockSize := aes.BlockSize
    padLen := blockSize - len(plaintext)%blockSize
    padded := append(plaintext, bytes.Repeat([]byte{byte(padLen)}, padLen)...)

    block, err := aes.NewCipher(key)
    if err != nil {
        return "", err
    }

    iv := make([]byte, 16)
    rand.Read(iv)

    mode := cipher.NewCBCEncrypter(block, iv)
    ciphertext := make([]byte, len(padded))
    mode.CryptBlocks(ciphertext, padded)

    result := append(iv, ciphertext...)
    return base64.URLEncoding.EncodeToString(result), nil
}
```

### PHP Example

```php
function encryptPaymentIntent(string $secretKey, array $paymentIntent): string {
    $iv = random_bytes(16);
    $key = substr($secretKey, 0, 32);
    $plaintext = json_encode($paymentIntent);

    $ciphertext = openssl_encrypt($plaintext, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);

    $result = $iv . $ciphertext;
    return strtr(base64_encode($result), '+/', '-_');
}
```

---

## Generating merchantData

The `merchantData` object sent to the frontend SDK has three fields:

```json
{
  "merchant": "api_pk_...",
  "signature": "<HMAC-SHA512 over the encoded paymentIntent string>",
  "paymentIntent": "<AES-256-CBC encrypted, base64url-encoded payment intent>"
}
```

> **Form-flow** signature differs from API-call signature:
>
> **Strongly prefer using an [official SDK](frontend-sdk.md#backend-sdks)** — the SDK gets this distinction right automatically. Use the manual recipe below only for stacks without an official SDK, and treat the SDK source as the source of truth.

### Full Example (Node.js, manual)

```javascript
function generateMerchantData(publicKey, secretKey, paymentIntent) {
  const encodedIntent = encryptPaymentIntent(secretKey, paymentIntent);
  // Form-flow: sign the encoded ciphertext, NOT the JSON body
  return {
    merchant: publicKey,
    signature: generateSignature(publicKey, secretKey, encodedIntent),
    paymentIntent: encodedIntent,
  };
}
```

### Rust Example (manual — for stacks without an official SDK)

Cargo deps: `aes`, `cbc`, `block-padding`, `hmac`, `sha2`, `base64`, `rand`, `hex`, `serde_json`.

```rust
use aes::Aes256;
use cbc::{cipher::{block_padding::Pkcs7, BlockEncryptMut, KeyIvInit}, Encryptor};
use base64::{engine::general_purpose::URL_SAFE, Engine};
use hmac::{Hmac, Mac};
use rand::RngCore;
use sha2::Sha512;
use serde_json::Value;

type Aes256Cbc = Encryptor<Aes256>;

fn encrypt_payment_intent(secret_key: &str, intent: &Value) -> String {
    let key: [u8; 32] = secret_key.as_bytes()[..32].try_into().unwrap();
    let mut iv = [0u8; 16];
    rand::rngs::OsRng.fill_bytes(&mut iv);

    let plaintext = serde_json::to_vec(intent).unwrap();
    let ciphertext = Aes256Cbc::new(&key.into(), &iv.into())
        .encrypt_padded_vec_mut::<Pkcs7>(&plaintext);

    let mut out = Vec::with_capacity(16 + ciphertext.len());
    out.extend_from_slice(&iv);
    out.extend_from_slice(&ciphertext);
    URL_SAFE.encode(out) // base64url with `=` padding kept
}

fn generate_signature(public_key: &str, secret_key: &str, payload: &str) -> String {
    // Form-flow: payload IS the encoded ciphertext, not the raw JSON body.
    let data = format!("{}{}{}", public_key, payload, public_key);
    let mut mac = Hmac::<Sha512>::new_from_slice(secret_key.as_bytes()).unwrap();
    mac.update(data.as_bytes());
    let hex = hex::encode(mac.finalize().into_bytes()); // hex first
    base64::engine::general_purpose::STANDARD.encode(hex.as_bytes()) // then base64
}

fn generate_merchant_data(public_key: &str, secret_key: &str, intent: &Value) -> Value {
    let encoded = encrypt_payment_intent(secret_key, intent);
    let signature = generate_signature(public_key, secret_key, &encoded);
    serde_json::json!({
        "merchant": public_key,
        "signature": signature,
        "paymentIntent": encoded,
    })
}
```

---

## Webhook Signature Verification

Webhooks use a separate key pair (`wh_pk_` / `wh_sk_`). The verification formula is the same:

```
expected = base64(hex(HMAC-SHA512(wh_secret_key, wh_public_key + raw_json_body + wh_public_key)))
```

**Critical:** Use the raw JSON body exactly as received — do NOT re-serialize or reformat it.

See [webhooks.md](webhooks.md) for full details.
