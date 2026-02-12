/**
 * Calculation Utilities
 * Math helpers and game calculation functions
 */

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Calculate percentage progress
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @returns {number} Percentage (0-100)
 */
export function calculateProgress(current, target) {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
}

/**
 * Calculate time to reach target at current rate
 * @param {number} current - Current amount
 * @param {number} target - Target amount
 * @param {number} rate - Production rate per second
 * @returns {number} Time in seconds (Infinity if rate <= 0)
 */
export function calculateTimeToTarget(current, target, rate) {
    if (rate <= 0) return Infinity;
    const remaining = Math.max(0, target - current);
    return remaining / rate;
}

/**
 * Calculate exponential growth
 * @param {number} base - Base value
 * @param {number} rate - Growth rate (e.g., 1.15 for 15% growth)
 * @param {number} count - Number of applications
 * @returns {number} Result after growth
 */
export function exponentialGrowth(base, rate, count) {
    return base * Math.pow(rate, count);
}

/**
 * Calculate building cost with exponential scaling
 * @param {number} baseCost - Base cost
 * @param {number} owned - Number already owned
 * @param {number} scale - Cost scaling factor (default 1.15)
 * @returns {number} Current cost
 */
export function calculateBuildingCost(baseCost, owned, scale = 1.15) {
    return Math.floor(baseCost * Math.pow(scale, owned));
}

/**
 * Calculate total cost for buying multiple buildings
 * @param {number} baseCost - Base cost of first building
 * @param {number} owned - Number already owned
 * @param {number} toBuy - Number to buy
 * @param {number} scale - Cost scaling factor (default 1.15)
 * @returns {number} Total cost
 */
export function calculateBulkCost(baseCost, owned, toBuy, scale = 1.15) {
    let total = 0;
    for (let i = 0; i < toBuy; i++) {
        total += calculateBuildingCost(baseCost, owned + i, scale);
    }
    return Math.floor(total);
}

/**
 * Calculate how many buildings can be afforded
 * @param {number} baseCost - Base cost
 * @param {number} owned - Number already owned
 * @param {number} currency - Available currency
 * @param {number} scale - Cost scaling factor (default 1.15)
 * @param {number} maxToBuy - Maximum to calculate (default 1000)
 * @returns {number} Number that can be afforded
 */
export function calculateAffordable(baseCost, owned, currency, scale = 1.15, maxToBuy = 1000) {
    let count = 0;
    let spent = 0;
    
    for (let i = 0; i < maxToBuy; i++) {
        const cost = calculateBuildingCost(baseCost, owned + i, scale);
        if (spent + cost > currency) break;
        spent += cost;
        count++;
    }
    
    return count;
}

/**
 * Round to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Decimal places
 * @returns {number} Rounded value
 */
export function roundTo(value, decimals = 0) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate percentage of total
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export function percentOf(part, total) {
    if (total === 0) return 0;
    return (part / total) * 100;
}

/**
 * Sum an array of numbers
 * @param {number[]} numbers - Array of numbers
 * @returns {number} Sum
 */
export function sum(numbers) {
    return numbers.reduce((acc, n) => acc + n, 0);
}

/**
 * Average of an array of numbers
 * @param {number[]} numbers - Array of numbers
 * @returns {number} Average
 */
export function average(numbers) {
    if (numbers.length === 0) return 0;
    return sum(numbers) / numbers.length;
}
