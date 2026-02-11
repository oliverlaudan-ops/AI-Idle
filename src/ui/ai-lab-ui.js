/**
 * AI Lab UI - User Interface for Real Machine Learning Features
 * 
 * Manages the UI for:
 * - Achievement Predictor (with REAL progress bars!)
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
     * Make predictions (with REAL progress bars!)
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
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <p>🎉 No achievements in range!</p>
                        <p style="font-size: 0.9rem;">You've unlocked everything achievable, or need more resources to progress.</p>
                    </div>
                `;
                return;
            }

            results.style.display = 'block';
            results.innerHTML = `
                <h4>Top 5 Achievements (Most Likely to Unlock Soon):</h4>
                <div class="prediction-list">
                    ${topPredictions.map(pred => `
                        <div class="prediction-item ${ pred.achievable ? '' : 'unachievable' }">
                            <div class="prediction-header">
                                <div class="prediction-name">
                                    <span class="achievement-icon">${pred.icon || '🏆'}</span>
                                    <span>${pred.name}</span>
                                </div>
                                <div class="prediction-eta">${this.predictor.formatTimeEstimate(pred.timeEstimate)}</div>
                            </div>
                            <div class="prediction-description">${pred.description || ''}</div>
                            <div class="prediction-bar-container">
                                <div class="prediction-bar" style="width: ${pred.progressPercent}%"></div>
                                <span class="prediction-percent">${pred.progressPercent.toFixed(1)}%</span>
                            </div>
                            <div class="prediction-details">
                                Current: ${this.formatValue(pred.current)} / ${this.formatValue(pred.target)}
                                ${pred.rate > 0 ? ` • Rate: ${this.formatValue(pred.rate)}/s` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="prediction-footer">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 1rem;">
                        ℹ️ Progress and time estimates update in real-time based on your current production rates.
                    </p>
                </div>
            `;

            // Start auto-updating predictions
            this.startAutoUpdate();

        } catch (error) {
            console.error('[AI Lab] Prediction error:', error);
            results.innerHTML = `<p style="color: #e63946;">❌ Prediction failed: ${error.message}</p>`;
        }
    }

    /**
     * Format numeric values for display
     */
    formatValue(value) {
        if (value >= 1000000) {
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
            if (document.getElementById('predictor-results').style.display !== 'none') {
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

// Add AI Lab styles
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
    }

    .prediction-item:hover {
        border-color: var(--accent-primary);
        box-shadow: 0 4px 12px rgba(0, 255, 255, 0.1);
    }

    .prediction-item.unachievable {
        opacity: 0.6;
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
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .prediction-eta {
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent-secondary);
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
    }
`;
document.head.appendChild(style);
