# Google Pay (H2H)

Accept Google Pay payments via direct API integration. Your server receives the encrypted payment token from Google Pay and forwards it to Solidgate.

---

## POST /api/v1/google-pay

### Flow

1. Frontend renders the Google Pay button using the [Google Pay Web SDK](https://developers.google.com/pay/api/web)
2. Customer approves payment → Google Pay returns `paymentData.paymentMethodData.tokenizationData.token`
3. Your server **decomposes the token** into its individual fields and sends them to Solidgate's API

### Request

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `amount` | integer | Yes | Amount in cents | `1020` |
| `currency` | string | Yes | ISO 4217 | `"USD"` |
| `order_id` | string | Yes | Unique order ID (max 100 chars) | `"order-gpay-001"` |
| `order_description` | string | Yes | Description | `"Payment via Google Pay"` |
| `customer_email` | string | Yes | Customer email | `"john@example.com"` |
| `customer_account_id` | string | Yes | Unique customer identifier | `"cust-001"` |
| `ip_address` | string | Yes | Customer IP | `"8.8.8.8"` |
| `signature` | string | Yes | The `signature` field from the Google Pay token | `"MEUCIQDx..."` |
| `protocol_version` | string | Yes | The `protocolVersion` from the Google Pay token (max 10 chars) | `"ECv2"` |
| `signed_message` | string | Yes | The `signedMessage` from the Google Pay token | `"{\"encryptedMessage\":...}"` |
| `geo_country` | string | No | Customer country | `"USA"` |
| `platform` | string | No | Platform | `"WEB"` |

**Note:** The Google Pay token returned by the SDK is a JSON string containing `signature`, `protocolVersion`, and `signedMessage`. You must parse the token and send each field separately — do **not** send the raw token as a single string field.

### Response 200

Same structure as `/charge`. The `transaction.operation` will be `"google-pay"`. May include 3DS redirect.

```json
{
  "order": {
    "order_id": "order-gpay-001",
    "amount": 1020,
    "currency": "USD",
    "status": "settle_ok"
  },
  "transaction": {
    "id": "trx-020",
    "operation": "google-pay",
    "status": "success",
    "amount": 1020,
    "currency": "USD",
    "card_token": {
      "token": "tok_gpay123..."
    }
  },
  "transactions": {
    "trx-020": {
      "id": "trx-020",
      "operation": "google-pay",
      "status": "success",
      "amount": 1020
    }
  }
}
```

If 3DS is required, `order.status` will be `"3ds_verify"` and `verify_url` will be present.

### Frontend Integration (Vanilla JS)

```javascript
const paymentsClient = new google.payments.api.PaymentsClient({
  environment: "TEST", // or "PRODUCTION"
});

const paymentRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [{
    type: "CARD",
    parameters: {
      allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
      allowedCardNetworks: ["VISA", "MASTERCARD"],
    },
    tokenizationSpecification: {
      type: "PAYMENT_GATEWAY",
      parameters: {
        gateway: "solidgate",
        gatewayMerchantId: "your_merchant_id",
      },
    },
  }],
  transactionInfo: {
    totalPriceStatus: "FINAL",
    totalPrice: "10.20",
    currencyCode: "USD",
  },
};

const paymentData = await paymentsClient.loadPaymentData(paymentRequest);

// Parse the token — it's a JSON string containing signature, protocolVersion, signedMessage
const tokenObj = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);

// Send decomposed token fields to your backend
await fetch("/api/google-pay", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: 1020,
    currency: "USD",
    order_id: "order-gpay-001",
    order_description: "Payment via Google Pay",
    customer_email: "john@example.com",
    customer_account_id: "cust-001",
    ip_address: "8.8.8.8",
    signature: tokenObj.signature,
    protocol_version: tokenObj.protocolVersion,
    signed_message: tokenObj.signedMessage,
  }),
});
```

### Test Amounts (Sandbox)

| Amount (cents) | Scenario |
|----------------|----------|
| `100` | Success (no 3DS) |
| `666` | Success with 3DS Challenge |
| `555` | Success with frictionless 3DS |
