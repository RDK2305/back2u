#!/usr/bin/env node

/**
 * Team Configuration Utility
 * Provides programmatic access to team member data
 * Usage: node utils/team-config-util.js [command] [memberId]
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../team-config.json');

class TeamConfigUtil {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading team config:', error.message);
      process.exit(1);
    }
  }

  getMemberById(id) {
    return this.config.teamMembers.find(m => m.id === id);
  }

  getMemberByKey(key) {
    return this.config.teamMembers.find(m => m.key === key);
  }

  getAllMembers() {
    return this.config.teamMembers;
  }

  getMembersForBranch(branch) {
    return this.config.teamMembers.filter(m => m.branch === branch);
  }

  getGitConfig(memberId) {
    const member = this.getMemberById(memberId);
    if (member) {
      return {
        name: member.gitConfig['user.name'],
        email: member.gitConfig['user.email']
      };
    }
    return null;
  }

  displayMember(member) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`ID:          ${member.id}`);
    console.log(`Name:        ${member.fullName}`);
    console.log(`Email:       ${member.email}`);
    console.log(`Role:        ${member.role}`);
    console.log(`Branch:      ${member.branch}`);
    console.log(`Responsibilities:`);
    member.responsibilities.forEach(r => console.log(`  • ${r}`));
    console.log(`${'═'.repeat(50)}\n`);
  }

  displayAllMembers() {
    console.log('\n' + '═'.repeat(50));
    console.log('BACK2U TEAM MEMBERS');
    console.log('═'.repeat(50));
    this.config.teamMembers.forEach(member => {
      console.log(`\n[${member.id}] ${member.fullName}`);
      console.log(`    Email: ${member.email}`);
      console.log(`    Role:  ${member.role}`);
      console.log(`    Branch: ${member.branch}`);
    });
    console.log('\n' + '═'.repeat(50) + '\n');
  }
}

// Command Line Interface
function main() {
  const util = new TeamConfigUtil();
  const args = process.argv.slice(2);
  const command = args[0];
  const param = args[1];

  switch (command) {
    case 'list':
      util.displayAllMembers();
      break;

    case 'info':
      if (!param) {
        console.error('Please provide member ID or key');
        process.exit(1);
      }
      const member = util.getMemberById(param) || util.getMemberByKey(param);
      if (member) {
        util.displayMember(member);
      } else {
        console.error(`Member not found: ${param}`);
        process.exit(1);
      }
      break;

    case 'git-config':
      if (!param) {
        console.error('Please provide member ID or key');
        process.exit(1);
      }
      const m = util.getMemberById(param) || util.getMemberByKey(param);
      if (m) {
        console.log(`\nGit Configuration for ${m.fullName}:`);
        console.log(`  user.name  = ${m.gitConfig['user.name']}`);
        console.log(`  user.email = ${m.gitConfig['user.email']}\n`);
      } else {
        console.error(`Member not found: ${param}`);
        process.exit(1);
      }
      break;

    case 'branches':
      console.log('\n' + '═'.repeat(50));
      console.log('PROJECT BRANCHES');
      console.log('═'.repeat(50));
      Object.entries(util.config.branches).forEach(([branch, info]) => {
        console.log(`\n${branch}`);
        console.log(`  Maintainer: ${info.maintainer}`);
        console.log(`  Purpose:    ${info.purpose}`);
      });
      console.log('\n' + '═'.repeat(50) + '\n');
      break;

    case 'help':
    default:
      console.log(`
Back2u Team Configuration Utility

Usage: node utils/team-config-util.js [command] [parameter]

Commands:
  list              - List all team members
  info <id|key>     - Show detailed info for a team member
  git-config <id>   - Show git configuration for a team member
  branches          - Show all project branches
  help              - Show this help message

Examples:
  node utils/team-config-util.js list
  node utils/team-config-util.js info 001
  node utils/team-config-util.js info gurjant
  node utils/team-config-util.js git-config 002
  node utils/team-config-util.js branches
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = TeamConfigUtil;
