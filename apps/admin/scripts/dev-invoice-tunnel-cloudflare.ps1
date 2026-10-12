# Cloudflare quick tunnel — no ngrok account required.
# Requires cloudflared: winget install Cloudflare.cloudflared
#
# Usage: pnpm dev:tunnel:cloudflare
# Copy the https://….trycloudflare.com URL into ADMIN_PUBLIC_URL in .env

$ErrorActionPreference = "Stop"
$port = 3001

function Find-CloudflaredExe {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $path = "$env:ProgramFiles\Cloudflare\Cloudflare WARP\cloudflared.exe"
  if (Test-Path $path) { return $path }
  return $null
}

$cloudflared = Find-CloudflaredExe
if (-not $cloudflared) {
  Write-Host "cloudflared not found."
  Write-Host "Install: winget install Cloudflare.cloudflared"
  Write-Host "Open a NEW terminal, then run: pnpm dev:tunnel:cloudflare"
  exit 1
}

Write-Host "Starting Cloudflare tunnel to http://localhost:$port ..."
Write-Host "Waiting for public URL (copy the https://….trycloudflare.com line below):"
Write-Host ""

& $cloudflared tunnel --url "http://localhost:$port"
