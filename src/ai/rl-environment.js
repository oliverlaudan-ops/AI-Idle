/**
 * RL Environment - Reinforcement Learning Environment for AI-Idle
 * 
 * Wraps the game as an OpenAI Gym-style environment for training RL agents.
 * Implements the standard RL interface: reset(), step(action), etc.
 */

import { AIInterface } from './ai-interface.js';

export class RLEnvironment {
    constructor(gameState) {
        this.game = gameState;
        this.aiInterface = new AIInterface(gameState);
        
        // Environment configuration
        this.config = {
            stateSize: 20,
            actionSize: 15,
            maxSteps: 1000,
            rewardScale: 1.0
        };
        
        // Episode tracking
        this.currentStep = 0;
        this.episodeReward = 0;
        this.previousState = null;
    }

    /**
     * Reset environment to initial state
     * Returns initial observation
     */
    reset() {
        console.log('[RLEnvironment] Resetting environment...');
        
        // Reset game state
        const resetInfo = this.aiInterface.reset();
        
        // Reset episode tracking
        this.currentStep = 0;
        this.episodeReward = 0;
        this.previousState = this.getState();
        
        return {
            state: this.previousState,
            info: resetInfo
        };
    }

    /**
     * Execute action and return next state, reward, done, info
     * 
     * @param {number} actionId - Action to execute (0-14)
     * @returns {object} { state, reward, done, info }
     */
    step(actionId) {
        // Validate action
        if (actionId < 0 || actionId >= this.config.actionSize) {
            console.warn(`[RLEnvironment] Invalid action: ${actionId}`);
            return {
                state: this.getState(),
                reward: -1.0, // Penalty for invalid action
                done: false,
                info: { error: 'Invalid action' }
            };
        }

        // Get action info
        const action = this.aiInterface.getActions()[actionId];
        
        // Store state before action
        const previousState = { ...this.previousState };
        
        // Execute action
        const actionResult = this.aiInterface.executeAction(actionId);
        
        // Update game (simulate time passing)
        this.game.update(0.1); // Simulate 100ms tick
        
        // Get new state
        const newState = this.getState();
        
        // Calculate reward
        const reward = this.calculateReward(previousState, action, newState, actionResult);
        
        // Update tracking
        this.currentStep++;
        this.episodeReward += reward;
        this.previousState = newState;
        
        // Check if episode is done
        const done = this.isDone();
        
        // Additional info
        const info = {
            step: this.currentStep,
            episodeReward: this.episodeReward,
            action: action.name,
            actionSuccess: actionResult.success,
            actionReason: actionResult.reason
        };
        
        return {
            state: newState,
            reward: reward * this.config.rewardScale,
            done: done,
            info: info
        };
    }

    /**
     * Get current state vector
     */
    getState() {
        return this.aiInterface.getStateVector();
    }

    /**
     * Calculate reward for this step
     */
    calculateReward(previousState, action, newState, actionResult) {
        let reward = 0;

        // === Primary Rewards ===
        
        // Reward for accuracy gain (main objective)
        const accuracyGain = newState[3] - previousState[3]; // accuracy is index 3
        reward += accuracyGain * 100; // Scale up for significance

        // Reward for data production rate increase
        const dataRateGain = newState[1] - previousState[1]; // data rate is index 1
        reward += dataRateGain * 10;

        // === Secondary Rewards ===

        // Reward for successful actions
        if (actionResult.success) {
            reward += 0.5;
        } else {
            // Small penalty for failed actions
            reward -= 0.2;
        }

        // Reward for building diversity (encourages exploration)
        const buildingDiversity = newState.slice(4, 10).filter(v => v > 0.01).length;
        reward += buildingDiversity * 0.3;

        // Reward for research progress
        const researchGain = newState[11] - previousState[11]; // research count is index 11
        reward += researchGain * 5;

        // === Penalties ===

        // Small penalty for waiting (encourage action)
        if (action.name === 'wait') {
            reward -= 0.1;
        }

        // Penalty for inefficient resource usage
        const dataAmount = newState[0]; // data amount is index 0
        if (dataAmount > 0.9) {
            // Penalty for hoarding resources (should spend them)
            reward -= 0.5;
        }

        // === Achievement Bonus ===
        const achievementGain = newState[15] - previousState[15]; // achievement count is index 15
        if (achievementGain > 0) {
            reward += 20; // Big bonus for achievements
        }

        return reward;
    }

    /**
     * Check if episode is done
     */
    isDone() {
        // Episode ends when:
        // 1. Max steps reached
        if (this.currentStep >= this.config.maxSteps) {
            console.log('[RLEnvironment] Episode done: Max steps reached');
            return true;
        }

        // 2. First achievement unlocked (success condition)
        const achievementCount = this.previousState[15]; // index 15
        if (achievementCount > 0) {
            console.log('[RLEnvironment] Episode done: Achievement unlocked!');
            return true;
        }

        // 3. High accuracy reached
        const accuracy = this.previousState[3]; // index 3
        if (accuracy > 0.5) { // 50% accuracy
            console.log('[RLEnvironment] Episode done: High accuracy reached');
            return true;
        }

        return false;
    }

    /**
     * Get action space info
     */
    getActionSpace() {
        return {
            size: this.config.actionSize,
            actions: this.aiInterface.getActions()
        };
    }

    /**
     * Get state space info
     */
    getStateSpace() {
        return {
            size: this.config.stateSize,
            shape: [this.config.stateSize]
        };
    }

    /**
     * Render environment (for debugging)
     */
    render() {
        const state = this.getState();
        console.log('=== Environment State ===');
        console.log(`Step: ${this.currentStep}/${this.config.maxSteps}`);
        console.log(`Episode Reward: ${this.episodeReward.toFixed(2)}`);
        console.log(`Data: ${(state[0] * 1e6).toFixed(0)} (+${(state[1] * 1e4).toFixed(1)}/s)`);
        console.log(`Accuracy: ${(state[3] * 100).toFixed(2)}%`);
        console.log(`Buildings: DC=${(state[4] * 100).toFixed(0)} GPU=${(state[6] * 100).toFixed(0)}`);
        console.log(`Achievements: ${(state[15] * 30).toFixed(0)}/30`);
        console.log('========================');
    }

    /**
     * Get environment info
     */
    getInfo() {
        return {
            config: this.config,
            currentStep: this.currentStep,
            maxSteps: this.config.maxSteps,
            episodeReward: this.episodeReward,
            actionSpace: this.getActionSpace(),
            stateSpace: this.getStateSpace()
        };
    }
}
