/**
 * Action Space Definition for RL Bot
 * 
 * Defines all possible actions the bot can take in the game.
 * Each action has an ID, type, and target.
 */

/**
 * Action types
 */
export const ActionType = {
    WAIT: 'wait',
    BUILD: 'build',
    TRAIN: 'train',
    RESEARCH: 'research',
    DEPLOY: 'deploy'        // NEW: Deployment/Prestige action
};

/**
 * Complete action space (29 actions)
 */
export const ACTION_SPACE = [
    // 0. Do nothing (always valid)
    {
        id: 0,
        type: ActionType.WAIT,
        target: null,
        name: 'Wait'
    },
    
    // 1-7. Building purchases (7 actions)
    {
        id: 1,
        type: ActionType.BUILD,
        target: 'dataCenter',
        name: 'Build Data Center'
    },
    {
        id: 2,
        type: ActionType.BUILD,
        target: 'computeCluster',
        name: 'Build Compute Cluster'
    },
    {
        id: 3,
        type: ActionType.BUILD,
        target: 'gpuFarm',
        name: 'Build GPU Farm'
    },
    {
        id: 4,
        type: ActionType.BUILD,
        target: 'researchLab',
        name: 'Build Research Lab'
    },
    {
        id: 5,
        type: ActionType.BUILD,
        target: 'dataWarehouse',
        name: 'Build Data Warehouse'
    },
    {
        id: 6,
        type: ActionType.BUILD,
        target: 'tensorCore',
        name: 'Build Tensor Core'
    },
    {
        id: 7,
        type: ActionType.BUILD,
        target: 'quantumProcessor',
        name: 'Build Quantum Processor'
    },
    
    // 8-17. Model training (10 actions)
    {
        id: 8,
        type: ActionType.TRAIN,
        target: 'linearRegression',
        name: 'Train Linear Regression'
    },
    {
        id: 9,
        type: ActionType.TRAIN,
        target: 'logisticRegression',
        name: 'Train Logistic Regression'
    },
    {
        id: 10,
        type: ActionType.TRAIN,
        target: 'neuralNetwork',
        name: 'Train Neural Network'
    },
    {
        id: 11,
        type: ActionType.TRAIN,
        target: 'deepNeuralNetwork',
        name: 'Train Deep Neural Network'
    },
    {
        id: 12,
        type: ActionType.TRAIN,
        target: 'cnn',
        name: 'Train CNN'
    },
    {
        id: 13,
        type: ActionType.TRAIN,
        target: 'rnn',
        name: 'Train RNN'
    },
    {
        id: 14,
        type: ActionType.TRAIN,
        target: 'lstm',
        name: 'Train LSTM'
    },
    {
        id: 15,
        type: ActionType.TRAIN,
        target: 'gru',
        name: 'Train GRU'
    },
    {
        id: 16,
        type: ActionType.TRAIN,
        target: 'transformer',
        name: 'Train Transformer'
    },
    {
        id: 17,
        type: ActionType.TRAIN,
        target: 'gpt',
        name: 'Train GPT'
    },
    
    // 18-25. Critical research items (8 actions)
    {
        id: 18,
        type: ActionType.RESEARCH,
        target: 'sgd',
        name: 'Research SGD'
    },
    {
        id: 19,
        type: ActionType.RESEARCH,
        target: 'adam',
        name: 'Research Adam'
    },
    {
        id: 20,
        type: ActionType.RESEARCH,
        target: 'relu',
        name: 'Research ReLU'
    },
    {
        id: 21,
        type: ActionType.RESEARCH,
        target: 'batchNorm',
        name: 'Research Batch Normalization'
    },
    {
        id: 22,
        type: ActionType.RESEARCH,
        target: 'dropout',
        name: 'Research Dropout'
    },
    {
        id: 23,
        type: ActionType.RESEARCH,
        target: 'attention',
        name: 'Research Attention Mechanism'
    },
    {
        id: 24,
        type: ActionType.RESEARCH,
        target: 'transferLearning',
        name: 'Research Transfer Learning'
    },
    {
        id: 25,
        type: ActionType.RESEARCH,
        target: 'dataAugmentation',
        name: 'Research Data Augmentation'
    },
    
    // 26-28. Deployment actions (3 actions) - THE ULTIMATE GOAL!
    {
        id: 26,
        type: ActionType.DEPLOY,
        target: 'fast',
        name: 'Deploy (Fast Strategy)',
        tokenMultiplier: 0.75,
        description: 'Quick deployment for fast iteration'
    },
    {
        id: 27,
        type: ActionType.DEPLOY,
        target: 'standard',
        name: 'Deploy (Standard Strategy)',
        tokenMultiplier: 1.0,
        description: 'Balanced deployment strategy'
    },
    {
        id: 28,
        type: ActionType.DEPLOY,
        target: 'complete',
        name: 'Deploy (Complete Strategy)',
        tokenMultiplier: 1.5,
        description: 'Maximum tokens, requires 3+ deployments'
    }
];

/**
 * Get action by ID
 * @param {number} actionId - Action ID (0-28)
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
    return ACTION_SPACE.length;
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
