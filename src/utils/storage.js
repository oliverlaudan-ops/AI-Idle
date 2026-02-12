/**
 * Storage Utilities
 * Safe localStorage wrapper with error handling and fallbacks
 */

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} data - Data to save (will be JSON stringified)
 * @returns {boolean} True if save was successful
 */
export function saveToStorage(key, data) {
    if (!isStorageAvailable()) {
        console.warn('[Storage] localStorage not available');
        return false;
    }
    
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('[Storage] Failed to save:', error);
        
        // Check if quota exceeded
        if (error.name === 'QuotaExceededError') {
            console.error('[Storage] Storage quota exceeded');
        }
        
        return false;
    }
}

/**
 * Load data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {any} Loaded data or default value
 */
export function loadFromStorage(key, defaultValue = null) {
    if (!isStorageAvailable()) {
        console.warn('[Storage] localStorage not available');
        return defaultValue;
    }
    
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) {
            return defaultValue;
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.error('[Storage] Failed to load:', error);
        return defaultValue;
    }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if removal was successful
 */
export function removeFromStorage(key) {
    if (!isStorageAvailable()) {
        return false;
    }
    
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('[Storage] Failed to remove:', error);
        return false;
    }
}

/**
 * Clear all data from localStorage
 * @returns {boolean} True if clear was successful
 */
export function clearStorage() {
    if (!isStorageAvailable()) {
        return false;
    }
    
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('[Storage] Failed to clear:', error);
        return false;
    }
}

/**
 * Get all keys in localStorage
 * @param {string} prefix - Optional prefix to filter keys
 * @returns {string[]} Array of keys
 */
export function getStorageKeys(prefix = '') {
    if (!isStorageAvailable()) {
        return [];
    }
    
    const keys = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key);
            }
        }
    } catch (error) {
        console.error('[Storage] Failed to get keys:', error);
    }
    
    return keys;
}

/**
 * Get storage size estimate in bytes
 * @returns {number} Estimated storage size in bytes
 */
export function getStorageSize() {
    if (!isStorageAvailable()) {
        return 0;
    }
    
    let size = 0;
    try {
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
    } catch (error) {
        console.error('[Storage] Failed to calculate size:', error);
    }
    
    return size;
}

/**
 * Check if a key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if key exists
 */
export function hasKey(key) {
    if (!isStorageAvailable()) {
        return false;
    }
    return localStorage.getItem(key) !== null;
}
