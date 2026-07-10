// Solidgate H2H — Java Example Server
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
//   javac SolidgateServer.java && java SolidgateServer
//
// Keys:
//   Get them from https://hub.solidgate.com/ (Settings → API Keys)
//
// NOTE: H2H integration requires PCI DSS certification.
// Requires Java 11+ (uses HttpClient). No external dependencies.

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;
import java.util.stream.Collectors;

public class SolidgateServer {
    static final String PUBLIC_KEY = System.getenv("SOLIDGATE_PUBLIC_KEY");
    static final String SECRET_KEY = System.getenv("SOLIDGATE_SECRET_KEY");
    static final String WH_PUBLIC_KEY = System.getenv("SOLIDGATE_WEBHOOK_PUBLIC_KEY");
    static final String WH_SECRET_KEY = System.getenv("SOLIDGATE_WEBHOOK_SECRET_KEY");
    static final String SOLIDGATE_API = "https://pay.solidgate.com";
    static final HttpClient client = HttpClient.newHttpClient();

    public static void main(String[] args) throws Exception {
        if (PUBLIC_KEY == null || SECRET_KEY == null || PUBLIC_KEY.isEmpty() || SECRET_KEY.isEmpty()) {
            System.err.println("Set SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY env vars.");
            System.exit(1);
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(3000), 0);
        server.createContext("/", SolidgateServer::handleIndex);
        server.createContext("/charge", SolidgateServer::handleCharge);
        server.createContext("/status", SolidgateServer::handleStatus);
        server.createContext("/refund", SolidgateServer::handleRefund);
        server.createContext("/webhook", SolidgateServer::handleWebhook);
        server.start();
        System.out.println("Server running on http://localhost:3000");
    }

    static String generateSignature(String publicKey, String secretKey, String jsonBody) throws Exception {
        String data = publicKey + jsonBody + publicKey;
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexStr = new StringBuilder();
        for (byte b : hash) hexStr.append(String.format("%02x", b));
        return Base64.getEncoder().encodeToString(hexStr.toString().getBytes(StandardCharsets.UTF_8));
    }

    static String solidgateRequest(String path, String jsonBody) throws Exception {
        String signature = generateSignature(PUBLIC_KEY, SECRET_KEY, jsonBody);
        System.out.println("[DEBUG] POST " + path + " request: " + jsonBody);

        if (!path.matches("/api/v[0-9]+/[a-z]+")) {
            throw new IllegalArgumentException("Refusing request to unexpected path: " + path);
        }
        URI uri = URI.create(SOLIDGATE_API + path);
        if (!"pay.solidgate.com".equals(uri.getHost())) {
            throw new IllegalArgumentException("Refusing request to unexpected host: " + uri.getHost());
        }
        HttpRequest req = HttpRequest.newBuilder()
                .uri(uri)
                .header("merchant", PUBLIC_KEY)
                .header("signature", signature)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        System.out.println("[DEBUG] POST " + path + " response (" + resp.statusCode() + "): " + resp.body());
        return resp.body();
    }
    // NOTE: For production usage, implement rate limiting on all API calls
    // to avoid exceeding Solidgate's request rate limits.

    static String jsonEscape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }

    static boolean verifyWebhookSignature(String rawBody, String receivedSignature) {
        try {
            String data = WH_PUBLIC_KEY + rawBody + WH_PUBLIC_KEY;
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(WH_SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexStr = new StringBuilder();
            for (byte b : hash) hexStr.append(String.format("%02x", b));
            String expected = Base64.getEncoder().encodeToString(hexStr.toString().getBytes(StandardCharsets.UTF_8));
            return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), receivedSignature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }

    static String readBody(HttpExchange ex) throws IOException {
        return new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    static Map<String, String> parseForm(String body) {
        return java.util.Arrays.stream(body.split("&"))
                .map(p -> p.split("=", 2))
                .filter(p -> p.length == 2)
                .collect(Collectors.toMap(
                        p -> java.net.URLDecoder.decode(p[0], StandardCharsets.UTF_8),
                        p -> java.net.URLDecoder.decode(p[1], StandardCharsets.UTF_8),
                        (a, b) -> b
                ));
    }

    static void sendResponse(HttpExchange ex, int code, String contentType, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", contentType);
        ex.sendResponseHeaders(code, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.getResponseBody().close();
    }

    static void handleIndex(HttpExchange ex) throws IOException {
        String html = "<h1>Solidgate H2H Test</h1>" +
                "<h2>Create Charge</h2>" +
                "<form action='/charge' method='POST'>" +
                "<label>Amount (cents): <input name='amount' value='1020'></label><br><br>" +
                "<label>Currency: <input name='currency' value='USD'></label><br><br>" +
                "<label>Card: <input name='card_number' value='4067429974719265'></label><br><br>" +
                "<label>Exp: <input name='card_exp_month' value='12' size='4'> / <input name='card_exp_year' value='2030' size='6'></label>" +
                "<label> CVV: <input name='card_cvv' value='123' size='4'></label><br><br>" +
                "<label>Holder: <input name='card_holder' value='John Doe'></label><br><br>" +
                "<label>Email: <input name='customer_email' value='john@example.com'></label><br><br>" +
                "<label>Account ID: <input name='customer_account_id' value='acc-123'></label><br><br>" +
                "<button type='submit'>Charge</button></form>" +
                "<h2>Check Status</h2>" +
                "<form action='/status' method='POST'><label>Order ID: <input name='order_id'></label>" +
                "<button type='submit'>Check</button></form>" +
                "<h2>Refund</h2>" +
                "<form action='/refund' method='POST'><label>Order ID: <input name='order_id'></label>" +
                "<label>Amount (required): <input name='amount' required></label><button type='submit'>Refund</button></form>";
        sendResponse(ex, 200, "text/html; charset=utf-8", html);
    }

    static void handleCharge(HttpExchange ex) throws IOException {
        try {
            Map<String, String> form = parseForm(readBody(ex));
            int amount = Integer.parseInt(form.getOrDefault("amount", "0"));
            if (amount <= 0) { sendResponse(ex, 400, "application/json", "{\"error\":\"amount must be > 0\"}"); return; }

            String orderId = "order-" + System.currentTimeMillis();
            String json = String.format(
                    "{\"amount\":%d,\"currency\":\"%s\",\"card_number\":\"%s\",\"card_exp_month\":\"%s\"," +
                    "\"card_exp_year\":\"%s\",\"card_cvv\":\"%s\",\"card_holder\":\"%s\"," +
                    "\"order_id\":\"%s\",\"order_description\":\"Test charge\"," +
                    "\"customer_email\":\"%s\",\"customer_account_id\":\"%s\"," +
                    "\"ip_address\":\"%s\",\"platform\":\"WEB\"}",
                    amount, jsonEscape(form.getOrDefault("currency", "USD")),
                    jsonEscape(form.get("card_number")),
                    jsonEscape(form.get("card_exp_month")),
                    jsonEscape(form.get("card_exp_year")),
                    jsonEscape(form.get("card_cvv")),
                    jsonEscape(form.getOrDefault("card_holder", "")),
                    jsonEscape(orderId),
                    jsonEscape(form.getOrDefault("customer_email", "test@example.com")),
                    jsonEscape(form.getOrDefault("customer_account_id", "")),
                    jsonEscape(ex.getRemoteAddress().getAddress().getHostAddress()));

            String resp = solidgateRequest("/api/v1/charge", json);
            sendResponse(ex, 200, "application/json", resp);
        } catch (Exception e) {
            sendResponse(ex, 400, "application/json", "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    static void handleStatus(HttpExchange ex) throws IOException {
        try {
            Map<String, String> form = parseForm(readBody(ex));
            String orderId = form.getOrDefault("order_id", "");
            if (orderId.isEmpty()) { sendResponse(ex, 400, "application/json", "{\"error\":\"order_id required\"}"); return; }
            String resp = solidgateRequest("/api/v1/status", "{\"order_id\":\"" + jsonEscape(orderId) + "\"}");
            sendResponse(ex, 200, "application/json", resp);
        } catch (Exception e) {
            sendResponse(ex, 400, "application/json", "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    static void handleRefund(HttpExchange ex) throws IOException {
        try {
            Map<String, String> form = parseForm(readBody(ex));
            String orderId = form.getOrDefault("order_id", "");
            if (orderId.isEmpty()) { sendResponse(ex, 400, "application/json", "{\"error\":\"order_id required\"}"); return; }
            String amountStr = form.getOrDefault("amount", "");
            if (amountStr.isEmpty()) { sendResponse(ex, 400, "application/json", "{\"error\":\"amount required\"}"); return; }
            String json = "{\"order_id\":\"" + jsonEscape(orderId) + "\",\"amount\":" + Integer.parseInt(amountStr) + "}";
            String resp = solidgateRequest("/api/v1/refund", json);
            sendResponse(ex, 200, "application/json", resp);
        } catch (Exception e) {
            sendResponse(ex, 400, "application/json", "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    static void handleWebhook(HttpExchange ex) throws IOException {
        String rawBody = readBody(ex);
        String signature = ex.getRequestHeaders().getFirst("signature");
        if (signature == null || signature.isEmpty()) { sendResponse(ex, 400, "text/plain", "Missing signature"); return; }
        if (!verifyWebhookSignature(rawBody, signature)) { sendResponse(ex, 400, "text/plain", "Invalid signature"); return; }
        String eventType = ex.getRequestHeaders().getFirst("solidgate-event-type");
        System.out.println("[DEBUG] Webhook [" + eventType + "]: " + rawBody);
        sendResponse(ex, 200, "text/plain", "OK");
    }
}
