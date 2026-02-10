/**
 * Achievement Predictor - ML Model for Achievement Probability Prediction
 * 
 * Uses TensorFlow.js to train a feedforward neural network that predicts
 * the probability of unlocking each achievement based on current game state.
 * 
 * Model Architecture:
 * - Input: 20 features (game state vector)
 * - Hidden Layer 1: 16 neurons, ReLU activation
 * - Hidden Layer 2: 8 neurons, ReLU activation
 * - Output: 1 neuron per achievement, Sigmoid activation (probability)
 */

import { AIInterface } from './ai-interface.js';

export class AchievementPredictor {
    constructor(gameState) {
        this.game = gameState;
        this.aiInterface = new AIInterface(gameState);
        this.model = null;
        this.isTraining = false;
        this.trainingProgress = 0;
        this.predictions = {};
        
        // Training configuration
        this.config = {
            inputSize: 20,
            hiddenSize1: 16,
            hiddenSize2: 8,
            outputSize: 30, // Number of achievements
            learningRate: 0.001,
            epochs: 50,
            batchSize: 32
        };
    }

    /**
     * Initialize the neural network
     */
    async init() {
        console.log('[AchievementPredictor] Initializing model...');
        
        try {
            // Check if TensorFlow.js is loaded
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js not loaded');
            }

            // Create model architecture
            this.model = tf.sequential({
                layers: [
                    // Input layer + first hidden layer
                    tf.layers.dense({
                        inputShape: [this.config.inputSize],
                        units: this.config.hiddenSize1,
                        activation: 'relu',
                        kernelInitializer: 'heNormal'
                    }),
                    
                    // Second hidden layer
                    tf.layers.dense({
                        units: this.config.hiddenSize2,
                        activation: 'relu',
                        kernelInitializer: 'heNormal'
                    }),
                    
                    // Output layer (one neuron per achievement)
                    tf.layers.dense({
                        units: this.config.outputSize,
                        activation: 'sigmoid' // Probabilities [0, 1]
                    })
                ]
            });

            // Compile model
            this.model.compile({
                optimizer: tf.train.adam(this.config.learningRate),
                loss: 'binaryCrossentropy',
                metrics: ['accuracy']
            });

            console.log('[AchievementPredictor] Model initialized successfully');
            console.log('[AchievementPredictor] Architecture: 20 -> 16 -> 8 -> 30');
            
            return true;
        } catch (error) {
            console.error('[AchievementPredictor] Failed to initialize:', error);
            return false;
        }
    }

    /**
     * Generate synthetic training data
     * Creates simulated game states with known achievement outcomes
     */
    generateTrainingData(numSamples = 1000) {
        console.log(`[AchievementPredictor] Generating ${numSamples} training samples...`);
        
        const X = []; // Input features
        const Y = []; // Target labels (achievement unlocked: 0 or 1)

        for (let i = 0; i < numSamples; i++) {
            // Generate random game state
            const state = this.generateRandomState();
            const achievements = this.simulateAchievements(state);

            X.push(state);
            Y.push(achievements);
        }

        return { X, Y };
    }

    /**
     * Generate random game state for training
     */
    generateRandomState() {
        const state = [];
        
        // Resources (4 features)
        state.push(Math.random()); // data amount
        state.push(Math.random()); // data rate
        state.push(Math.random()); // compute
        state.push(Math.random()); // accuracy
        
        // Building counts (6 features)
        for (let i = 0; i < 6; i++) {
            state.push(Math.random());
        }
        
        // Research (4 features)
        for (let i = 0; i < 4; i++) {
            state.push(Math.random());
        }
        
        // Training & achievements (5 features)
        for (let i = 0; i < 5; i++) {
            state.push(Math.random());
        }
        
        // Playtime (1 feature)
        state.push(Math.random());
        
        return state;
    }

    /**
     * Simulate which achievements would be unlocked for given state
     */
    simulateAchievements(state) {
        const achievements = new Array(this.config.outputSize).fill(0);
        
        // Simple heuristic rules to label training data
        // In reality, these would be derived from actual game logic
        
        // Achievement 0: First data collected (almost always unlocked)
        if (state[0] > 0.01) achievements[0] = 1;
        
        // Achievement 1: 100 data
        if (state[0] > 0.1) achievements[1] = 1;
        
        // Achievement 2: First building
        if (state[4] > 0.1) achievements[2] = 1;
        
        // Achievement 3: High data rate
        if (state[1] > 0.5) achievements[3] = 1;
        
        // Achievement 4: Multiple building types
        const buildingDiversity = state.slice(4, 10).filter(v => v > 0.1).length;
        if (buildingDiversity >= 3) achievements[4] = 1;
        
        // Achievement 5: First training completed
        if (state[12] > 0.3) achievements[5] = 1;
        
        // Achievement 6: Research unlocked
        if (state[11] > 0.2) achievements[6] = 1;
        
        // Achievement 7: High accuracy
        if (state[3] > 0.5) achievements[7] = 1;
        
        // Achievement 8: Advanced buildings
        if (state[8] > 0.3 || state[9] > 0.3) achievements[8] = 1;
        
        // Achievement 9: Long playtime
        if (state[19] > 0.5) achievements[9] = 1;
        
        return achievements;
    }

    /**
     * Train the model on synthetic data
     */
    async train(onProgress = null) {
        if (this.isTraining) {
            console.warn('[AchievementPredictor] Training already in progress');
            return false;
        }

        if (!this.model) {
            console.error('[AchievementPredictor] Model not initialized');
            return false;
        }

        this.isTraining = true;
        this.trainingProgress = 0;

        try {
            console.log('[AchievementPredictor] Starting training...');

            // Generate training data
            const { X, Y } = this.generateTrainingData(1000);

            // Convert to tensors
            const xTrain = tf.tensor2d(X);
            const yTrain = tf.tensor2d(Y);

            // Train model
            const history = await this.model.fit(xTrain, yTrain, {
                epochs: this.config.epochs,
                batchSize: this.config.batchSize,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        this.trainingProgress = (epoch + 1) / this.config.epochs;
                        console.log(`[AchievementPredictor] Epoch ${epoch + 1}/${this.config.epochs} - Loss: ${logs.loss.toFixed(4)} - Acc: ${logs.acc.toFixed(4)}`);
                        
                        if (onProgress) {
                            onProgress({
                                epoch: epoch + 1,
                                totalEpochs: this.config.epochs,
                                loss: logs.loss,
                                accuracy: logs.acc,
                                valLoss: logs.val_loss,
                                valAccuracy: logs.val_acc
                            });
                        }
                    }
                }
            });

            // Cleanup tensors
            xTrain.dispose();
            yTrain.dispose();

            console.log('[AchievementPredictor] Training completed!');
            this.isTraining = false;
            this.trainingProgress = 1.0;

            return true;
        } catch (error) {
            console.error('[AchievementPredictor] Training failed:', error);
            this.isTraining = false;
            return false;
        }
    }

    /**
     * Predict achievement probabilities for current game state
     */
    async predict() {
        if (!this.model) {
            console.warn('[AchievementPredictor] Model not initialized');
            return null;
        }

        try {
            // Get current state
            const state = this.aiInterface.getStateVector();
            const stateTensor = tf.tensor2d([state]);

            // Make prediction
            const predictionTensor = this.model.predict(stateTensor);
            const probabilities = await predictionTensor.data();

            // Cleanup
            stateTensor.dispose();
            predictionTensor.dispose();

            // Store predictions
            const achievements = Object.keys(this.game.achievements);
            this.predictions = {};

            achievements.forEach((id, index) => {
                if (index < probabilities.length) {
                    this.predictions[id] = probabilities[index];
                }
            });

            return this.predictions;
        } catch (error) {
            console.error('[AchievementPredictor] Prediction failed:', error);
            return null;
        }
    }

    /**
     * Get prediction for specific achievement
     */
    getPrediction(achievementId) {
        return this.predictions[achievementId] || 0;
    }

    /**
     * Get top N achievements most likely to unlock soon
     */
    getTopPredictions(n = 5) {
        const unlocked = Object.entries(this.game.achievements)
            .filter(([id, ach]) => !ach.unlocked);

        return unlocked
            .map(([id, ach]) => ({
                id: id,
                name: ach.name,
                probability: this.predictions[id] || 0
            }))
            .sort((a, b) => b.probability - a.probability)
            .slice(0, n);
    }

    /**
     * Estimate time to unlock achievement (based on current rates)
     */
    estimateTimeToUnlock(achievementId) {
        const probability = this.predictions[achievementId] || 0;
        
        // Simple heuristic: higher probability = less time
        // In reality, this would consider resource production rates
        if (probability > 0.9) return 30; // 30 seconds
        if (probability > 0.7) return 120; // 2 minutes
        if (probability > 0.5) return 300; // 5 minutes
        if (probability > 0.3) return 600; // 10 minutes
        return 1800; // 30 minutes
    }

    /**
     * Save model to browser storage
     */
    async saveModel() {
        if (!this.model) {
            console.warn('[AchievementPredictor] No model to save');
            return false;
        }

        try {
            await this.model.save('localstorage://achievement-predictor');
            console.log('[AchievementPredictor] Model saved to local storage');
            return true;
        } catch (error) {
            console.error('[AchievementPredictor] Failed to save model:', error);
            return false;
        }
    }

    /**
     * Load model from browser storage
     */
    async loadModel() {
        try {
            this.model = await tf.loadLayersModel('localstorage://achievement-predictor');
            console.log('[AchievementPredictor] Model loaded from local storage');
            return true;
        } catch (error) {
            console.log('[AchievementPredictor] No saved model found, will train new model');
            return false;
        }
    }

    /**
     * Get model info
     */
    getModelInfo() {
        if (!this.model) return null;

        return {
            architecture: `${this.config.inputSize} -> ${this.config.hiddenSize1} -> ${this.config.hiddenSize2} -> ${this.config.outputSize}`,
            parameters: this.model.countParams(),
            isTraining: this.isTraining,
            trainingProgress: this.trainingProgress
        };
    }
}
