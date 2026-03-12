/**
 * Error Boundary Utilities for AI-Idle
 * Provides safe execution wrappers and global error handling
 */

// Error log storage for debugging
const errorLog = [];
const MAX_ERROR_LOG_SIZE = 50;

/**
 * Log error with full details for debugging
 */
function logError(context, error, extra = {}) {
    const errorEntry = {
        timestamp: new Date().toISOString(),
        context,
        message: error?.message || String(error),
        stack: error?.stack || '',
        userAgent: navigator?.userAgent || 'unknown',
        url: window?.location?.href || 'unknown',
        extra
    };
    
    errorLog.push(errorEntry);
    
    // Keep log size manageable
    if (errorLog.length > MAX_ERROR_LOG_SIZE) {
        errorLog.shift();
    }
    
    // Console output with context
    console.error(`[ErrorBoundary] ${context}:`, errorEntry.message);
    if (errorEntry.stack) {
        console.error(errorEntry.stack);
    }
    console.error('[ErrorBoundary] Extra:', extra);
    
    return errorEntry;
}

/**
 * Try-Catch Higher-Order Function
 * Wraps a function with try/catch and logs errors
 * 
 * @param {Function} fn - Function to wrap
 * @param {string} context - Error context description
 * @param {Object} options - Options
 * @param {*} options.defaultValue - Default value to return on error
 * @param {boolean} options.log - Whether to log errors (default: true)
 * @param {boolean} options.notify - Whether to show user notification (default: false)
 * @returns {Function} Wrapped function
 */
export function tryCatch(fn, context, options = {}) {
    const { defaultValue = undefined, log = true, notify = false } = options;
    
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            if (log) {
                logError(context, error, { args: args.length > 0 ? '[args present]' : '[]' });
            }
            if (notify && typeof showToast === 'function') {
                showToast(`Error in ${context}. Check console.`, 'error');
            }
            return defaultValue;
        }
    };
}

/**
 * Safe Execute - Execute function and return default value on error
 * 
 * @param {Function} fn - Function to execute
 * @param {string} context - Error context description
 * @param {Object} options - Options
 * @param {*} options.defaultValue - Default value to return on error
 * @param {boolean} options.log - Whether to log errors (default: true)
 * @param {boolean} options.notify - Whether to show user notification (default: false)
 * @returns {*} Result of function or default value
 */
export function safeExecute(fn, context, options = {}) {
    const { defaultValue = undefined, log = true, notify = false } = options;
    
    try {
        return fn();
    } catch (error) {
        if (log) {
            logError(context, error);
        }
        if (notify && typeof showToast === 'function') {
            showToast(`Something went wrong in ${context}`, 'error');
        }
        return defaultValue;
    }
}

/**
 * Wrap Async Function - Handle promise rejections
 * 
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Error context description
 * @param {Object} options - Options
 * @param {*} options.defaultValue - Default value to return on error
 * @param {boolean} options.log - Whether to log errors (default: true)
 * @param {boolean} options.notify - Whether to show user notification (default: false)
 * @returns {Function} Wrapped async function
 */
export function wrapAsync(fn, context, options = {}) {
    const { defaultValue = undefined, log = true, notify = false } = options;
    
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            if (log) {
                logError(context, error);
            }
            if (notify && typeof showToast === 'function') {
                showToast(`Error in ${context}. Check console.`, 'error');
            }
            return defaultValue;
        }
    };
}

/**
 * Safe Async - Execute async function with error handling
 * Returns [error, result] tuple
 * 
 * @param {Function} fn - Async function to execute
 * @param {string} context - Error context description
 * @returns {Promise<[Error|null, *]>} Tuple of [error, result]
 */
export async function safeAsync(fn, context) {
    try {
        const result = await fn();
        return [null, result];
    } catch (error) {
        logError(context, error);
        return [error, null];
    }
}

/**
 * Safe Promise - Wrap promise with error handling
 * Returns [error, result] tuple
 * 
 * @param {Promise} promise - Promise to wrap
 * @param {string} context - Error context description
 * @returns {Promise<[Error|null, *]>} Tuple of [error, result]
 */
export function safePromise(promise, context) {
    return promise
        .then(result => [null, result])
        .catch(error => {
            logError(context, error);
            return [error, null];
        });
}

/**
 * ErrorHandler Class - Global Error Handling
 */
export class ErrorHandler {
    constructor() {
        this.listeners = [];
        this.isEnabled = true;
    }
    
    /**
     * Initialize global error handlers
     */
    init() {
        // Handle JavaScript errors
        window.onerror = (message, source, lineno, colno, error) => {
            if (!this.isEnabled) return false;
            
            logError('window.onerror', error || new Error(String(message)), {
                message: String(message),
                source,
                lineno,
                colno
            });
            
            // Show user-friendly message
            this.showUserMessage();
            
            // Don't prevent default (allow browser error console)
            return false;
        };
        
        // Handle unhandled promise rejections
        window.onunhandledrejection = (event) => {
            if (!this.isEnabled) return;
            
            const error = event.reason instanceof Error 
                ? event.reason 
                : new Error(String(event.reason));
            
            logError('unhandledrejection', error, {
                promise: event.promise ? '[Promise]' : 'unknown'
            });
            
            this.showUserMessage();
        };
        
        // Catch errors in setTimeout
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = function(callback, delay, ...args) {
            return originalSetTimeout.call(window, () => {
                try {
                    callback(...args);
                } catch (error) {
                    logError('setTimeout callback', error);
                }
            }, delay, ...args);
        };
        
        // Catch errors in setInterval
        const originalSetInterval = window.setInterval;
        window.setInterval = function(callback, delay, ...args) {
            return originalSetInterval.call(window, () => {
                try {
                    callback(...args);
                } catch (error) {
                    logError('setInterval callback', error);
                }
            }, delay, ...args);
        };
        
        console.log('[ErrorHandler] Global handlers initialized');
    }
    
    /**
     * Show user-friendly error message
     */
    showUserMessage() {
        // Only show if not already showing
        const existingError = document.getElementById('error-boundary-message');
        if (existingError) return;
        
        // Check if game is initialized (toast function exists)
        if (typeof showToast === 'function') {
            showToast('Something went wrong. Check console for details.', 'error', 5000);
        }
    }
    
    /**
     * Register error listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    /**
     * Remove error listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }
    
    /**
     * Notify all listeners
     */
    notify(error, context) {
        for (const listener of this.listeners) {
            try {
                listener(error, context);
            } catch (e) {
                console.error('[ErrorHandler] Listener error:', e);
            }
        }
    }
    
    /**
     * Enable/disable error handling
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    /**
     * Get error log for debugging
     */
    getErrorLog() {
        return [...errorLog];
    }
    
    /**
     * Clear error log
     */
    clearErrorLog() {
        errorLog.length = 0;
    }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Wrap button click handler with error handling
 * 
 * @param {HTMLElement} element - Button or element to wrap
 * @param {Function} handler - Click handler function
 * @param {string} context - Context description for logging
 * @param {Object} options - Options (see tryCatch)
 */
export function wrapClickHandler(element, handler, context, options = {}) {
    if (!element) return;
    
    const { log = true, notify = false } = options;
    
    element.addEventListener('click', (event) => {
        try {
            handler(event);
        } catch (error) {
            if (log) {
                logError(`click:${context}`, error);
            }
            if (notify && typeof showToast === 'function') {
                showToast(`Action failed: ${context}`, 'error');
            }
            event.preventDefault();
            event.stopPropagation();
        }
    });
}

/**
 * Wrap event handler with error handling
 * 
 * @param {HTMLElement} element - Element with event listener
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {string} context - Context description
 * @param {Object} options - Options
 */
export function wrapEventHandler(element, event, handler, context, options = {}) {
    if (!element) return;
    
    const safeHandler = tryCatch(handler, `event:${context}`, options);
    element.addEventListener(event, safeHandler);
}

export default {
    tryCatch,
    safeExecute,
    wrapAsync,
    safeAsync,
    safePromise,
    ErrorHandler,
    errorHandler,
    wrapClickHandler,
    wrapEventHandler
};