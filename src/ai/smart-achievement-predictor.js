/**
 * Smart Achievement Predictor
 * 
 * Enhances basic progress calculations with ML-based player modeling.
 * 
 * The neural network learns:
 * - Which types of achievements the player prioritizes
 * - Typical progression patterns and pacing
 * - Player skill level and efficiency
 * - Preferred gameplay styles (idle vs active, building vs research, etc.)\ * 
 * This creates PERSONALIZED predictions that adapt to each player!
 */

import { AchievementProgressCalculator } from './achievement-progress-calculator.js';

export class SmartAchievementPredictor {
    constructor(gameState) {
        this.game = gameState;
        this.progressCalculator = new AchievementProgressCalculator(gameState);
        this.model = null;
        this.isTraining = false;
        this.trainingHistory = [];
        
        // Configuration
        this.config = {
            inputSize: 30, // Extended feature set
            hiddenSize1: 24,
            hiddenSize2: 12,
            outputSize: 1, // Probability of unlocking achievement
            learningRate: 0.001,
            epochs: 100,
            batchSize: 16
        };
        
        // Load training history from localStorage
        this.loadTrainingHistory();
        
        // NEW: Sync already-unlocked achievements from game state
        this.syncUnlockedAchievements();
    }

    /**
     * Sync already-unlocked achievements from game state to training history
     * This fixes the bug where loading a save doesn't count existing achievements
     */
    syncUnlockedAchievements() {
        const unlockedAchievements = Object.entries(this.game.achievements)
            .filter(([id, ach]) => ach.unlocked);
        
        let syncedCount = 0;
        
        for (const [id, achievement] of unlockedAchievements) {
            // Check if this achievement is already in training history
            const alreadyRecorded = this.trainingHistory.some(entry => entry.achievementId === id);
            
            if (!alreadyRecorded) {
                // Add to training history
                const entry = {
                    achievementId: id,
                    timestamp: Date.now() / 1000, // Use current time as approximation
                    features: this.extractFeatures(achievement),
                    unlocked: true,
                    synced: true // Mark as synced from save (not organically unlocked)
                };
                
                this.trainingHistory.push(entry);
                syncedCount++;
            }
        }
        
        if (syncedCount > 0) {
            console.log(`[SmartPredictor] Synced ${syncedCount} unlocked achievements from save`);
            this.saveTrainingHistory();
        }
        
        console.log(`[SmartPredictor] Total training data: ${this.trainingHistory.length} unlocks`);
    }

    /**
     * Initialize the neural network
     */
    async init() {
        console.log('[SmartPredictor] Initializing ML model...');
        
        try {
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js not loaded');
            }

            // Try to load saved model first
            const loaded = await this.loadModel();
            
            if (!loaded) {
                // Create new model
                this.model = tf.sequential({
                    layers: [
                        tf.layers.dense({
                            inputShape: [this.config.inputSize],
                            units: this.config.hiddenSize1,
                            activation: 'relu',
                            kernelInitializer: 'heNormal',
                            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
                        }),
                        tf.layers.dropout({ rate: 0.2 }),
                        
                        tf.layers.dense({
                            units: this.config.hiddenSize2,
                            activation: 'relu',
                            kernelInitializer: 'heNormal',
                            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
                        }),
                        tf.layers.dropout({ rate: 0.1 }),
                        
                        tf.layers.dense({
                            units: this.config.outputSize,
                            activation: 'sigmoid'
                        })
                    ]
                });

                this.model.compile({
                    optimizer: tf.train.adam(this.config.learningRate),
                    loss: 'binaryCrossentropy',
                    metrics: ['accuracy', 'precision']
                });
            }

            console.log('[SmartPredictor] Model ready!');
            return true;
        } catch (error) {
            console.error('[SmartPredictor] Failed to initialize:', error);
            return false;
        }
    }

    /**
     * Extract features for ML model from game state + achievement
     */
    extractFeatures(achievement) {
        const features = [];
        const stats = this.progressCalculator.getGameStats();
        const progress = this.progressCalculator.calculateProgress(achievement);
        
        // === PROGRESS FEATURES (5) ===
        features.push(progress.progress); // Current progress 0-1
        features.push(Math.log(1 + progress.timeEstimate) / 20); // Log-scaled time
        features.push(progress.rate > 0 ? 1 : 0); // Is achievable?
        features.push(Math.min(progress.rate, 1)); // Production rate (capped)
        features.push(progress.remaining / (progress.target || 1)); // Remaining fraction
        
        // === PLAYER STATS (8) ===
        features.push(Math.log(1 + stats.modelsTrained) / 10);
        features.push(Math.log(1 + stats.totalDataGenerated) / 20);
        features.push(stats.maxAccuracy / 100);
        features.push(Math.log(1 + stats.totalCompute) / 15);
        features.push(Math.log(1 + stats.totalBuildings) / 10);
        features.push(Math.log(1 + stats.deployments) / 5);
        features.push(stats.dataPerSecond > 0 ? Math.log(1 + stats.dataPerSecond) / 10 : 0);
        features.push(stats.computePerSecond > 0 ? Math.log(1 + stats.computePerSecond) / 10 : 0);
        
        // === ACHIEVEMENT TYPE (6) ===
        const req = achievement.requirement;
        const typeOneHot = new Array(6).fill(0);
        const typeMap = {
            'modelsTrained': 0,
            'totalDataGenerated': 1,
            'buildingCount': 2,
            'totalBuildings': 2,
            'totalCompute': 2,
            'specificResearch': 3,
            'researchCategory': 3,
            'allResearch': 3,
            'maxAccuracy': 4,
            'deploymentsCount': 5,
            'totalAccuracy': 5
        };
        const typeIndex = typeMap[req.type] || 0;
        typeOneHot[typeIndex] = 1;
        features.push(...typeOneHot);
        
        // === ACHIEVEMENT CATEGORY (4) ===
        const catOneHot = new Array(4).fill(0);
        const catMap = {
            'training': 0,
            'research': 1,
            'infrastructure': 2,
            'deployment': 3
        };
        const catIndex = catMap[achievement.category] || 0;
        catOneHot[catIndex] = 1;
        features.push(...catOneHot);
        
        // === PLAYER STYLE (4) ===
        const totalActions = stats.modelsTrained + stats.totalBuildings + stats.deployments;
        if (totalActions > 0) {
            features.push(stats.modelsTrained / totalActions); // Training focus
            features.push(stats.totalBuildings / totalActions); // Building focus
            features.push(stats.deployments / totalActions); // Deployment focus
        } else {
            features.push(0, 0, 0);
        }
        features.push(stats.maxAccuracy > 90 ? 1 : 0); // High skill indicator
        
        // === TEMPORAL FEATURES (3) ===
        const playtime = this.game.stats?.playtime || 0;
        features.push(Math.log(1 + playtime) / 15); // Total playtime
        features.push(this.getSessionActivity()); // Current session activity
        features.push(this.getRecentUnlockRate()); // Recent unlock momentum
        
        return features;
    }

    /**
     * Get current session activity level (0-1)
     */
    getSessionActivity() {
        const sessionStart = this.game.session?.startTime || Date.now();
        const sessionDuration = (Date.now() - sessionStart) / 1000;
        const actions = this.game.session?.actions || 0;
        
        if (sessionDuration > 0) {
            const actionsPerMinute = (actions / sessionDuration) * 60;
            return Math.min(actionsPerMinute / 10, 1); // Normalize to 0-1
        }
        return 0;
    }

    /**
     * Get recent achievement unlock rate (0-1)
     */
    getRecentUnlockRate() {
        const recentWindow = 300; // Last 5 minutes
        const now = Date.now() / 1000;
        
        const recentUnlocks = this.trainingHistory.filter(entry => {
            return (now - entry.timestamp) < recentWindow;
        }).length;
        
        return Math.min(recentUnlocks / 5, 1); // Normalize
    }

    /**
     * Record achievement unlock for training
     */
    recordUnlock(achievementId) {
        const achievement = this.game.achievements[achievementId];
        if (!achievement) return;
        
        // Check if already recorded (avoid duplicates)
        const alreadyRecorded = this.trainingHistory.some(entry => entry.achievementId === achievementId);
        if (alreadyRecorded) {
            console.log('[SmartPredictor] Achievement already recorded:', achievementId);
            return;
        }
        
        const entry = {
            achievementId: achievementId,
            timestamp: Date.now() / 1000,
            features: this.extractFeatures(achievement),
            unlocked: true
        };
        
        this.trainingHistory.push(entry);
        
        // Keep only last 100 unlocks
        if (this.trainingHistory.length > 100) {
            this.trainingHistory.shift();
        }
        
        this.saveTrainingHistory();
        
        console.log('[SmartPredictor] Recorded unlock:', achievementId);
    }

    /**
     * Generate training data from history
     */
    generateTrainingData() {
        const X = [];
        const Y = [];
        
        // Positive samples (actually unlocked)
        this.trainingHistory.forEach(entry => {
            X.push(entry.features);
            Y.push(1); // Unlocked
        });
        
        // Negative samples (not unlocked yet)
        const unlockedAchievements = Object.values(this.game.achievements)
            .filter(a => !a.unlocked);
        
        // Sample some negative examples
        const numNegative = Math.min(X.length * 2, unlockedAchievements.length);
        for (let i = 0; i < numNegative; i++) {
            const ach = unlockedAchievements[Math.floor(Math.random() * unlockedAchievements.length)];
            X.push(this.extractFeatures(ach));
            Y.push(0); // Not unlocked
        }
        
        return { X, Y };
    }

    /**
     * Train model on player's achievement history
     */
    async train(onProgress = null) {
        if (this.isTraining) {
            console.warn('[SmartPredictor] Training already in progress');
            return false;
        }

        if (!this.model) {
            console.error('[SmartPredictor] Model not initialized');
            return false;
        }

        // Need at least 5 unlocks to train
        if (this.trainingHistory.length < 5) {
            console.log('[SmartPredictor] Not enough training data yet. Need 5 unlocks, have', this.trainingHistory.length);
            return false;
        }

        this.isTraining = true;

        try {
            console.log('[SmartPredictor] Training on', this.trainingHistory.length, 'historical unlocks...');

            const { X, Y } = this.generateTrainingData();
            
            if (X.length < 10) {
                console.log('[SmartPredictor] Not enough training samples:', X.length);
                this.isTraining = false;
                return false;
            }

            const xTrain = tf.tensor2d(X);
            const yTrain = tf.tensor2d(Y.map(y => [y]));

            const history = await this.model.fit(xTrain, yTrain, {
                epochs: this.config.epochs,
                batchSize: this.config.batchSize,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if ((epoch + 1) % 10 === 0) {
                            console.log(`[SmartPredictor] Epoch ${epoch + 1}/${this.config.epochs} - Loss: ${logs.loss.toFixed(4)} - Acc: ${logs.acc.toFixed(4)}`);
                        }
                        
                        if (onProgress) {
                            onProgress({
                                epoch: epoch + 1,
                                totalEpochs: this.config.epochs,
                                loss: logs.loss,
                                accuracy: logs.acc
                            });
                        }
                    }
                }
            });

            xTrain.dispose();
            yTrain.dispose();

            console.log('[SmartPredictor] Training completed!');
            await this.saveModel();
            
            this.isTraining = false;
            return true;
            
        } catch (error) {
            console.error('[SmartPredictor] Training failed:', error);
            this.isTraining = false;
            return false;
        }
    }

    /**
     * Predict likelihood of unlocking achievement
     * Combines ML model with progress calculation
     */
    async predict(achievement) {
        if (!this.model) {
            // Fall back to progress only
            const progress = this.progressCalculator.calculateProgress(achievement);
            return {
                mlProbability: progress.progress,
                progressProbability: progress.progress,
                combinedProbability: progress.progress,
                confidence: 0.5, // Medium confidence without ML
                ...progress
            };
        }

        try {
            // Extract features
            const features = this.extractFeatures(achievement);
            const input = tf.tensor2d([features]);
            
            // Get ML prediction
            const prediction = this.model.predict(input);
            const mlProb = (await prediction.data())[0];
            
            input.dispose();
            prediction.dispose();
            
            // Get progress-based prediction
            const progress = this.progressCalculator.calculateProgress(achievement);
            
            // Combine predictions (weighted average)
            // ML weight increases with more training data
            const mlWeight = Math.min(this.trainingHistory.length / 20, 0.6);
            const progressWeight = 1 - mlWeight;
            
            const combinedProb = (mlProb * mlWeight) + (progress.progress * progressWeight);
            
            // Calculate confidence based on agreement between ML and progress
            const agreement = 1 - Math.abs(mlProb - progress.progress);
            const confidence = agreement * 0.7 + mlWeight * 0.3;
            
            return {
                mlProbability: mlProb,
                progressProbability: progress.progress,
                combinedProbability: combinedProb,
                confidence: confidence,
                mlWeight: mlWeight,
                progressWeight: progressWeight,
                ...progress
            };
            
        } catch (error) {
            console.error('[SmartPredictor] Prediction error:', error);
            
            // Fall back to progress only
            const progress = this.progressCalculator.calculateProgress(achievement);
            return {
                mlProbability: progress.progress,
                progressProbability: progress.progress,
                combinedProbability: progress.progress,
                confidence: 0.5,
                ...progress
            };
        }
    }

    /**
     * Predict all achievements
     */
    async predictAll() {
        const predictions = {};
        
        const achievements = Object.values(this.game.achievements)
            .filter(a => !a.unlocked);
        
        for (const achievement of achievements) {
            predictions[achievement.id] = await this.predict(achievement);
        }
        
        return predictions;
    }

    /**
     * Get top N predictions
     */
    async getTopPredictions(n = 5) {
        const predictions = await this.predictAll();
        
        return Object.entries(predictions)
            .map(([id, pred]) => ({
                id: id,
                achievement: this.game.achievements[id],
                ...pred
            }))
            .filter(p => p.achievable)
            .sort((a, b) => {
                // Sort by combined probability (descending)
                return b.combinedProbability - a.combinedProbability;
            })
            .slice(0, n);
    }

    /**
     * Save model to localStorage
     */
    async saveModel() {
        if (!this.model) return false;
        
        try {
            await this.model.save('localstorage://smart-achievement-predictor');
            console.log('[SmartPredictor] Model saved');
            return true;
        } catch (error) {
            console.error('[SmartPredictor] Failed to save model:', error);
            return false;
        }
    }

    /**
     * Load model from localStorage
     */
    async loadModel() {
        try {
            this.model = await tf.loadLayersModel('localstorage://smart-achievement-predictor');
            console.log('[SmartPredictor] Model loaded from storage');
            return true;
        } catch (error) {
            console.log('[SmartPredictor] No saved model found');
            return false;
        }
    }

    /**
     * Save training history to localStorage
     */
    saveTrainingHistory() {
        try {
            localStorage.setItem('achievement-training-history', JSON.stringify(this.trainingHistory));
        } catch (error) {
            console.error('[SmartPredictor] Failed to save history:', error);
        }
    }

    /**
     * Load training history from localStorage
     */
    loadTrainingHistory() {
        try {
            const stored = localStorage.getItem('achievement-training-history');
            if (stored) {
                this.trainingHistory = JSON.parse(stored);
                console.log('[SmartPredictor] Loaded', this.trainingHistory.length, 'historical unlocks');
            }
        } catch (error) {
            console.error('[SmartPredictor] Failed to load history:', error);
            this.trainingHistory = [];
        }
    }

    /**
     * Get model info
     */
    getModelInfo() {
        return {
            trainingDataSize: this.trainingHistory.length,
            isTraining: this.isTraining,
            modelLoaded: this.model !== null,
            minDataRequired: 5,
            canTrain: this.trainingHistory.length >= 5
        };
    }
}
