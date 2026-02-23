/**
 * RL Bot UI Component
 * 
 * Provides UI controls and visualization for the RL bot.
 */

import { createBotController, BotState, logSystemInfo } from '../systems/rl-bot/index.js';

export class RLBotUI {
    /**
     * Create RL Bot UI
     * @param {object} gameState - Game state reference
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.botController = null;
        this.updateInterval = null;
        
        // UI state
        this.isDirty = true;
        
        console.log('🎨 RL Bot UI initialized');
    }
    
    /**
     * Initialize the bot controller
     */
    initBot() {
        if (!this.botController) {
            this.botController = createBotController(this.gameState);
            logSystemInfo();
        }
    }
    
    /**
     * Render the UI
     * @param {HTMLElement} container - Container element
     */
    render(container) {
        if (!container) return;
        
        // Initialize bot if not done
        this.initBot();
        
        const html = `
            <div class="rl-bot-container">
                <!-- Header -->
                <div class="rl-bot-header">
                    <h2>🤖 Reinforcement Learning Bot</h2>
                    <p class="rl-bot-description">Watch an AI agent learn to play optimally through trial and error!</p>
                </div>
                
                <!-- Status Bar -->
                <div class="rl-bot-status">
                    <div class="status-indicator">
                        <span class="status-dot" id="rl-status-dot"></span>
                        <span class="status-text" id="rl-status-text">Idle</span>
                    </div>
                    <div class="status-info">
                        <span id="rl-episode-info">Episode 0</span>
                        <span class="separator">•</span>
                        <span id="rl-epsilon-info">ε: 1.000</span>
                    </div>
                </div>
                
                <!-- Control Panel -->
                <div class="rl-bot-controls">
                    <div class="control-group">
                        <h3>Training Controls</h3>
                        <div class="button-group">
                            <button id="rl-btn-start" class="btn btn-primary">
                                ▶️ Start Training
                            </button>
                            <button id="rl-btn-pause" class="btn btn-secondary" disabled>
                                ⏸️ Pause
                            </button>
                            <button id="rl-btn-stop" class="btn btn-secondary" disabled>
                                ⏹️ Stop
                            </button>
                            <button id="rl-btn-reset" class="btn btn-danger">
                                🔄 Reset
                            </button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <h3>Speed Control</h3>
                        <div class="speed-controls">
                            <button class="speed-btn" data-speed="1">1x</button>
                            <button class="speed-btn" data-speed="2">2x</button>
                            <button class="speed-btn" data-speed="5">5x</button>
                            <button class="speed-btn active" data-speed="10">10x</button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <h3>Model</h3>
                        <div class="button-group">
                            <button id="rl-btn-save" class="btn btn-secondary">
                                💾 Save Model
                            </button>
                            <button id="rl-btn-load" class="btn btn-secondary">
                                📁 Load Model
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Metrics Grid -->
                <div class="rl-metrics-grid">
                    <!-- Training Progress -->
                    <div class="metric-card">
                        <div class="metric-header">📊 Training Progress</div>
                        <div class="metric-content">
                            <div class="metric-row">
                                <span class="metric-label">Episodes:</span>
                                <span class="metric-value" id="rl-episodes">0</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">Total Steps:</span>
                                <span class="metric-value" id="rl-steps">0</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">Steps/Second:</span>
                                <span class="metric-value" id="rl-steps-per-sec">0.0</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Rewards -->
                    <div class="metric-card">
                        <div class="metric-header">🎯 Rewards</div>
                        <div class="metric-content">
                            <div class="metric-row">
                                <span class="metric-label">Total Reward:</span>
                                <span class="metric-value" id="rl-total-reward">0</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">Avg Reward:</span>
                                <span class="metric-value" id="rl-avg-reward">0.0</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">Last Episode:</span>
                                <span class="metric-value" id="rl-last-reward">0</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Learning -->
                    <div class="metric-card">
                        <div class="metric-header">🧠 Learning</div>
                        <div class="metric-content">
                            <div class="metric-row">
                                <span class="metric-label">Exploration (ε):</span>
                                <span class="metric-value" id="rl-epsilon">1.000</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">Avg Loss:</span>
                                <span class="metric-value" id="rl-loss">0.000</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">Buffer Size:</span>
                                <span class="metric-value" id="rl-buffer-size">0</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Environment -->
                    <div class="metric-card">
                        <div class="metric-header">🎮 Environment</div>
                        <div class="metric-content">
                            <div class="metric-row">
                                <span class="metric-label">Can Deploy:</span>
                                <span class="metric-value" id="rl-can-deploy">No</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">Tokens Available:</span>
                                <span class="metric-value" id="rl-tokens">0</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">Valid Actions:</span>
                                <span class="metric-value" id="rl-valid-actions">0</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Episodes Table -->
                <div class="rl-episodes-section">
                    <h3>📈 Recent Episodes</h3>
                    <div class="episodes-table-container">
                        <table class="episodes-table">
                            <thead>
                                <tr>
                                    <th>Episode</th>
                                    <th>Reward</th>
                                    <th>Steps</th>
                                    <th>Duration</th>
                                    <th>Tokens</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="rl-episodes-tbody">
                                <tr>
                                    <td colspan="6" class="empty-state">No episodes yet. Start training to see results!</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Info Footer -->
                <div class="rl-bot-footer">
                    <p class="info-text">
                        💡 <strong>Tip:</strong> The bot learns through trial and error. 
                        Early episodes will be random, but it will improve over time!
                    </p>
                    <p class="info-text">
                        🎯 <strong>Goal:</strong> Maximize deployment tokens by learning optimal building, training, and deployment strategies.
                    </p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        this._attachEventListeners();
        this._startUpdateLoop();
    }
    
    /**
     * Attach event listeners to UI controls
     */
    _attachEventListeners() {
        // Start button
        const startBtn = document.getElementById('rl-btn-start');
        startBtn?.addEventListener('click', () => this._handleStart());
        
        // Pause button
        const pauseBtn = document.getElementById('rl-btn-pause');
        pauseBtn?.addEventListener('click', () => this._handlePause());
        
        // Stop button
        const stopBtn = document.getElementById('rl-btn-stop');
        stopBtn?.addEventListener('click', () => this._handleStop());
        
        // Reset button
        const resetBtn = document.getElementById('rl-btn-reset');
        resetBtn?.addEventListener('click', () => this._handleReset());
        
        // Save button
        const saveBtn = document.getElementById('rl-btn-save');
        saveBtn?.addEventListener('click', () => this._handleSave());
        
        // Load button
        const loadBtn = document.getElementById('rl-btn-load');
        loadBtn?.addEventListener('click', () => this._handleLoad());
        
        // Speed buttons
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseInt(e.target.dataset.speed);
                this._handleSpeedChange(speed);
                
                // Update active state
                speedBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    /**
     * Handle start button
     */
    _handleStart() {
        if (!this.botController) return;
        
        this.botController.start();
        this._updateButtonStates();
    }
    
    /**
     * Handle pause button
     */
    _handlePause() {
        if (!this.botController) return;
        
        if (this.botController.state === BotState.TRAINING) {
            this.botController.pause();
        } else if (this.botController.state === BotState.PAUSED) {
            this.botController.resume();
        }
        
        this._updateButtonStates();
    }
    
    /**
     * Handle stop button
     */
    _handleStop() {
        if (!this.botController) return;
        
        this.botController.stop();
        this._updateButtonStates();
    }
    
    /**
     * Handle reset button
     */
    _handleReset() {
        if (!this.botController) return;
        
        if (confirm('Are you sure? This will delete all training progress!')) {
            this.botController.reset();
            this.isDirty = true;
        }
    }
    
    /**
     * Handle save button
     */
    async _handleSave() {
        if (!this.botController) return;
        
        try {
            await this.botController.saveModel();
            alert('Model saved successfully!');
        } catch (error) {
            alert('Failed to save model: ' + error.message);
        }
    }
    
    /**
     * Handle load button
     */
    async _handleLoad() {
        if (!this.botController) return;
        
        try {
            const loaded = await this.botController.loadModel();
            if (loaded) {
                alert('Model loaded successfully!');
                this.isDirty = true;
            } else {
                alert('No saved model found!');
            }
        } catch (error) {
            alert('Failed to load model: ' + error.message);
        }
    }
    
    /**
     * Handle speed change
     */
    _handleSpeedChange(speed) {
        if (!this.botController) return;
        
        this.botController.setSpeed(speed);
    }
    
    /**
     * Update button states based on bot state
     */
    _updateButtonStates() {
        if (!this.botController) return;
        
        const startBtn = document.getElementById('rl-btn-start');
        const pauseBtn = document.getElementById('rl-btn-pause');
        const stopBtn = document.getElementById('rl-btn-stop');
        
        const state = this.botController.state;
        
        if (state === BotState.IDLE) {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            pauseBtn.textContent = '⏸️ Pause';
        } else if (state === BotState.TRAINING) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            pauseBtn.textContent = '⏸️ Pause';
        } else if (state === BotState.PAUSED) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            pauseBtn.textContent = '▶️ Resume';
        }
    }
    
    /**
     * Start update loop for real-time metrics
     */
    _startUpdateLoop() {
        if (this.updateInterval) return;
        
        this.updateInterval = setInterval(() => {
            this.update();
        }, 500); // Update every 500ms
    }
    
    /**
     * Update UI with current stats
     */
    update() {
        if (!this.botController) return;
        
        const stats = this.botController.getStats();
        
        // Update status
        this._updateStatus(stats.state);
        
        // Update metrics
        this._updateElement('rl-episode-info', `Episode ${stats.currentEpisode}`);
        this._updateElement('rl-epsilon-info', `ε: ${stats.epsilon.toFixed(3)}`);
        
        this._updateElement('rl-episodes', stats.episodesCompleted.toLocaleString());
        this._updateElement('rl-steps', stats.totalSteps.toLocaleString());
        this._updateElement('rl-steps-per-sec', stats.stepsPerSecond.toFixed(1));
        
        this._updateElement('rl-total-reward', Math.floor(stats.totalReward).toLocaleString());
        this._updateElement('rl-avg-reward', stats.avgReward.toFixed(1));
        this._updateElement('rl-last-reward', Math.floor(stats.lastEpisodeReward).toLocaleString());
        
        this._updateElement('rl-epsilon', stats.epsilon.toFixed(3));
        this._updateElement('rl-loss', stats.avgRecentLoss?.toFixed(3) || '0.000');
        this._updateElement('rl-buffer-size', stats.replayBufferSize.toLocaleString());
        
        if (stats.environment) {
            this._updateElement('rl-can-deploy', stats.environment.canDeploy ? '✅ Yes' : '❌ No');
            this._updateElement('rl-tokens', stats.environment.tokensAvailable);
            this._updateElement('rl-valid-actions', stats.environment.validActions);
        }
        
        // Update episodes table
        if (stats.recentEpisodes && stats.recentEpisodes.length > 0) {
            this._updateEpisodesTable(stats.recentEpisodes);
        }
        
        // Update button states
        this._updateButtonStates();
    }
    
    /**
     * Update status indicator
     */
    _updateStatus(state) {
        const dot = document.getElementById('rl-status-dot');
        const text = document.getElementById('rl-status-text');
        
        if (!dot || !text) return;
        
        dot.className = 'status-dot';
        
        if (state === BotState.TRAINING) {
            dot.classList.add('status-active');
            text.textContent = 'Training';
        } else if (state === BotState.PAUSED) {
            dot.classList.add('status-paused');
            text.textContent = 'Paused';
        } else {
            dot.classList.add('status-idle');
            text.textContent = 'Idle';
        }
    }
    
    /**
     * Update episodes table
     */
    _updateEpisodesTable(episodes) {
        const tbody = document.getElementById('rl-episodes-tbody');
        if (!tbody) return;
        
        const rows = episodes.slice().reverse().map(ep => `
            <tr>
                <td>${ep.episode}</td>
                <td>${Math.floor(ep.reward).toLocaleString()}</td>
                <td>${ep.steps}</td>
                <td>${ep.duration.toFixed(1)}s</td>
                <td>${ep.tokensEarned || 0}</td>
                <td>${ep.deployed ? '🚀 Deployed' : '⏳ Ongoing'}</td>
            </tr>
        `).join('');
        
        tbody.innerHTML = rows;
    }
    
    /**
     * Helper to update element text content
     */
    _updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    /**
     * Clean up
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.botController) {
            this.botController.stop();
        }
    }
}

/**
 * Create and render RL Bot UI
 * @param {HTMLElement} container - Container element
 * @param {object} gameState - Game state
 * @returns {RLBotUI} UI instance
 */
export function createRLBotUI(container, gameState) {
    const ui = new RLBotUI(gameState);
    ui.render(container);
    return ui;
}
