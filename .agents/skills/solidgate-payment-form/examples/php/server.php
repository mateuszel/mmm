<?php
// Solidgate Payment Form — PHP example server
//
// Uses the OFFICIAL solidgate/php-sdk package for merchantData generation.
// The SDK computes the correct HMAC-SHA512 signature over the encoded,
// encrypted paymentIntent — getting that right by hand is easy to break.
//
// Endpoints
//   GET  /                      Test page with embedded payment form
//   POST /api/payment-intent    Generate merchantData (signed + encrypted)
//   POST /webhook               Receive and verify webhook notifications
//
// Setup (one-time)
//   1. Get keys from https://hub.solidgate.com/  (Settings → API Keys).
//   2. Export env vars:
//        export SOLIDGATE_PUBLIC_KEY="api_pk_..."
//        export SOLIDGATE_SECRET_KEY="api_sk_..."
//        export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
//        export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
//   3. Install dependency (in this directory):
//        composer require solidgate/php-sdk
//
// Run
//   php -S localhost:3000 server.php
//
// Then open http://localhost:3000 — fill the form, use test card
// 4067429974719265 (any future expiry, any CVV).

require __DIR__ . '/vendor/autoload.php';

use SolidGate\API\Api;

// ============================================================
// Configuration
// ============================================================
define('PUBLIC_KEY',     getenv('SOLIDGATE_PUBLIC_KEY') ?: '');
define('SECRET_KEY',     getenv('SOLIDGATE_SECRET_KEY') ?: '');
define('WH_PUBLIC_KEY',  getenv('SOLIDGATE_WEBHOOK_PUBLIC_KEY') ?: '');
define('WH_SECRET_KEY',  getenv('SOLIDGATE_WEBHOOK_SECRET_KEY') ?: '');

if (PUBLIC_KEY === '' || SECRET_KEY === '') {
    http_response_code(500);
    echo "SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY must be set.\n";
    echo "  export SOLIDGATE_PUBLIC_KEY=\"api_pk_...\"\n";
    echo "  export SOLIDGATE_SECRET_KEY=\"api_sk_...\"\n";
    exit;
}

// One Api instance — reuse it.
$api = new Api(PUBLIC_KEY, SECRET_KEY);

// ============================================================
// Webhook signature — no SDK helper exists, so verify manually.
// Formula:  base64(hex(HMAC-SHA512(wh_secret, wh_public + raw_body + wh_public)))
// ============================================================
function verifyWebhookSignature(string $rawBody, string $receivedSignature): bool {
    $data = WH_PUBLIC_KEY . $rawBody . WH_PUBLIC_KEY;
    $hmacHex = hash_hmac('sha512', $data, WH_SECRET_KEY);
    $expected = base64_encode($hmacHex);
    return hash_equals($expected, $receivedSignature);
}

function jsonResponse(int $status, $data): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
}

// ============================================================
// Routing
// ============================================================
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Test page
if ($path === '/' && $method === 'GET') {
    header('Content-Type: text/html; charset=utf-8');
    echo <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solidgate Payment Form Test</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    label { display: block; margin: 8px 0 4px; }
    input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { margin-top: 16px; padding: 10px 24px; background: #0066FF; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    #payment-form { margin-top: 24px; min-height: 300px; }
    #status { margin-top: 16px; padding: 12px; border-radius: 4px; display: none; }
    .success { background: #d4edda; color: #155724; }
    .error   { background: #f8d7da; color: #721c24; }
    .info    { background: #d1ecf1; color: #0c5460; }
  </style>
</head>
<body>
  <h1>Solidgate Payment Form Test</h1>
  <form id="config-form">
    <label>Amount (cents): <input id="amount" value="1020" type="number"></label>
    <label>Currency: <input id="currency" value="USD"></label>
    <label>Description: <input id="description" value="Test payment"></label>
    <button type="submit">Initialize Payment Form</button>
  </form>
  <div id="status"></div>
  <div id="payment-form"></div>
  <script src="https://cdn.solidgate.com/js/solid-form.js"></script>
  <script>
    const statusEl = document.getElementById("status");
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = type;
      statusEl.style.display = "block";
    }
    document.getElementById("config-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      showStatus("Initializing...", "info");
      const orderId = "order-" + crypto.randomUUID();
      try {
        const resp = await fetch("/api/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseInt(document.getElementById("amount").value, 10),
            currency: document.getElementById("currency").value,
            order_id: orderId,
            order_description: document.getElementById("description").value,
          }),
        });
        if (!resp.ok) {
          showStatus("Error: " + (await resp.json()).error, "error");
          return;
        }
        const merchantData = await resp.json();
        document.getElementById("payment-form").innerHTML = "";
        const form = PaymentFormSdk.init({
          merchantData,
          iframeParams: { containerId: "payment-form" },
        });
        form.on("mounted", () => showStatus("Form loaded. Test card: 4067429974719265", "info"));
        form.on("success", () => showStatus("Payment successful!", "success"));
        form.on("fail",    (ev) => showStatus("Failed: " + (ev.error?.message || "Declined"), "error"));
        form.on("error",   (ev) => showStatus("Error: "  + (ev.value?.message || "Unknown"), "error"));
      } catch (err) {
        showStatus("Network error: " + err.message, "error");
      }
    });
  </script>
</body>
</html>
HTML;
    exit;
}

// Generate merchantData via the official SDK.
// $api->formMerchantData($intent) returns a FormInitDTO; toArray() gives
// an associative array shaped like { merchant, signature, paymentIntent }.
if ($path === '/api/payment-intent' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['amount']) || empty($input['currency']) || empty($input['order_id'])) {
        jsonResponse(400, ['error' => 'amount, currency, and order_id are required']);
        exit;
    }

    $intent = [
        'amount'            => (int)$input['amount'],
        'currency'          => $input['currency'],
        'order_id'          => $input['order_id'],
        'order_description' => $input['order_description'] ?? 'Payment',
        'platform'          => 'WEB',
    ];
    foreach (['customer_email', 'product_id', 'payment_type', 'ip_address'] as $field) {
        if (!empty($input[$field])) {
            $intent[$field] = $input[$field];
        }
    }

    $merchantData = $api->formMerchantData($intent)->toArray();
    error_log('[DEBUG] Generated merchantData for order_id=' . $input['order_id']);
    jsonResponse(200, $merchantData);
    exit;
}

// Webhook — verify signature, then handle event.
if ($path === '/webhook' && $method === 'POST') {
    $rawBody   = file_get_contents('php://input');
    $signature = $_SERVER['HTTP_SIGNATURE'] ?? '';
    $eventType = $_SERVER['HTTP_SOLIDGATE_EVENT_TYPE'] ?? '';
    $eventId   = $_SERVER['HTTP_SOLIDGATE_EVENT_ID'] ?? '';

    if ($signature === '') {
        http_response_code(400);
        echo 'Missing signature header';
        exit;
    }
    if (!verifyWebhookSignature($rawBody, $signature)) {
        error_log('[ERROR] Invalid webhook signature');
        http_response_code(400);
        echo 'Invalid signature';
        exit;
    }

    $event = json_decode($rawBody, true);
    error_log("[DEBUG] Webhook [$eventType] ($eventId)");

    // Add business logic here. Decline info lives at top-level $event['error']
    // (sibling of order/transactions), NOT inside $event['order'].

    echo 'OK';
    exit;
}

// 404
http_response_code(404);
echo 'Not found';
