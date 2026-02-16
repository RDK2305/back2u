#!/bin/bash

# Multi-Account Git Setup Script
# Usage: ./setup-account.sh [gurjant|bishal|rudraksh]

set_gurjant() {
    echo -e "\033[32mSetting up Gurjant Singh account for Backend...\033[0m"
    git config user.name "Gurjant Singh"
    git config user.email "gurjant@email.com"
    echo -e "\033[32m✓ Git configured for Gurjant Singh\033[0m"
    echo -e "\033[36mBranch: backend/gurjant\033[0m"
    git config --local user.name
}

set_bishal() {
    echo -e "\033[32mSetting up Bishal account for Database & Documentation...\033[0m"
    git config user.name "Bishal"
    git config user.email "bishal@email.com"
    echo -e "\033[32m✓ Git configured for Bishal\033[0m"
    echo -e "\033[36mBranch: database/bishal\033[0m"
    git config --local user.name
}

set_rudraksh() {
    echo -e "\033[32mSetting up Rudraksh account for Full Stack...\033[0m"
    git config user.name "Rudraksh"
    git config user.email "rudraksh@email.com"
    echo -e "\033[32m✓ Git configured for Rudraksh\033[0m"
    echo -e "\033[36mBranch: main\033[0m"
    git config --local user.name
}

show_menu() {
    echo ""
    echo -e "\033[36m=== Git Account Setup ===\033[0m"
    echo -e "\033[33m\nSelect your account:\033[0m"
    echo "1. Gurjant Singh (Backend)"
    echo "2. Bishal (Database & Documentation)"
    echo "3. Rudraksh (Full Stack)"
    echo -e "\033[33mEnter choice (1-3): \033[0m"
}

case "$1" in
    "gurjant"|"1")
        set_gurjant
        ;;
    "bishal"|"2")
        set_bishal
        ;;
    "rudraksh"|"3")
        set_rudraksh
        ;;
    *)
        show_menu
        read -r choice
        case $choice in
            1) set_gurjant ;;
            2) set_bishal ;;
            3) set_rudraksh ;;
            *) echo -e "\033[31mInvalid selection\033[0m" ;;
        esac
        ;;
esac

echo ""
echo -e "\033[32m✓ Account setup complete!\033[0m"
echo -e "\033[32mYou can now commit and push your code.\033[0m"
