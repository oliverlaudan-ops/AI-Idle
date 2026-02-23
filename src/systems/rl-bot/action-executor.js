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
    try {
        const building = gameState.buildings[buildingId];
        
        if (!building || !building.unlocked) {
            return {
                success: false,
                deployed: false,
                message: `Building ${buildingId} not unlocked`
            };
        }
        
        // Use official GameState method if available
        if (gameState.purchaseBuilding && typeof gameState.purchaseBuilding === 'function') {
            const result = gameState.purchaseBuilding(buildingId, 1);
            
            if (result && result.success) {
                return {
                    success: true,
                    deployed: false,
                    message: `Built ${buildingId}`
                };
            }
            
            return {
                success: false,
                deployed: false,
                message: `Cannot afford ${buildingId}`
            };
        }
        
        // Fallback should never be reached if GameState is properly initialized
        return {
            success: false,
            deployed: false,
            message: `GameState.purchaseBuilding() not available`
        };
    } catch (error) {
        console.error(`[Action Executor] Building error:`, error);
        return { success: false, deployed: false };
    }
}

/**
 * Execute model training
 * @param {object} gameState - Game state
 * @param {string} modelId - Model identifier
 * @returns {object} Result
 */
function executeTraining(gameState, modelId) {
    try {
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
        
        // Use official GameState method if available
        if (gameState.startTraining && typeof gameState.startTraining === 'function') {
            const success = gameState.startTraining(modelId);
            
            if (success) {
                return {
                    success: true,
                    deployed: false,
                    message: `Started training ${modelId}`
                };
            }
            
            return {
                success: false,
                deployed: false,
                message: `Cannot start training ${modelId}`
            };
        }
        
        return {
            success: false,
            deployed: false,
            message: `GameState.startTraining() not available`
        };
    } catch (error) {
        console.error(`[Action Executor] Training error:`, error);
        return { success: false, deployed: false };
    }
}

/**
 * Execute research
 * @param {object} gameState - Game state
 * @param {string} researchId - Research identifier
 * @returns {object} Result
 */
function executeResearch(gameState, researchId) {
    try {
        const research = gameState.research?.[researchId];
        
        if (!research || !research.unlocked || research.researched) {
            return {
                success: false,
                deployed: false,
                message: `Research ${researchId} not available`
            };
        }
        
        // Use official GameState method (performResearch from game-state.js line 299)
        if (gameState.performResearch && typeof gameState.performResearch === 'function') {
            const success = gameState.performResearch(researchId);
            
            if (success) {
                return {
                    success: true,
                    deployed: false,
                    message: `Researched ${researchId}`
                };
            }
            
            return {
                success: false,
                deployed: false,
                message: `Cannot afford research ${researchId}`
            };
        }
        
        return {
            success: false,
            deployed: false,
            message: `GameState.performResearch() not available`
        };
    } catch (error) {
        console.error(`[Action Executor] Research error:`, error);
        return { success: false, deployed: false };
    }
}

/**
 * Execute deployment (THE ULTIMATE ACTION!)
 * @param {object} gameState - Game state
 * @param {string} strategyId - Strategy: 'fast', 'standard', or 'complete'
 * @returns {object} Result with deployment details
 */
async function executeDeployment(gameState, strategyId) {
    try {
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
        
        // Set the strategy before deployment
        if (gameState.deployment) {
            gameState.deployment.selectedStrategy = strategyId;
        }
        
        // Store pre-deployment info for reward calculation
        const preDeployTokens = gameState.deployment?.tokens ?? 0;
        const runDurationMs = Date.now() - (gameState.stats?.startTime ?? Date.now());
        const lifetimeAccuracy = gameState.deployment?.lifetimeStats?.totalAccuracy ?? 0;
        
        // Use official GameState method (performDeployment from game-state.js line 378)
        if (gameState.performDeployment && typeof gameState.performDeployment === 'function') {
            const result = gameState.performDeployment();
            
            if (result && result.success) {
                const tokensEarned = result.tokensEarned ?? 0;
                
                return {
                    success: true,
                    deployed: true,
                    tokensEarned,
                    deploymentResult: {
                        success: true,
                        tokensEarned,
                        strategyId,
                        runDurationMs,
                        lifetimeAccuracy,
                        baseTokens: result.baseTokens,
                        strategyMultiplier: result.strategyMultiplier,
                        upgradeMultiplier: result.upgradeMultiplier
                    },
                    message: `🚀 Deployed with ${strategyId} strategy! Earned ${tokensEarned} tokens!`
                };
            }
            
            return {
                success: false,
                deployed: false,
                message: result?.reason ?? 'Deployment failed'
            };
        }
        
        return {
            success: false,
            deployed: false,
            message: `GameState.performDeployment() not available`
        };
    } catch (error) {
        console.error(`[Action Executor] Deployment error:`, error);
        return { success: false, deployed: false };
    }
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
