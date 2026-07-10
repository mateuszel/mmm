<!--
  Solidgate Payment Form — Vue 3 example component

  Uses the OFFICIAL @solidgate/vue-sdk — Solidgate's Vue wrapper around the
  Payment Form. The wrapper auto-loads `solid-form.js` from the CDN, so you
  do NOT need to add a <script> tag.

  Setup (one-time)
    1. Get keys from https://hub.solidgate.com/  (Settings → API Keys).
    2. Stand up a backend that returns merchantData at POST /api/payment-intent.
       The Node.js, Python, Go, and PHP backends in this repo all do exactly
       that — pick one and run it on the same origin (or behind a proxy /
       CORS-enabled).
    3. In your Vue app:  npm install @solidgate/vue-sdk

  Usage
    <PaymentForm
      :amount="1020"
      currency="USD"
      :order-id="`order-${crypto.randomUUID()}`"
      order-description="Premium subscription"
      @payment-success="(e) => console.log('paid', e)"
    />

  Test card: 4067429974719265 (any future expiry, any CVV).
-->

<template>
  <div>
    <div v-if="!merchantData">
      <button @click="initPayment" :disabled="loading">
        {{ loading ? "Loading..." : "Pay" }}
      </button>
      <p v-if="error" style="color: red">{{ error }}</p>
    </div>

    <div v-else>
      <p v-if="status" style="color: green">{{ status }}</p>
      <p v-if="error" style="color: red">{{ error }}</p>

      <Payment
        :merchant-data="merchantData"
        @success="handleSuccess"
        @fail="handleFail"
        @error="handleError"
        @mounted="handleMounted"
        @verify="handleVerify"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Payment from "@solidgate/vue-sdk";

interface MerchantData {
  merchant: string;
  signature: string;
  paymentIntent: string;
}

const props = withDefaults(
  defineProps<{
    /** Amount in cents */
    amount: number;
    /** ISO 4217 currency code */
    currency: string;
    /** Unique order ID */
    orderId: string;
    /** Order description */
    orderDescription?: string;
    /** Customer email */
    customerEmail?: string;
    /** Product ID for subscriptions */
    productId?: string;
    /** Backend endpoint URL */
    apiUrl?: string;
  }>(),
  {
    orderDescription: "Payment",
    apiUrl: "/api/payment-intent",
  },
);

const emit = defineEmits<{
  (e: "paymentSuccess", event: any): void;
  (e: "paymentFail", event: any): void;
}>();

const merchantData = ref<MerchantData | null>(null);
const status = ref("");
const error = ref("");
const loading = ref(false);

async function initPayment() {
  loading.value = true;
  error.value = "";
  status.value = "";

  try {
    const body: Record<string, any> = {
      amount: props.amount,
      currency: props.currency,
      order_id: props.orderId,
      order_description: props.orderDescription,
    };
    if (props.customerEmail) body.customer_email = props.customerEmail;
    if (props.productId) {
      body.product_id = props.productId;
      body.payment_type = "recurring";
    }

    const resp = await fetch(props.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || `HTTP ${resp.status}`);
    }

    merchantData.value = await resp.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function handleSuccess(event: any) {
  status.value = "Payment successful!";
  emit("paymentSuccess", event);
}

function handleFail(event: any) {
  error.value = event.error?.message || "Payment declined";
  emit("paymentFail", event);
}

function handleError(event: any) {
  error.value = event.value?.message || "An error occurred";
}

function handleMounted() {
  status.value = "Payment form ready";
}

function handleVerify() {
  status.value = "3DS verification in progress...";
}
</script>
