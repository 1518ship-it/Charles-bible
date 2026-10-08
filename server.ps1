# Simple Lightweight PowerShell HTTP Server for Charles' Bible
param(
  [int]$Port = 8085
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
  Write-Host "Server running at $prefix"
} catch {
  Write-Error $_.Exception.Message
  exit 1
}

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$mimeMap = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $response.AddHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
    $response.AddHeader("Access-Control-Allow-Headers", "*")

    if ($request.HttpMethod -eq "OPTIONS") {
      $response.StatusCode = 204
      $response.Close()
      continue
    }

    $rawPath = $request.Url.LocalPath
    if ($rawPath -eq "/" -or [string]::IsNullOrWhiteSpace($rawPath)) {
      $rawPath = "/index.html"
    }

    $filePath = Join-Path $root ($rawPath.TrimStart('/').Replace('/', '\'))

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $contentType = $mimeMap[$ext]
      if (-not $contentType) { $contentType = "application/octet-stream" }

      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentType = $contentType
      $response.ContentLength64 = $bytes.Length
      $response.StatusCode = 200
      if ($request.HttpMethod -ne "HEAD") {
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } else {
      $response.StatusCode = 404
      $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $response.ContentType = "text/plain; charset=utf-8"
      $response.ContentLength64 = $errBytes.Length
      if ($request.HttpMethod -ne "HEAD") {
        $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
      }
    }
  } catch {
    # Ignore broken pipes or client disconnects
    $null = $_
  } finally {
    if ($response) {
      try { $response.Close() } catch { $null = $_ }
    }
  }
}
