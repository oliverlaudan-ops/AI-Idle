/**
 * Reward Function for RL Bot
 * 
 * Calculates rewards to guide the RL agent's learning.
 * Rewards are designed to encourage:
 * - Accuracy gain (primary objective)
 * - Efficient resource management
 * - Research progress
 * - Successful deployments
 */

/**
 * Reward weights (can be tuned for better performance)
 */
const REWARD_WEIGHTS = {
    accuracy: 1.0,           // Per point of accuracy gained
    efficiency: 0.5,         // Bonus for high resource efficiency
    research: 2.0,           // Bonus per research completed
    deployment: 50.0,        // Large bonus for successful deployment
    invalidAction: -5.0,     // Penalty for invalid actions
    idle: -0.1               // Small penalty for doing nothing when could act
};

/**
 * Calculate reward for a state transition
 * @param {object} previousState - State before action
 * @param {number} actionId - Action taken
 * @param {object} newState - State after action
 * @param {boolean} actionSucceeded - Whether action was valid and executed
 * @returns {number} Reward value
 */
export function calculateReward(previousState, actionId, newState, actionSucceeded) {
    let reward = 0;
    
    // ========== Invalid Action Penalty ==========
    if (!actionSucceeded) {
        return REWARD_WEIGHTS.invalidAction;
    }
    
    // ========== Primary Objective: Accuracy Gain ==========
    const accuracyGain = newState.stats.totalAccuracy - previousState.stats.totalAccuracy;
    reward += accuracyGain * REWARD_WEIGHTS.accuracy;
    
    // ========== Efficiency Bonus ==========
    const efficiencyBonus = calculateEfficiencyBonus(newState);
    reward += efficiencyBonus * REWARD_WEIGHTS.efficiency;
    
    // ========== Research Completion Bonus ==========
    const researchCompleted = newState.stats.completedResearch.length - 
                             previousState.stats.completedResearch.length;
    if (researchCompleted > 0) {
        reward += researchCompleted * REWARD_WEIGHTS.research;
    }
    
    // ========== Deployment Success Bonus ==========
    const deploymentCount = newState.stats.deployments - previousState.stats.deployments;
    if (deploymentCount > 0) {
        reward += deploymentCount * REWARD_WEIGHTS.deployment;
    }
    
    // ========== Idle Penalty ==========
    // Penalize "wait" action if there were valid actions available
    if (actionId === 0) { // Wait action
        const hasResources = newState.resources.data.amount > 100 && 
                           newState.resources.compute.amount > 100;
        if (hasResources) {
            reward += REWARD_WEIGHTS.idle;
        }
    }
    
    return reward;
}

/**
 * Calculate efficiency bonus based on resource utilization
 * Rewards the bot for maintaining good resource balance
 * @param {object} state - Current state
 * @returns {number} Efficiency bonus
 */
function calculateEfficiencyBonus(state) {
    const data = state.resources.data.amount;
    const compute = state.resources.compute.amount;
    const dataPerSec = state.resources.data.perSecond;
    const computePerSec = state.resources.compute.perSecond;
    
    // Avoid division by zero
    if (dataPerSec === 0 || computePerSec === 0) return 0;
    
    // Calculate resource balance (how close to 1:1 ratio)
    const ratio = Math.min(data, compute) / Math.max(data, compute);
    
    // Calculate production balance
    const productionRatio = Math.min(dataPerSec, computePerSec) / 
                           Math.max(dataPerSec, computePerSec);
    
    // Reward balanced resource management
    // Perfect balance (ratio = 1) gives maximum bonus
    const balanceBonus = (ratio + productionRatio) / 2;
    
    return balanceBonus;
}

/**
 * Calculate shaped reward (adds intermediate rewards for better learning)
 * This helps the agent learn faster by providing more frequent feedback
 * @param {object} previousState - State before action
 * @param {number} actionId - Action taken
 * @param {object} newState - State after action
 * @param {boolean} actionSucceeded - Whether action was valid
 * @returns {number} Shaped reward
 */
export function calculateShapedReward(previousState, actionId, newState, actionSucceeded) {
    let reward = calculateReward(previousState, actionId, newState, actionSucceeded);
    
    // Add potential-based reward shaping
    // Φ(s') - Φ(s) where Φ is a potential function
    const previousPotential = estimatePotential(previousState);
    const newPotential = estimatePotential(newState);
    const gamma = 0.99; // Discount factor
    
    reward += gamma * newPotential - previousPotential;
    
    return reward;
}

/**
 * Estimate state potential (how "good" a state is)
 * Higher potential = closer to deployment
 * @param {object} state - Game state
 * @returns {number} Potential value
 */
function estimatePotential(state) {
    let potential = 0;
    
    // Accuracy progress toward deployment
    const accuracyProgress = state.stats.totalAccuracy / 250000; // First deployment at 250K
    potential += Math.min(accuracyProgress, 1.0) * 10;
    
    // Production capacity
    const productionScore = (state.resources.data.perSecond + 
                           state.resources.compute.perSecond) / 1000;
    potential += Math.min(productionScore, 1.0) * 5;
    
    // Research progress
    const researchProgress = state.stats.completedResearch.length / 40; // 40 total research items
    potential += researchProgress * 3;
    
    // Building infrastructure
    let totalBuildings = 0;
    for (const building of Object.values(state.buildings)) {
        totalBuildings += building.count || 0;
    }
    const buildingScore = Math.min(totalBuildings / 50, 1.0);
    potential += buildingScore * 2;
    
    return potential;
}

/**
 * Calculate episodic return (sum of rewards over an episode)
 * @param {array} rewards - Array of rewards from an episode
 * @param {number} gamma - Discount factor (default 0.99)
 * @returns {number} Discounted return
 */
export function calculateReturn(rewards, gamma = 0.99) {
    let G = 0;
    for (let t = rewards.length - 1; t >= 0; t--) {
        G = rewards[t] + gamma * G;
    }
    return G;
}

/**
 * Normalize rewards (helps with training stability)
 * @param {array} rewards - Array of rewards
 * @returns {array} Normalized rewards
 */
export function normalizeRewards(rewards) {
    if (rewards.length === 0) return [];
    
    // Calculate mean and std
    const mean = rewards.reduce((sum, r) => sum + r, 0) / rewards.length;
    const variance = rewards.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rewards.length;
    const std = Math.sqrt(variance) + 1e-8; // Add epsilon to avoid division by zero
    
    // Normalize: (x - mean) / std
    return rewards.map(r => (r - mean) / std);
}

/**
 * Calculate advantage (for Actor-Critic methods, future enhancement)
 * @param {array} rewards - Rewards
 * @param {array} values - State values from critic
 * @param {number} gamma - Discount factor
 * @returns {array} Advantages
 */
export function calculateAdvantages(rewards, values, gamma = 0.99) {
    const advantages = [];
    let advantage = 0;
    
    for (let t = rewards.length - 1; t >= 0; t--) {
        const td_error = rewards[t] + gamma * (values[t + 1] || 0) - values[t];
        advantage = td_error + gamma * 0.95 * advantage; // GAE with λ=0.95
        advantages.unshift(advantage);
    }
    
    return advantages;
}

/**
 * Get reward statistics for an episode (useful for logging)
 * @param {array} rewards - Array of rewards from an episode
 * @returns {object} Statistics
 */
export function getRewardStats(rewards) {
    if (rewards.length === 0) {
        return {
            total: 0,
            mean: 0,
            min: 0,
            max: 0,
            std: 0
        };
    }
    
    const total = rewards.reduce((sum, r) => sum + r, 0);
    const mean = total / rewards.length;
    const min = Math.min(...rewards);
    const max = Math.max(...rewards);
    
    const variance = rewards.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rewards.length;
    const std = Math.sqrt(variance);
    
    return { total, mean, min, max, std };
}

/**
 * Export reward weights for tuning
 */
export { REWARD_WEIGHTS };

/**
 * Update reward weights (for hyperparameter tuning)
 * @param {object} newWeights - New weight values
 */
export function updateRewardWeights(newWeights) {
    Object.assign(REWARD_WEIGHTS, newWeights);
}
