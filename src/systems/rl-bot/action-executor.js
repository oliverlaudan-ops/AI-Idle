/**
 * Action Executor
 * 
 * Translates RL bot actions into actual game state mutations.
 * Handles all action types: wait, build, train, research, deploy.
 */

import { ActionType } from './action-space.js';

/**
 * Execute an action on the game state
 * @param {object} gameState - Game state object
 * @param {object} action - Action definition from action space
 * @returns {object} Result {success, deployed, tokensEarned, deploymentResult}
 */
export async function executeAction(gameState, action) {
    try {
        switch (action.type) {
            case ActionType.WAIT:
                return executeWait();
            
            case ActionType.BUILD:
                return executeBuilding(gameState, action.target);
            
            case ActionType.TRAIN:
                return executeTraining(gameState, action.target);
            
            case ActionType.RESEARCH:
                return executeResearch(gameState, action.target);
            
            case ActionType.DEPLOY:
                return await executeDeployment(gameState, action.target);
            
            default:
                console.warn(`Unknown action type: ${action.type}`);
                return { success: false, deployed: false };
        }
    } catch (error) {
        console.error(`Error executing action ${action.name}:`, error);
        return { success: false, deployed: false };
    }
}

/**
 * Execute wait action (do nothing)
 * @returns {object} Result
 */
function executeWait() {
    return {
        success: true,
        deployed: false,
        message: 'Waiting...'
    };
}

/**
 * Execute building purchase
 * @param {object} gameState - Game state
 * @param {string} buildingId - Building identifier
 * @returns {object} Result
 */
function executeBuilding(gameState, buildingId) {
    const building = gameState.buildings[buildingId];
    
    if (!building || !building.unlocked) {
        return {
            success: false,
            deployed: false,
            message: `Building ${buildingId} not unlocked`
        };
    }
    
    // Get building cost
    const cost = gameState.getBuildingCost?.(buildingId);
    if (!cost) {
        return {
            success: false,
            deployed: false,
            message: `Could not calculate cost for ${buildingId}`
        };
    }
    
    // Check if can afford
    if (!gameState.canAfford(cost)) {
        return {
            success: false,
            deployed: false,
            message: `Cannot afford ${buildingId}`
        };
    }
    
    // Purchase building (assuming game state has purchaseBuilding method)
    if (gameState.purchaseBuilding) {
        gameState.purchaseBuilding(buildingId);
        return {
            success: true,
            deployed: false,
            message: `Built ${buildingId}`
        };
    }
    
    // Fallback: manual purchase
    gameState.resources.data.amount -= cost.data || 0;
    gameState.resources.compute.amount -= cost.compute || 0;
    building.count++;
    
    // Recalculate production
    if (gameState.recalculateProduction) {
        gameState.recalculateProduction();
    }
    
    return {
        success: true,
        deployed: false,
        message: `Built ${buildingId}`
    };
}

/**
 * Execute model training
 * @param {object} gameState - Game state
 * @param {string} modelId - Model identifier
 * @returns {object} Result
 */
function executeTraining(gameState, modelId) {
    // Check if already training
    if (gameState.currentTraining) {
        return {
            success: false,
            deployed: false,
            message: 'Already training a model'
        };
    }
    
    const model = gameState.models[modelId];
    
    if (!model || !model.unlocked) {
        return {
            success: false,
            deployed: false,
            message: `Model ${modelId} not unlocked`
        };
    }
    
    // Check requirements
    if (!gameState.canAfford(model.requirements)) {
        return {
            success: false,
            deployed: false,
            message: `Cannot afford to train ${modelId}`
        };
    }
    
    // Start training (assuming game state has startTraining method)
    if (gameState.startTraining) {
        gameState.startTraining(modelId);
        return {
            success: true,
            deployed: false,
            message: `Started training ${modelId}`
        };
    }
    
    // Fallback: manual training start
    gameState.resources.data.amount -= model.requirements.data || 0;
    gameState.resources.compute.amount -= model.requirements.compute || 0;
    gameState.currentTraining = modelId;
    gameState.trainingProgress = 0;
    
    return {
        success: true,
        deployed: false,
        message: `Started training ${modelId}`
    };
}

/**
 * Execute research
 * @param {object} gameState - Game state
 * @param {string} researchId - Research identifier
 * @returns {object} Result
 */
function executeResearch(gameState, researchId) {
    const research = gameState.research[researchId];
    
    if (!research || !research.unlocked || research.researched) {
        return {
            success: false,
            deployed: false,
            message: `Research ${researchId} not available`
        };
    }
    
    // Check if can afford
    if (!gameState.canAfford(research.cost)) {
        return {
            success: false,
            deployed: false,
            message: `Cannot afford research ${researchId}`
        };
    }
    
    // Complete research (assuming game state has completeResearch method)
    if (gameState.completeResearch) {
        gameState.completeResearch(researchId);
        return {
            success: true,
            deployed: false,
            message: `Researched ${researchId}`
        };
    }
    
    // Fallback: manual research
    gameState.resources.researchPoints.amount -= research.cost.researchPoints || 0;
    research.researched = true;
    gameState.stats.completedResearch.push(researchId);
    
    // Apply research effects
    if (gameState.applyResearchEffects) {
        gameState.applyResearchEffects(researchId);
    }
    
    return {
        success: true,
        deployed: false,
        message: `Researched ${researchId}`
    };
}

/**
 * Execute deployment (THE ULTIMATE ACTION!)
 * @param {object} gameState - Game state
 * @param {string} strategyId - Strategy: 'fast', 'standard', or 'complete'
 * @returns {object} Result with deployment details
 */
async function executeDeployment(gameState, strategyId) {
    // Check if can deploy
    const deployInfo = gameState.getDeploymentInfo?.();
    
    if (!deployInfo || !deployInfo.canDeploy) {
        return {
            success: false,
            deployed: false,
            message: 'Cannot deploy yet (need 250K lifetime accuracy)'
        };
    }
    
    // Check if strategy is unlocked
    if (strategyId === 'complete') {
        const deployments = gameState.deployment?.deployments ?? 0;
        if (deployments < 3) {
            return {
                success: false,
                deployed: false,
                message: 'Complete strategy requires 3+ deployments'
            };
        }
    }
    
    // Calculate tokens with strategy multiplier
    const baseTokens = deployInfo.tokensEarned;
    const multipliers = {
        'fast': 0.75,
        'standard': 1.0,
        'complete': 1.5
    };
    const multiplier = multipliers[strategyId] || 1.0;
    const tokensEarned = Math.floor(baseTokens * multiplier);
    
    // Store run duration for reward calculation
    const runDurationMs = Date.now() - (gameState.stats.startTime || Date.now());
    
    // Execute deployment (assuming game state has deploy method)
    if (gameState.deploy) {
        const result = await gameState.deploy(strategyId);
        
        return {
            success: true,
            deployed: true,
            tokensEarned,
            deploymentResult: {
                success: true,
                tokensEarned,
                strategyId,
                runDurationMs,
                lifetimeAccuracy: deployInfo.lifetimeAccuracy
            },
            message: `Deployed with ${strategyId} strategy! Earned ${tokensEarned} tokens!`
        };
    }
    
    // Fallback: manual deployment (simplified)
    console.log(`🚀 DEPLOYMENT: ${strategyId} strategy, ${tokensEarned} tokens`);
    
    // Award tokens
    if (gameState.deployment) {
        gameState.deployment.tokens = (gameState.deployment.tokens || 0) + tokensEarned;
        gameState.deployment.deployments = (gameState.deployment.deployments || 0) + 1;
        gameState.deployment.lifetimeStats = gameState.deployment.lifetimeStats || {};
        gameState.deployment.lifetimeStats.totalTokensEarned = 
            (gameState.deployment.lifetimeStats.totalTokensEarned || 0) + tokensEarned;
    }
    
    return {
        success: true,
        deployed: true,
        tokensEarned,
        deploymentResult: {
            success: true,
            tokensEarned,
            strategyId,
            runDurationMs,
            lifetimeAccuracy: deployInfo.lifetimeAccuracy
        },
        message: `Deployed with ${strategyId} strategy! Earned ${tokensEarned} tokens!`
    };
}

/**
 * Validate action before execution (optional pre-check)
 * @param {object} gameState - Game state
 * @param {object} action - Action to validate
 * @returns {boolean} Whether action is valid
 */
export function validateAction(gameState, action) {
    // This is handled by isActionValid in action-space.js
    // But we can add game-specific validation here if needed
    return true;
}
