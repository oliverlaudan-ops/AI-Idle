/**
 * Game Environment Wrapper
 * 
 * Wraps the game state to provide a standard RL environment interface.
 * Handles state observation, action execution, and reward calculation.
 * 
 * Standard RL interface:
 * - observe() -> state
 * - step(action) -> {state, reward, done, info}
 * - reset() -> state
 */

import { encodeState, getDeploymentReadiness } from './state-encoder.js';
import { getValidActions, isDeploymentAction, getAction, isActionValid } from './action-space.js';
import { calculateReward } from './reward-function.js';

export class GameEnvironment {
    /**
     * Create a game environment
     * @param {object} gameState - Reference to main game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        
        // Episode tracking
        this.episodeStartTime = Date.now();
        this.episodeSteps = 0;
        this.episodeReward = 0;
        
        // Previous state for reward calculation
        this.previousState = null;
        
        // Debug flag
        this.debugValidActions = false;
        
        console.log('🎮 Game Environment initialized');
    }
    
    /**
     * Observe current state
     * @returns {Float32Array} Encoded state vector
     */
    observe() {
        return encodeState(this.gameState);
    }
    
    /**
     * Get valid actions for current state
     * @returns {array} Array of valid action IDs
     */
    getValidActions() {
        const validActions = getValidActions(this.gameState);
        
        // Debug logging (only first time)
        if (this.debugValidActions && this.episodeSteps === 0) {
            console.log('\n🔍 Debugging Valid Actions:');
            console.log(`Valid actions: ${validActions.length}`);
            
            // Show sample of what's unlocked
            console.log('\n🏭 Buildings:');
            for (const [id, building] of Object.entries(this.gameState.buildings || {})) {
                if (building.unlocked) {
                    console.log(`  ✅ ${id}: unlocked=${building.unlocked}, count=${building.count}`);
                }
            }
            
            console.log('\n🧠 Models:');
            for (const [id, model] of Object.entries(this.gameState.models || {})) {
                if (model.unlocked) {
                    console.log(`  ✅ ${id}: unlocked=${model.unlocked}`);
                }
            }
            
            console.log('\n🔬 Research:');
            for (const [id, research] of Object.entries(this.gameState.research || {})) {
                if (research.unlocked && !research.researched) {
                    console.log(`  ✅ ${id}: unlocked=${research.unlocked}, researched=${research.researched}`);
                }
            }
            
            console.log(`\n🎯 Valid action IDs: [${validActions.join(', ')}]`);
            console.log('Action names:', validActions.map(id => getAction(id).name));
            console.log('');
            
            this.debugValidActions = false; // Only log once per episode
        }
        
        return validActions;
    }
    
    /**
     * Execute an action and return result
     * @param {number} actionId - Action to execute
     * @returns {object} {state, reward, done, info}
     */
    async step(actionId) {
        // Store previous state
        const previousState = this._cloneGameState();
        this.previousState = previousState;
        
        // Execute action
        const actionResult = await this._executeAction(actionId);
        
        // Get new state
        const newState = this.observe();
        
        // Check if episode is done (deployment happened)
        const done = actionResult.deployed || false;
        
        // Calculate reward
        const reward = calculateReward(
            previousState,
            actionId,
            this.gameState,
            actionResult.success,
            actionResult.deploymentResult
        );
        
        // Update episode tracking
        this.episodeSteps++;
        this.episodeReward += reward;
        
        // Additional info for logging/debugging
        const info = {
            action: getAction(actionId).name,
            success: actionResult.success,
            deployed: actionResult.deployed,
            tokensEarned: actionResult.tokensEarned || 0,
            validActions: this.getValidActions().length,
            deploymentReadiness: getDeploymentReadiness(this.gameState),
            episodeSteps: this.episodeSteps,
            message: actionResult.message
        };
        
        return {
            state: newState,
            reward,
            done,
            info
        };
    }
    
    /**
     * Execute action on game state
     * @param {number} actionId - Action ID
     * @returns {object} Action result
     */
    async _executeAction(actionId) {
        const action = getAction(actionId);
        
        // Import action executor dynamically to avoid circular dependency
        const { executeAction } = await import('./action-executor.js');
        
        return executeAction(this.gameState, action);
    }
    
    /**
     * Reset environment for new episode
     * Note: In AI-Idle, reset happens through deployment, not manual reset
     * @returns {Float32Array} Initial state
     */
    reset() {
        this.episodeStartTime = Date.now();
        this.episodeSteps = 0;
        this.episodeReward = 0;
        this.previousState = null;
        this.debugValidActions = true; // Enable debug logging for new episode
        
        return this.observe();
    }
    
    /**
     * Get episode statistics
     * @returns {object} Episode stats
     */
    getEpisodeStats() {
        const duration = (Date.now() - this.episodeStartTime) / 1000; // seconds
        
        return {
            steps: this.episodeSteps,
            reward: this.episodeReward,
            duration,
            rewardPerStep: this.episodeSteps > 0 ? this.episodeReward / this.episodeSteps : 0,
            stepsPerSecond: duration > 0 ? this.episodeSteps / duration : 0
        };
    }
    
    /**
     * Check if can deploy (episode can end)
     * @returns {boolean} Whether deployment is possible
     */
    canDeploy() {
        const deployInfo = this.gameState.getDeploymentInfo?.();
        return deployInfo && deployInfo.canDeploy;
    }
    
    /**
     * Get deployment info
     * @returns {object} Deployment information
     */
    getDeploymentInfo() {
        return this.gameState.getDeploymentInfo?.() || {
            canDeploy: false,
            tokensEarned: 0,
            lifetimeAccuracy: 0
        };
    }
    
    /**
     * Clone game state for comparison
     * @returns {object} Cloned state (lightweight)
     */
    _cloneGameState() {
        // We don't need a full deep clone, just key stats
        return {
            resources: {
                data: { ...this.gameState.resources.data },
                compute: { ...this.gameState.resources.compute },
                researchPoints: { ...this.gameState.resources.researchPoints }
            },
            stats: { ...this.gameState.stats },
            buildings: JSON.parse(JSON.stringify(this.gameState.buildings)),
            research: JSON.parse(JSON.stringify(this.gameState.research)),
            currentTraining: this.gameState.currentTraining,
            trainingProgress: this.gameState.trainingProgress,
            deployment: this.gameState.deployment ? 
                JSON.parse(JSON.stringify(this.gameState.deployment)) : null,
            models: this.gameState.models,
            canAfford: this.gameState.canAfford.bind(this.gameState),
            getBuildingCost: this.gameState.getBuildingCost?.bind(this.gameState),
            getDeploymentInfo: this.gameState.getDeploymentInfo?.bind(this.gameState)
        };
    }
    
    /**
     * Get environment info for UI display
     * @returns {object} Environment info
     */
    getInfo() {
        const deployInfo = this.getDeploymentInfo();
        
        return {
            episodeSteps: this.episodeSteps,
            episodeReward: this.episodeReward,
            episodeDuration: (Date.now() - this.episodeStartTime) / 1000,
            canDeploy: this.canDeploy(),
            tokensAvailable: deployInfo.tokensEarned,
            deploymentReadiness: getDeploymentReadiness(this.gameState),
            validActions: this.getValidActions().length
        };
    }
}

/**
 * Create a game environment from game state
 * @param {object} gameState - Game state object
 * @returns {GameEnvironment} Environment instance
 */
export function createEnvironment(gameState) {
    return new GameEnvironment(gameState);
}
