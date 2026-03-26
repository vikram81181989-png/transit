/**
 * Simple in-memory rate limiter.
 * Tracks request counts per IP address within a sliding window.
 */

const store = new Map();

// Periodically clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.reset) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * @param {object} options
 * @param {number} options.windowMs   - Time window in milliseconds (default: 15 min)
 * @param {number} options.max        - Max requests per window (default: 100)
 * @param {string} options.message    - Error message (default: 'Too many requests')
 */
function rateLimit({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.reset) {
      entry = { count: 0, reset: now + windowMs };
    }
    entry.count += 1;
    store.set(key, entry);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.reset / 1000));

    if (entry.count > max) {
      return res.status(429).json({ success: false, message });
    }
    next();
  };
}

module.exports = rateLimit;
