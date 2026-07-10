<?php
// ChargebackHit — PHP Example Server
//
// Endpoints:
// - POST /webhook    — Handle alert webhooks
// - POST /alerts     — List alerts
// - GET  /           — Test page
//
// Run:
//   export CHARGEBACKHIT_PUBLIC_KEY="your_public_key"
//   export CHARGEBACKHIT_SECRET_KEY="your_secret_key"
//   php -S localhost:3000 server.php

define('PUBLIC_KEY', getenv('CHARGEBACKHIT_PUBLIC_KEY') ?: '');
define('SECRET_KEY', getenv('CHARGEBACKHIT_SECRET_KEY') ?: '');
define('CBH_API', 'https://api.chargebackhit.com');

function generateSignature(string $publicKey, string $secretKey, string $jsonBody): string {
    $data = $publicKey . $jsonBody . $publicKey;
    $hmacHex = hash_hmac('sha512', $data, $secretKey);
    return base64_encode($hmacHex);
}

function verifySignature(string $rawBody, string $receivedSignature): bool {
    $expected = generateSignature(PUBLIC_KEY, SECRET_KEY, $rawBody);
    return hash_equals($expected, $receivedSignature);
}

function cbhRequest(string $path, array $body): array {
    $jsonBody = json_encode($body);
    $signature = generateSignature(PUBLIC_KEY, SECRET_KEY, $jsonBody);

    $ch = curl_init(CBH_API . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $jsonBody,
        CURLOPT_HTTPHEADER => [
            'public_key: ' . PUBLIC_KEY,
            'Signature: ' . $signature,
            'Content-Type: application/json',
        ],
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true) ?? [];
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (PUBLIC_KEY === '' || SECRET_KEY === '') {
    http_response_code(500);
    echo "Set CHARGEBACKHIT_PUBLIC_KEY and CHARGEBACKHIT_SECRET_KEY.\n";
    exit;
}

if ($path === '/' && $method === 'GET') {
    header('Content-Type: text/html; charset=utf-8');
    echo '<h1>ChargebackHit Test</h1>';
    echo '<p>Webhook: <code>POST http://localhost:3000/webhook</code></p>';
    echo '<form action="/alerts" method="POST"><button>Get Alerts</button></form>';
    exit;
}

if ($path === '/webhook' && $method === 'POST') {
    $rawBody = file_get_contents('php://input');
    $signature = $_SERVER['HTTP_SIGNATURE'] ?? '';

    if (!$signature || !verifySignature($rawBody, $signature)) {
        http_response_code(400);
        echo 'Invalid signature';
        exit;
    }

    $alert = json_decode($rawBody, true);
    $alertType = $alert['alert']['type'] ?? '';
    error_log("[WEBHOOK] Alert [$alertType]");

    header('Content-Type: application/json');
    if ($alertType === 'init-refund') {
        echo json_encode(['outcome' => 'reversed']);
    } else {
        echo json_encode(['outcome' => 'acknowledged']);
    }
    exit;
}

if ($path === '/alerts' && $method === 'POST') {
    header('Content-Type: application/json');
    echo json_encode(cbhRequest('/api/v2/alerts/list', [
        'pagination' => ['method' => 'token', 'limit' => 20],
    ]));
    exit;
}

http_response_code(404);
echo 'Not found';
