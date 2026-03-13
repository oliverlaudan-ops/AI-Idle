/**
 * Action Space Definition for RL Bot
 * 
 * Defines all possible actions the bot can take in the game.
 * Each action has an ID, type, and target.
 * 
 * IMPORTANT: Uses actual game IDs from AI-Idle (verified from debug output)
 */

/**
 * Action types
 */
export const ActionType = {
    WAIT: 'wait',
    BUILD: 'build',
    TRAIN: 'train',
    RESEARCH: 'research',
    DEPLOY: 'deploy',
    SHOP: 'shop'
};

/**
 * Complete action space - using ACTUAL game IDs from debug output!
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
    
    // 10-15. Model training (6 models from actual game - includes rlagent and llm!)
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
    {
        id: 14,
        type: ActionType.TRAIN,
        target: 'rlagent',
        name: 'Train RL Agent'
    },
    {
        id: 15,
        type: ActionType.TRAIN,
        target: 'llm',
        name: 'Train LLM'
    },
    
    // 16-33. Research items (18 research from actual game - complete list!)
    {
        id: 16,
        type: ActionType.RESEARCH,
        target: 'momentum',
        name: 'Research Momentum'
    },
    {
        id: 17,
        type: ActionType.RESEARCH,
        target: 'leakyrelu',
        name: 'Research Leaky ReLU'
    },
    {
        id: 18,
        type: ActionType.RESEARCH,
        target: 'cnn',
        name: 'Research CNN'
    },
    {
        id: 19,
        type: ActionType.RESEARCH,
        target: 'batchnorm',
        name: 'Research Batch Normalization'
    },
    {
        id: 20,
        type: ActionType.RESEARCH,
        target: 'weightdecay',
        name: 'Research Weight Decay'
    },
    {
        id: 21,
        type: ActionType.RESEARCH,
        target: 'gpu_acceleration',
        name: 'Research GPU Acceleration'
    },
    {
        id: 22,
        type: ActionType.RESEARCH,
        target: 'data_augmentation',
        name: 'Research Data Augmentation'
    },
    {
        id: 23,
        type: ActionType.RESEARCH,
        target: 'hyperparameter_search',
        name: 'Research Hyperparameter Search'
    },
    {
        id: 24,
        type: ActionType.RESEARCH,
        target: 'bias_detection',
        name: 'Research Bias Detection'
    },
    {
        id: 25,
        type: ActionType.RESEARCH,
        target: 'adam',
        name: 'Research Adam'
    },
    {
        id: 26,
        type: ActionType.RESEARCH,
        target: 'gelu',
        name: 'Research GELU'
    },
    {
        id: 27,
        type: ActionType.RESEARCH,
        target: 'rnn',
        name: 'Research RNN'
    },
    {
        id: 28,
        type: ActionType.RESEARCH,
        target: 'layernorm',
        name: 'Research Layer Normalization'
    },
    {
        id: 29,
        type: ActionType.RESEARCH,
        target: 'mixed_precision',
        name: 'Research Mixed Precision'
    },
    {
        id: 30,
        type: ActionType.RESEARCH,
        target: 'transfer_learning',
        name: 'Research Transfer Learning'
    },
    {
        id: 31,
        type: ActionType.RESEARCH,
        target: 'nas',
        name: 'Research Neural Architecture Search'
    },
    {
        id: 32,
        type: ActionType.RESEARCH,
        target: 'interpretability',
        name: 'Research Interpretability'
    },
    
    // 33-35. Deployment actions (3 strategies)
    {
        id: 33,
        type: ActionType.DEPLOY,
        target: 'fast',
        name: 'Deploy (Fast Strategy)',
        tokenMultiplier: 0.75,
        description: 'Quick deployment for fast iteration'
    },
    {
        id: 34,
        type: ActionType.DEPLOY,
        target: 'standard',
        name: 'Deploy (Standard Strategy)',
        tokenMultiplier: 1.0,
        description: 'Balanced deployment strategy'
    },
    {
        id: 35,
        type: ActionType.DEPLOY,
        target: 'complete',
        name: 'Deploy (Complete Strategy)',
        tokenMultiplier: 1.5,
        description: 'Maximum tokens, requires 3+ deployments'
    },
    
    // 36-44. Cloud Providers (v0.9.0) - Premium buildings
    {
        id: 36,
        type: ActionType.BUILD,
        target: 'aws_credits',
        name: 'Build AWS Credits',
        premium: true
    },
    {
        id: 37,
        type: ActionType.BUILD,
        target: 'aws_s3',
        name: 'Build AWS S3 Storage',
        premium: true
    },
    {
        id: 38,
        type: ActionType.BUILD,
        target: 'aws_sagemaker',
        name: 'Build AWS SageMaker',
        premium: true
    },
    {
        id: 39,
        type: ActionType.BUILD,
        target: 'gcp_compute',
        name: 'Build GCP Compute',
        premium: true
    },
    {
        id: 40,
        type: ActionType.BUILD,
        target: 'gcp_bigquery',
        name: 'Build GCP BigQuery',
        premium: true
    },
    {
        id: 41,
        type: ActionType.BUILD,
        target: 'gcp_vertex',
        name: 'Build GCP Vertex AI',
        premium: true
    },
    {
        id: 42,
        type: ActionType.BUILD,
        target: 'azure_vm',
        name: 'Build Azure VMs',
        premium: true
    },
    {
        id: 43,
        type: ActionType.BUILD,
        target: 'azure_cosmos',
        name: 'Build Azure Cosmos DB',
        premium: true
    },
    {
        id: 44,
        type: ActionType.BUILD,
        target: 'azure_ml',
        name: 'Build Azure ML',
        premium: true
    },
    
    // 45-52. New Research Items (v0.9.0) - Top priorities
    {
        id: 45,
        type: ActionType.RESEARCH,
        target: 'chain_of_thought',
        name: 'Research Chain-of-Thought'
    },
    {
        id: 46,
        type: ActionType.RESEARCH,
        target: 'quantization',
        name: 'Research Quantization'
    },
    {
        id: 47,
        type: ActionType.RESEARCH,
        target: 'rag',
        name: 'Research RAG'
    },
    {
        id: 48,
        type: ActionType.RESEARCH,
        target: 'moe',
        name: 'Research Mixture of Experts'
    },
    {
        id: 49,
        type: ActionType.RESEARCH,
        target: 'diffusion',
        name: 'Research Diffusion Models'
    },
    
    // 50-52. Shop Actions (v0.9.0) - Redeem tokens
    {
        id: 50,
        type: ActionType.SHOP,
        target: 'redeem_cheap',
        name: 'Redeem Cheap Token',
        costTier: 'cheap',
        description: 'Redeem low-cost prestige token'
    },
    {
        id: 51,
        type: ActionType.SHOP,
        target: 'redeem_medium',
        name: 'Redeem Medium Token',
        costTier: 'medium',
        description: 'Redeem medium-cost prestige token'
    },
    {
        id: 52,
        type: ActionType.SHOP,
        target: 'redeem_expensive',
        name: 'Redeem Expensive Token',
        costTier: 'expensive',
        description: 'Redeem high-cost prestige token'
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
    return ACTION_SPACE.length; // Now 47 actions! (v0.9.0)
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
    
    // Shop - check if tokens available and tier unlocked
    if (action.type === ActionType.SHOP) {
        const tokens = gameState.tokens ?? 0;
        const costTier = action.costTier;
        
        // Simple cost check - bot will learn from failed attempts
        if (costTier === 'cheap' && tokens >= 100) return true;
        if (costTier === 'medium' && tokens >= 500) return true;
        if (costTier === 'expensive' && tokens >= 2000) return true;
        
        return false;
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
