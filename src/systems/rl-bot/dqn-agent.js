/**
 * Deep Q-Network (DQN) Agent
 * 
 * Implements DQN algorithm for playing AI-Idle optimally.
 * Uses TensorFlow.js for neural network training.
 * 
 * PRIMARY GOAL: Learn to maximize tokens through optimal deployment!
 * 
 * Note: TensorFlow.js is loaded from CDN (see index.html), available as global 'tf'
 */

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
        // Check if TensorFlow.js is available
        if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js not loaded! Must load from CDN first.');
        }
        
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // State and action spaces
        this.stateDim = getStateDimensions();   // 27 dimensions (with deployment features)
        this.actionDim = getActionSpaceSize();  // 36 actions (updated!)
        
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
     * Architecture: 27 → 128 → 64 → 36
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
        this._compileModel(model);
        
        return model;
    }
    
    /**
     * Compile a model with optimizer and loss
     * @param {tf.Sequential} model - Model to compile
     */
    _compileModel(model) {
        model.compile({
            optimizer: tf.train.adam(this.config.learningRate),
            loss: 'meanSquaredError'
        });
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
     * Uses proper DQN algorithm:
     * 1. Get current Q-values for all actions
     * 2. For action taken, update: Q(s,a) ← r + γ * max(Q(s',a'))
     * 3. Train network to predict updated Q-values
     * 
     * @returns {number} Loss value (or null if not enough experiences)
     */
    async train() {
        // Wait until we have enough experiences
        if (!this.replayBuffer.canSample(this.config.batchSize) ||
            this.replayBuffer.length() < this.config.minReplaySize) {
            return null;
        }
        
        // Safety check: Ensure model is compiled
        if (!this.model.optimizer) {
            console.warn('[DQN Agent] Model not compiled! Recompiling...');
            this._compileModel(this.model);
        }
        
        // Sample mini-batch
        const batch = this.replayBuffer.sample(this.config.batchSize);
        
        // Prepare tensors (outside of tidy for async operations)
        let states, nextStates, actions, rewards, dones;
        let currentQs, nextQs, targetQs;
        
        try {
            // Create tensors from batch
            states = tf.tensor2d(batch.states, [this.config.batchSize, this.stateDim]);
            nextStates = tf.tensor2d(batch.nextStates, [this.config.batchSize, this.stateDim]);
            actions = batch.actions; // Keep as array for indexing
            rewards = batch.rewards; // Keep as array
            dones = batch.dones;     // Keep as array
            
            // Get current Q-values for all actions (from main network)
            currentQs = this.model.predict(states);
            const currentQsData = await currentQs.array(); // [batchSize, actionDim]
            
            // Get next Q-values (from target network for stability)
            nextQs = this.targetModel.predict(nextStates);
            const nextQsData = await nextQs.array(); // [batchSize, actionDim]
            
            // Build target Q-values
            // Start with current Q-values, then update only the action taken
            const targetQsData = currentQsData.map((qValues, i) => {
                const newQValues = [...qValues];
                
                // DQN update rule: Q(s,a) ← r + γ * max(Q(s',a')) * (1 - done)
                const maxNextQ = Math.max(...nextQsData[i]);
                const target = rewards[i] + this.config.gamma * maxNextQ * (1 - dones[i]);
                
                // Update only the Q-value for the action that was taken
                newQValues[actions[i]] = target;
                
                return newQValues;
            });
            
            // Create target tensor
            targetQs = tf.tensor2d(targetQsData, [this.config.batchSize, this.actionDim]);
            
            // Train the network (this is async, so outside of tidy)
            const result = await this.model.fit(states, targetQs, {
                epochs: 1,
                verbose: 0,
                batchSize: this.config.batchSize
            });
            
            const loss = result.history.loss[0];
            
            // Clean up tensors
            states.dispose();
            nextStates.dispose();
            currentQs.dispose();
            nextQs.dispose();
            targetQs.dispose();
            
            // Update target network periodically
            if (this.stepCount % this.config.targetUpdateFreq === 0) {
                this._updateTargetModel();
            }
            
            // Record loss
            this.lossHistory.push(loss);
            
            return loss;
            
        } catch (error) {
            console.error('[DQN Agent] Training error:', error);
            
            // Clean up any tensors that were created
            if (states) states.dispose();
            if (nextStates) nextStates.dispose();
            if (currentQs) currentQs.dispose();
            if (nextQs) nextQs.dispose();
            if (targetQs) targetQs.dispose();
            
            return null;
        }
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
     * Save model AND metadata to storage
     * @param {string} name - Model name
     */
    async saveModel(name = 'ai-idle-dqn') {
        // Save neural network weights to IndexedDB
        await this.model.save(`indexeddb://${name}`);
        
        // Save metadata to localStorage (small, fast)
        const metadata = {
            episodeCount: this.episodeCount,
            stepCount: this.stepCount,
            epsilon: this.epsilon,
            totalReward: this.totalReward,
            lossHistory: this.lossHistory.slice(-100),  // Last 100
            rewardHistory: this.rewardHistory.slice(-100),  // Last 100
            epsilonHistory: this.epsilonHistory.slice(-100),  // Last 100
            timestamp: Date.now()
        };
        
        localStorage.setItem(`${name}-metadata`, JSON.stringify(metadata));
        
        console.log(`💾 Model saved as ${name} (with metadata)`);
    }
    
    /**
     * Load model AND metadata from storage
     * @param {string} name - Model name
     */
    async loadModel(name = 'ai-idle-dqn') {
        try {
            // Load neural network weights from IndexedDB
            this.model = await tf.loadLayersModel(`indexeddb://${name}`);
            
            // IMPORTANT: Recompile the model after loading!
            this._compileModel(this.model);
            
            this._updateTargetModel();
            
            // Load metadata from localStorage
            const metadataJson = localStorage.getItem(`${name}-metadata`);
            if (metadataJson) {
                const metadata = JSON.parse(metadataJson);
                
                // Restore training state
                this.episodeCount = metadata.episodeCount || 0;
                this.stepCount = metadata.stepCount || 0;
                this.epsilon = metadata.epsilon || this.config.epsilonStart;
                this.totalReward = metadata.totalReward || 0;
                this.lossHistory = metadata.lossHistory || [];
                this.rewardHistory = metadata.rewardHistory || [];
                this.epsilonHistory = metadata.epsilonHistory || [];
                
                console.log(`💾 Model loaded from ${name}`);
                console.log(`  📊 Restored state: Episode ${this.episodeCount}, ε: ${this.epsilon.toFixed(3)}, Total Reward: ${this.totalReward.toFixed(0)}`);
            } else {
                console.log(`💾 Model loaded from ${name} (no metadata found, starting fresh)`);
            }
            
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
