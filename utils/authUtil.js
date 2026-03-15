/**
 * Enhanced Authentication Features
 * - Forgot Password / Password Reset
 * - Professor Role Support
 * - Role-Specific ID Prefixes (prof-, stud-, sec-)
 */

const crypto = require('crypto');

/**
 * Generate role-specific ID with prefix
 * Format: role-XXXXXX (prof-001234, stud-001234, sec-001234)
 * @param {string} role - User role (student, professor, security)
 * @returns {string} - Formatted ID with role prefix
 */
function generateRoleSpecificId(role) {
  const rolePrefix = {
    'student': 'stud',
    'professor': 'prof',
    'security': 'sec'
  }[role] || 'usr';

  // Generate random 6-digit number
  const randomNum = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `${rolePrefix}-${randomNum}`;
}

/**
 * Generate password reset token (good for 1 hour)
 * @returns {object} - {token, hash, expiresAt}
 */
function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  return {
    token,
    hashedToken,
    expiresAt
  };
}

/**
 * Validate if the ID prefix matches the role
 * @param {string} id - ID to validate (prof-123456, stud-123456, etc.)
 * @param {string} role - Role to check against
 * @returns {boolean}
 */
function isValidRoleIdPair(id, role) {
  const rolePrefix = {
    'student': 'stud',
    'professor': 'prof',
    'security': 'sec'
  }[role];

  if (!rolePrefix) return false;
  return id.startsWith(`${rolePrefix}-`);
}

/**
 * Extract role from ID format
 * @param {string} id - ID string (prof-123456, stud-123456, sec-123456)
 * @returns {string|null} - Extracted role or null if invalid
 */
function extractRoleFromId(id) {
  const prefixToRole = {
    'prof': 'professor',
    'stud': 'student',
    'sec': 'security'
  };

  const prefix = id.split('-')[0];
  return prefixToRole[prefix] || null;
}

module.exports = {
  generateRoleSpecificId,
  generatePasswordResetToken,
  isValidRoleIdPair,
  extractRoleFromId
};
