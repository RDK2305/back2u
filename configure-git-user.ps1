# Team Member Configuration
# Maps team member IDs to their Git credentials

param(
    [string]$MemberId = ""
)

# Team Member Database
$teamMembers = @{
    "gurjant" = @{
        "id" = "001"
        "name" = "Gurjant Singh"
        "email" = "gssandhu911@gmail.com"
        "role" = "Backend Developer"
        "branch" = "backend/gurjant"
    }
    "bishal" = @{
        "id" = "002"
        "name" = "Bishal"
        "email" = "bishalsharma24112002@gmail.com"
        "role" = "Database Administrator"
        "branch" = "database/bishal"
    }
    "rudraksh" = @{
        "id" = "003"
        "name" = "Rudraksh"
        "email" = "rudrakshkharadi53@gmail.com"
        "role" = "Full Stack Coordinator"
        "branch" = "main"
    }
}

function Show-TeamInfo {
    param([object]$member)
    Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║          GIT USER CONFIGURATION SETUP          ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host "`nTeam Member ID: $($member.id)" -ForegroundColor Yellow
    Write-Host "Name: $($member.name)" -ForegroundColor Green
    Write-Host "Email: $($member.email)" -ForegroundColor Green
    Write-Host "Role: $($member.role)" -ForegroundColor Cyan
    Write-Host "Branch: $($member.branch)" -ForegroundColor Magenta
}

function Set-GitUser {
    param([object]$member)
    
    Write-Host "`nConfiguring Git for $($member.name)..." -ForegroundColor Green
    
    git config user.name $member.name
    git config user.email $member.email
    
    Write-Host "✓ Git user configured successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "  1. Checkout branch: git checkout -b $($member.branch)"
    Write-Host "  2. Make your changes"
    Write-Host "  3. Commit: git add . && git commit -m 'Your message'"
    Write-Host "  4. Push: git push origin $($member.branch) --set-upstream"
}

function Show-Menu {
    Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║      BACK2U TEAM MEMBER SELECTION MENU         ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    $index = 1
    foreach ($key in $teamMembers.Keys) {
        $member = $teamMembers[$key]
        Write-Host "`n$index. $($member.name)" -ForegroundColor Yellow
        Write-Host "   ID: $($member.id) | Role: $($member.role)" -ForegroundColor Gray
        Write-Host "   Branch: $($member.branch)" -ForegroundColor Gray
        $index++
    }
    
    Write-Host "`n" -NoNewline
}

# Main Logic
if ($MemberId -and $teamMembers.ContainsKey($MemberId)) {
    $member = $teamMembers[$MemberId]
    Show-TeamInfo $member
    Set-GitUser $member
} else {
    Show-Menu
    Write-Host "Select team member (1-3): " -ForegroundColor Yellow -NoNewline
    $choice = Read-Host
    
    $memberArray = @("gurjant", "bishal", "rudraksh")
    if ($choice -ge 1 -and $choice -le $memberArray.Count) {
        $member = $teamMembers[$memberArray[$choice - 1]]
        Show-TeamInfo $member
        Set-GitUser $member
    } else {
        Write-Host "Invalid selection!" -ForegroundColor Red
    }
}

# Display current git config
Write-Host "`n✓ Current Git Configuration:" -ForegroundColor Green
Write-Host "  User: $(git config user.name)" -ForegroundColor Gray
Write-Host "  Email: $(git config user.email)" -ForegroundColor Gray
