# Test Flask Server Locally
Write-Host "Testing Flask Server Locally" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

# Test Flask server on localhost (if running locally)
$localFlaskUrl = "http://localhost:5000"

Write-Host "1. Testing Flask Health Check (Local)..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$localFlaskUrl/api/health" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "SUCCESS - Local Flask Server: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
}
catch {
    Write-Host "FAILED - Local Flask Server not running" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test VPS servers
Write-Host "2. Testing VPS Flask Server..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://143.244.133.125:5000/api/health" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "SUCCESS - VPS Flask Server: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
}
catch {
    Write-Host "FAILED - VPS Flask Server not responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "3. Testing VPS FastAPI Server..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://143.244.133.125:8000/health" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "SUCCESS - VPS FastAPI Server: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
}
catch {
    Write-Host "FAILED - VPS FastAPI Server not responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start Flask server locally: 'cd BUAS && python server.py'"
Write-Host "2. Upload files to VPS and run: 'bash start-vps-complete.sh'"
Write-Host "3. Re-run this test to verify both servers are working"
