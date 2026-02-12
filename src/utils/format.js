/**
 * Formatting Utilities
 * Centralized formatting functions for consistent display across the game
 */

/**
 * Format numbers with K/M/B/T suffixes
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places (default 0)
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 0) {
    if (num < 1000) {
        return num.toFixed(decimals);
    }
    
    const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    
    if (tier <= 0) return num.toFixed(decimals);
    if (tier >= units.length) return num.toExponential(2);
    
    const unit = units[tier];
    const scaled = num / Math.pow(10, tier * 3);
    
    return scaled.toFixed(decimals) + unit;
}

/**
 * Format time in seconds to human-readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time (e.g., "1h 23m" or "45m 12s")
 */
export function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

/**
 * Format training time as MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time (e.g., "02:45")
 */
export function formatTrainingTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format percentage with specified decimal places
 * @param {number} value - Value to format as percentage (0-1 or 0-100)
 * @param {number} decimals - Decimal places (default 1)
 * @param {boolean} isDecimal - Whether value is 0-1 (true) or 0-100 (false)
 * @returns {string} Formatted percentage with % symbol
 */
export function formatPercentage(value, decimals = 1, isDecimal = true) {
    const percentage = isDecimal ? value * 100 : value;
    return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format large numbers in scientific notation if needed
 * @param {number} num - Number to format
 * @param {number} threshold - Threshold for scientific notation (default 1e12)
 * @returns {string} Formatted number
 */
export function formatScientific(num, threshold = 1e12) {
    if (Math.abs(num) >= threshold) {
        return num.toExponential(2);
    }
    return formatNumber(num, 2);
}

/**
 * Format resource amount with icon and unit
 * @param {Object} resource - Resource object with icon, amount, unit
 * @param {number} amount - Amount to display (optional, uses resource.amount if not provided)
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted resource (e.g., "📊 123.45K Data")
 */
export function formatResource(resource, amount = null, decimals = 0) {
    const value = amount !== null ? amount : resource.amount;
    const unit = resource.unit || '';
    return `${resource.icon} ${formatNumber(value, decimals)}${unit}`;
}

/**
 * Format production rate (per second)
 * @param {number} rate - Production rate
 * @param {string} icon - Resource icon (optional)
 * @param {number} decimals - Decimal places (default 2)
 * @returns {string} Formatted rate (e.g., "(+123.45/s)")
 */
export function formatRate(rate, icon = '', decimals = 2) {
    const formatted = formatNumber(rate, decimals);
    return icon ? `(${icon} +${formatted}/s)` : `(+${formatted}/s)`;
}
