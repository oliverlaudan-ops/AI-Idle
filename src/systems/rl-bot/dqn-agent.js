/**
 * Deep Q-Network (DQN) Agent
 * 
 * Implements DQN algorithm for playing AI-Idle optimally.
 * Uses TensorFlow.js for neural network training.
 * 
 * PRIMARY GOAL: Learn to maximize tokens through optimal deployment!
 */

import * as tf from '@tensorflow/tfjs';
import { ReplayBuffer } from './replay-buffer.js';
import { getActionSpaceSize, isDeploymentAction } from './action-space.js';
import { getStateDimensions } from './state-encoder.js';

/**
 * DQN Hyperparameters
 */
const DEFAULT_CONFIG = {
    // Network architecture
    hiddenLayers: [128, 64],        // Hidden layer sizes
    activation: 'relu',              // Activation function
    
    // Training
    learningRate: 0.001,             // Adam learning rate
    gamma: 0.99,                     // Discount factor
    batchSize: 32,                   // Mini-batch size
    
    // Exploration
    epsilonStart: 1.0,               // Initial exploration rate
    epsilonEnd: 0.01,                // Final exploration rate
    epsilonDecay: 0.995,             // Decay rate per episode
    
    // Experience replay
    replayBufferSize: 10000,         // Max experiences to store
    minReplaySize: 1000,             // Min experiences before training
    
    // Target network
    targetUpdateFreq: 100,           // Update target network every N steps
    
    // Optimization
    gradientClipValue: 1.0,          // Clip gradients to prevent exploding
};

export class DQNAgent {
    /**
     * Create a DQN agent
     * @param {object} config - Hyperparameters (optional)
     */
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // State and action spaces
        this.stateDim = getStateDimensions();   // 27 dimensions (with deployment features)
        this.actionDim = getActionSpaceSize();  // 29 actions (with deployment actions)
        
        console.log(`🤖 DQN Agent initialized: ${this.stateDim}D state → ${this.actionDim} actions`);
        
        // Neural networks
        this.model = this._buildModel();
        this.targetModel = this._buildModel();
        this._updateTargetModel(); // Initialize target with same weights
        
        // Experience replay
        this.replayBuffer = new ReplayBuffer(this.config.replayBufferSize);
        
        // Exploration
        this.epsilon = this.config.epsilonStart;
        
        // Training state
        this.stepCount = 0;
        this.episodeCount = 0;
        this.totalReward = 0;
        
        // Metrics
        this.lossHistory = [];
        this.rewardHistory = [];
        this.epsilonHistory = [];
    }
    
    /**
     * Build the Q-network
     * Architecture: 27 → 128 → 64 → 29
     * @returns {tf.Sequential} TensorFlow model
     */
    _buildModel() {
        const model = tf.sequential();
        
        // Input layer
        model.add(tf.layers.dense({
            units: this.config.hiddenLayers[0],
            activation: this.config.activation,
            inputShape: [this.stateDim]
        }));
        
        // Hidden layers
        for (let i = 1; i < this.config.hiddenLayers.length; i++) {
            model.add(tf.layers.dense({
                units: this.config.hiddenLayers[i],
                activation: this.config.activation
            }));
        }
        
        // Output layer (Q-values for each action)
        model.add(tf.layers.dense({
            units: this.actionDim,
            activation: 'linear' // No activation for Q-values
        }));
        
        // Compile model
        model.compile({
            optimizer: tf.train.adam(this.config.learningRate),
            loss: 'meanSquaredError'
        });
        
        return model;
    }
    
    /**
     * Select an action using epsilon-greedy policy
     * @param {Float32Array} state - Current state
     * @param {array} validActions - Array of valid action IDs
     * @returns {number} Selected action ID
     */
    selectAction(state, validActions = null) {
        // Epsilon-greedy exploration
        if (Math.random() < this.epsilon) {
            // Explore: random action
            if (validActions && validActions.length > 0) {
                const randomIndex = Math.floor(Math.random() * validActions.length);
                return validActions[randomIndex];
            }
            return Math.floor(Math.random() * this.actionDim);
        }
        
        // Exploit: best action from Q-network
        return tf.tidy(() => {
            const stateTensor = tf.tensor2d([state], [1, this.stateDim]);
            const qValues = this.model.predict(stateTensor);
            const qArray = qValues.dataSync();
            
            // If valid actions specified, mask invalid actions
            if (validActions && validActions.length > 0) {
                const maskedQ = Array.from(qArray).map((q, i) => 
                    validActions.includes(i) ? q : -Infinity
                );
                return maskedQ.indexOf(Math.max(...maskedQ));
            }
            
            // Return action with highest Q-value
            return qArray.indexOf(Math.max(...qArray));
        });
    }
    
    /**
     * Store an experience in replay buffer
     * @param {Float32Array} state - Current state
     * @param {number} action - Action taken
     * @param {number} reward - Reward received
     * @param {Float32Array} nextState - Next state
     * @param {boolean} done - Whether episode ended (e.g., deployment)
     */
    remember(state, action, reward, nextState, done) {
        this.replayBuffer.add(state, action, reward, nextState, done);
        this.stepCount++;
        
        // Log deployment actions
        if (isDeploymentAction(action)) {
            console.log(`🚀 Bot attempted deployment! Reward: ${reward.toFixed(0)}, Done: ${done}`);
        }
    }
    
    /**
     * Train the agent on a mini-batch from replay buffer
     * @returns {number} Loss value (or null if not enough experiences)
     */
    async train() {
        // Wait until we have enough experiences
        if (!this.replayBuffer.canSample(this.config.batchSize) ||
            this.replayBuffer.length() < this.config.minReplaySize) {
            return null;
        }
        
        // Sample mini-batch
        const batch = this.replayBuffer.sample(this.config.batchSize);
        
        // Train on batch
        const loss = await tf.tidy(async () => {
            // Convert batch to tensors
            const states = tf.tensor2d(batch.states);
            const nextStates = tf.tensor2d(batch.nextStates);
            const actions = tf.tensor1d(batch.actions, 'int32');
            const rewards = tf.tensor1d(batch.rewards);
            const dones = tf.tensor1d(batch.dones);
            
            // Compute target Q-values using target network
            const nextQValues = this.targetModel.predict(nextStates);
            const maxNextQ = nextQValues.max(1);
            
            // Q-learning target: r + γ * max(Q(s',a')) * (1 - done)
            const targets = rewards.add(
                maxNextQ.mul(tf.scalar(this.config.gamma)).mul(tf.scalar(1).sub(dones))
            );
            
            // Train
            const result = await this.model.fit(states, targets, {
                epochs: 1,
                verbose: 0,
                callbacks: {
                    onBatchEnd: async (batch, logs) => {
                        // Clip gradients
                        if (this.config.gradientClipValue) {
                            const grads = tf.variableGrads(() => this.model.loss);
                            for (const name in grads.grads) {
                                grads.grads[name] = grads.grads[name].clipByValue(
                                    -this.config.gradientClipValue,
                                    this.config.gradientClipValue
                                );
                            }
                        }
                    }
                }
            });
            
            return result.history.loss[0];
        });
        
        // Update target network periodically
        if (this.stepCount % this.config.targetUpdateFreq === 0) {
            this._updateTargetModel();
        }
        
        // Record loss
        this.lossHistory.push(loss);
        
        return loss;
    }
    
    /**
     * Update target network with current model weights
     */
    _updateTargetModel() {
        const weights = this.model.getWeights();
        const targetWeights = weights.map(w => w.clone());
        this.targetModel.setWeights(targetWeights);
    }
    
    /**
     * Decay exploration rate
     */
    decayEpsilon() {
        this.epsilon = Math.max(
            this.config.epsilonEnd,
            this.epsilon * this.config.epsilonDecay
        );
        this.epsilonHistory.push(this.epsilon);
    }
    
    /**
     * End episode and update metrics
     * @param {number} episodeReward - Total reward for episode
     */
    endEpisode(episodeReward) {
        this.episodeCount++;
        this.totalReward += episodeReward;
        this.rewardHistory.push(episodeReward);
        this.decayEpsilon();
        
        console.log(`🏁 Episode ${this.episodeCount} complete! Reward: ${episodeReward.toFixed(0)}, ε: ${this.epsilon.toFixed(3)}`);
    }
    
    /**
     * Get agent statistics
     * @returns {object} Statistics
     */
    getStats() {
        const recentRewards = this.rewardHistory.slice(-100);
        const avgRecentReward = recentRewards.length > 0
            ? recentRewards.reduce((sum, r) => sum + r, 0) / recentRewards.length
            : 0;
        
        const recentLoss = this.lossHistory.slice(-100);
        const avgRecentLoss = recentLoss.length > 0
            ? recentLoss.reduce((sum, l) => sum + l, 0) / recentLoss.length
            : 0;
        
        return {
            episodeCount: this.episodeCount,
            stepCount: this.stepCount,
            epsilon: this.epsilon,
            totalReward: this.totalReward,
            avgReward: this.totalReward / Math.max(1, this.episodeCount),
            avgRecentReward,
            avgRecentLoss,
            replayBufferSize: this.replayBuffer.length()
        };
    }
    
    /**
     * Save model to IndexedDB
     * @param {string} name - Model name
     */
    async saveModel(name = 'ai-idle-dqn') {
        await this.model.save(`indexeddb://${name}`);
        console.log(`💾 Model saved as ${name}`);
    }
    
    /**
     * Load model from IndexedDB
     * @param {string} name - Model name
     */
    async loadModel(name = 'ai-idle-dqn') {
        try {
            this.model = await tf.loadLayersModel(`indexeddb://${name}`);
            this._updateTargetModel();
            console.log(`💾 Model loaded from ${name}`);
            return true;
        } catch (error) {
            console.warn(`Failed to load model: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Reset agent (for testing)
     */
    reset() {
        this.model.dispose();
        this.targetModel.dispose();
        
        this.model = this._buildModel();
        this.targetModel = this._buildModel();
        this._updateTargetModel();
        
        this.replayBuffer.clear();
        this.epsilon = this.config.epsilonStart;
        this.stepCount = 0;
        this.episodeCount = 0;
        this.totalReward = 0;
        
        this.lossHistory = [];
        this.rewardHistory = [];
        this.epsilonHistory = [];
    }
}
