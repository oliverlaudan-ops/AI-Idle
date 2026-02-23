/**
 * Action Space Definition for RL Bot
 * 
 * Defines all possible actions the bot can take in the game.
 * Each action has an ID, type, and target.
 * 
 * IMPORTANT: Uses actual game IDs from AI-Idle (not generic names)
 */

/**
 * Action types
 */
export const ActionType = {
    WAIT: 'wait',
    BUILD: 'build',
    TRAIN: 'train',
    RESEARCH: 'research',
    DEPLOY: 'deploy'
};

/**
 * Complete action space - using ACTUAL game IDs!
 */
export const ACTION_SPACE = [
    // 0. Do nothing (always valid)
    {
        id: 0,
        type: ActionType.WAIT,
        target: null,
        name: 'Wait'
    },
    
    // 1-9. Building purchases (9 buildings from actual game)
    {
        id: 1,
        type: ActionType.BUILD,
        target: 'datacollector',
        name: 'Build Data Collector'
    },
    {
        id: 2,
        type: ActionType.BUILD,
        target: 'cpucore',
        name: 'Build CPU Core'
    },
    {
        id: 3,
        type: ActionType.BUILD,
        target: 'storageserver',
        name: 'Build Storage Server'
    },
    {
        id: 4,
        type: ActionType.BUILD,
        target: 'gpucluster',
        name: 'Build GPU Cluster'
    },
    {
        id: 5,
        type: ActionType.BUILD,
        target: 'datapipeline',
        name: 'Build Data Pipeline'
    },
    {
        id: 6,
        type: ActionType.BUILD,
        target: 'coolingsystem',
        name: 'Build Cooling System'
    },
    {
        id: 7,
        type: ActionType.BUILD,
        target: 'tpuarray',
        name: 'Build TPU Array'
    },
    {
        id: 8,
        type: ActionType.BUILD,
        target: 'distributedsystem',
        name: 'Build Distributed System'
    },
    {
        id: 9,
        type: ActionType.BUILD,
        target: 'quantumprocessor',
        name: 'Build Quantum Processor'
    },
    
    // 10-13. Model training (4 models from actual game)
    {
        id: 10,
        type: ActionType.TRAIN,
        target: 'digitrecognition',
        name: 'Train Digit Recognition'
    },
    {
        id: 11,
        type: ActionType.TRAIN,
        target: 'imageclassification',
        name: 'Train Image Classification'
    },
    {
        id: 12,
        type: ActionType.TRAIN,
        target: 'objectdetection',
        name: 'Train Object Detection'
    },
    {
        id: 13,
        type: ActionType.TRAIN,
        target: 'nlpmodel',
        name: 'Train NLP Model'
    },
    
    // 14-22. Research items (9 research from actual game)
    {
        id: 14,
        type: ActionType.RESEARCH,
        target: 'momentum',
        name: 'Research Momentum'
    },
    {
        id: 15,
        type: ActionType.RESEARCH,
        target: 'leakyrelu',
        name: 'Research Leaky ReLU'
    },
    {
        id: 16,
        type: ActionType.RESEARCH,
        target: 'cnn',
        name: 'Research CNN'
    },
    {
        id: 17,
        type: ActionType.RESEARCH,
        target: 'batchnorm',
        name: 'Research Batch Normalization'
    },
    {
        id: 18,
        type: ActionType.RESEARCH,
        target: 'weightdecay',
        name: 'Research Weight Decay'
    },
    {
        id: 19,
        type: ActionType.RESEARCH,
        target: 'gpu_acceleration',
        name: 'Research GPU Acceleration'
    },
    {
        id: 20,
        type: ActionType.RESEARCH,
        target: 'data_augmentation',
        name: 'Research Data Augmentation'
    },
    {
        id: 21,
        type: ActionType.RESEARCH,
        target: 'hyperparameter_search',
        name: 'Research Hyperparameter Search'
    },
    {
        id: 22,
        type: ActionType.RESEARCH,
        target: 'bias_detection',
        name: 'Research Bias Detection'
    },
    
    // 23-25. Deployment actions (3 strategies)
    {
        id: 23,
        type: ActionType.DEPLOY,
        target: 'fast',
        name: 'Deploy (Fast Strategy)',
        tokenMultiplier: 0.75,
        description: 'Quick deployment for fast iteration'
    },
    {
        id: 24,
        type: ActionType.DEPLOY,
        target: 'standard',
        name: 'Deploy (Standard Strategy)',
        tokenMultiplier: 1.0,
        description: 'Balanced deployment strategy'
    },
    {
        id: 25,
        type: ActionType.DEPLOY,
        target: 'complete',
        name: 'Deploy (Complete Strategy)',
        tokenMultiplier: 1.5,
        description: 'Maximum tokens, requires 3+ deployments'
    }
];

/**
 * Get action by ID
 * @param {number} actionId - Action ID
 * @returns {object} Action definition
 */
export function getAction(actionId) {
    if (actionId < 0 || actionId >= ACTION_SPACE.length) {
        throw new Error(`Invalid action ID: ${actionId}`);
    }
    return ACTION_SPACE[actionId];
}

/**
 * Get number of possible actions
 * @returns {number} Action space size
 */
export function getActionSpaceSize() {
    return ACTION_SPACE.length; // Now 26 actions (was 29)
}

/**
 * Get all actions of a specific type
 * @param {string} type - Action type (ActionType enum)
 * @returns {array} Array of actions
 */
export function getActionsByType(type) {
    return ACTION_SPACE.filter(action => action.type === type);
}

/**
 * Get action ID by target
 * @param {string} type - Action type
 * @param {string} target - Target identifier
 * @returns {number} Action ID or -1 if not found
 */
export function getActionId(type, target) {
    const action = ACTION_SPACE.find(a => a.type === type && a.target === target);
    return action ? action.id : -1;
}

/**
 * Check if action is valid given current game state
 * 
 * RELAXED VALIDATION: We allow actions even if they might fail.
 * The bot will learn from negative rewards which actions work.
 * 
 * @param {object} gameState - Current game state
 * @param {number} actionId - Action to validate
 * @returns {boolean} Whether action is valid
 */
export function isActionValid(gameState, actionId) {
    const action = getAction(actionId);
    
    // Wait is always valid
    if (action.type === ActionType.WAIT) {
        return true;
    }
    
    // Building purchase - check if unlocked (we let the bot try even if can't afford)
    if (action.type === ActionType.BUILD) {
        const building = gameState.buildings?.[action.target];
        if (!building) return false;
        
        // Only check if unlocked - bot will learn from failed purchase attempts
        return building.unlocked === true;
    }
    
    // Model training - check if unlocked and not currently training
    if (action.type === ActionType.TRAIN) {
        // Can't train if already training
        if (gameState.currentTraining) return false;
        
        const model = gameState.models?.[action.target];
        if (!model) return false;
        
        // Only check if unlocked - bot will learn from failed training attempts
        return model.unlocked === true;
    }
    
    // Research - check if unlocked and not already researched
    if (action.type === ActionType.RESEARCH) {
        const research = gameState.research?.[action.target];
        if (!research) return false;
        
        // Must be unlocked and not already researched
        return research.unlocked === true && research.researched !== true;
    }
    
    // Deployment - THE ULTIMATE ACTION!
    if (action.type === ActionType.DEPLOY) {
        // Check if we have enough lifetime accuracy
        try {
            const deployInfo = gameState.getDeploymentInfo?.();
            if (!deployInfo || !deployInfo.canDeploy) return false;
            
            // Check if strategy is unlocked
            if (action.target === 'complete') {
                const deployments = gameState.deployment?.deployments ?? 0;
                if (deployments < 3) return false; // Complete requires 3+ deployments
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    return false;
}

/**
 * Get all valid actions for current game state
 * @param {object} gameState - Current game state
 * @returns {array} Array of valid action IDs
 */
export function getValidActions(gameState) {
    const validActions = [];
    
    for (let i = 0; i < ACTION_SPACE.length; i++) {
        if (isActionValid(gameState, i)) {
            validActions.push(i);
        }
    }
    
    // Always include Wait as fallback
    if (validActions.length === 0) {
        validActions.push(0); // Wait
    }
    
    return validActions;
}

/**
 * Get action mask (binary array indicating valid actions)
 * Useful for masked action selection in RL
 * @param {object} gameState - Current game state
 * @returns {array} Binary mask [1,0,1,...] where 1 = valid, 0 = invalid
 */
export function getActionMask(gameState) {
    const mask = new Array(ACTION_SPACE.length);
    
    for (let i = 0; i < ACTION_SPACE.length; i++) {
        mask[i] = isActionValid(gameState, i) ? 1 : 0;
    }
    
    return mask;
}

/**
 * Check if action is a deployment action
 * @param {number} actionId - Action ID
 * @returns {boolean} Whether this is a deployment action
 */
export function isDeploymentAction(actionId) {
    const action = getAction(actionId);
    return action.type === ActionType.DEPLOY;
}

/**
 * Get deployment strategy from action ID
 * @param {number} actionId - Action ID
 * @returns {string|null} Strategy name or null if not a deployment action
 */
export function getDeploymentStrategy(actionId) {
    if (!isDeploymentAction(actionId)) return null;
    const action = getAction(actionId);
    return action.target;
}
