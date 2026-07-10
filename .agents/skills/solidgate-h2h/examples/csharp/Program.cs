// Solidgate H2H — C# Example Server (ASP.NET Minimal API)
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
//   dotnet run
//
// NOTE: H2H integration requires PCI DSS certification.
// Requires .NET 6+.

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

var publicKey = Environment.GetEnvironmentVariable("SOLIDGATE_PUBLIC_KEY") ?? "";
var secretKey = Environment.GetEnvironmentVariable("SOLIDGATE_SECRET_KEY") ?? "";
var whPublicKey = Environment.GetEnvironmentVariable("SOLIDGATE_WEBHOOK_PUBLIC_KEY") ?? "";
var whSecretKey = Environment.GetEnvironmentVariable("SOLIDGATE_WEBHOOK_SECRET_KEY") ?? "";
const string solidgateApi = "https://pay.solidgate.com";

if (string.IsNullOrEmpty(publicKey) || string.IsNullOrEmpty(secretKey))
{
    Console.Error.WriteLine("Set SOLIDGATE_PUBLIC_KEY and SOLIDGATE_SECRET_KEY env vars.");
    return;
}

var httpClient = new HttpClient();
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:3000");
var app = builder.Build();

// ============================================================
// Crypto helpers
// ============================================================

string GenerateSignature(string pubKey, string secKey, string jsonBody)
{
    var data = Encoding.UTF8.GetBytes(pubKey + jsonBody + pubKey);
    using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(secKey));
    var hashBytes = hmac.ComputeHash(data);
    var hexStr = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
    return Convert.ToBase64String(Encoding.UTF8.GetBytes(hexStr));
}

async Task<string> SolidgateRequest(string path, string jsonBody)
{
    var signature = GenerateSignature(publicKey, secretKey, jsonBody);
    Console.WriteLine($"[DEBUG] POST {path} request: {jsonBody}");

    var req = new HttpRequestMessage(HttpMethod.Post, solidgateApi + path)
    {
        Content = new StringContent(jsonBody, Encoding.UTF8, "application/json")
    };
    req.Headers.Add("merchant", publicKey);
    req.Headers.Add("signature", signature);

    var resp = await httpClient.SendAsync(req);
    var body = await resp.Content.ReadAsStringAsync();
    Console.WriteLine($"[DEBUG] POST {path} response ({(int)resp.StatusCode}): {body}");
    return body;
}
// NOTE: Solidgate API has rate limits. Implement retry with exponential backoff for production use.

bool VerifyWebhookSignature(string rawBody, string receivedSignature)
{
    var data = Encoding.UTF8.GetBytes(whPublicKey + rawBody + whPublicKey);
    using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(whSecretKey));
    var hashBytes = hmac.ComputeHash(data);
    var hexStr = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
    var expected = Convert.ToBase64String(Encoding.UTF8.GetBytes(hexStr));
    return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(receivedSignature));
}

// ============================================================
// Endpoints
// ============================================================

app.MapGet("/", () => Results.Content(@"
<h1>Solidgate H2H Test</h1>
<h2>Create Charge</h2>
<form action='/charge' method='POST'>
  <label>Amount (cents): <input name='amount' value='1020'></label><br><br>
  <label>Currency: <input name='currency' value='USD'></label><br><br>
  <label>Card: <input name='card_number' value='4067429974719265'></label><br><br>
  <label>Exp: <input name='card_exp_month' value='12' size='4'> / <input name='card_exp_year' value='2030' size='6'></label>
  <label> CVV: <input name='card_cvv' value='123' size='4'></label><br><br>
  <label>Holder: <input name='card_holder' value='John Doe'></label><br><br>
  <label>Email: <input name='customer_email' value='john@example.com'></label><br><br>
  <label>Account ID: <input name='customer_account_id' value='customer-123'></label><br><br>
  <button type='submit'>Charge</button>
</form>
<h2>Check Status</h2>
<form action='/status' method='POST'><label>Order ID: <input name='order_id'></label>
<button type='submit'>Check</button></form>
<h2>Refund</h2>
<form action='/refund' method='POST'><label>Order ID: <input name='order_id'></label>
<label>Amount: <input name='amount' required></label><button type='submit'>Refund</button></form>
", "text/html"));

app.MapPost("/charge", async (HttpContext ctx) =>
{
    var form = await ctx.Request.ReadFormAsync();
    var amount = int.TryParse(form["amount"], out var a) ? a : 0;
    if (amount <= 0) return Results.Json(new { error = "amount must be > 0" }, statusCode: 400);

    var orderId = "order-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    var json = JsonSerializer.Serialize(new
    {
        amount,
        currency = form["currency"].FirstOrDefault() ?? "USD",
        card_number = form["card_number"].FirstOrDefault(),
        card_exp_month = form["card_exp_month"].FirstOrDefault(),
        card_exp_year = form["card_exp_year"].FirstOrDefault(),
        card_cvv = form["card_cvv"].FirstOrDefault(),
        card_holder = form["card_holder"].FirstOrDefault() ?? "",
        order_id = orderId,
        order_description = "Test charge",
        customer_email = form["customer_email"].FirstOrDefault() ?? "test@example.com",
        customer_account_id = form["customer_account_id"].FirstOrDefault() ?? "",
        ip_address = ctx.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
        platform = "WEB"
    });

    var resp = await SolidgateRequest("/api/v1/charge", json);
    return Results.Content(resp, "application/json");
});

app.MapPost("/status", async (HttpContext ctx) =>
{
    var form = await ctx.Request.ReadFormAsync();
    var orderId = form["order_id"].FirstOrDefault() ?? "";
    if (string.IsNullOrEmpty(orderId)) return Results.Json(new { error = "order_id required" }, statusCode: 400);

    var json = JsonSerializer.Serialize(new { order_id = orderId });
    var resp = await SolidgateRequest("/api/v1/status", json);
    return Results.Content(resp, "application/json");
});

app.MapPost("/refund", async (HttpContext ctx) =>
{
    var form = await ctx.Request.ReadFormAsync();
    var orderId = form["order_id"].FirstOrDefault() ?? "";
    if (string.IsNullOrEmpty(orderId)) return Results.Json(new { error = "order_id required" }, statusCode: 400);

    var amountStr = form["amount"].FirstOrDefault() ?? "";
    if (string.IsNullOrEmpty(amountStr) || !int.TryParse(amountStr, out var refundAmount) || refundAmount <= 0)
        return Results.Json(new { error = "amount is required and must be > 0" }, statusCode: 400);

    var json = JsonSerializer.Serialize(new { order_id = orderId, amount = refundAmount });

    var resp = await SolidgateRequest("/api/v1/refund", json);
    return Results.Content(resp, "application/json");
});

app.MapPost("/webhook", async (HttpContext ctx) =>
{
    using var reader = new StreamReader(ctx.Request.Body);
    var rawBody = await reader.ReadToEndAsync();
    var signature = ctx.Request.Headers["signature"].FirstOrDefault() ?? "";

    if (string.IsNullOrEmpty(signature)) return Results.Text("Missing signature", statusCode: 400);
    if (!VerifyWebhookSignature(rawBody, signature)) return Results.Text("Invalid signature", statusCode: 400);

    var eventType = ctx.Request.Headers["solidgate-event-type"].FirstOrDefault() ?? "";
    Console.WriteLine($"[DEBUG] Webhook [{eventType}]: {rawBody}");

    return Results.Text("OK");
});

Console.WriteLine("Server running on http://localhost:3000");
app.Run();
