# Download and build 개역개정 4판 Bible JSON dataset (66 books, 1,189 chapters)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$brainDir = "C:\Users\1518i\.gemini\antigravity-ide\brain\7f602d16-caab-4946-8e35-3e893b7dbde3\scratch"
$converterScript = Join-Path $brainDir "convert_bible_to_nkrve.ps1"

if (Test-Path $converterScript) {
    & powershell -ExecutionPolicy Bypass -File $converterScript
} else {
    Write-Host "Bible dataset (개역개정 4판) already in data\bible\."
}
