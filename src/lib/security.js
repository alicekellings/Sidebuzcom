// SideBuz.com Security Module
// Input validation, sanitization, and rate limiting

// ============================================
// Input Validation & Sanitization
// ============================================

/**
 * Sanitize string input - remove potentially dangerous characters
 * @param {string} input - Raw user input
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input, maxLength = 200) {
    if (typeof input !== 'string') return '';

    // Trim and limit length
    let cleaned = input.trim().substring(0, maxLength);

    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // Escape special HTML characters
    cleaned = cleaned
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    // Remove control characters
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');

    // Remove potential script injection patterns
    cleaned = cleaned.replace(/javascript:/gi, '');
    cleaned = cleaned.replace(/on\w+=/gi, '');
    cleaned = cleaned.replace(/data:/gi, '');

    return cleaned;
}

/**
 * Validate and sanitize quiz answers
 * @param {Object} answers - Raw quiz answers
 * @returns {Object} - Validated and sanitized answers
 */
export function validateQuizAnswers(answers) {
    if (!answers || typeof answers !== 'object') {
        return { valid: false, error: 'Invalid input format', data: null };
    }

    const allowedMajors = ['stem', 'business', 'humanities', 'arts', 'other'];
    const allowedYears = ['freshman', 'sophomore', 'junior', 'senior', 'graduate'];
    const allowedHours = ['5', '10', '20', '25'];
    const allowedSkills = ['writing', 'coding', 'design', 'social', 'teaching', 'math', 'video', 'other'];
    const allowedGoals = ['low', 'medium', 'high', 'max'];

    const validated = {};

    // Validate major
    if (answers.major && allowedMajors.includes(answers.major)) {
        validated.major = answers.major;
    }

    // Validate year
    if (answers.year && allowedYears.includes(answers.year)) {
        validated.year = answers.year;
    }

    // Validate hours
    if (answers.hours && allowedHours.includes(answers.hours)) {
        validated.hours = answers.hours;
    }

    // Validate skills (array)
    if (Array.isArray(answers.skills)) {
        validated.skills = answers.skills.filter(s => allowedSkills.includes(s)).slice(0, 5);
    }

    // Validate income goal
    if (answers.goal && allowedGoals.includes(answers.goal)) {
        validated.goal = answers.goal;
    }

    return { valid: true, error: null, data: validated };
}

// ============================================
// User Rate Limiting (Client-side tracking)
// ============================================

const USER_RATE_LIMITS = {
    maxRequestsPerMinute: 5,      // Max 5 requests per minute per user
    maxRequestsPerHour: 20,       // Max 20 requests per hour per user
    cooldownMinutes: 5,           // Cooldown period after hitting limit
};

// In-memory storage for user requests (server-side)
const userRateLimits = new Map();

/**
 * Check if user should be rate limited
 * @param {string} identifier - User identifier (IP or session ID)
 * @returns {Object} - { allowed: boolean, retryAfter?: number, message?: string }
 */
export function checkUserRateLimit(identifier) {
    if (!identifier) {
        return { allowed: true };
    }

    const now = Date.now();
    let userData = userRateLimits.get(identifier);

    if (!userData) {
        userData = {
            requests: [],
            blocked: false,
            blockedUntil: 0,
        };
        userRateLimits.set(identifier, userData);
    }

    // Check if user is blocked
    if (userData.blocked && now < userData.blockedUntil) {
        const retryAfter = Math.ceil((userData.blockedUntil - now) / 1000);
        return {
            allowed: false,
            retryAfter,
            message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        };
    }

    // Clear block if time has passed
    if (userData.blocked && now >= userData.blockedUntil) {
        userData.blocked = false;
        userData.blockedUntil = 0;
        userData.requests = [];
    }

    // Clean up old requests
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    userData.requests = userData.requests.filter(t => t > oneHourAgo);

    // Count recent requests
    const requestsInLastMinute = userData.requests.filter(t => t > oneMinuteAgo).length;
    const requestsInLastHour = userData.requests.length;

    // Check limits
    if (requestsInLastMinute >= USER_RATE_LIMITS.maxRequestsPerMinute) {
        userData.blocked = true;
        userData.blockedUntil = now + (USER_RATE_LIMITS.cooldownMinutes * 60000);
        return {
            allowed: false,
            retryAfter: USER_RATE_LIMITS.cooldownMinutes * 60,
            message: 'Too many requests. Please wait a few minutes before trying again.',
        };
    }

    if (requestsInLastHour >= USER_RATE_LIMITS.maxRequestsPerHour) {
        const retryAfter = Math.ceil((userData.requests[0] + 3600000 - now) / 1000);
        return {
            allowed: false,
            retryAfter,
            message: 'Hourly limit reached. Please try again later.',
        };
    }

    // Record this request
    userData.requests.push(now);

    return { allowed: true };
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits() {
    const now = Date.now();
    const twoHoursAgo = now - 7200000;

    for (const [identifier, userData] of userRateLimits.entries()) {
        // Remove entries with no recent activity
        if (userData.requests.length === 0 ||
            Math.max(...userData.requests) < twoHoursAgo) {
            userRateLimits.delete(identifier);
        }
    }
}

// ============================================
// Security Headers
// ============================================

export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.groq.com",
};

// ============================================
// IP Extraction (for rate limiting)
// ============================================

/**
 * Extract client IP from request headers
 * @param {Request} request - HTTP request object
 * @returns {string} - Client IP address
 */
export function getClientIP(request) {
    // Vercel/Cloudflare headers
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    // Cloudflare specific
    const cfIP = request.headers.get('cf-connecting-ip');
    if (cfIP) return cfIP;

    // Real IP header
    const realIP = request.headers.get('x-real-ip');
    if (realIP) return realIP;

    return 'unknown';
}

// ============================================
// Error Handling Helpers
// ============================================

export class SecurityError extends Error {
    constructor(message, code = 'SECURITY_ERROR') {
        super(message);
        this.name = 'SecurityError';
        this.code = code;
    }
}

export class RateLimitError extends Error {
    constructor(message, retryAfter) {
        super(message);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

// Periodic cleanup (every 10 minutes)
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimits, 600000);
}
