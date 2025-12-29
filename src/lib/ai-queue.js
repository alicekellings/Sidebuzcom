// Simple queue and rate limiter for Groq API calls
// This helps prevent hitting rate limits and provides better error handling

class AIQueueManager {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 2000; // Minimum 2 seconds between requests
        this.maxConcurrent = 1; // Process one at a time
        this.activeRequests = 0;
    }

    async addToQueue(requestFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ requestFn, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        if (this.activeRequests >= this.maxConcurrent) {
            return;
        }

        this.isProcessing = true;
        this.activeRequests++;

        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        // Wait if we're sending requests too fast
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(r => setTimeout(r, waitTime));
        }

        const { requestFn, resolve, reject } = this.queue.shift();
        this.lastRequestTime = Date.now();

        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.activeRequests--;
            this.isProcessing = false;
            // Process next item in queue
            if (this.queue.length > 0) {
                setTimeout(() => this.processQueue(), 100);
            }
        }
    }

    getQueueLength() {
        return this.queue.length;
    }
}

// Singleton instance
const queueManager = new AIQueueManager();

// Main function to call Groq API with queue management
export async function callGroqAPI(apiKey, messages, options = {}) {
    const {
        model = 'llama-3.1-8b-instant',
        temperature = 0.7,
        maxTokens = 200,
        timeout = 30000, // 30 second timeout
    } = options;

    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    const makeRequest = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle rate limiting
            if (response.status === 429) {
                const retryAfter = response.headers.get('retry-after') || 60;
                throw new AIError(
                    'RATE_LIMITED',
                    `AI service is busy. Please try again in ${retryAfter} seconds.`,
                    { retryAfter: parseInt(retryAfter) }
                );
            }

            // Handle other errors
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Groq API Error:', response.status, errorText);
                throw new AIError(
                    'API_ERROR',
                    'AI service temporarily unavailable. Please try again later.',
                    { status: response.status, error: errorText }
                );
            }

            const data = await response.json();
            return {
                success: true,
                content: data.choices?.[0]?.message?.content || null,
                usage: data.usage,
            };

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new AIError(
                    'TIMEOUT',
                    'AI request timed out. Please try again.',
                    { timeout }
                );
            }

            if (error instanceof AIError) {
                throw error;
            }

            throw new AIError(
                'UNKNOWN',
                'An unexpected error occurred. Please try again later.',
                { originalError: error.message }
            );
        }
    };

    // Add to queue and wait for result
    return queueManager.addToQueue(makeRequest);
}

// Custom error class for AI-related errors
export class AIError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = 'AIError';
        this.code = code;
        this.details = details;
        this.isAIError = true;
    }
}

// Helper to get queue status
export function getQueueStatus() {
    return {
        queueLength: queueManager.getQueueLength(),
        activeRequests: queueManager.activeRequests,
    };
}

// Helper to format user-friendly error message
export function formatErrorMessage(error) {
    if (error?.isAIError) {
        switch (error.code) {
            case 'RATE_LIMITED':
                return {
                    title: 'AI Service Busy',
                    message: 'Our AI is handling many requests right now. Please wait a moment and try again.',
                    retryable: true,
                };
            case 'TIMEOUT':
                return {
                    title: 'Request Timeout',
                    message: 'The AI took too long to respond. Please try again.',
                    retryable: true,
                };
            case 'API_ERROR':
                return {
                    title: 'Service Unavailable',
                    message: 'Our AI service is temporarily down. Please try again in a few minutes.',
                    retryable: true,
                };
            default:
                return {
                    title: 'Something Went Wrong',
                    message: 'An error occurred. Please try again later.',
                    retryable: true,
                };
        }
    }

    return {
        title: 'Error',
        message: 'Something unexpected happened. Please try again.',
        retryable: true,
    };
}
