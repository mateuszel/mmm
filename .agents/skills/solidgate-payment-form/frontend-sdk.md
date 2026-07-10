# Frontend SDK

The Solidgate Payment Form is rendered as an iframe via the JavaScript SDK. Card data never touches your server.

---

## Installation

### CDN (Vanilla JS)

```html
<script src="https://cdn.solidgate.com/js/solid-form.js"></script>
```

### React

```bash
npm install @solidgate/react-sdk
```

### Vue.js

```bash
npm install @solidgate/vue-sdk
```

### Angular

```bash
npm install @solidgate/angular-sdk
```

---

## Backend SDKs

**Strongly prefer the official SDKs** — they encapsulate the correct AES-256-CBC encryption and the HMAC-SHA512 signature over the **encoded encrypted paymentIntent** (the form-flow signature is computed differently from the regular API-call signature; see [authentication.md](authentication.md)).

```bash
composer require solidgate/php-sdk           # PHP
npm install @solidgate/node-sdk              # Node.js
go get github.com/solidgate-tech/go-sdk      # Go
pip3 install solidgate-sdk                   # Python
```

### SDK Usage

Each SDK exposes a single call that returns `{ merchant, signature, paymentIntent }` ready to send to the browser.

**PHP** — `solidgate/php-sdk`:
```php
$api = new \SolidGate\API\Api($publicKey, $secretKey);
$merchantData = $api->formMerchantData($paymentIntent)->toArray();
```

**Node.js** — `@solidgate/node-sdk`:
```javascript
const solidGate = require('@solidgate/node-sdk');
const api = new solidGate.Api(publicKey, secretKey);
const merchantData = api.formMerchantData(paymentIntent).toObject();
```

**Go** — `github.com/solidgate-tech/go-sdk` (the SDK takes JSON bytes):
```go
api, _ := solidgate.NewAPI(publicKey, secretKey, nil)
intentBytes, _ := json.Marshal(paymentIntent)
dto, _ := api.FormMerchantData(intentBytes)
// dto.Merchant, dto.Signature, dto.PaymentIntent → send to frontend
```

**Python** — `solidgate-sdk`:
```python
from solidgate import ApiClient

# Constructor accepts public_key / secret_key — positional or keyword.
client = ApiClient(public_key=public_key, secret_key=secret_key)

md = client.form_merchant_data(payment_intent)
# `md` is a `solidgate.MerchantData` with snake_case attrs and NO `.to_dict()`.
# The frontend expects camelCase `paymentIntent` — convert manually:
merchant_data = {
    "merchant": md.merchant,
    "signature": md.signature,
    "paymentIntent": md.payment_intent,
}
```

For stacks **without an official SDK** (Java, C#, Ruby, Rust, Elixir, …) — and **only** then — implement the algorithm by hand following [authentication.md](authentication.md). If your stack appears in the list above, use that SDK rather than re-implementing the math. The form-flow signature is HMAC-SHA512 over `merchant + encodedPaymentIntent + merchant`, **not** over the raw JSON body.

---

## Initialization

### Vanilla JS

`merchantData` has exactly three fields: `merchant`, `signature`, `paymentIntent`. Generate them on your backend with an official SDK (above) or by hand ([authentication.md](authentication.md)).

```html
<div id="solid-payment-form-container"></div>
<script src="https://cdn.solidgate.com/js/solid-form.js"></script>
<script>
  const form = PaymentFormSdk.init({
    merchantData: {
      merchant: "api_pk_...",
      signature: "<HMAC-SHA512 signature>",
      paymentIntent: "<AES-256-CBC encrypted payment intent>",
    },
    formParams: { /* optional, see formParams Object below */ },
    styles: { /* optional — see styling.md */ },
    iframeParams: {
      containerId: "solid-payment-form-container", // default value shown
      width: "100%",                               // optional iframe width
    },
    // Digital-wallet & APM button params (all optional)
    googlePayButtonParams: { /* ... */ },
    applePayButtonParams:  { /* ... */ },
    paypalButtonParams:    { /* ... */ },
    // ...other APM params
  });

  form.on("mounted", () => { /* ready */ });
  form.on("success", (e) => { /* show success UX */ });
  form.on("fail",    (e) => { /* show decline UX — confirm via webhook */ });
  form.on("error",   (e) => { /* init error — log e.value, e.details */ });
</script>
```

### React

```tsx
import Payment from "@solidgate/react-sdk";

function PaymentPage({ merchantData }) {
  return (
    <Payment
      merchantData={merchantData}
      formParams={{ formTypeClass: "default" }}
      width="100%"
      onSuccess={(event) => console.log("Success:", event)}
      onFail={(event) => console.log("Failed:", event)}
      onError={(event) => console.log("Error:", event)}
      onMounted={(event) => console.log("Mounted:", event)}
      onReadyPaymentInstance={(form) => {
        // form.submit(), form.update(), etc.
      }}
    />
  );
}
```

### Vue.js

```vue
<template>
  <Payment
    :merchant-data="merchantData"
    :form-params="formParams"
    width="100%"
    @success="onSuccess"
    @fail="onFail"
    @error="onError"
    @mounted="onMounted"
  />
</template>

<script setup>
import { defineAsyncComponent } from "vue";
const Payment = defineAsyncComponent(() => import("@solidgate/vue-sdk"));

const props = defineProps({ merchantData: Object });
const formParams = { formTypeClass: "default" };

const onSuccess = (event) => console.log("Success:", event);
const onFail = (event) => console.log("Fail:", event);
const onError = (event) => console.log("Error:", event);
const onMounted = (event) => console.log("Mounted:", event);
</script>
```

### Angular

```typescript
import { SolidPaymentModule, FormType, InitConfig } from "@solidgate/angular-sdk";

@NgModule({ imports: [BrowserModule, SolidPaymentModule] })
export class AppModule {}

@Component({
  template: `
    <ngx-solid-payment
      [merchantData]="merchantData"
      [formParams]="formParams"
      width="100%"
      (success)="onSuccess($event)"
      (fail)="onFail($event)"
    ></ngx-solid-payment>
  `,
})
export class PaymentComponent {
  merchantData: InitConfig["merchantData"] = { merchant: "...", signature: "...", paymentIntent: "..." };
  formParams: InitConfig["formParams"] = { formTypeClass: FormType.Default };
}
```

---

## formParams Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `formTypeClass` | string | `"default"` | Template: `"default"`, `"card"`, `"inline"`, `"flat"` |
| `buttonType` | string | `"default"` | `"default"` or `"continue"` |
| `submitButtonText` | string | — | Custom submit button label |
| `isCardHolderVisible` | boolean | `false` | Always show cardholder field |
| `hideCvvNumbers` | boolean | `false` | Mask CVV digits as `•••` while typing (regular form and resign) |
| `headerText` | string | — | Form header text |
| `titleText` | string | — | Form subtitle text |
| `isSolidLogoVisible` | boolean | `false` | Show "Powered by Solidgate" logo |
| `enabled` | boolean | `true` | Show card form |
| `allowSubmit` | boolean | `true` | Allow submit button interaction (set `false` for custom submit) |
| `autoFocus` | boolean | `true` | Auto-focus first field on load |
| `cardBrands` | array | — | Card brand logos. Common: `"visa"`, `"mastercard"`, `"american-express"`, `"maestro"`, `"jcb"`, `"diners-club"`, `"discover"`, `"elo"`, `"hipercard"`, `"mada"`, `"unionpay"`, `"rupay"`, `"paypal"`. SDK accepts ~24 values — see `CardBrand` enum in client-sdk-loader. |
| `secureBrands` | array | — | Security logos: `"visa-secure"`, `"mcc-id-check"`, `"ssl"`, `"pci-dss"`, `"norton"`, `"mc-affee"` |
| `googleFontLink` | string | — | Google Font CDN URL |
| `cardNumberLabel` / `cardNumberPlaceholder` | string | — | Custom label / placeholder for card number |
| `cardExpiryDateLabel` / `cardExpiryDatePlaceholder` | string | — | Custom label / placeholder for expiry |
| `cardCvvLabel` / `cardCvvPlaceholder` | string | — | Custom label / placeholder for CVV |
| `cardHolderLabel` / `cardHolderPlaceholder` | string | — | Custom label / placeholder for cardholder |
| `emailLabel` / `emailPlaceholder` | string | — | Custom label / placeholder for the email field |
| `zipLabel` / `zipPlaceholder` | string | — | Custom label / placeholder for the ZIP field (alias kept for backward compatibility — prefer `zipCodeLabel` / `zipCodePlaceholder`) |
| `zipCodeLabel` / `zipCodePlaceholder` | string | — | Custom label / placeholder for the ZIP-code field |
| `<additionalFieldName>Label` / `<additionalFieldName>Placeholder` | string | — | Custom label / placeholder for any country-specific additional field — see "Additional fields" below |
| `cardFormExpandButtonParams` | object | — | `{ height?: number }` — overrides the default height of the "expand" button shown on collapsed card-form templates. |

### Additional fields

The form supports per-country and per-region "additional fields" (national ID, billing parts, customer phone, blik code, …). Each additional field has its own `<name>Label` and `<name>Placeholder` `formParams` keys that follow the same camelCase pattern as the built-in fields.

Available `<additionalFieldName>` values (mirrors the SDK's `AdditionalFieldName` union):

```
cardPin, zip, billingAddress, billingCity, billingState, blikCode, cardHolder,
firstName, lastName, customerPhone, customerFirstName, customerLastName,
indianCustomerPhone, brazilCustomerPhone, gbrPostalCode, brazilZip, indiaZip,
argentinaDni, bangladeshNic, boliviaCi, brazilCpf, cameroonCni, chileCi,
chinaId, pakistanCnic, colombiaCc, costaRicaCi, dominicanaId, ecuadorCi,
elSalvadorId, egyptId, ghanaCard, guatemalaCui, indiaPan, indonesiaNik,
japanId, kenyaId, malaysiaNric, mexicoCurp, moroccoCnie, nigeriaNin,
panamaId, paraguayCi, peruDni, philipinesPsn, senegalCni, southAfricaId,
tanzaniaId, thailandId, turkeyTcKimlikNo, ugandaNic, uriguayCi, vietnamVnid
```

**Examples:**

```js
formParams: {
  brazilCpfLabel:        "CPF",
  brazilCpfPlaceholder:  "000.000.000-00",
  gbrPostalCodeLabel:        "Postcode",
  gbrPostalCodePlaceholder:  "SW1A 1AA",
  customerPhoneLabel:        "Phone",
  customerPhonePlaceholder:  "+1 555 123 4567",
}
```

The corresponding style target for these fields is `additional_field` (see [styling.md](styling.md#style-targets)).

---

## Form Templates

`formTypeClass` accepts `"default"`, `"flat"`, `"card"`, `"inline"`. See [styling.md](styling.md#templates-formparamsformtypeclass) for what each template looks like, sub-selector support, and template-specific limitations.

---

## Events

### Event Subscription

**Vanilla JS:**
```javascript
form.on("event_name", (e) => { /* e.data */ });
form.unsubscribe("event_name");
form.unsubscribeAll();
```

**React props:** `onMounted`, `onSubmit`, `onCard`, `onInteraction`, `onRedirect`, `onCustomStylesAppended`, `onSuccess`, `onVerify`, `onFail`, `onOrderStatus`, `onPaymentDetails`, `onResize`, `onError`

**Vue events:** `@mounted`, `@submit`, `@card`, `@interaction`, `@redirect`, `@custom-styles-appended`, `@success`, `@verify`, `@fail`, `@order-status`, `@payment-details`, `@resize`, `@error`

### Event Catalog

#### `mounted`
Fires when form or button renders and becomes interactive.
```typescript
{ type: "mounted", entity: "applebtn" | "googlebtn" | "form" | "resign" | "bizum" | "blik" | "mbway" | "paypal" | "pix" | "pix-qr" | "pix-automatico" }
```

#### `submit`
Fires when customer submits payment. Same entity union as `mounted`.
```typescript
{ type: "submit", entity: "applebtn" | "googlebtn" | "form" | "resign" | "bizum" | "blik" | "mbway" | "paypal" | "pix" | "pix-qr" }
```

#### `card`
Fires when card number is entered and validated (after first 6-8 digits).
```typescript
{
  type: "card",
  card: {
    brand: string,        // "VISA", "MASTERCARD", "AMERICAN EXPRESS", "unknown"
    bin: string,          // First 6 digits
    cardType: string,     // "DEBIT", "CREDIT", "PREPAID", "CHARGE CARD", "unknown"
    cardCategory: string, // "BUSINESS", "STANDARD", "PLATINUM", "CLASSIC", etc.
    bank: string,         // Issuing bank name
    binCountry: string    // Country code
  }
}
```

#### `interaction`
Fires on user interaction with form elements. Replace `cardForm` with `resignForm` when the resign flow is active (same shape, only `resignCvv` is tracked).

```typescript
{
  type: "interaction",
  target: {
    type: "button" | "input",
    name: "submit" | "applePay" | "googlePay" | "cardNumber" | "cardCvv" | "cardExpiryDate" | "cardHolder" | "email" | "zipCode",
    interaction: "click" | "change" | "focus" | "blur" | "enterKeyDown" | "pageClose" | "resetRequested"
  },
  cardForm: {
    fields: {
      cardNumber: { isValid: boolean, isTouched: boolean },
      cardCvv: { isValid: boolean, isTouched: boolean },
      cardExpiryDate: { isValid: boolean, isTouched: boolean }
      // Other fields (e.g. cardHolder) appear here once they are touched.
    },
    isValid: boolean,
    isTouched: boolean
  }
}
```

`pageClose` fires when the user closes an APM modal **before** submission. `resetRequested` fires when the user closes an APM modal **after** submission, but only when the button was initialised with `resetEnabled: true` — closing the modal does NOT auto-cancel the order; the merchant must destroy the SDK instance and re-init.

#### `success`
Fires when payment completes successfully.
```typescript
{
  type: "success",
  entity: "applebtn" | "googlebtn" | "form" | "resign" | "bizum" | "blik" | "mbway" | "paypal" | "pix" | "pix-qr",
  order?: {
    status: string,
    currency: string,
    amount: number,
    subscription_id: string,
    order_id: string
  }
}
```

#### `fail`
Fires when payment is declined.
```typescript
{
  type: "fail",
  entity: "applebtn" | "googlebtn" | "form" | "resign" | "bizum" | "blik" | "mbway" | "paypal" | "pix" | "pix-qr",
  code: string,
  message: string,
  order?: {
    status: string,
    currency: string,
    amount: number,
    subscription_id: string,
    order_id: string
  }
}
```

#### `verify`
Fires when 3DS verification begins.
```typescript
{ type: "verify" }
```

#### `error`
Fires on initialization or processing error.
```typescript
{
  type: "error",
  value: {
    name: "ConnectionError" | "InitPaymentError" | "GatewayError",
    message: string
  },
  details?: {
    code: string,    // "1.01", "2.01", "6.01"
    message: string | { [key: string]: string }
  }
}
```

Error codes: `1.01` = auth failed (invalid credentials/signature), `2.01` = invalid data (per-field details in `details.message`), `6.01` = unknown decline.

#### `formRedirect`
Fires before redirecting to 3DS page, status page, or external URL.
```typescript
{ type: "formRedirect" }
```

#### `customStylesAppended`
Fires after custom CSS is injected into the form iframe.
```typescript
{ type: "customStylesAppended" }
```

#### `orderStatus`
Fires when order status changes (may fire multiple times during processing). `response` is a partial order-status payload — for cards it matches the [card-order webhook](https://api-docs.solidgate.com/#tag/Card-payments/operation/webhook-card-order-status), for APMs the [APM-order webhook](https://api-docs.solidgate.com/#tag/Alternative-payment-methods/operation/webhook-apm-order-status).
```typescript
{
  type: "orderStatus",
  entity: "applebtn" | "googlebtn" | "form" | "resign" | "bizum" | "blik" | "mbway" | "paypal" | "pix" | "pix-qr",
  response: object
}
```

#### `paymentDetails`
Fires with price breakdown (subscriptions with coupons/taxes).
```typescript
{
  type: "paymentDetails",
  payment: {
    priceBreakdown: {
      productPrice?: { amount: string, currency: string, currencyIcon: string },
      discountPrice?: { amount: string, currency: string, currencyIcon: string },
      trialPrice?: { amount: string, currency: string, currencyIcon: string },
      price: {
        source: "productPrice" | "discountPrice" | "trialPrice",
        amount: string, taxAmount: string, taxRate: number,
        taxableAmount: string, currency: string, currencyIcon: string
      }
    }
  }
}
```

#### `resize`
Fires when form dimensions change.
```typescript
{ type: "resize", width: number, height: number }
```

### Event Timeline

1. `mounted` → `customStylesAppended` (if custom CSS)
2. `interaction` events during user input
3. `card` when card number validated
4. `submit` on form submission
5. `orderStatus` (may repeat)
6. `verify` (if 3DS)
7. `success` or `fail`
8. `formRedirect` before navigation

---

## Form Methods

### `form.submit()`

Programmatically submit the form:

```javascript
// Set allowSubmit: false, then use your own button:
const form = PaymentFormSdk.init({
  merchantData,
  formParams: { allowSubmit: false },
});

document.getElementById("my-button").addEventListener("click", () => form.submit());
```

React:
```tsx
const [form, setForm] = useState(null);
<Payment
  formParams={{ allowSubmit: false }}
  onReadyPaymentInstance={(f) => setForm(f)}
/>
<button onClick={() => form?.submit()}>Pay Now</button>
```

### `form.update(partialIntent)`

Update payment parameters without reinitializing. Accepts `amount`, `currency`, `product_id`, and other select fields.

```javascript
form.update(updatedMerchantData);
```

### `form.applyCoupon(couponCode)`

Apply a discount coupon (subscriptions only):

```javascript
form.applyCoupon("SPRING20")
  .then((prices) => {
    // prices.productPrice, prices.discountPrice, prices.trialPrice
  })
  .catch((error) => {
    // error.details?.code, error.details?.message
  });
```

### `form.unsubscribeAll()`

Remove all event listeners.

### `form.destroy()`

Fully tear down the form instance: detaches the iframe, cleans the DOM tree, and removes residual event listeners and internal state. Use before swapping in a new `init`/`resign` (e.g. after a `resetRequested` interaction or when navigating between checkout steps).

```javascript
form.destroy();
```

---

## Resign Flow (1-Click Payments)

For returning customers with saved card tokens. Displays only the CVV field.

### Vanilla JS

```javascript
const form = await PaymentFormSdk.resign({
  merchant: "api_pk_...",
  signature: "<signature>",
  resignIntent: "<AES encrypted resign intent>",
}, {
  container: { id: "resign-container", width: "100%" },
  appearance: {
    autoFocus: false, // SDK enforces false in resign mode
    submitButtonText: "Pay Now",
    allowSubmit: true,
    googleFontLink: "https://fonts.googleapis.com/css2?family=Inter",
    resignCvvLabel: "Card CVV",
    resignCvvPlaceholder: "•••",
    hideCvvNumbers: false, // also available on the regular form
    cardBrandIconStyle: "colored", // "monochrome-light" | "monochrome-dark" | "colored"
  },
  styles: { /* resign-specific style targets */ },
});
```

### resignIntent Fields

The resignIntent accepts essentially the same shape as `paymentIntent` ([payment-intent.md](payment-intent.md)) **plus** the required `recurring_token`, **minus** `product_id` and any wallet-token paths.

Required core:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_id` | string ≤255 | Yes | Unique order ID |
| `recurring_token` | string | Yes | Saved card token (must be a card token — Apple Pay / Google Pay tokens are NOT permitted) |
| `order_description` | string ≤255 | Yes | Description |
| `amount` | integer ≥0 | Yes (one-time) | Amount in minor units |
| `currency` | string (ISO 4217) | Yes (one-time) | Currency code |
| `product_price_id` | string (UUID v4) | Yes (subscription) | Price ID — note `product_id` is **not** accepted in resign |
| `customer_account_id` | string ≤100 | Yes (subscription) | Customer ID |

Optional fields accepted in resignIntent (same semantics as paymentIntent):

`coupon_id`, `settle_interval`, `authorization_type`, `retry_attempt`, `force3ds`, `customer_email`, `customer_first_name`, `customer_last_name`, `customer_phone`, `customer_date_of_birth`, `ip_address`, `traffic_source`, `transaction_source`, `purchase_country`, `geo_country`, `geo_city`, `billing_address` (and its sub-fields), `language`, `website`, `device`, `device_sessions`, `platform`, `user_agent`, `order_metadata`, `success_url`, `fail_url`, `order_items`, `order_date`, `order_number`.

See [payment-intent.md](payment-intent.md) for shapes and constraints of each.

**Restrictions:**
- Only card tokens — Apple Pay / Google Pay tokens must NOT be used with resign.
- `form.update()` and `form.applyCoupon()` are not supported in resign mode.

---

## Google Pay Button

**paymentIntent fields:**
- `google_pay_merchant_id` (required) — merchant ID from Google Pay & Wallet Console (max 100 chars)
- `google_pay_merchant_name` (recommended) — display name in Google Pay sheet (max 255 chars)

```javascript
PaymentFormSdk.init({
  merchantData,
  googlePayButtonParams: {
    enabled: true,
    containerId: "google-pay-container", // optional, renders above form by default
    color: "black",     // "default" | "black" | "white"
    type: "pay",        // "buy" | "checkout" | "order" | "pay" | "plain" | "subscribe"
    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
  },
});
```

**Test amounts (sandbox):** `100` = success, `555` = decline, `666` = 3DS challenge.

React with custom container:
```tsx
const googleRef = useRef(null);
<div ref={googleRef} />
<Payment merchantData={merchantData} googlePayContainerRef={googleRef} />
```

---

## Apple Pay Button

**paymentIntent fields:**
- `apple_pay_merchant_name` (required) — display name in the Apple Pay sheet (max 64 chars)
- `apple_pay_merchant_domain` is auto-set from Solidgate Hub config; the merchant doesn't pass it explicitly.

**Setup:**
1. Host the verification file at `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association.txt` over HTTPS, MIME `text/plain`, no auth.
2. Verify the domain in Solidgate Hub → Developers section.
3. Pages embedding the form must allow payments in iframes via `allow="payment"`.

```javascript
PaymentFormSdk.init({
  merchantData,
  applePayButtonParams: {
    enabled: true,
    containerId: "apple-pay-container",
    color: "black",           // "black" | "white-outline" | "white"
    type: "plain",            // "plain" (default) | "buy" | "check-out" | "pay" | "order" | "subscribe" | "continue" | "add-money" | "reload" | "set-up" | "top-up"
    integrationType: "css",   // "css" (Safari only, default) | "js" (cross-browser, QR for non-Safari)
  },
});
```

**`integrationType` differences:**
- `"css"` — Safari-only, tested and stable.
- `"js"` — cross-browser via WebComponents. Non-Safari browsers see a QR code that can be scanned with iOS 18+. Requires adding `https://applepay.cdn-apple.com/` to your CSP `script-src`.

---

## Click to Pay

Powered by Visa/Mastercard/AmEx Click to Pay (Unified Checkout Solutions, UCS). Customer saves the card once and pays on any supported site by selecting it from a list — no card re-entry.

**Onboarding (mandatory before use):**
- Requires a Solidgate Acquiring connector account.
- Requires UCS onboarding — **not self-serve, contact your Solidgate account manager.**
- Click to Pay works only through Solidgate Acquiring; not available on other processing paths.

**paymentIntent fields:** none specific. Initialize the form normally.

```javascript
PaymentFormSdk.init({
  merchantData,
  clickToPayButtonParams: {
    enabled: true,                                   // Required, default false
    saveRecognitionToken: true,                      // default false; sets `provider_clickToPayRecognitionToken` cookie (~180 days, Secure, SameSite=None) so returning visitors are recognised
    supportedCardNetworks: ["visa", "mastercard"],   // default ["mastercard", "visa", "amex"]
    height: 56,                                      // optional, range 52..60
    // NOTE: clickToPayButtonParams does NOT support containerId — SDK positions automatically
  },
});
```

**`clickToPayButtonParams` reference:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `false` | Required to display the button |
| `saveRecognitionToken` | boolean | `false` | Persist a first-party recognition cookie for returning customers |
| `supportedCardNetworks` | string[] | `["mastercard", "visa", "amex"]` | Card networks to allow |
| `height` | number | — | Button height in px, range 52–60 |

The SDK renders the Click to Pay UI above the card form with an automatic divider. Keep the card form visible as a fallback.

**Event routing — distinguish Click to Pay from card form using `entity`:**
```javascript
form.on("mounted", (e) => {
  if (e.entity === "clicktopay") { /* Click to Pay UI is ready */ }
  if (e.entity === "form")       { /* card form is ready */ }
});
form.on("submit", (e) => {
  if (e.entity === "clicktopay") { /* customer used C2P */ }
});
```

---

## APM Buttons

For each APM, configure the payment method in Solidgate Hub first. If `containerId` is omitted, the button renders above the card form. A non-existent containerId logs an error to the console.

### PayPal

paymentIntent: no extra fields required.

```javascript
paypalButtonParams: {
  enabled: true,                 // default false
  containerId: "paypal-container",
  color: "gold",                 // "gold" | "blue" | "silver" | "white" | "black"
  shape: "pill",                 // "rect" | "pill" | "sharp"
  label: "buynow",               // "paypal" | "checkout" | "buynow" | "pay"
  height: 52,                    // string, range 25..55 — button adapts to its container if omitted
  disableMaxWidth: false,        // when true, removes the default 750px max-width cap
}
```

Default for `label` is documented inconsistently upstream (`paypal` in the form-init reference, `buynow` in the APM-buttons reference) — pass it explicitly to avoid surprises.

### Blik

paymentIntent: no extra fields required.

```javascript
blikButtonParams: {
  enabled: true,            // default false (per APM-buttons reference)
  containerId: "blik-container",
  theme: "dark",            // "light" | "dark" (default "dark")
  resetEnabled: false,      // when true, modal close button stays visible after submit and emits `resetRequested`
}
```


### SmartPix / Pix QR / Pix Automático

```javascript
// SmartPix (default Pix flow). Default `enabled: true` per the SmartPix expander.
pixButtonParams: { enabled: true, containerId: "...", resetEnabled: false }

// Pix QR (one-shot QR code). Default `enabled: false`.
pixQrButtonParams: { enabled: true, containerId: "...", resetEnabled: false }

// Pix Automático (recurring). Default `enabled: false`. Requires future_usage in paymentIntent:
//   future_usage: {
//     payment_type: "recurring",
//     max_amount: 5000,
//     billing_period: { unit: "month", value: 1 }
//   }
pixAutomaticoButtonParams: { enabled: true, containerId: "...", resetEnabled: false }
```

Subscribe to the `mounted` event to know when the Pix QR / SmartPix button is set up and displayed. The mandate for Pix Automático must respect the authorization ceiling defined by `future_usage.max_amount` together with the Hub product configuration.

`resetEnabled: true` keeps the modal close button visible after submission — clicking it emits an `interaction` event with `interaction: "resetRequested"`. The SDK does NOT auto-cancel the order; merchants must `form.destroy()` and re-init with a new order.

### Bizum

paymentIntent must include: `future_usage: { payment_type: "one-time" }`.

```javascript
bizumButtonParams: { enabled: true, containerId: "..." }   // default enabled: false (APM-buttons ref)
```

### MB WAY

paymentIntent must include: `future_usage: { payment_type: "one-time" }`.

```javascript
mbwayButtonParams: { enabled: true, containerId: "..." }   // default enabled: false
```

### Cash App Pay

paymentIntent must include: `geo_country: "USA"`, `future_usage: { payment_type: "one-time" }`, `success_url`, `fail_url`.

```javascript
cashAppButtonParams: { enabled: true, containerId: "..." }   // default enabled: false
```

---

## Customize the Form

For visual customisation — templates, the `formParams` content/copy options, the full `styles` target catalogue, state variants, supported pseudo-classes, and ready-made scenarios (branded colours, error palettes, hidden fields, custom submit, dark card template) — see the dedicated **[styling.md](styling.md)** reference.
