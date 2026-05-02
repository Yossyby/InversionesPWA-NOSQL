#!/usr/bin/env pwsh
[CmdletBinding()]
param(
  [string]$RootPath = ".",
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path -LiteralPath $RootPath

$requiredDirectories = @(
  "frontend",
  "backend",
  "specs"
)

$recommendedDirectories = @(
  "tests"
)

$missingRequired = @()
$missingRecommended = @()

foreach ($dir in $requiredDirectories) {
  $full = Join-Path $root.Path $dir
  if (-not (Test-Path -LiteralPath $full -PathType Container)) {
    $missingRequired += $dir
  }
}

foreach ($dir in $recommendedDirectories) {
  $full = Join-Path $root.Path $dir
  if (-not (Test-Path -LiteralPath $full -PathType Container)) {
    $missingRecommended += $dir
  }
}

Write-Host "Structural gate report"
Write-Host "- Root: $($root.Path)"
Write-Host "- Required dirs checked: $($requiredDirectories -join ', ')"
Write-Host "- Recommended dirs checked: $($recommendedDirectories -join ', ')"

if ($missingRequired.Count -gt 0) {
  Write-Host "[FAIL] Missing required directories: $($missingRequired -join ', ')" -ForegroundColor Red
  exit 1
}

if ($missingRecommended.Count -gt 0) {
  Write-Host "[WARN] Missing recommended directories: $($missingRecommended -join ', ')" -ForegroundColor Yellow
  if ($Strict) {
    Write-Host "[FAIL] Strict mode enabled." -ForegroundColor Red
    exit 1
  }
}

Write-Host "[PASS] Structure gate satisfied for required directories." -ForegroundColor Green
exit 0
