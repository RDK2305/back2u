# Multi-Account Git Setup Script
# Run this script to configure your Git account before pushing

param(
    [string]$AccountType = "",
    [string]$UserName = "",
    [string]$UserEmail = ""
)

function Set-GurjantAccount {
    Write-Host "Setting up Gurjant Singh account for Backend..." -ForegroundColor Green
    git config user.name "Gurjant Singh"
    git config user.email "gurjant@email.com"
    Write-Host "✓ Git configured for Gurjant Singh" -ForegroundColor Green
    Write-Host "Branch: backend/gurjant" -ForegroundColor Cyan
    git config --local user.name
}

function Set-BishalAccount {
    Write-Host "Setting up Bishal account for Database & Documentation..." -ForegroundColor Green
    git config user.name "Bishal"
    git config user.email "bishal@email.com"
    Write-Host "✓ Git configured for Bishal" -ForegroundColor Green
    Write-Host "Branch: database/bishal" -ForegroundColor Cyan
    git config --local user.name
}

function Set-RudrakshAccount {
    Write-Host "Setting up Rudraksh account for Full Stack..." -ForegroundColor Green
    git config user.name "Rudraksh"
    git config user.email "rudraksh@email.com"
    Write-Host "✓ Git configured for Rudraksh" -ForegroundColor Green
    Write-Host "Branch: main" -ForegroundColor Cyan
    git config --local user.name
}

function Show-Menu {
    Write-Host "`n=== Git Account Setup ===" -ForegroundColor Cyan
    Write-Host "`nSelect your account:" -ForegroundColor Yellow
    Write-Host "1. Gurjant Singh (Backend)"
    Write-Host "2. Bishal (Database & Documentation)"
    Write-Host "3. Rudraksh (Full Stack)"
    Write-Host "`nEnter choice (1-3): " -NoNewline
}

if ($AccountType -eq "gurjant" -or $AccountType -eq "1") {
    Set-GurjantAccount
} elseif ($AccountType -eq "bishal" -or $AccountType -eq "2") {
    Set-BishalAccount
} elseif ($AccountType -eq "rudraksh" -or $AccountType -eq "3") {
    Set-RudrakshAccount
} else {
    Show-Menu
    $choice = Read-Host
    
    switch ($choice) {
        "1" { Set-GurjantAccount }
        "2" { Set-BishalAccount }
        "3" { Set-RudrakshAccount }
        default { Write-Host "Invalid selection" -ForegroundColor Red }
    }
}

Write-Host "`n✓ Account setup complete!" -ForegroundColor Green
Write-Host "You can now commit and push your code." -ForegroundColor Green
