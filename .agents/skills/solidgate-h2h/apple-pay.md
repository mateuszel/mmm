# Apple Pay (H2H)

Accept Apple Pay payments via direct API integration. Your server receives the payment token from Apple Pay and forwards it to Solidgate.

---

## POST /api/v1/apple-pay

### Flow

1. Frontend renders the Apple Pay button using [Apple Pay JS API](https://developer.apple.com/documentation/apple_pay_on_the_web)
2. Customer authenticates with Face ID / Touch ID → Apple Pay returns payment token
3. Your server **decomposes the token** into its individual fields and sends them to Solidgate's API

### Prerequisites

1. **Apple Developer account** with Apple Pay merchant ID
2. **Domain verification**: host `/.well-known/apple-developer-merchantid-domain-association` on your domain
3. **HTTPS** required on your domain
4. Configure Apple Pay in Solidgate Hub

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `amount` | integer | Yes | Amount in cents | `1020` |
| `currency` | string | Yes | ISO 4217 | `"USD"` |
| `order_id` | string | Yes | Unique order ID (max 100 chars) | `"order-apay-001"` |
| `order_description` | string | Yes | Description | `"Payment via Apple Pay"` |
| `customer_email` | string | Yes | Customer email | `"john@example.com"` |
| `customer_account_id` | string | Yes | Unique customer identifier | `"cust-001"` |
| `ip_address` | string | Yes | Customer IP | `"8.8.8.8"` |
| `signature` | string | Yes | The `signature` from the Apple Pay token's `paymentData` | `"MIAGCSq..."` |
| `version` | string | Yes | The `version` from Apple Pay token's `paymentData` | `"EC_v1"` |
| `data` | string | Yes | The `data` (encrypted payment data) from Apple Pay token's `paymentData` | `"base64..."` |
| `header` | object | Yes | The `header` object from Apple Pay token's `paymentData` | (see below) |
| `header.transactionId` | string | Yes | Transaction identifier | `"abc123..."` |
| `header.publicKeyHash` | string | Yes | Hash of the ephemeral public key | `"base64..."` |
| `header.ephemeralPublicKey` | string | No | Ephemeral public key (for EC_v1) | `"base64..."` |
| `header.wrappedKey` | string | No | Wrapped key (for RSA_v1) | `"base64..."` |
| `network` | string | No | Card network (`"Visa"`, `"MasterCard"`, etc.) | `"Visa"` |
| `geo_country` | string | No | Customer country | `"USA"` |
| `platform` | string | No | Platform | `"WEB"` |

**Note:** The Apple Pay token returned by the SDK contains a `paymentData` object with `signature`, `version`, `data`, and `header`. You must decompose these fields and send them individually — do **not** send the raw token as a single string field.

### Response 200

Same structure as `/charge`. The `transaction.operation` will be `"apple-pay"`.

```json
{
  "order": {
    "order_id": "order-apay-001",
    "amount": 1020,
    "currency": "USD",
    "status": "settle_ok"
  },
  "transaction": {
    "id": "trx-030",
    "operation": "apple-pay",
    "status": "success",
    "amount": 1020,
    "currency": "USD",
    "card_token": {
      "token": "tok_apay123..."
    }
  },
  "transactions": {
    "trx-030": {
      "id": "trx-030",
      "operation": "apple-pay",
      "status": "success",
      "amount": 1020
    }
  }
}
```

If 3DS is required, `order.status` will be `"3ds_verify"` and `verify_url` will be present.

### Frontend Integration (Safari/iOS)

```javascript
const session = new ApplePaySession(3, {
  countryCode: "US",
  currencyCode: "USD",
  supportedNetworks: ["visa", "masterCard"],
  merchantCapabilities: ["supports3DS"],
  total: {
    label: "Your Store",
    amount: "10.20",
  },
});

session.onvalidatemerchant = async (event) => {
  // Validate merchant session via your backend
  const merchantSession = await fetch("/api/apple-pay/validate", {
    method: "POST",
    body: JSON.stringify({ validationURL: event.validationURL }),
  }).then((r) => r.json());

  session.completeMerchantValidation(merchantSession);
};

session.onpaymentauthorized = async (event) => {
  const paymentData = event.payment.token.paymentData;
  const paymentMethod = event.payment.token.paymentMethod;

  // Decompose the token and send individual fields to your backend
  const result = await fetch("/api/apple-pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: 1020,
      currency: "USD",
      order_id: "order-apay-001",
      order_description: "Payment via Apple Pay",
      customer_email: "john@example.com",
      customer_account_id: "cust-001",
      ip_address: "8.8.8.8",
      signature: paymentData.signature,
      version: paymentData.version,
      data: paymentData.data,
      header: paymentData.header,
      network: paymentMethod.network,
    }),
  }).then((r) => r.json());

  session.completePayment(
    result.order?.status === "settle_ok"
      ? ApplePaySession.STATUS_SUCCESS
      : ApplePaySession.STATUS_FAILURE
  );
};

session.begin();
```

### Test Amounts (Sandbox)

| Amount (cents) | Scenario |
|----------------|----------|
| `100` | Success (no 3DS) |
| `666` | Success with 3DS Challenge |
| `555` | Success with frictionless 3DS |
