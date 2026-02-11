/**
 * AI Lab UI - User Interface for Real Machine Learning Features
 * 
 * Manages the UI for:
 * - Achievement Predictor (with REAL progress bars + Polish!)
 * - RL Bot Training
 * - Watch AI Play Mode
 * - Human vs AI Competition
 */

import { AchievementPredictor } from '../ai/achievement-predictor.js';
import { RLEnvironment } from '../ai/rl-environment.js';

export class AILabUI {
    constructor(gameState) {
        this.game = gameState;
        this.predictor = null;
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

            // Initialize AI modules
            this.predictor = new AchievementPredictor(this.game);
            await this.predictor.init();

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
                        <span>Achievement Predictor: Ready</span>
                    </div>
                    <div class="status-item">
                        <span class="status-icon">🤖</span>
                        <span>RL Environment: Ready</span>
                    </div>
                </div>

                <!-- Achievement Predictor Section -->
                <div class="ai-section">
                    <div class="ai-section-header">
                        <h3>🎯 Achievement Predictor</h3>
                        <p>ML model that predicts which achievements you'll unlock next</p>
                    </div>
                    <div class="ai-section-content">
                        <div class="predictor-controls">
                            <button class="btn-primary" id="btn-train-predictor">
                                🎓 Retrain Model
                            </button>
                            <button class="btn-secondary" id="btn-predict">
                                🔮 Make Predictions
                            </button>
                        </div>
                        <div id="predictor-status" class="predictor-status">
                            <p style="color: #4ade80;">✅ Training complete! Model ready for predictions.</p>
                        </div>
                        <div id="predictor-results" class="predictor-results">
                            <p style="color: var(--text-secondary);">Click "Make Predictions" to analyze your progress!</p>
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
                            <h4>Achievement Predictor Architecture:</h4>
                            <pre>Input (20 features) → Dense (16, ReLU) → Dense (8, ReLU) → Output (30, Sigmoid)</pre>
                            <p><strong>Input Features:</strong> Resources, buildings, research, progress</p>
                            <p><strong>Output:</strong> Probability for each achievement (0-1)</p>
                            <p><strong>Training:</strong> Binary cross-entropy loss, Adam optimizer</p>
                            
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
     * Train achievement predictor
     */
    async trainPredictor() {
        const status = document.getElementById('predictor-status');
        const trainBtn = document.getElementById('btn-train-predictor');
        const predictBtn = document.getElementById('btn-predict');

        if (!this.predictor || !status || !trainBtn) return;

        try {
            trainBtn.disabled = true;
            trainBtn.textContent = '⏳ Training...';
            status.innerHTML = '<p>Training in progress...</p><div class="training-progress"></div>';

            // Train model with progress callback
            const success = await this.predictor.train((progress) => {
                status.innerHTML = `
                    <p>Training: Epoch ${progress.epoch}/${progress.totalEpochs}</p>
                    <div class="training-progress">
                        <div class="progress-bar" style="width: ${(progress.epoch / progress.totalEpochs) * 100}%"></div>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-secondary);">
                        Loss: ${progress.loss.toFixed(4)} | Accuracy: ${(progress.accuracy * 100).toFixed(1)}%
                    </p>
                `;
            });

            if (success) {
                status.innerHTML = '<p style="color: #4ade80;">✅ Training complete! Model ready for predictions.</p>';
                trainBtn.textContent = '🔄 Retrain Model';
                trainBtn.disabled = false;
                
                if (predictBtn) {
                    predictBtn.disabled = false;
                }

                // Auto-predict after training
                setTimeout(() => this.makePredictions(), 500);
            } else {
                throw new Error('Training failed');
            }

        } catch (error) {
            console.error('[AI Lab] Training error:', error);
            status.innerHTML = `<p style="color: #e63946;">❌ Training failed: ${error.message}</p>`;
            trainBtn.disabled = false;
            trainBtn.textContent = '🎓 Train Model';
        }
    }

    /**
     * Make predictions (with REAL progress bars + Polish!)
     */
    async makePredictions() {
        const results = document.getElementById('predictor-results');
        if (!this.predictor || !results) return;

        try {
            // Get predictions with real progress data
            const predictions = await this.predictor.predict();
            const topPredictions = this.predictor.getTopPredictions(5);

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

            results.style.display = 'block';
            results.innerHTML = `
                <h4>Top 5 Achievements (Most Likely to Unlock Soon):</h4>
                <div class="prediction-list">
                    ${topPredictions.map((pred, index) => this.renderPrediction(pred, index)).join('')}
                </div>
                <div class="prediction-footer">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem;">
                        ℹ️ Progress and time estimates update every 5 seconds based on your production rates.
                    </p>
                </div>
            `;

            // Setup tooltips after rendering
            this.setupTooltips();

            // Start auto-updating predictions
            this.startAutoUpdate();

        } catch (error) {
            console.error('[AI Lab] Prediction error:', error);
            results.innerHTML = `<p style="color: #e63946;">❌ Prediction failed: ${error.message}</p>`;
        }
    }

    /**
     * Render a single prediction with confidence indicator and tooltip
     */
    renderPrediction(pred, index) {
        const confidence = this.calculateConfidence(pred);
        const confidenceClass = this.getConfidenceClass(confidence);
        const shouldPulse = confidence >= 0.8 && pred.progressPercent > 80;
        
        return `
            <div class="prediction-item ${confidenceClass} ${shouldPulse ? 'pulse-animation' : ''}" 
                 style="animation-delay: ${index * 0.1}s;"
                 data-achievement-id="${pred.id}">
                
                <!-- Header -->
                <div class="prediction-header">
                    <div class="prediction-name">
                        <span class="achievement-icon">${pred.icon || '🏆'}</span>
                        <span>${pred.name}</span>
                        <span class="confidence-badge ${confidenceClass}" 
                              title="Prediction confidence: ${(confidence * 100).toFixed(0)}%">
                            ${this.getConfidenceEmoji(confidence)}
                        </span>
                    </div>
                    <div class="prediction-eta">
                        <span class="eta-icon">⏱️</span>
                        ${this.predictor.formatTimeEstimate(pred.timeEstimate)}
                    </div>
                </div>
                
                <!-- Description -->
                <div class="prediction-description">${pred.description || ''}</div>
                
                <!-- Progress Bar -->
                <div class="prediction-bar-container">
                    <div class="prediction-bar ${confidenceClass}" 
                         style="width: ${pred.progressPercent}%"></div>
                    <span class="prediction-percent">${pred.progressPercent.toFixed(1)}%</span>
                </div>
                
                <!-- Details -->
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
                
                <!-- Tooltip trigger -->
                <div class="info-trigger" data-tooltip-id="tooltip-${pred.id}">
                    <span>💡</span>
                    <span class="info-text">Why this prediction?</span>
                </div>
                
                <!-- Hidden tooltip content -->
                <div class="tooltip-content" id="tooltip-${pred.id}" style="display: none;">
                    ${this.generateTooltipContent(pred)}
                </div>
            </div>
        `;
    }

    /**
     * Calculate confidence level for prediction
     */
    calculateConfidence(pred) {
        // Confidence based on:
        // 1. Progress percentage (higher = more confident)
        // 2. Time estimate (shorter = more confident)
        // 3. Production rate (higher = more confident)
        
        let confidence = 0;
        
        // Progress weight: 50%
        confidence += (pred.progressPercent / 100) * 0.5;
        
        // Time weight: 30%
        if (pred.timeEstimate < 60) confidence += 0.3;
        else if (pred.timeEstimate < 300) confidence += 0.2;
        else if (pred.timeEstimate < 3600) confidence += 0.1;
        
        // Rate weight: 20%
        if (pred.rate > 0) {
            confidence += Math.min(pred.rate / 10, 0.2);
        }
        
        return Math.min(confidence, 1);
    }

    /**
     * Get confidence CSS class
     */
    getConfidenceClass(confidence) {
        if (confidence >= 0.8) return 'high-confidence';
        if (confidence >= 0.5) return 'medium-confidence';
        return 'low-confidence';
    }

    /**
     * Get confidence emoji
     */
    getConfidenceEmoji(confidence) {
        if (confidence >= 0.8) return '🔥';
        if (confidence >= 0.5) return '✨';
        return '🌱';
    }

    /**
     * Generate tooltip content with strategy tips
     */
    generateTooltipContent(pred) {
        const achievement = this.game.achievements[pred.id];
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
                <h5>🎯 ${pred.name}</h5>
                <p class="tooltip-desc">${pred.description}</p>
                <div class="tooltip-divider"></div>
                <p class="tooltip-strategy"><strong>Strategy:</strong> ${strategy}</p>
                <p class="tooltip-progress"><strong>Current Progress:</strong> ${pred.progressPercent.toFixed(1)}%</p>
                ${pred.rate > 0 ? `<p class="tooltip-rate"><strong>Production Rate:</strong> +${this.formatValue(pred.rate)}/s</p>` : ''}
            </div>
        `;
    }

    /**
     * Setup interactive tooltips
     */
    setupTooltips() {
        const triggers = document.querySelectorAll('.info-trigger');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const tooltipId = trigger.getAttribute('data-tooltip-id');
                const tooltip = document.getElementById(tooltipId);
                
                if (tooltip) {
                    // Close all other tooltips
                    document.querySelectorAll('.tooltip-content').forEach(t => {
                        if (t.id !== tooltipId) t.style.display = 'none';
                    });
                    
                    // Toggle this tooltip
                    tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
                }
            });
        });
        
        // Close tooltips when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.info-trigger')) {
                document.querySelectorAll('.tooltip-content').forEach(t => {
                    t.style.display = 'none';
                });
            }
        });
    }

    /**
     * Format numeric values for display
     */
    formatValue(value) {
        if (value >= 1000000000) {
            return (value / 1000000000).toFixed(1) + 'B';
        } else if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        } else if (value >= 1) {
            return value.toFixed(1);
        } else {
            return value.toFixed(3);
        }
    }

    /**
     * Start auto-updating predictions
     */
    startAutoUpdate() {
        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Update every 5 seconds
        this.updateInterval = setInterval(() => {
            const results = document.getElementById('predictor-results');
            if (results && results.style.display !== 'none') {
                this.makePredictions();
            }
        }, 5000);
    }

    /**
     * Stop auto-updating
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Render error state
     */
    renderError(error) {
        const content = document.getElementById('ai-lab-content');
        if (!content) return;

        content.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #e63946;">
                <h3>⚠️ AI Lab Failed to Initialize</h3>
                <p>${error.message}</p>
                <p style="color: var(--text-secondary); margin-top: 1rem;">
                    Make sure TensorFlow.js loaded correctly. Try reloading the page.
                </p>
                <button class="btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                    🔄 Reload Page
                </button>
            </div>
        `;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stopAutoUpdate();
    }
}

// Add AI Lab styles (UPDATED WITH POLISH!)
const style = document.createElement('style');
style.textContent = `
    .ai-lab-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }

    .ai-status-banner {
        display: flex;
        gap: 2rem;
        padding: 1rem;
        background: var(--bg-secondary);
        border: 2px solid var(--accent-primary);
        border-radius: 12px;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .status-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
    }

    .status-icon {
        font-size: 1.2rem;
    }

    .ai-section {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .ai-section-header h3 {
        margin: 0 0 0.5rem 0;
        color: var(--accent-primary);
    }

    .ai-section-header p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .ai-section-content {
        margin-top: 1rem;
    }

    .predictor-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .predictor-status {
        padding: 1rem;
        background: var(--bg-tertiary);
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .training-progress {
        width: 100%;
        height: 8px;
        background: var(--bg-tertiary);
        border-radius: 4px;
        overflow: hidden;
        margin: 0.5rem 0;
    }

    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        transition: width 0.3s ease;
    }

    .predictor-results {
        padding: 1rem;
        background: var(--bg-tertiary);
        border-radius: 8px;
    }

    .prediction-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
    }

    .prediction-item {
        padding: 1rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        transition: all 0.3s ease;
        opacity: 0;
        animation: fadeIn 0.5s ease forwards;
        position: relative;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .prediction-item:hover {
        border-color: var(--accent-primary);
        box-shadow: 0 4px 12px rgba(0, 255, 255, 0.1);
        transform: translateY(-2px);
    }

    .prediction-item.high-confidence {
        border-color: #22c55e;
    }

    .prediction-item.medium-confidence {
        border-color: #eab308;
    }

    .prediction-item.low-confidence {
        border-color: var(--border-color);
        opacity: 0.8;
    }

    .pulse-animation {
        animation: fadeIn 0.5s ease forwards, pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        50% { box-shadow: 0 0 20px 5px rgba(34, 197, 94, 0.3); }
    }

    .prediction-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .prediction-name {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        font-size: 1.1rem;
    }

    .achievement-icon {
        font-size: 1.5rem;
    }

    .confidence-badge {
        font-size: 0.9rem;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        background: var(--bg-tertiary);
        cursor: help;
    }

    .confidence-badge.high-confidence {
        background: rgba(34, 197, 94, 0.2);
    }

    .confidence-badge.medium-confidence {
        background: rgba(234, 179, 8, 0.2);
    }

    .prediction-eta {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent-secondary);
    }

    .eta-icon {
        font-size: 1.2rem;
    }

    .prediction-description {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
    }

    .prediction-bar-container {
        position: relative;
        height: 32px;
        background: var(--bg-tertiary);
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    .prediction-bar {
        height: 100%;
        background: linear-gradient(90deg, #4ade80, #22c55e);
        transition: width 0.8s ease;
        box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
    }

    .prediction-bar.high-confidence {
        background: linear-gradient(90deg, #22c55e, #16a34a);
        box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
    }

    .prediction-bar.medium-confidence {
        background: linear-gradient(90deg, #eab308, #ca8a04);
        box-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
    }

    .prediction-percent {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.9rem;
        font-weight: 700;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }

    .prediction-details {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
    }

    .detail-item {
        display: flex;
        gap: 0.5rem;
        font-size: 0.85rem;
    }

    .detail-label {
        color: var(--text-secondary);
    }

    .detail-value {
        color: var(--text-primary);
        font-weight: 600;
    }

    .info-trigger {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.85rem;
        color: var(--accent-primary);
        cursor: pointer;
        margin-top: 0.5rem;
        padding: 0.3rem;
        border-radius: 4px;
        transition: background 0.2s;
        width: fit-content;
    }

    .info-trigger:hover {
        background: var(--bg-tertiary);
    }

    .info-text {
        text-decoration: underline;
    }

    .tooltip-content {
        position: absolute;
        top: calc(100% + 0.5rem);
        left: 0;
        right: 0;
        z-index: 1000;
        background: var(--bg-primary);
        border: 2px solid var(--accent-primary);
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        animation: tooltipFadeIn 0.3s ease;
    }

    @keyframes tooltipFadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .tooltip-inner h5 {
        margin: 0 0 0.5rem 0;
        color: var(--accent-primary);
    }

    .tooltip-desc {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin: 0 0 0.5rem 0;
    }

    .tooltip-divider {
        height: 1px;
        background: var(--border-color);
        margin: 0.75rem 0;
    }

    .tooltip-strategy,
    .tooltip-progress,
    .tooltip-rate {
        font-size: 0.85rem;
        margin: 0.25rem 0;
    }

    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .empty-state h4 {
        color: var(--accent-primary);
        margin: 0.5rem 0;
    }

    .empty-state p {
        color: var(--text-secondary);
        margin: 0.5rem 0;
    }

    .empty-hint {
        font-size: 0.9rem;
        color: var(--text-tertiary) !important;
        margin-top: 1rem !important;
    }

    .prediction-footer {
        margin-top: 1rem;
        text-align: center;
    }

    .rl-status {
        padding: 2rem;
        text-align: center;
        background: var(--bg-tertiary);
        border-radius: 8px;
    }

    .tech-info {
        font-size: 0.9rem;
    }

    .tech-info h4 {
        margin: 0.5rem 0;
        color: var(--accent-secondary);
    }

    .tech-info pre {
        background: var(--bg-tertiary);
        padding: 0.75rem;
        border-radius: 6px;
        overflow-x: auto;
        margin: 0.5rem 0;
    }

    .tech-info p {
        margin: 0.25rem 0;
        color: var(--text-secondary);
    }

    @media (max-width: 768px) {
        .prediction-item {
            padding: 0.75rem;
        }

        .prediction-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .prediction-details {
            flex-direction: column;
            gap: 0.25rem;
        }

        .tooltip-content {
            position: fixed;
            left: 1rem;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
        }
    }
`;
document.head.appendChild(style);
