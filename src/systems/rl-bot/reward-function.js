/**
 * Reward Function for RL Bot
 * 
 * Calculates rewards to guide the RL agent's learning.
 * 
 * PRIMARY OBJECTIVE: Maximize tokens earned through optimal deployment!
 * 
 * Rewards are designed to encourage:
 * - Token acquisition (deployment with maximum efficiency)
 * - Accuracy gain (means to an end - tokens!)
 * - Efficient resource management
 * - Research progress
 * - Optimal deployment timing
 * - SAVING for big buildings and quality trainings
 */

import { isDeploymentAction, getDeploymentStrategy, ActionType, getAction } from './action-space.js';

/**
 * Reward weights (carefully tuned for deployment-focused learning)
 */
const REWARD_WEIGHTS = {
    // Primary objective: TOKENS!
    tokensEarned: 100.0,         // Huge reward per token (was 50)
    deploymentBonus: 50.0,       // Extra for using Complete strategy
    timeEfficiency: 20.0,        // Reward for fast runs
    
    // Secondary objectives (help reach deployment)
    // Buildings: Now cost-based!
    buildingTier1Multiplier: 0.5,    // Small buildings = small reward
    buildingTier2Multiplier: 2.5,    // Medium buildings = medium reward
    buildingTier3Multiplier: 12.5,   // Big buildings = big reward!
    
    // Training: Now cost-based + accuracy!
    trainingCostScale: 0.00002,      // Scale by data+compute cost
    trainingAccuracyBonus: 20.0,     // Bonus scaled by accuracy (unchanged)
    
    researchSuccess: 10.0,       // Successful research completion
    accuracy: 0.1,               // Per point of accuracy
    efficiency: 0.5,             // Resource balance bonus
    
    // Penalties (MUCH REDUCED!)
    cannotAfford: -0.1,          // Tiny penalty for trying expensive actions
    invalidAction: -1.0,         // Small penalty for truly invalid actions
    idle: -0.05,                 // Tiny penalty for waiting when could act
    prematureDeployment: -5.0    // Medium penalty for deploying too early
};

/**
 * Calculate reward for a state transition
 * @param {object} previousState - State before action
 * @param {number} actionId - Action taken
 * @param {object} newState - State after action
 * @param {boolean} actionSucceeded - Whether action was valid and executed
 * @param {object} deploymentResult - Deployment result if action was deployment
 * @returns {number} Reward value
 */
export function calculateReward(previousState, actionId, newState, actionSucceeded, deploymentResult = null) {
    let reward = 0;
    const action = getAction(actionId);
    
    // ========== Invalid Action Handling ==========
    if (!actionSucceeded) {
        // Check WHY it failed - different penalties!
        const actionInfo = newState._lastActionInfo || {};
        
        // If failed because "cannot afford" - tiny penalty (bot should try!)
        if (actionInfo.message && 
            (actionInfo.message.includes('Cannot afford') || 
             actionInfo.message.includes('cannot afford') ||
             actionInfo.message.includes('Not enough'))) {
            return REWARD_WEIGHTS.cannotAfford; // -0.1 (almost neutral!)
        }
        
        // Other failures (not unlocked, etc.) - small penalty
        return REWARD_WEIGHTS.invalidAction; // -1.0
    }
    
    // ========== PRIMARY REWARD: DEPLOYMENT SUCCESS ==========
    if (deploymentResult && deploymentResult.success) {
        const tokensEarned = deploymentResult.tokensEarned;
        const strategyId = deploymentResult.strategyId;
        const runDuration = deploymentResult.runDurationMs / 1000; // Convert to seconds
        
        // MASSIVE REWARD FOR TOKENS!
        reward += tokensEarned * REWARD_WEIGHTS.tokensEarned;
        
        // BONUS: Complete Strategy (1.5x multiplier)
        if (strategyId === 'complete') {
            reward += REWARD_WEIGHTS.deploymentBonus;
        }
        
        // TIME EFFICIENCY: Reward faster runs
        // Optimal run time: 300-600 seconds (5-10 minutes)
        const timeEfficiency = calculateTimeEfficiency(runDuration);
        reward += timeEfficiency * REWARD_WEIGHTS.timeEfficiency;
        
        console.log(`🎉 DEPLOYMENT REWARD: ${reward.toFixed(0)} (${tokensEarned} tokens, ${strategyId} strategy, ${runDuration.toFixed(0)}s)`);
        
        return reward; // Return immediately - this is the ultimate success!
    }
    
    // ========== Check for Premature Deployment Attempt ==========
    if (isDeploymentAction(actionId)) {
        // If we tried to deploy but couldn't (not enough accuracy)
        const lifetimeAccuracy = previousState.deployment?.lifetimeStats?.totalAccuracy ?? 0;
        if (lifetimeAccuracy < 60000) {
            return REWARD_WEIGHTS.prematureDeployment;
        }
    }
    
    // ========== SUCCESS REWARDS ==========
    
    // Building Purchase Success - NOW COST-BASED!
    if (action.type === ActionType.BUILD) {
        const buildingId = action.target;
        const building = newState.buildings[buildingId];
        
        if (building) {
            const tier = building.tier || 1;
            const baseCost = building.baseCost || {};
            
            // Calculate total base cost (data + compute)
            const totalBaseCost = (baseCost.data || 0) + (baseCost.compute || 0);
            
            // Apply tier multiplier
            let multiplier = REWARD_WEIGHTS.buildingTier1Multiplier;
            if (tier === 2) multiplier = REWARD_WEIGHTS.buildingTier2Multiplier;
            if (tier === 3) multiplier = REWARD_WEIGHTS.buildingTier3Multiplier;
            
            // Reward = sqrt(cost) * tier_multiplier
            // This gives bigger rewards for expensive buildings!
            const buildingReward = Math.sqrt(totalBaseCost) * multiplier;
            reward += buildingReward;
            
            console.log(`🏗️ Building reward: ${buildingReward.toFixed(1)} tokens (${buildingId}, tier ${tier}, cost ${totalBaseCost})`);
        }
    }
    
    // Training Start Success - NOW COST + ACCURACY BASED!
    if (action.type === ActionType.TRAIN) {
        const modelId = action.target;
        const model = newState.models[modelId];
        
        if (model) {
            // Get training cost
            const requirements = model.requirements || {};
            const dataCost = requirements.data || 0;
            const computeCost = requirements.compute || 0;
            const totalCost = dataCost + computeCost;
            
            // Base reward from cost (logarithmic scaling)
            const costReward = Math.log10(totalCost + 1) * 10 * REWARD_WEIGHTS.trainingCostScale / 0.00002;
            
            // Get accuracy from the action result
            const trainingAccuracy = newState._lastTrainingAccuracy || model.accuracy || 50;
            
            // Accuracy bonus (0-20 tokens based on accuracy)
            const accuracyBonus = (trainingAccuracy / 100) * REWARD_WEIGHTS.trainingAccuracyBonus;
            
            reward += costReward + accuracyBonus;
            
            // Log the reward breakdown for debugging
            console.log(`🎓 Training reward: ${(costReward + accuracyBonus).toFixed(1)} tokens (${modelId}, cost ${totalCost}, accuracy ${trainingAccuracy.toFixed(1)}%)`);
        }
    }
    
    // Research Completion Success
    if (action.type === ActionType.RESEARCH) {
        reward += REWARD_WEIGHTS.researchSuccess; // +10.0
    }
    
    // ========== Secondary Objectives (during run) ==========
    
    // Accuracy Gain (small reward, accumulates over time)
    const accuracyGain = newState.stats.totalAccuracy - previousState.stats.totalAccuracy;
    reward += accuracyGain * REWARD_WEIGHTS.accuracy;
    
    // Efficiency Bonus
    const efficiencyBonus = calculateEfficiencyBonus(newState);
    reward += efficiencyBonus * REWARD_WEIGHTS.efficiency;
    
    // Idle Penalty (tiny now!)
    if (actionId === 0) { // Wait action
        const hasResources = newState.resources.data.amount > 100 && 
                           newState.resources.compute.amount > 100;
        if (hasResources) {
            reward += REWARD_WEIGHTS.idle; // -0.05
        }
    }
    
    return reward;
}

/**
 * Calculate time efficiency bonus
 * Rewards runs that are fast but not rushed
 * @param {number} runDuration - Run duration in seconds
 * @returns {number} Efficiency score [0, 1]
 */
function calculateTimeEfficiency(runDuration) {
    // Optimal range: 300-600 seconds (5-10 minutes)
    const optimalMin = 300;
    const optimalMax = 600;
    
    if (runDuration < optimalMin) {
        // Too fast - probably premature
        return 0.3;
    } else if (runDuration <= optimalMax) {
        // Perfect timing!
        return 1.0;
    } else {
        // Too slow - diminishing returns
        const penalty = Math.max(0, 1.0 - (runDuration - optimalMax) / 1800); // Decay over 30 min
        return penalty;
    }
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
 * @param {object} deploymentResult - Deployment result
 * @returns {number} Shaped reward
 */
export function calculateShapedReward(previousState, actionId, newState, actionSucceeded, deploymentResult = null) {
    let reward = calculateReward(previousState, actionId, newState, actionSucceeded, deploymentResult);
    
    // Don't add shaping for deployment - reward is already huge
    if (deploymentResult && deploymentResult.success) {
        return reward;
    }
    
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
    
    // PRIMARY: Accuracy progress toward deployment (most important!)
    const lifetimeAccuracy = state.deployment?.lifetimeStats?.totalAccuracy ?? state.stats.totalAccuracy;
    const accuracyProgress = lifetimeAccuracy / 60000; // First deployment at 60K
    potential += Math.min(accuracyProgress, 1.0) * 50; // Huge potential weight!
    
    // Production capacity (helps reach deployment faster)
    const productionScore = (state.resources.data.perSecond + 
                           state.resources.compute.perSecond) / 1000;
    potential += Math.min(productionScore, 1.0) * 10;
    
    // Research progress (force multipliers)
    const researchProgress = state.stats.completedResearch.length / 40; // 40 total research items
    potential += researchProgress * 5;
    
    // Building infrastructure
    let totalBuildings = 0;
    for (const building of Object.values(state.buildings)) {
        totalBuildings += building.count || 0;
    }
    const buildingScore = Math.min(totalBuildings / 50, 1.0);
    potential += buildingScore * 3;
    
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
