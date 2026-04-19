// Simple in-memory rate limiter for demonstration
// In production, use Redis or a dedicated rate limiting middleware
const rateLimitStore = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // Max 10 requests per minute per IP

  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up old entries
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const validTimestamps = timestamps.filter(time => time > windowStart);
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validTimestamps);
    }
  }

  // Get or create entry for this IP
  const requestTimestamps = rateLimitStore.get(ip) || [];
  const recentRequests = requestTimestamps.filter(time => time > windowStart);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  }

  // Add current timestamp
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);

  next();
};

module.exports = rateLimiter;