/**
 * AI Lab UI - User Interface for Real Machine Learning Features
 * 
 * Now with SMART PREDICTIONS powered by player-specific ML!
 */

import { getSmartPredictor } from '../modules/achievements.js';
import { RLEnvironment } from '../ai/rl-environment.js';

export class AILabUI {
    constructor(gameState) {
        this.game = gameState;
        this.smartPredictor = null;
        this.environment = null;
        this.isInitialized = false;
        this.updateInterval = null;
    }

    /**
     * Initialize AI Lab UI
     */
    async init() {
        console.log('[AI Lab] Initializing...');
        
        const content = document.getElementById('ai-lab-content');
        if (!content) {
            throw new Error('AI Lab content container not found');
        }

        try {
            // Check if TensorFlow.js is loaded
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js not loaded. Please reload the page.');
            }

            console.log('[AI Lab] TensorFlow.js version:', tf.version.tfjs);

            // Get Smart Predictor from achievements module
            this.smartPredictor = getSmartPredictor();
            
            if (!this.smartPredictor) {
                throw new Error('Smart Predictor not initialized');
            }

            this.environment = new RLEnvironment(this.game);

            // Render UI
            this.render();

            this.isInitialized = true;
            console.log('[AI Lab] Initialized successfully!');

        } catch (error) {
            console.error('[AI Lab] Initialization failed:', error);
            this.renderError(error);
            throw error;
        }
    }

    /**
     * Render AI Lab UI
     */
    render() {
        const content = document.getElementById('ai-lab-content');
        if (!content) return;
        
        const modelInfo = this.smartPredictor ? this.smartPredictor.getModelInfo() : null;

        content.innerHTML = `
            <div class="ai-lab-container">
                <!-- Status Info -->
                <div class="ai-status-banner">
                    <div class="status-item">
                        <span class="status-icon">✅</span>
                        <span>TensorFlow.js ${tf.version.tfjs}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-icon">🧠</span>
                        <span>Smart Predictor: ${modelInfo?.modelLoaded ? 'Trained' : 'Ready'}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-icon">📊</span>
                        <span>Training Data: ${modelInfo?.trainingDataSize || 0} unlocks</span>
                    </div>
                </div>

                <!-- Achievement Predictor Section -->
                <div class="ai-section">
                    <div class="ai-section-header">
                        <h3>🎯 Smart Achievement Predictor</h3>
                        <p>Personalized ML predictions based on YOUR playstyle</p>
                    </div>
                    <div class="ai-section-content">
                        <div class="predictor-controls">
                            <button class="btn-secondary" id="btn-predict">
                                🔮 Make Predictions
                            </button>
                            ${modelInfo?.canTrain ? `
                                <button class="btn-primary" id="btn-train-predictor">
                                    🎓 Train ML Model
                                </button>
                            ` : `
                                <div class="training-hint">
                                    🌱 Unlock ${modelInfo?.minDataRequired || 5} achievements to enable ML training
                                </div>
                            `}
                        </div>
                        <div id="predictor-status" class="predictor-status" style="display: none;">
                            <!-- Training status appears here -->
                        </div>
                        <div id="predictor-results" class="predictor-results">
                            <p style="color: var(--text-secondary);">Click "Make Predictions" to see which achievements you'll unlock next!</p>
                        </div>
                    </div>
                </div>

                <!-- RL Bot Section -->
                <div class="ai-section">
                    <div class="ai-section-header">
                        <h3>🤖 Reinforcement Learning Bot</h3>
                        <p>DQN agent that learns to play AI-Idle optimally</p>
                    </div>
                    <div class="ai-section-content">
                        <div class="rl-status">
                            <p>🚧 Coming soon in Day 2 of development!</p>
                            <p style="color: var(--text-secondary); font-size: 0.9rem;">
                                The RL Bot will learn through trial and error to maximize accuracy gains.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Model Info -->
                <div class="ai-section">
                    <div class="ai-section-header">
                        <h3>ℹ️ Technical Details</h3>
                    </div>
                    <div class="ai-section-content">
                        <div class="tech-info">
                            <h4>Smart Achievement Predictor:</h4>
                            <pre>Input (30 features) → Dense (24, ReLU) → Dropout → Dense (12, ReLU) → Output (1, Sigmoid)</pre>
                            <p><strong>Personalization:</strong> Learns from your achievement unlock patterns</p>
                            <p><strong>Features:</strong> Progress, playstyle, skill level, temporal patterns</p>
                            <p><strong>Hybrid:</strong> Combines ML predictions with progress calculations</p>
                            
                            <h4 style="margin-top: 1rem;">RL Environment:</h4>
                            <pre>State Space: 20 dimensions | Action Space: 15 actions</pre>
                            <p><strong>Actions:</strong> Collect, buy buildings, train models, research</p>
                            <p><strong>Reward:</strong> Accuracy gain + efficiency + achievements</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const trainBtn = document.getElementById('btn-train-predictor');
        const predictBtn = document.getElementById('btn-predict');

        if (trainBtn) {
            trainBtn.addEventListener('click', () => this.trainPredictor());
        }

        if (predictBtn) {
            predictBtn.addEventListener('click', () => this.makePredictions());
        }
    }

    /**
     * Train Smart Predictor
     */
    async trainPredictor() {
        const status = document.getElementById('predictor-status');
        const trainBtn = document.getElementById('btn-train-predictor');

        if (!this.smartPredictor || !status || !trainBtn) return;

        try {
            status.style.display = 'block';
            trainBtn.disabled = true;
            trainBtn.textContent = '⏳ Training...';
            status.innerHTML = '<p>Training ML model on your achievement history...</p><div class="training-progress"></div>';

            const success = await this.smartPredictor.train((progress) => {
                if (progress.epoch % 10 === 0) {
                    status.innerHTML = `
                        <p>Training: Epoch ${progress.epoch}/${progress.totalEpochs}</p>
                        <div class="training-progress">
                            <div class="progress-bar" style="width: ${(progress.epoch / progress.totalEpochs) * 100}%"></div>
                        </div>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">
                            Loss: ${progress.loss.toFixed(4)} | Accuracy: ${(progress.accuracy * 100).toFixed(1)}%
                        </p>
                    `;
                }
            });

            if (success) {
                status.innerHTML = '<p style="color: #4ade80;">✅ ML model trained! Predictions are now personalized to your playstyle.</p>';
                trainBtn.textContent = '🔄 Retrain Model';
                trainBtn.disabled = false;
                
                // Auto-predict after training
                setTimeout(() => {
                    this.makePredictions();
                    // Hide status after a bit
                    setTimeout(() => { status.style.display = 'none'; }, 3000);
                }, 500);
            } else {
                throw new Error('Training failed - need more achievement unlocks');
            }

        } catch (error) {
            console.error('[AI Lab] Training error:', error);
            status.innerHTML = `<p style="color: #e63946;">❌ ${error.message}</p>`;
            trainBtn.disabled = false;
            trainBtn.textContent = '🎓 Train ML Model';
        }
    }

    /**
     * Make predictions with Smart Predictor
     */
    async makePredictions() {
        const results = document.getElementById('predictor-results');
        if (!this.smartPredictor || !results) return;

        try {
            const topPredictions = await this.smartPredictor.getTopPredictions(5);

            if (topPredictions.length === 0) {
                results.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🎉</div>
                        <h4>All Caught Up!</h4>
                        <p>You've unlocked all achievements currently in reach.</p>
                        <p class="empty-hint">Keep playing to unlock resources for more achievements!</p>
                    </div>
                `;
                return;
            }

            const modelInfo = this.smartPredictor.getModelInfo();

            results.style.display = 'block';
            results.innerHTML = `
                <div class="prediction-header-banner">
                    <h4>Top 5 Predictions</h4>
                    ${modelInfo.modelLoaded ? `
                        <div class="ml-badge">
                            <span class="ml-icon">✨</span>
                            <span>ML-Enhanced (${modelInfo.trainingDataSize} unlocks)</span>
                        </div>
                    ` : `
                        <div class="ml-badge basic">
                            <span class="ml-icon">📊</span>
                            <span>Progress-Based</span>
                        </div>
                    `}
                </div>
                <div class="prediction-list">
                    ${topPredictions.map((pred, index) => this.renderPrediction(pred, index, modelInfo.modelLoaded)).join('')}
                </div>
                <div class="prediction-footer">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem;">
                        ℹ️ ${modelInfo.modelLoaded ? 'Predictions combine ML analysis with progress tracking.' : 'Unlock more achievements to enable ML personalization!'}
                    </p>
                </div>
            `;

            this.setupTooltips();
            this.startAutoUpdate();

        } catch (error) {
            console.error('[AI Lab] Prediction error:', error);
            results.innerHTML = `<p style="color: #e63946;">❌ Prediction failed: ${error.message}</p>`;
        }
    }

    /**
     * Render a single prediction with ML confidence
     */
    renderPrediction(pred, index, hasMLModel) {
        const confidence = pred.confidence || 0.5;
        const confidenceClass = this.getConfidenceClass(confidence);
        const shouldPulse = confidence >= 0.8 && pred.progressPercent > 80;
        
        return `
            <div class="prediction-item ${confidenceClass} ${shouldPulse ? 'pulse-animation' : ''}" 
                 style="animation-delay: ${index * 0.1}s;"
                 data-achievement-id="${pred.id}">
                
                <div class="prediction-header">
                    <div class="prediction-name">
                        <span class="achievement-icon">${pred.achievement.icon || '🏆'}</span>
                        <span>${pred.achievement.name}</span>
                        <span class="confidence-badge ${confidenceClass}" 
                              title="Prediction confidence: ${(confidence * 100).toFixed(0)}%">
                            ${this.getConfidenceEmoji(confidence)}
                        </span>
                    </div>
                    <div class="prediction-eta">
                        <span class="eta-icon">⏱️</span>
                        ${this.formatTimeEstimate(pred.timeEstimate)}
                    </div>
                </div>
                
                <div class="prediction-description">${pred.achievement.description || ''}</div>
                
                <!-- Probability Breakdown (if ML available) -->
                ${hasMLModel ? `
                    <div class="probability-breakdown">
                        <div class="prob-item">
                            <span class="prob-label">🧠 ML:</span>
                            <span class="prob-value">${(pred.mlProbability * 100).toFixed(0)}%</span>
                        </div>
                        <div class="prob-item">
                            <span class="prob-label">📊 Progress:</span>
                            <span class="prob-value">${(pred.progressProbability * 100).toFixed(0)}%</span>
                        </div>
                        <div class="prob-item combined">
                            <span class="prob-label">✨ Combined:</span>
                            <span class="prob-value">${(pred.combinedProbability * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Progress Bar -->
                <div class="prediction-bar-container">
                    <div class="prediction-bar ${confidenceClass}" 
                         style="width: ${pred.progressPercent}%"></div>
                    <span class="prediction-percent">${pred.progressPercent.toFixed(1)}%</span>
                </div>
                
                <div class="prediction-details">
                    <div class="detail-item">
                        <span class="detail-label">Progress:</span>
                        <span class="detail-value">${this.formatValue(pred.current)} / ${this.formatValue(pred.target)}</span>
                    </div>
                    ${pred.rate > 0 ? `
                        <div class="detail-item">
                            <span class="detail-label">Rate:</span>
                            <span class="detail-value">+${this.formatValue(pred.rate)}/s</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="info-trigger" data-tooltip-id="tooltip-${pred.id}">
                    <span>💡</span>
                    <span class="info-text">Strategy tips</span>
                </div>
                
                <div class="tooltip-content" id="tooltip-${pred.id}" style="display: none;">
                    ${this.generateTooltipContent(pred)}
                </div>
            </div>
        `;
    }

    /**
     * Calculate confidence level
     */
    calculateConfidence(pred) {
        return pred.confidence || 0.5;
    }

    /**
     * Get confidence CSS class
     */
    getConfidenceClass(confidence) {
        if (confidence >= 0.7) return 'high-confidence';
        if (confidence >= 0.4) return 'medium-confidence';
        return 'low-confidence';
    }

    /**
     * Get confidence emoji
     */
    getConfidenceEmoji(confidence) {
        if (confidence >= 0.7) return '🔥';
        if (confidence >= 0.4) return '✨';
        return '🌱';
    }

    /**
     * Generate tooltip content
     */
    generateTooltipContent(pred) {
        const achievement = pred.achievement;
        const req = achievement?.requirement;
        
        let strategy = 'Keep playing to make progress!';
        
        if (req) {
            switch (req.type) {
                case 'modelsTrained':
                    strategy = `Complete ${req.value} training tasks. Focus on quick training cycles!`;
                    break;
                case 'totalDataGenerated':
                    strategy = `Generate ${this.formatValue(req.value)} training data. Build more data generators!`;
                    break;
                case 'maxAccuracy':
                    strategy = `Reach ${req.value}% accuracy. Upgrade your models and research better algorithms!`;
                    break;
                case 'buildingCount':
                    strategy = `Build ${req.value} ${req.building}. Save up resources and purchase them!`;
                    break;
                case 'totalCompute':
                    strategy = `Reach ${this.formatValue(req.value)} TFLOPS. Invest in GPU clusters!`;
                    break;
                case 'specificResearch':
                    strategy = `Unlock the "${req.research}" research. Earn research points!`;
                    break;
                default:
                    strategy = 'Continue progressing through the game!';
            }
        }
        
        return `
            <div class="tooltip-inner">
                <h5>🎯 ${achievement.name}</h5>
                <p class="tooltip-desc">${achievement.description}</p>
                <div class="tooltip-divider"></div>
                <p class="tooltip-strategy"><strong>Strategy:</strong> ${strategy}</p>
                <p class="tooltip-progress"><strong>Current Progress:</strong> ${pred.progressPercent.toFixed(1)}%</p>
                ${pred.rate > 0 ? `<p class="tooltip-rate"><strong>Production Rate:</strong> +${this.formatValue(pred.rate)}/s</p>` : ''}
            </div>
        `;
    }

    /**
     * Setup tooltips
     */
    setupTooltips() {
        const triggers = document.querySelectorAll('.info-trigger');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const tooltipId = trigger.getAttribute('data-tooltip-id');
                const tooltip = document.getElementById(tooltipId);
                
                if (tooltip) {
                    document.querySelectorAll('.tooltip-content').forEach(t => {
                        if (t.id !== tooltipId) t.style.display = 'none';
                    });
                    tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.info-trigger')) {
                document.querySelectorAll('.tooltip-content').forEach(t => {
                    t.style.display = 'none';
                });
            }
        });
    }

    /**
     * Format values
     */
    formatValue(value) {
        if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B';
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        if (value >= 1) return value.toFixed(1);
        return value.toFixed(3);
    }

    /**
     * Format time estimate
     */
    formatTimeEstimate(seconds) {
        if (!isFinite(seconds) || seconds < 0) return 'Unknown';
        if (seconds < 60) return `≈${Math.ceil(seconds)}s`;
        if (seconds < 3600) return `≈${Math.ceil(seconds / 60)}m`;
        if (seconds < 86400) return `≈${Math.ceil(seconds / 3600)}h`;
        return `≈${Math.ceil(seconds / 86400)}d`;
    }

    /**
     * Start auto-updating
     */
    startAutoUpdate() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => {
            const results = document.getElementById('predictor-results');
            if (results && results.style.display !== 'none') {
                this.makePredictions();
            }
        }, 5000);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    renderError(error) {
        const content = document.getElementById('ai-lab-content');
        if (!content) return;
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #e63946;">
                <h3>⚠️ AI Lab Failed to Initialize</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                    🔄 Reload Page
                </button>
            </div>
        `;
    }

    destroy() {
        this.stopAutoUpdate();
    }
}

// Enhanced styles with ML probability breakdown
const style = document.createElement('style');
style.textContent = `
    ${document.getElementById('ai-lab-styles')?.textContent || ''}
    
    .training-hint {
        padding: 0.5rem 1rem;
        background: var(--bg-tertiary);
        border-radius: 8px;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .prediction-header-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .prediction-header-banner h4 {
        margin: 0;
    }
    
    .ml-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.8rem;
        background: linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.2));
        border: 1px solid #22c55e;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    
    .ml-badge.basic {
        background: rgba(100, 100, 100, 0.2);
        border-color: var(--border-color);
    }
    
    .ml-icon {
        font-size: 1rem;
    }
    
    .probability-breakdown {
        display: flex;
        gap: 1rem;
        margin: 0.75rem 0;
        padding: 0.5rem;
        background: var(--bg-tertiary);
        border-radius: 6px;
        flex-wrap: wrap;
    }
    
    .prob-item {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.85rem;
    }
    
    .prob-item.combined {
        font-weight: 700;
        color: var(--accent-primary);
        margin-left: auto;
    }
    
    .prob-label {
        color: var(--text-secondary);
    }
    
    .prob-value {
        font-weight: 600;
    }
`;
if (!document.getElementById('ai-lab-ml-styles')) {
    style.id = 'ai-lab-ml-styles';
    document.head.appendChild(style);
}
