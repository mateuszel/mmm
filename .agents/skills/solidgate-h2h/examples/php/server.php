<?php
// Solidgate H2H — PHP Example Server
//
// Endpoints:
// - POST /charge    — Create a card payment
// - POST /status    — Check order status
// - POST /refund    — Refund an order
// - POST /webhook   — Receive and verify webhooks
// - GET  /          — Test page
//
// Run:
//   export SOLIDGATE_PUBLIC_KEY="api_pk_..."
//   export SOLIDGATE_SECRET_KEY="api_sk_..."
//   export SOLIDGATE_WEBHOOK_PUBLIC_KEY="wh_pk_..."
//   export SOLIDGATE_WEBHOOK_SECRET_KEY="wh_sk_..."
//   php -S localhost:3000 server.php
//
// NOTE: H2H integration requires PCI DSS certification.

define('PUBLIC_KEY', getenv('SOLIDGATE_PUBLIC_KEY') ?: '');
define('SECRET_KEY', getenv('SOLIDGATE_SECRET_KEY') ?: '');
define('WH_PUBLIC_KEY', getenv('SOLIDGATE_WEBHOOK_PUBLIC_KEY') ?: '');
define('WH_SECRET_KEY', getenv('SOLIDGATE_WEBHOOK_SECRET_KEY') ?: '');
define('SOLIDGATE_API', 'https://pay.solidgate.com');

function generateSignature(string $publicKey, string $secretKey, string $jsonBody): string {
    $data = $publicKey . $jsonBody . $publicKey;
    $hmacHex = hash_hmac('sha512', $data, $secretKey);
    return base64_encode($hmacHex);
}

function solidgateRequest(string $method, string $path, ?array $body = null): array {
    $jsonBody = $body !== null ? json_encode($body) : "";
    $signature = generateSignature(PUBLIC_KEY, SECRET_KEY, $jsonBody);

    error_log("[DEBUG] $method $path request: $jsonBody");

    $ch = curl_init(SOLIDGATE_API . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "merchant: " . PUBLIC_KEY,
            "signature: " . $signature,
            "Content-Type: application/json",
        ],
    ]);
    if ($method === "POST" && $body !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);
    }
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    error_log("[DEBUG] $method $path response ($httpCode): $response");

    $data = json_decode($response, true) ?? [];
    if ($httpCode !== 200) {
        throw new RuntimeException("API error ($httpCode): $response");
    }
    return $data;
}
// Rate limits: 25 req/s (live), 10 req/s (sandbox). On HTTP 429, retry with exponential backoff.

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

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (PUBLIC_KEY === '' || SECRET_KEY === '') {
    http_response_code(500);
    echo "Set SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY env vars.\n";
    exit;
}

if ($path === '/' && $method === 'GET') {
    header('Content-Type: text/html; charset=utf-8');
    echo <<<'HTML'
<h1>Solidgate H2H Test</h1>
<h2>Create Charge</h2>
<form action="/charge" method="POST">
  <label>Amount (cents): <input name="amount" value="1020"></label><br><br>
  <label>Currency: <input name="currency" value="USD"></label><br><br>
  <label>Card: <input name="card_number" value="4067429974719265"></label><br><br>
  <label>Exp Month: <input name="card_exp_month" value="12" size="4"></label>
  <label>Exp Year: <input name="card_exp_year" value="2030" size="6"></label>
  <label>CVV: <input name="card_cvv" value="123" size="4"></label><br><br>
  <label>Cardholder: <input name="card_holder" value="John Doe"></label><br><br>
  <label>Email: <input name="customer_email" value="john@example.com"></label><br><br>
  <label>Customer Account ID: <input name="customer_account_id" value=""></label><br><br>
  <button type="submit">Charge</button>
</form>
<h2>Check Status</h2>
<form action="/status" method="POST">
  <label>Order ID: <input name="order_id"></label>
  <button type="submit">Check</button>
</form>
<h2>Refund</h2>
<form action="/refund" method="POST">
  <label>Order ID: <input name="order_id"></label>
  <label>Amount (cents, required): <input name="amount"></label>
  <button type="submit">Refund</button>
</form>
HTML;
    exit;
}

if ($path === '/charge' && $method === 'POST') {
    try {
        $amount = (int)($_POST['amount'] ?? 0);
        if ($amount <= 0) { jsonResponse(400, ['error' => 'amount must be > 0']); exit; }

        $body = [
            'amount' => $amount,
            'currency' => $_POST['currency'] ?? 'USD',
            'card_number' => $_POST['card_number'],
            'card_exp_month' => $_POST['card_exp_month'],
            'card_exp_year' => $_POST['card_exp_year'],
            'card_cvv' => $_POST['card_cvv'],
            'card_holder' => $_POST['card_holder'] ?? '',
            'order_id' => 'order-' . (int)(microtime(true) * 1000),
            'order_description' => 'Test charge',
            'customer_email' => $_POST['customer_email'] ?? 'test@example.com',
            'customer_account_id' => $_POST['customer_account_id'] ?? '',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            'platform' => 'WEB',
        ];

        $data = solidgateRequest('POST', '/api/v1/charge', $body);
        jsonResponse(200, $data);
    } catch (RuntimeException $e) {
        jsonResponse(400, ['error' => $e->getMessage()]);
    }
    exit;
}

if ($path === '/status' && $method === 'POST') {
    try {
        $orderId = $_POST['order_id'] ?? '';
        if (!$orderId) { jsonResponse(400, ['error' => 'order_id required']); exit; }
        $data = solidgateRequest('POST', '/api/v1/status', ['order_id' => $orderId]);
        jsonResponse(200, $data);
    } catch (RuntimeException $e) {
        jsonResponse(400, ['error' => $e->getMessage()]);
    }
    exit;
}

if ($path === '/refund' && $method === 'POST') {
    try {
        $orderId = $_POST['order_id'] ?? '';
        if (!$orderId) { jsonResponse(400, ['error' => 'order_id required']); exit; }
        $amount = (int)($_POST['amount'] ?? 0);
        if ($amount <= 0) { jsonResponse(400, ['error' => 'amount is required and must be > 0']); exit; }
        $body = ['order_id' => $orderId, 'amount' => $amount];
        $data = solidgateRequest('POST', '/api/v1/refund', $body);
        jsonResponse(200, $data);
    } catch (RuntimeException $e) {
        jsonResponse(400, ['error' => $e->getMessage()]);
    }
    exit;
}

if ($path === '/webhook' && $method === 'POST') {
    $rawBody = file_get_contents('php://input');
    $signature = $_SERVER['HTTP_SIGNATURE'] ?? '';
    if (!$signature) { http_response_code(400); echo 'Missing signature'; exit; }
    if (!verifyWebhookSignature($rawBody, $signature)) { http_response_code(400); echo 'Invalid signature'; exit; }
    $eventType = $_SERVER['HTTP_SOLIDGATE_EVENT_TYPE'] ?? '';
    error_log("[DEBUG] Webhook [$eventType]: $rawBody");
    echo 'OK';
    exit;
}

http_response_code(404);
echo 'Not found';
