/**
 * Input validation and sanitization helpers.
 * Used across route handlers to validate user-supplied data.
 */

/**
 * Strip control characters and enforce safe text input to reduce injection risk.
 * Note: SQL injection is prevented by parameterized queries (pool.execute with ?).
 * React automatically escapes rendered output, providing frontend XSS protection.
 */
function sanitize(value) {
  if (typeof value !== 'string') return value;
  // Remove null bytes and control characters; trim whitespace
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Validate an email address format.
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

/**
 * Validate an Indian mobile number (10 digits, starts with 6-9).
 */
function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(String(phone));
}

/**
 * Check that all required fields are present and non-empty.
 * Returns an error string, or null if valid.
 */
function requireFields(fields, body) {
  const missing = fields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
  return missing.length ? `Missing required fields: ${missing.join(', ')}` : null;
}

/**
 * Validate a positive number.
 */
function validatePositiveNumber(value) {
  const n = Number(value);
  return !Number.isNaN(n) && n > 0;
}

module.exports = { sanitize, validateEmail, validatePhone, requireFields, validatePositiveNumber };
