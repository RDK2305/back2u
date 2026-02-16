#!/bin/bash

# Team Member Configuration
# Maps team member IDs to their Git credentials

# Team Member Database
declare -A TEAM_MEMBERS=(
    ["gurjant:id"]="001"
    ["gurjant:name"]="Gurjant Singh"
    ["gurjant:email"]="gssandhu911@gmail.com"
    ["gurjant:role"]="Backend Developer"
    ["gurjant:branch"]="backend/gurjant"
    
    ["bishal:id"]="002"
    ["bishal:name"]="Bishal"
    ["bishal:email"]="bishalsharma24112002@gmail.com"
    ["bishal:role"]="Database Administrator"
    ["bishal:branch"]="database/bishal"
    
    ["rudraksh:id"]="003"
    ["rudraksh:name"]="Rudraksh"
    ["rudraksh:email"]="rudrakshkharadi53@gmail.com"
    ["rudraksh:role"]="Full Stack Coordinator"
    ["rudraksh:branch"]="main"
)

MEMBERS=("gurjant" "bishal" "rudraksh")

show_team_info() {
    local member=$1
    local id="${TEAM_MEMBERS[$member:id]}"
    local name="${TEAM_MEMBERS[$member:name]}"
    local email="${TEAM_MEMBERS[$member:email]}"
    local role="${TEAM_MEMBERS[$member:role]}"
    local branch="${TEAM_MEMBERS[$member:branch]}"
    
    echo -e "\n\033[36m╔════════════════════════════════════════════════╗\033[0m"
    echo -e "\033[36m║          GIT USER CONFIGURATION SETUP          ║\033[0m"
    echo -e "\033[36m╚════════════════════════════════════════════════╝\033[0m"
    echo -e "\nTeam Member ID: \033[33m$id\033[0m"
    echo -e "Name: \033[32m$name\033[0m"
    echo -e "Email: \033[32m$email\033[0m"
    echo -e "Role: \033[36m$role\033[0m"
    echo -e "Branch: \033[35m$branch\033[0m"
}

set_git_user() {
    local member=$1
    local name="${TEAM_MEMBERS[$member:name]}"
    local email="${TEAM_MEMBERS[$member:email]}"
    local branch="${TEAM_MEMBERS[$member:branch]}"
    
    echo -e "\nConfiguring Git for \033[32m$name\033[0m..."
    
    git config user.name "$name"
    git config user.email "$email"
    
    echo -e "\033[32m✓ Git user configured successfully!\033[0m"
    echo -e "\nNext steps: \033[33m"
    echo "  1. Checkout branch: git checkout -b $branch"
    echo "  2. Make your changes"
    echo "  3. Commit: git add . && git commit -m 'Your message'"
    echo -e "  4. Push: git push origin $branch --set-upstream\033[0m"
}

show_menu() {
    echo -e "\n\033[36m╔════════════════════════════════════════════════╗\033[0m"
    echo -e "\033[36m║      BACK2U TEAM MEMBER SELECTION MENU         ║\033[0m"
    echo -e "\033[36m╚════════════════════════════════════════════════╝\033[0m"
    
    local index=1
    for member in "${MEMBERS[@]}"; do
        local id="${TEAM_MEMBERS[$member:id]}"
        local name="${TEAM_MEMBERS[$member:name]}"
        local role="${TEAM_MEMBERS[$member:role]}"
        local branch="${TEAM_MEMBERS[$member:branch]}"
        
        echo -e "\n\033[33m$index. $name\033[0m"
        echo -e "   ID: $id | Role: $role"
        echo -e "   Branch: $branch"
        
        ((index++))
    done
    
    echo ""
}

# Main Logic
if [[ $# -gt 0 ]]; then
    member=$1
    if [[ " ${MEMBERS[@]} " =~ " $member " ]]; then
        show_team_info "$member"
        set_git_user "$member"
    else
        echo -e "\033[31mInvalid member ID!\033[0m"
        echo "Valid IDs: ${MEMBERS[@]}"
        exit 1
    fi
else
    show_menu
    read -p "Select team member (1-3): " choice
    
    if [[ $choice -ge 1 && $choice -le ${#MEMBERS[@]} ]]; then
        member="${MEMBERS[$((choice-1))]}"
        show_team_info "$member"
        set_git_user "$member"
    else
        echo -e "\033[31mInvalid selection!\033[0m"
        exit 1
    fi
fi

# Display current git config
echo -e "\n\033[32m✓ Current Git Configuration:\033[0m"
echo -e "  User: \033[90m$(git config user.name)\033[0m"
echo -e "  Email: \033[90m$(git config user.email)\033[0m"
