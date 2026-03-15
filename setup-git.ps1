# Git Configuration Setup Script for CampusFind Project (Windows PowerShell)
# Each team member should run this script with their credentials

$teamMembers = @{
    "1" = @{
        "name" = "Rudraksh Kharadi"
        "email" = "rudrakshkharadi53@gmail.com"
        "github" = "RDK2305"
    }
    "2" = @{
        "name" = "Bishal Paudel"
        "email" = "bishalsharma24112002@gmail.com"
        "github" = "paudel3101"
    }
    "3" = @{
        "name" = "Gagan Singh"
        "email" = "gs9814870091@gmail.com"
        "github" = "Gagan-sran"
    }
    "4" = @{
        "name" = "Gurjant Singh"
        "email" = "gssandhu911@gmail.com"
        "github" = "gurjant575"
    }
}

Write-Host "========== CampusFind Git Configuration Setup ==========" -ForegroundColor Cyan
Write-Host ""

Write-Host "Select your profile:" -ForegroundColor Cyan
Write-Host "1) Rudraksh Kharadi (rudrakshkharadi53@gmail.com)"
Write-Host "2) Bishal Paudel (bishalsharma24112002@gmail.com)"
Write-Host "3) Gagan Singh (gs9814870091@gmail.com)"
Write-Host "4) Gurjant Singh (gssandhu911@gmail.com)"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

if (-not $teamMembers.ContainsKey($choice)) {
    Write-Host "Invalid choice!" -ForegroundColor Red
    exit 1
}

$member = $teamMembers[$choice]
$name = $member["name"]
$email = $member["email"]
$github = $member["github"]

Write-Host ""
Write-Host "Configuring git for: $name" -ForegroundColor Cyan

# Configure local git
git config user.name "$name"
git config user.email "$email"
git config push.default current

Write-Host "✓ Git user.name set to: $name" -ForegroundColor Green
Write-Host "✓ Git user.email set to: $email" -ForegroundColor Green
Write-Host "✓ GitHub username: $github" -ForegroundColor Green
Write-Host "✓ Push configuration: current branch" -ForegroundColor Green

# Verify configuration
Write-Host ""
Write-Host "Current Git Configuration:" -ForegroundColor Cyan
git config --local user.name
git config --local user.email

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now:"
Write-Host "- Make commits which will be attributed to $name"
Write-Host "- Push code using: git push"
Write-Host "- View all commits: git log --pretty=format:'%an | %s'"
