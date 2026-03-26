/**
 * Input validation and sanitization helpers.
 * Used across route handlers to validate user-supplied data.
 */

/**
 * Strip HTML/script tags and trim whitespace to prevent XSS.
 */
function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
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
