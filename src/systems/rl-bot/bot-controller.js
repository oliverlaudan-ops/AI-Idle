/**
 * Bot Controller
 * 
 * Orchestrates the RL training loop.
 * Manages the bot playing the game, learning, and tracking progress.
 */

import { DQNAgent } from './dqn-agent.js';
import { GameEnvironment } from './game-environment.js';

/**
 * Bot Controller States
 */
export const BotState = {
    IDLE: 'idle',           // Not running
    TRAINING: 'training',   // Active training
    PAUSED: 'paused'        // Paused
};

/**
 * Bot Controller Configuration
 */
const DEFAULT_CONFIG = {
    stepsPerTick: 1,        // How many actions per tick
    tickInterval: 1000,     // Milliseconds between ticks (1 = 1 second)
    trainInterval: 1,       // Train every N steps
    maxStepsPerEpisode: 1000, // Safety limit
    autoSaveInterval: 10    // Auto-save model every N episodes
};

export class BotController {
    /**
     * Create a bot controller
     * @param {object} gameState - Game state reference
     * @param {object} config - Configuration options
     */
    constructor(gameState, config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // Components
        this.agent = new DQNAgent();
        this.environment = new GameEnvironment(gameState);
        
        // State
        this.state = BotState.IDLE;
        this.speed = 1.0; // Speed multiplier (1x, 2x, 5x, 10x)
        
        // Training loop
        this.intervalId = null;
        this.currentEpisode = 0;
        this.totalSteps = 0;
        
        // Metrics
        this.episodeHistory = [];
        this.performanceMetrics = {
            stepsPerSecond: 0,
            episodesCompleted: 0,
            totalReward: 0,
            avgReward: 0,
            lastEpisodeReward: 0
        };
        
        // Timing
        this.lastTickTime = Date.now();
        this.performanceCheckTime = Date.now();
        this.performanceCheckSteps = 0;
        
        console.log('🤖 Bot Controller initialized');
    }
    
    /**
     * Start the bot training
     */
    start() {
        if (this.state === BotState.TRAINING) {
            console.warn('Bot already running');
            return;
        }
        
        console.log('🚀 Bot starting training...');
        this.state = BotState.TRAINING;
        
        // Start training loop
        this._startTrainingLoop();
    }
    
    /**
     * Stop the bot
     */
    stop() {
        if (this.state === BotState.IDLE) {
            return;
        }
        
        console.log('⏸️ Bot stopped');
        this.state = BotState.IDLE;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    /**
     * Pause the bot
     */
    pause() {
        if (this.state !== BotState.TRAINING) {
            return;
        }
        
        console.log('⏸️ Bot paused');
        this.state = BotState.PAUSED;
    }
    
    /**
     * Resume the bot
     */
    resume() {
        if (this.state !== BotState.PAUSED) {
            return;
        }
        
        console.log('▶️ Bot resumed');
        this.state = BotState.TRAINING;
    }
    
    /**
     * Set training speed
     * @param {number} speed - Speed multiplier (1, 2, 5, 10)
     */
    setSpeed(speed) {
        this.speed = speed;
        
        // Restart loop with new speed if running
        if (this.state === BotState.TRAINING) {
            this.stop();
            this.start();
        }
        
        console.log(`⏩ Speed set to ${speed}x`);
    }
    
    /**
     * Start the training loop
     */
    _startTrainingLoop() {
        const tickInterval = this.config.tickInterval / this.speed;
        
        this.intervalId = setInterval(() => {
            if (this.state === BotState.TRAINING) {
                this._tick();
            }
        }, tickInterval);
    }
    
    /**
     * Execute one training tick
     */
    async _tick() {
        try {
            // Execute multiple steps per tick for higher speeds
            const stepsThisTick = Math.floor(this.config.stepsPerTick * this.speed);
            
            for (let i = 0; i < stepsThisTick; i++) {
                await this._step();
            }
            
            // Update performance metrics
            this._updatePerformanceMetrics();
            
        } catch (error) {
            console.error('Error in training tick:', error);
            this.stop();
        }
    }
    
    /**
     * Execute one training step
     */
    async _step() {
        // Get current state
        const state = this.environment.observe();
        
        // Get valid actions
        const validActions = this.environment.getValidActions();
        
        if (validActions.length === 0) {
            console.warn('No valid actions available!');
            return;
        }
        
        // Agent selects action
        const action = this.agent.selectAction(state, validActions);
        
        // Execute action in environment
        const { state: nextState, reward, done, info } = await this.environment.step(action);
        
        // Store experience
        this.agent.remember(state, action, reward, nextState, done);
        
        // Train agent
        if (this.totalSteps % this.config.trainInterval === 0) {
            await this.agent.train();
        }
        
        // Update counters
        this.totalSteps++;
        
        // Episode end (deployment)
        if (done) {
            await this._endEpisode(info);
        }
        
        // Safety limit
        const episodeSteps = this.environment.episodeSteps;
        if (episodeSteps >= this.config.maxStepsPerEpisode) {
            console.warn(`Episode exceeded max steps (${this.config.maxStepsPerEpisode})`);
            await this._endEpisode(info);
        }
    }
    
    /**
     * End current episode
     * @param {object} info - Step info
     */
    async _endEpisode(info) {
        const episodeStats = this.environment.getEpisodeStats();
        
        // Update agent
        this.agent.endEpisode(episodeStats.reward);
        
        // Store episode history
        this.episodeHistory.push({
            episode: this.currentEpisode,
            reward: episodeStats.reward,
            steps: episodeStats.steps,
            duration: episodeStats.duration,
            tokensEarned: info.tokensEarned || 0,
            deployed: info.deployed
        });
        
        // Update metrics
        this.performanceMetrics.episodesCompleted++;
        this.performanceMetrics.totalReward += episodeStats.reward;
        this.performanceMetrics.avgReward = 
            this.performanceMetrics.totalReward / this.performanceMetrics.episodesCompleted;
        this.performanceMetrics.lastEpisodeReward = episodeStats.reward;
        
        this.currentEpisode++;
        
        // Auto-save model
        if (this.currentEpisode % this.config.autoSaveInterval === 0) {
            await this.agent.saveModel();
        }
        
        // Reset environment for next episode
        this.environment.reset();
        
        console.log(`🏆 Episode ${this.currentEpisode} complete! Reward: ${episodeStats.reward.toFixed(0)}, Steps: ${episodeStats.steps}, Tokens: ${info.tokensEarned || 0}`);
    }
    
    /**
     * Update performance metrics
     */
    _updatePerformanceMetrics() {
        const now = Date.now();
        const timeDelta = (now - this.performanceCheckTime) / 1000; // seconds
        
        if (timeDelta >= 1.0) { // Update every second
            const stepsDelta = this.totalSteps - this.performanceCheckSteps;
            this.performanceMetrics.stepsPerSecond = stepsDelta / timeDelta;
            
            this.performanceCheckTime = now;
            this.performanceCheckSteps = this.totalSteps;
        }
    }
    
    /**
     * Get current statistics
     * @returns {object} Stats
     */
    getStats() {
        const agentStats = this.agent.getStats();
        const envInfo = this.environment.getInfo();
        
        return {
            state: this.state,
            speed: this.speed,
            currentEpisode: this.currentEpisode,
            totalSteps: this.totalSteps,
            ...this.performanceMetrics,
            ...agentStats,
            environment: envInfo,
            recentEpisodes: this.episodeHistory.slice(-10)
        };
    }
    
    /**
     * Load a saved model
     * @param {string} name - Model name
     */
    async loadModel(name) {
        return await this.agent.loadModel(name);
    }
    
    /**
     * Save current model
     * @param {string} name - Model name
     */
    async saveModel(name) {
        return await this.agent.saveModel(name);
    }
    
    /**
     * Reset bot (clear all training)
     */
    reset() {
        this.stop();
        this.agent.reset();
        this.environment.reset();
        
        this.currentEpisode = 0;
        this.totalSteps = 0;
        this.episodeHistory = [];
        
        this.performanceMetrics = {
            stepsPerSecond: 0,
            episodesCompleted: 0,
            totalReward: 0,
            avgReward: 0,
            lastEpisodeReward: 0
        };
        
        console.log('🔄 Bot reset');
    }
}

/**
 * Create a bot controller
 * @param {object} gameState - Game state
 * @param {object} config - Configuration
 * @returns {BotController} Controller instance
 */
export function createBotController(gameState, config) {
    return new BotController(gameState, config);
}
