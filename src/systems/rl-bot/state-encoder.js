/**
 * State Encoder for RL Bot
 * 
 * Converts game state into a normalized feature vector for neural network input.
 * All features are scaled to [0, 1] range for better training stability.
 */

/**
 * Maximum values for normalization (empirically determined)
 */
const MAX_VALUES = {
    data: 1e6,              // 1 million
    compute: 1e6,           // 1 million
    accuracy: 1e5,          // 100K (per run, not lifetime)
    researchPoints: 1000,   // 1000 RP
    buildingCount: 100,     // Max 100 of each building type
    runDuration: 3600       // 1 hour in seconds
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
 * Encode game state into feature vector
 * @param {object} gameState - Current game state
 * @returns {Float32Array} Normalized feature vector (23 dimensions)
 */
export function encodeState(gameState) {
    const features = [];
    
    // ========== Resources (4 features) ==========
    features.push(
        normalize(gameState.resources.data.amount, MAX_VALUES.data),
        normalize(gameState.resources.compute.amount, MAX_VALUES.compute),
        normalize(gameState.stats.totalAccuracy, MAX_VALUES.accuracy),
        normalize(gameState.resources.researchPoints.amount, MAX_VALUES.researchPoints)
    );
    
    // ========== Buildings (7 features) ==========
    for (const buildingId of BUILDINGS) {
        const building = gameState.buildings[buildingId];
        const count = building ? building.count : 0;
        features.push(normalize(count, MAX_VALUES.buildingCount));
    }
    
    // ========== Research Status (8 binary features) ==========
    for (const researchId of CRITICAL_RESEARCH) {
        const research = gameState.research[researchId];
        const completed = research && research.researched ? 1 : 0;
        features.push(completed);
    }
    
    // ========== Training State (3 features) ==========
    const isTraining = gameState.currentTraining ? 1 : 0;
    const trainingProgress = gameState.currentTraining 
        ? (gameState.trainingProgress / gameState.models[gameState.currentTraining].trainingTime)
        : 0;
    
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
    
    // ========== Time (1 feature) ==========
    const currentTime = Date.now();
    const startTime = gameState.stats.startTime || currentTime;
    const runDuration = (currentTime - startTime) / 1000; // seconds
    features.push(normalize(runDuration, MAX_VALUES.runDuration));
    
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
           BUILDINGS.length +        // Buildings
           CRITICAL_RESEARCH.length + // Research
           3 +                       // Training
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
    
    for (let i = 0; i < featureNames.length; i++) {
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
    
    for (let i = 0; i < state1.length; i++) {
        const diff = Math.abs(state2[i] - state1[i]);
        if (diff > 0.01) { // Only report significant changes
            differences.push({
                feature: featureNames[i],
                before: state1[i].toFixed(3),
                after: state2[i].toFixed(3),
                change: (state2[i] - state1[i]).toFixed(3)
            });
        }
    }
    
    return differences;
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
