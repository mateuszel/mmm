// Solidgate Payment Form — React example component
//
// Uses the OFFICIAL @solidgate/react-sdk — Solidgate's React wrapper around
// the Payment Form. The wrapper auto-loads `solid-form.js` from the CDN, so
// you do NOT need to add a <script> tag.
//
// Setup (one-time)
//   1. Get keys from https://hub.solidgate.com/  (Settings → API Keys).
//   2. Stand up a backend that returns merchantData (signed + encrypted
//      paymentIntent) at POST /api/payment-intent. The Node.js, Python,
//      Go, and PHP backends in this repo all do exactly that — pick one
//      and run it on the same origin (or behind a proxy / CORS-enabled).
//   3. In your React app:  npm install @solidgate/react-sdk
//
// Usage
//   <PaymentForm
//     amount={1020}
//     currency="USD"
//     orderId={`order-${crypto.randomUUID()}`}
//     orderDescription="Premium subscription"
//     onPaymentSuccess={(e) => console.log("paid", e)}
//   />
//
// Test card: 4067429974719265 (any future expiry, any CVV).

import { useState, useCallback } from "react";
import Payment from "@solidgate/react-sdk";

interface MerchantData {
  merchant: string;
  signature: string;
  paymentIntent: string;
}

interface PaymentFormProps {
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
  /** Called on successful payment */
  onPaymentSuccess?: (event: any) => void;
  /** Called on failed payment */
  onPaymentFail?: (event: any) => void;
}

export default function PaymentForm({
  amount,
  currency,
  orderId,
  orderDescription = "Payment",
  customerEmail,
  productId,
  apiUrl = "/api/payment-intent",
  onPaymentSuccess,
  onPaymentFail,
}: PaymentFormProps) {
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const initPayment = useCallback(async () => {
    setLoading(true);
    setError("");
    setStatus("");

    try {
      const body: Record<string, any> = {
        amount,
        currency,
        order_id: orderId,
        order_description: orderDescription,
      };
      if (customerEmail) body.customer_email = customerEmail;
      if (productId) {
        body.product_id = productId;
        body.payment_type = "recurring";
      }

      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const data: MerchantData = await resp.json();
      setMerchantData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    amount,
    currency,
    orderId,
    orderDescription,
    customerEmail,
    productId,
    apiUrl,
  ]);

  const handleSuccess = useCallback(
    (event: any) => {
      setStatus("Payment successful!");
      onPaymentSuccess?.(event);
    },
    [onPaymentSuccess],
  );

  const handleFail = useCallback(
    (event: any) => {
      setError(event.error?.message || "Payment declined");
      onPaymentFail?.(event);
    },
    [onPaymentFail],
  );

  const handleError = useCallback((event: any) => {
    setError(event.value?.message || "An error occurred");
  }, []);

  const handleMounted = useCallback(() => {
    setStatus("Payment form ready");
  }, []);

  const handleVerify = useCallback(() => {
    setStatus("3DS verification in progress...");
  }, []);

  if (!merchantData) {
    return (
      <div>
        <button onClick={initPayment} disabled={loading}>
          {loading ? "Loading..." : "Pay"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {status && <p style={{ color: "green" }}>{status}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Payment
        merchantData={merchantData}
        onSuccess={handleSuccess}
        onFail={handleFail}
        onError={handleError}
        onMounted={handleMounted}
        onVerify={handleVerify}
      />
    </div>
  );
}
