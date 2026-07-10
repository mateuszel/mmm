# Styling the Payment Form

Comprehensive reference for visually customising the Solidgate Payment Form. [Customize payment form](https://docs.solidgate.com/payments/integrate/payment-form/custom-payment-form/) doc.

The Payment Form renders inside a sandboxed iframe — you cannot inject your own stylesheet. Instead, the SDK accepts:

1. A `formParams` object — picks the template and toggles built-in elements.
2. A `styles` object — a CSS-in-JS-style nested map applied inside the iframe.
3. `formParams.googleFontLink` — a single Google Fonts URL pulled into the iframe.

Customisations propagate as soon as the SDK injects them; subscribe to the `customStylesAppended` event before revealing the form to avoid a flash of unstyled content.

---

## Templates (`formParams.formTypeClass`)

Pick one of four pre-designed templates. They differ in spacing, shadows, and which `styles` targets apply.

| Template | Look & feel | When to use |
|----------|-------------|-------------|
| `default` | Traditional layout, clearly bordered fields | Most checkouts; works on any screen size |
| `flat` | Minimal, no shadows or textures | Pairs with flat-design brand systems |
| `card` | Card-shaped form with `card_view` background | Promotional / branded checkouts |
| `inline` | Condensed two-column (CVV + Expiry side-by-side) | Compact layouts, embedded checkouts |

```js
PaymentFormSdk.init({
  merchantData,
  formParams: { formTypeClass: "card" },
});
```

`body_errors` only takes effect under `card` and `flat`.

---

## `formParams` — content & visibility

Toggle built-in form elements and override copy. Set on `PaymentFormSdk.init({ formParams: {...} })` (or `formParams={...}` for React/Vue/Angular).

### Layout & buttons

| Param | Type | Default | Purpose |
|-------|------|---------|---------|
| `formTypeClass` | string | `"default"` | See template table above. |
| `buttonType` | string | `"default"` | `"default"` shows "Pay", `"continue"` shows "Continue". |
| `submitButtonText` | string | — | Custom submit-button label. |
| `allowSubmit` | boolean | `true` | Set `false` to hide the built-in button and drive submission yourself with `form.submit()` (also disables Enter-key submit). |
| `autoFocus` | boolean | `true` | Auto-focus the first field on load. |
| `enabled` | boolean | `true` | Set `false` to hide the card form (e.g. show only Apple/Google Pay). |
| `headerText` | string | — | Top header text. |
| `titleText` | string | — | Subtitle below the header. |
| `isCardHolderVisible` | boolean | `false` | Force the cardholder field to always render. |
| `hideCvvNumbers` | boolean | `false` | Mask CVV digits as `•••` while typing. Works on the regular form, not just resign. |
| `isSolidLogoVisible` | boolean | `false` | Show the "Powered by Solidgate" footer logo. |

### Branding

| Param | Type | Purpose |
|-------|------|---------|
| `cardBrands` | string[] | Brand logos to render above the form. SDK accepts ≈24 values: `american-express`, `aura`, `bajaj`, `bancontact`, `bc-card`, `cartes-bancaires`, `dankort`, `diners-club`, `discover`, `elo`, `gpn-card`, `hipercard`, `interac`, `jcb`, `maestro`, `mada`, `mastercard`, `paypal`, `rupay`, `thai-payment-network`, `troy`, `unionpay`, `verve`, `visa`. |
| `secureBrands` | string[] | Trust logos. Common values: `visa-secure`, `mcc-id-check`, `ssl`, `pci-dss`, `norton`, `mc-affee`. |
| `googleFontLink` | string | Single Google Fonts URL to load into the iframe (keep the font set small for fast loads). Reference the family in `styles.form_body['font-family']`. |

### Field labels & placeholders

Every input field accepts `<fieldName>Label` and `<fieldName>Placeholder` overrides. Standard fields:

```text
cardNumberLabel       cardNumberPlaceholder
cardExpiryDateLabel   cardExpiryDatePlaceholder
cardCvvLabel          cardCvvPlaceholder
cardHolderLabel       cardHolderPlaceholder
emailLabel            emailPlaceholder
zipCodeLabel          zipCodePlaceholder
```

```js
PaymentFormSdk.init({
  merchantData,
  formParams: {
    cardExpiryDateLabel: "Expiration Date",
    cardExpiryDatePlaceholder: "MM/YY",
    argentinaDniLabel: "DNI",
  },
});
```

---

## `styles` object — the CSS-in-JS map

`styles` accepts nested objects matching iframe-internal class targets. Each key may contain:

- direct CSS properties (`color`, `background`, `border-radius`, …)
- sub-selectors (`input`, `.label`, `.error`, `.error-text`, etc.)
- pseudo-classes / pseudo-elements (`:focus`, `:hover`, `:placeholder`, `:disabled`, `::before`, `::after`)
- state-variant classes (`.not-empty`, `.error`, `.valid`)

If no state class is given, properties apply to all states.

### Style targets

**Any class name other than the ones listed below is dropped** — styles attached to unknown class names will not apply.

#### Card-form targets

| Target | Purpose | Common sub-selectors |
|--------|---------|----------------------|
| `form_body` | Outer container — font-family, color, spacing | `.label`, `.input` |
| `header` | Form header (top region) | — |
| `form_title` | Subtitle below header | — |
| `input_group` | All input fields uniformly | `input`, `.label`, `.error` |
| `card_number` | Card-number field | `input`, `.label`, `.error`, `.error-text`, `i` |
| `card_cvv` | CVV field | `input`, `.label`, `.error`, `.error-text` |
| `expiry_date` | Expiry-date field | `input`, `.label`, `.error`, `.error-text` |
| `card_holder` | Cardholder-name field | `input`, `.label` |
| `email` | Customer email field | `input`, `.label`, `.error` |
| `zip_code` | ZIP code field | `input`, `.label`, `.error` |
| `card_view` | Background of the `card` template | — |
| `card_brands` | Card-brand logo strip | `i` (brand icons) |
| `submit_button` | Submit button | `.title`, `:disabled`, `::before` |
| `two-columns` | Wrapper for CVV+Expiry in `inline`/`default` (note the hyphen — *not* `two_columns`) | — |
| `additional_field` | Generic country-specific extra fields | `input`, `.label`, `.error` |
| `card_cpf` | Brazilian CPF input | `input`, `.label`, `.error` |
| `card_dni` | DNI / national-ID input (Argentina, Peru, …) | `input`, `.label`, `.error` |
| `card_curp` | Mexican CURP input | `input`, `.label`, `.error` |
| `card_pin` | Card PIN input (regions where required) | `input`, `.label`, `.error` |
| `body_errors` | Form-level error messages — `card` and `flat` templates only | — |
| `secure_info` | Security/SSL/PCI logo footer | — |

#### Resign (1-click / saved-card) targets

Used only when the SDK is initialised via `PaymentFormSdk.resign(...)`. See [frontend-sdk.md § Resign Flow](frontend-sdk.md#resign-flow-1-click-payments).

| Target | Purpose |
|--------|---------|
| `resign-form` | Outer container of the resign form |
| `resign-form-content` | Inner content wrapper |
| `resign-card-preview` | Saved-card preview block |
| `resign-card-preview-content` | Inner content of the card preview |
| `resign-card-brand-icon` | Brand icon shown next to the saved card |
| `resign-unknown-card-icon` | Fallback icon when the brand can't be detected |
| `resign-card-card-brand-name` | Saved card brand name text |
| `resign-card-ending-in-text` | "ending in" label text |
| `resign-card-last-four` | Last-four digits text |
| `resign-input-group` | Input wrapper |
| `resign-input-block` | Single input cell |
| `resign-label` | Input label |
| `resign-cvv` | CVV input on the resign form |
| `resign-dotted-placeholder` | Dotted CVV placeholder |
| `resign-tooltip-icon` | Tooltip trigger icon |
| `resign-tooltip` | Tooltip popover |
| `resign-submit-button` | Resign submit button |

### Example — branded styling

```js
const form = PaymentFormSdk.init({
  merchantData,
  formParams: {
    formTypeClass: "default",
    googleFontLink: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap",
  },
  styles: {
    form_body: {
      "font-family": "Inter, sans-serif",
      color: "#1a1a1a",
    },
    form_title: {
      "font-weight": "500",
      "font-size": "20px",
    },
    card_number: {
      input: {
        "border-color": "#c8d6e5",
        color: "#222f3e",
        ":focus": { "border-color": "#0066ff" },
      },
      ".label": { color: "#222f3e" },
      ".error input": { "border-color": "#fc9494", color: "#fc9494" },
      ".error .label": { color: "#fc9494" },
    },
    submit_button: {
      "background-color": "#0066ff",
      color: "#ffffff",
      "border-radius": "8px",
      height: "50px",
      ":disabled": { "background-color": "#576574" },
    },
    secure_info: { color: "#3d4251" },
  },
});

form.on("customStylesAppended", () => {
  // Reveal your container only after styles land — avoids FOUC.
});
```

---

## Common scenarios

### 1. Brand colours + custom font

```js
PaymentFormSdk.init({
  merchantData,
  formParams: {
    googleFontLink: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap",
  },
  styles: {
    form_body: { "font-family": "Roboto, sans-serif" },
    submit_button: { "background-color": "#7B1FA2", "border-radius": "12px" },
  },
});
```

### 2. Error state colour palette

```js
styles: {
  card_number: {
    ".error input":     { "border-color": "#e53935", color: "#e53935" },
    ".error .label":    { color: "#e53935" },
    ".error-text":      { color: "#e53935" },
  },
  card_cvv:    { ".error input": { "border-color": "#e53935" } },
  expiry_date: { ".error input": { "border-color": "#e53935" } },
  body_errors: { color: "#e53935" }, // takes effect under "card" / "flat" templates
}
```

### 3. Hide a built-in field via CSS

You can hide elements purely via `display: none`. Hiding card-number fields can break form behaviour; test thoroughly.

```js
styles: {
  card_holder: { display: "none" },
  zip_code:    { display: "none" },
}
```

### 4. Card-template background

```js
formParams: { formTypeClass: "card" },
styles: {
  card_view: { background: "#101820" },
  form_body: { color: "#ffffff" },
  card_number: {
    ".label": { color: "rgba(255,255,255,0.7)" },
    input:    { color: "#ffffff", "border-color": "rgba(255,255,255,0.3)" },
  },
}
```

### 5. Custom submit button (drive submission yourself)

```js
const form = PaymentFormSdk.init({
  merchantData,
  formParams: { allowSubmit: false },
});

document.getElementById("my-pay-button").addEventListener("click", () => form.submit());
```

For the React equivalent, capture the form instance via `onReadyPaymentInstance` and call `.submit()` from your own button.

### 6. Two-column layout with the inline template

```js
formParams: { formTypeClass: "inline" },
styles: {
  "two-columns": { gap: "12px" },
}
```

### 7. Resign-form CVV mask

`hideCvvNumbers` works for both regular and resign flows; in resign mode the SDK enforces `autoFocus: false`.

```js
PaymentFormSdk.resign(resignMerchantData, {
  container: { id: "resign-container", width: "100%" },
  appearance: { hideCvvNumbers: true, cardBrandIconStyle: "colored" },
});
```

---

## Constraints

- **No images** — `background-image: url(...)` and `data:` URIs are not supported.
- **Fonts** — only Google Fonts, loaded via `formParams.googleFontLink`. Self-hosted fonts are not loaded into the iframe.
- **`body_errors`** — only applies under the `card` and `flat` templates.
- **Avoid FOUC** — wait for the `customStylesAppended` event before revealing the form container.
- **Hiding card-number fields can break behaviour** — hide with care and test the full flow before shipping.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| Styles applied but layout still default-looking | Sub-selector typo (e.g. `.errors` instead of `.error`); pseudo-class quoted wrong |
| Custom font not loading | Wrong `googleFontLink` URL, or font name not referenced in `styles.form_body['font-family']` |
| Brief unstyled flash on load | Reveal the container only after `customStylesAppended` fires |
| `body_errors` does nothing | Active template is `default` or `inline`; switch to `card` or `flat` |
| "Solidgate PaymentFormSdk is already initialized" warning | `solid-form.js` was loaded twice — remove the duplicate `<script>` |
