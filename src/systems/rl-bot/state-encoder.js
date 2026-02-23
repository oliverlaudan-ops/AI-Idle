/**
 * State Encoder for RL Bot
 * 
 * Converts game state into a normalized feature vector for neural network input.
 * All features are scaled to [0, 1] range for better training stability.
 * 
 * DEPLOYMENT-FOCUSED: Bot needs to know when it can deploy!
 */

/**
 * Maximum values for normalization (empirically determined)
 */
const MAX_VALUES = {
    data: 1e6,              // 1 million
    compute: 1e6,           // 1 million
    accuracy: 1e5,          // 100K (current run)
    lifetimeAccuracy: 1e6,  // 1M lifetime (for deployment tracking)
    researchPoints: 1000,   // 1000 RP
    buildingCount: 100,     // Max 100 of each building type
    runDuration: 3600,      // 1 hour in seconds
    deployments: 20         // Max 20 deployments tracked
};

/**
 * Critical research items to track as binary features
 */
const CRITICAL_RESEARCH = [
    'sgd',
    'adam',
    'relu',
    'batchNorm',
    'dropout',
    'attention',
    'transferLearning',
    'dataAugmentation'
];

/**
 * Building IDs to track
 */
const BUILDINGS = [
    'dataCenter',
    'computeCluster',
    'gpuFarm',
    'researchLab',
    'dataWarehouse',
    'tensorCore',
    'quantumProcessor'
];

/**
 * Safe get helper - returns 0 if property doesn't exist
 * @param {object} obj - Object to access
 * @param {string} path - Dot-separated path (e.g., 'resources.data.amount')
 * @returns {number} Value or 0
 */
function safeGet(obj, path, defaultValue = 0) {
    try {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return defaultValue;
            }
            current = current[key];
        }
        
        return current ?? defaultValue;
    } catch (error) {
        console.warn(`[State Encoder] Failed to access ${path}:`, error);
        return defaultValue;
    }
}

/**
 * Encode game state into feature vector
 * @param {object} gameState - Current game state
 * @returns {Float32Array} Normalized feature vector (27 dimensions)
 */
export function encodeState(gameState) {
    // Validate gameState
    if (!gameState) {
        console.error('[State Encoder] gameState is null/undefined!');
        return new Float32Array(27); // Return zeros
    }
    
    const features = [];
    
    // ========== Resources (4 features) ==========
    features.push(
        normalize(safeGet(gameState, 'resources.data.amount'), MAX_VALUES.data),
        normalize(safeGet(gameState, 'resources.compute.amount'), MAX_VALUES.compute),
        normalize(safeGet(gameState, 'stats.totalAccuracy'), MAX_VALUES.accuracy),
        normalize(safeGet(gameState, 'resources.research.amount'), MAX_VALUES.researchPoints)
    );
    
    // ========== Buildings (7 features) ==========
    for (const buildingId of BUILDINGS) {
        const count = safeGet(gameState, `buildings.${buildingId}.count`, 0);
        features.push(normalize(count, MAX_VALUES.buildingCount));
    }
    
    // ========== Research Status (8 binary features) ==========
    for (const researchId of CRITICAL_RESEARCH) {
        const researched = safeGet(gameState, `research.${researchId}.researched`, false);
        features.push(researched ? 1 : 0);
    }
    
    // ========== Training State (3 features) ==========
    const isTraining = gameState.currentTraining ? 1 : 0;
    
    let trainingProgress = 0;
    if (gameState.currentTraining && gameState.models && gameState.models[gameState.currentTraining]) {
        const model = gameState.models[gameState.currentTraining];
        const progress = safeGet(gameState, 'trainingProgress', 0);
        const trainingTime = model.trainingTime || 1;
        trainingProgress = progress / trainingTime;
    }
    
    // Current model tier (0-1 scale, 0=none, 1=advanced)
    let modelTier = 0;
    if (gameState.currentTraining) {
        const modelId = gameState.currentTraining;
        const modelOrder = [
            'linearRegression', 'logisticRegression', 'neuralNetwork',
            'deepNeuralNetwork', 'cnn', 'rnn', 'lstm', 'gru',
            'transformer', 'gpt'
        ];
        const index = modelOrder.indexOf(modelId);
        modelTier = index >= 0 ? (index / (modelOrder.length - 1)) : 0;
    }
    
    features.push(isTraining, trainingProgress, modelTier);
    
    // ========== Deployment Features (4 features) - CRITICAL! ==========
    
    // Lifetime accuracy (how close to deployment?)
    const lifetimeAccuracy = safeGet(gameState, 'deployment.lifetimeStats.totalAccuracy', 
                                      safeGet(gameState, 'stats.totalAccuracy', 0));
    features.push(normalize(lifetimeAccuracy, MAX_VALUES.lifetimeAccuracy));
    
    // Can deploy right now? (binary)
    let canDeploy = 0;
    try {
        if (gameState.getDeploymentInfo && typeof gameState.getDeploymentInfo === 'function') {
            const deployInfo = gameState.getDeploymentInfo();
            canDeploy = deployInfo && deployInfo.canDeploy ? 1 : 0;
        }
    } catch (error) {
        console.warn('[State Encoder] getDeploymentInfo() failed:', error);
    }
    features.push(canDeploy);
    
    // Complete strategy unlocked? (binary)
    const deployments = safeGet(gameState, 'deployment.deployments', 0);
    const completeUnlocked = deployments >= 3 ? 1 : 0;
    features.push(completeUnlocked);
    
    // Number of past deployments (helps bot learn progression)
    features.push(normalize(deployments, MAX_VALUES.deployments));
    
    // ========== Time (1 feature) ==========
    const currentTime = Date.now();
    const startTime = safeGet(gameState, 'stats.startTime', currentTime);
    const runDuration = (currentTime - startTime) / 1000; // seconds
    features.push(normalize(runDuration, MAX_VALUES.runDuration));
    
    // Validate feature count
    if (features.length !== 27) {
        console.error(`[State Encoder] Expected 27 features, got ${features.length}`);
        // Pad with zeros if needed
        while (features.length < 27) features.push(0);
    }
    
    // Convert to Float32Array for TensorFlow.js
    return new Float32Array(features);
}

/**
 * Normalize value to [0, 1] range with soft clipping
 * Uses tanh scaling to handle outliers gracefully
 * @param {number} value - Raw value
 * @param {number} max - Maximum expected value
 * @returns {number} Normalized value in [0, 1]
 */
function normalize(value, max) {
    if (max === 0) return 0;
    if (typeof value !== 'number' || isNaN(value)) return 0;
    
    // Linear normalization with soft clipping
    const ratio = value / max;
    
    // Soft clip using tanh for values > 1
    // This prevents extreme outliers from breaking the network
    if (ratio > 1) {
        return 0.5 + 0.5 * Math.tanh(ratio - 1);
    }
    
    return Math.max(0, Math.min(1, ratio));
}

/**
 * Get state space dimensions
 * @returns {number} Size of state vector
 */
export function getStateDimensions() {
    return 4 +                      // Resources
           BUILDINGS.length +        // Buildings (7)
           CRITICAL_RESEARCH.length + // Research (8)
           3 +                       // Training
           4 +                       // Deployment (NEW!)
           1;                        // Time
}

/**
 * Get feature names (useful for debugging and visualization)
 * @returns {array} Array of feature names
 */
export function getFeatureNames() {
    const names = [];
    
    // Resources
    names.push('data', 'compute', 'accuracy', 'researchPoints');
    
    // Buildings
    for (const buildingId of BUILDINGS) {
        names.push(`building_${buildingId}`);
    }
    
    // Research
    for (const researchId of CRITICAL_RESEARCH) {
        names.push(`research_${researchId}`);
    }
    
    // Training
    names.push('isTraining', 'trainingProgress', 'modelTier');
    
    // Deployment
    names.push('lifetimeAccuracy', 'canDeploy', 'completeUnlocked', 'pastDeployments');
    
    // Time
    names.push('runDuration');
    
    return names;
}

/**
 * Decode state vector back to human-readable format (for debugging)
 * @param {Float32Array} stateVector - Encoded state
 * @returns {object} Human-readable state object
 */
export function decodeState(stateVector) {
    const featureNames = getFeatureNames();
    const decoded = {};
    
    for (let i = 0; i < featureNames.length && i < stateVector.length; i++) {
        decoded[featureNames[i]] = stateVector[i];
    }
    
    return decoded;
}

/**
 * Create a batch of states for training
 * @param {array} gameStates - Array of game states
 * @returns {Float32Array} Batch tensor (shape: [batch_size, state_dim])
 */
export function encodeBatch(gameStates) {
    const stateDim = getStateDimensions();
    const batchSize = gameStates.length;
    const batch = new Float32Array(batchSize * stateDim);
    
    for (let i = 0; i < batchSize; i++) {
        const state = encodeState(gameStates[i]);
        batch.set(state, i * stateDim);
    }
    
    return batch;
}

/**
 * Calculate state difference (useful for debugging state changes)
 * @param {Float32Array} state1 - First state
 * @param {Float32Array} state2 - Second state
 * @returns {object} Difference analysis
 */
export function stateDifference(state1, state2) {
    const featureNames = getFeatureNames();
    const differences = [];
    
    const minLength = Math.min(state1.length, state2.length);
    
    for (let i = 0; i < minLength; i++) {
        const diff = Math.abs(state2[i] - state1[i]);
        if (diff > 0.01) { // Only report significant changes
            differences.push({
                feature: featureNames[i] || `feature_${i}`,
                before: state1[i].toFixed(3),
                after: state2[i].toFixed(3),
                change: (state2[i] - state1[i]).toFixed(3)
            });
        }
    }
    
    return differences;
}

/**
 * Get deployment readiness score (0-1, how close to deployment?)
 * Useful for debugging and UI display
 * @param {object} gameState - Game state
 * @returns {number} Readiness score
 */
export function getDeploymentReadiness(gameState) {
    if (!gameState) return 0;
    
    const lifetimeAccuracy = safeGet(gameState, 'deployment.lifetimeStats.totalAccuracy', 
                                      safeGet(gameState, 'stats.totalAccuracy', 0));
    const threshold = 250000;
    
    return Math.min(1.0, lifetimeAccuracy / threshold);
}

/**
 * Export constants for testing
 */
export const STATE_CONSTANTS = {
    MAX_VALUES,
    CRITICAL_RESEARCH,
    BUILDINGS,
    STATE_DIM: getStateDimensions()
};
