# Expose local admin (port 3001) over HTTPS for AiSensy invoice PDF tests.
#
# Requires ngrok CLI (not npm): winget install ngrok.ngrok
# One-time: free authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
#   ngrok config add-authtoken YOUR_TOKEN
# Or set NGROK_AUTHTOKEN in apps/admin/.env
#
# Usage:
#   Terminal A: pnpm dev
#   Terminal B: pnpm dev:tunnel   (from crux-monorepo root or apps/admin)
#   Copy ADMIN_PUBLIC_URL into .env, restart dev, test invoice WhatsApp.

$ErrorActionPreference = "Stop"
$port = 3001

function Get-EnvTrimmed([string]$name) {
  $v = [Environment]::GetEnvironmentVariable($name)
  if ($null -eq $v) { return "" }
  return $v.Trim()
}

function Find-NgrokExe {
  $cmd = Get-Command ngrok -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $candidates = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links\ngrok.exe",
    "$env:ProgramFiles\ngrok\ngrok.exe",
    "$env:LOCALAPPDATA\Programs\ngrok\ngrok.exe"
  )
  foreach ($path in $candidates) {
    if (Test-Path $path) { return $path }
  }
  return $null
}

function Test-NgrokAuthtokenConfigured {
  if ((Get-EnvTrimmed "NGROK_AUTHTOKEN").Length -gt 0) { return $true }

  $configPaths = @(
    (Join-Path $env:LOCALAPPDATA "ngrok\ngrok.yml"),
    (Join-Path $env:USERPROFILE ".ngrok2\ngrok.yml")
  )
  foreach ($configPath in $configPaths) {
    if ((Test-Path $configPath) -and (Select-String -Path $configPath -Pattern "authtoken\s*:" -Quiet)) {
      return $true
    }
  }
  return $false
}

$ngrok = Find-NgrokExe
if (-not $ngrok) {
  Write-Host "ngrok CLI not found in PATH."
  Write-Host "Install: winget install ngrok.ngrok"
  Write-Host "Then open a NEW terminal (PATH refresh) and run: pnpm dev:tunnel"
  Write-Host ""
  Write-Host "No ngrok? Use Cloudflare instead: pnpm dev:tunnel:cloudflare"
  exit 1
}

if (-not (Test-NgrokAuthtokenConfigured)) {
  Write-Host "Ngrok needs a free authtoken (this is NOT an npm/pnpm package)."
  Write-Host ""
  Write-Host "1. Sign up:  https://dashboard.ngrok.com/signup"
  Write-Host "2. Copy token: https://dashboard.ngrok.com/get-started/your-authtoken"
  Write-Host "3. Run once in any terminal:"
  Write-Host "     ngrok config add-authtoken YOUR_TOKEN"
  Write-Host "   Or add to apps/admin/.env:"
  Write-Host "     NGROK_AUTHTOKEN=YOUR_TOKEN"
  Write-Host ""
  Write-Host "Then run pnpm dev:tunnel again."
  exit 1
}

Write-Host "Starting ngrok on http://localhost:$port ..."
$ngrokArgs = @("http", "$port")
$authtoken = Get-EnvTrimmed "NGROK_AUTHTOKEN"
if ($authtoken.Length -gt 0) {
  $ngrokArgs += @("--authtoken", $authtoken)
}
Start-Process -FilePath $ngrok -ArgumentList $ngrokArgs | Out-Null

$publicUrl = $null
$lastError = $null
for ($attempt = 1; $attempt -le 20; $attempt++) {
  Start-Sleep -Seconds 2
  try {
    $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 3
    $https = $tunnels.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
    if ($null -ne $https -and $https.public_url) {
      $publicUrl = $https.public_url.TrimEnd("/")
      break
    }
  } catch {
    $lastError = $_.Exception.Message
  }
}

if (-not $publicUrl) {
  Write-Host ""
  Write-Host "Ngrok is running but no HTTPS tunnel appeared yet."
  if ($lastError) { Write-Host "API error: $lastError" }
  Write-Host ""
  Write-Host "Check the ngrok window for errors (often missing/invalid authtoken)."
  Write-Host "Dashboard: http://127.0.0.1:4040"
  Write-Host ""
  Write-Host "Or use Cloudflare (no account): pnpm dev:tunnel:cloudflare"
  exit 1
}

Write-Host ""
Write-Host "Add to apps/admin/.env (then restart pnpm dev):"
Write-Host ""
Write-Host "  ADMIN_PUBLIC_URL=$publicUrl"
Write-Host ""
Write-Host "Test PDF proxy after composing an invoice:"
Write-Host "  $publicUrl/api/invoices/view/<token>"
Write-Host ""
Write-Host "Ngrok dashboard: http://127.0.0.1:4040"
