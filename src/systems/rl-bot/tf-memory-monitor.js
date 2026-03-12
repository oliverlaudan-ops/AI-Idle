/**
 * TensorFlow.js Memory Monitor
 * 
 * Utility for tracking TensorFlow.js memory usage to detect leaks.
 * Uses tf.memory() API to monitor tensors and GPU memory.
 */

let prevMemoryStats = null;

/**
 * Get current TensorFlow.js memory usage
 * @returns {object} Memory statistics with deltas
 */
export function getTensorFlowMemoryUsage() {
    if (typeof tf === 'undefined') {
        console.warn('[TF Memory] TensorFlow.js not loaded!');
        return null;
    }

    const memory = tf.memory();
    
    const stats = {
        numTensors: memory.numTensors,
        numDataBuffers: memory.numDataBuffers,
        numBytes: memory.numBytes,
        peakBytesInUse: memory.peakBytesInUse,
        prevNumTensors: prevMemoryStats?.numTensors || null,
        deltaTensors: prevMemoryStats ? memory.numTensors - prevMemoryStats.numTensors : 0,
        prevNumBytes: prevMemoryStats?.numBytes || null,
        deltaBytes: prevMemoryStats ? memory.numBytes - prevMemoryStats.numBytes : 0,
        timestamp: Date.now()
    };

    prevMemoryStats = {
        numTensors: memory.numTensors,
        numBytes: memory.numBytes
    };

    return stats;
}

/**
 * Log memory status with appropriate log level
 * @param {string} context - Context string (e.g., "Train step", "Episode end")
 * @param {object} stats - Optional stats object (if null, fetches new)
 */
export function logMemoryStatus(context = '', stats = null) {
    const memStats = stats || getTensorFlowMemoryUsage();
    
    if (!memStats) return;

    const mbUsed = (memStats.numBytes / (1024 * 1024)).toFixed(2);
    const mbPeak = (memStats.peakBytesInUse / (1024 * 1024)).toFixed(2);
    const deltaMb = memStats.deltaBytes ? (memStats.deltaBytes / (1024 * 1024)).toFixed(2) : '0';
    
    const logMsg = `[TF Memory] ${context} | Tensors: ${memStats.numTensors}${memStats.deltaTensors !== 0 ? ` (${memStats.deltaTensors > 0 ? '+' : ''}${memStats.deltaTensors})` : ''} | Memory: ${mbUsed}MB${memStats.deltaBytes !== 0 ? ` (${memStats.deltaBytes > 0 ? '+' : ''}${deltaMb}MB)` : ''} | Peak: ${mbPeak}MB`;

    // Log level based on memory growth
    const MEMORY_WARNING_THRESHOLD_MB = 100;
    const MEMORY_CRITICAL_THRESHOLD_MB = 500;

    if (memStats.numBytes > MEMORY_CRITICAL_THRESHOLD_MB * 1024 * 1024) {
        console.error(logMsg);
    } else if (memStats.numBytes > MEMORY_WARNING_THRESHOLD_MB * 1024 * 1024 || memStats.deltaTensors > 100) {
        console.warn(logMsg);
    } else {
        console.log(logMsg);
    }

    return memStats;
}

/**
 * Force garbage collection of TensorFlow.js tensors
 * Useful when memory usage gets too high
 * @returns {number} Number of tensors cleaned up (approximation)
 */
export function forceTensorCleanup() {
    if (typeof tf === 'undefined') return 0;

    const before = tf.memory().numTensors;
    
    // tf.tidy automatically cleans up intermediate tensors
    // This is mainly for debugging/emergency cleanup
    tf.disposeVariables();
    
    const after = tf.memory().numTensors;
    
    console.log(`[TF Memory] Cleanup: ${before} → ${after} tensors (freed ~${before - after})`);
    
    return before - after;
}

/**
 * Check if memory is within acceptable bounds
 * @param {number} maxBytes - Maximum acceptable bytes (default: 500MB)
 * @returns {object} Check result with status and stats
 */
export function checkMemoryThreshold(maxBytes = 500 * 1024 * 1024) {
    const stats = getTensorFlowMemoryUsage();
    
    if (!stats) {
        return { ok: false, reason: 'TF not loaded' };
    }

    const isOk = stats.numBytes <= maxBytes;
    
    return {
        ok: isOk,
        stats,
        percentUsed: ((stats.numBytes / maxBytes) * 100).toFixed(1),
        thresholdMb: (maxBytes / (1024 * 1024)).toFixed(0)
    };
}

/**
 * Reset memory tracking (for testing)
 */
export function resetMemoryTracking() {
    prevMemoryStats = null;
}