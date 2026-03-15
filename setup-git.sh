#!/bin/bash
# Git Configuration Setup Script for CampusFind Project
# Each team member should run this script with their credentials

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CampusFind Git Configuration Setup ===${NC}\n"

# Team members
declare -A TEAM_MEMBERS
TEAM_MEMBERS[1]="Rudraksh Kharadi|rudrakshkharadi53@gmail.com|RDK2305"
TEAM_MEMBERS[2]="Bishal Paudel|bishalsharma24112002@gmail.com|paudel3101"
TEAM_MEMBERS[3]="Gagan Singh|gs9814870091@gmail.com|Gagan-sran"
TEAM_MEMBERS[4]="Gurjant Singh|gssandhu911@gmail.com|gurjant575"

echo "Select your profile:"
echo "1) Rudraksh Kharadi (rudrakshkharadi53@gmail.com)"
echo "2) Bishal Paudel (bishalsharma24112002@gmail.com)"
echo "3) Gagan Singh (gs9814870091@gmail.com)"
echo "4) Gurjant Singh (gssandhu911@gmail.com)"
echo ""
read -p "Enter your choice (1-4): " choice

if [[ ! ${TEAM_MEMBERS[$choice]} ]]; then
    echo -e "${RED}Invalid choice!${NC}"
    exit 1
fi

IFS='|' read -r NAME EMAIL GITHUB <<< "${TEAM_MEMBERS[$choice]}"

echo -e "\n${BLUE}Configuring git for: $NAME${NC}"

# Configure local git
git config user.name "$NAME"
git config user.email "$EMAIL"

# Add custom push configuration
git config push.default current

echo -e "${GREEN}✓ Git user.name set to: $NAME${NC}"
echo -e "${GREEN}✓ Git user.email set to: $EMAIL${NC}"
echo -e "${GREEN}✓ GitHub username: $GITHUB${NC}"
echo -e "${GREEN}✓ Push configuration: current branch${NC}"

# Verify configuration
echo -e "\n${BLUE}Current Git Configuration:${NC}"
git config --local user.name
git config --local user.email

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "\nYou can now:"
echo "- Make commits which will be attributed to $NAME"
echo "- Push code using: git push"
echo "- View all commits: git log --pretty=format:'%an | %s'"
