/**
 * Bot Controller
 * 
 * Orchestrates the RL training loop.
 * Manages the bot playing the game, learning, and tracking progress.
 */

import { DQNAgent } from './dqn-agent.js';
import { GameEnvironment } from './game-environment.js';
import { getAction } from './action-space.js';

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
    trainInterval: 50,      // Train every N steps (was 1, now 50 for performance!)
    maxStepsPerEpisode: 1000, // Safety limit
    autoSaveInterval: 10,   // Auto-save model every N episodes
    verboseLogging: true    // Log every action (for debugging)
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
        this.episodeSteps = 0;
        
        // Metrics
        this.episodeHistory = [];
        this.performanceMetrics = {
            stepsPerSecond: 0,
            episodesCompleted: 0,
            totalReward: 0,
            avgReward: 0,
            lastEpisodeReward: 0
        };
        
        // Action tracking (for debugging)
        this.actionCounts = {};
        this.actionSuccesses = {};
        
        // Timing
        this.lastTickTime = Date.now();
        this.performanceCheckTime = Date.now();
        this.performanceCheckSteps = 0;
        
        console.log('🤖 Bot Controller initialized');
        console.log(`⏱️ Training frequency: every ${this.config.trainInterval} steps`);
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
        this.episodeSteps = 0;
        
        // Reset action tracking for new run
        this.actionCounts = {};
        this.actionSuccesses = {};
        
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
        
        // Print action statistics
        this._printActionStats();
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
     * Toggle verbose logging
     */
    toggleVerbose() {
        this.config.verboseLogging = !this.config.verboseLogging;
        console.log(`📢 Verbose logging: ${this.config.verboseLogging ? 'ON' : 'OFF'}`);
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
        const actionId = this.agent.selectAction(state, validActions);
        const action = getAction(actionId);
        
        // Track action attempts
        this.actionCounts[action.name] = (this.actionCounts[action.name] || 0) + 1;
        
        // Verbose logging (only first 20 steps to avoid spam)
        if (this.config.verboseLogging && this.episodeSteps < 20) {
            console.log(`  Step ${this.episodeSteps + 1}: Trying "${action.name}"...`);
        }
        
        // Execute action in environment
        const { state: nextState, reward, done, info } = await this.environment.step(actionId);
        
        // Track action results
        if (info.success) {
            this.actionSuccesses[action.name] = (this.actionSuccesses[action.name] || 0) + 1;
        }
        
        // Verbose logging
        if (this.config.verboseLogging && this.episodeSteps < 20) {
            const status = info.success ? '✅ Success' : '❌ Failed';
            const reason = info.message ? ` (${info.message})` : '';
            const rewardStr = reward !== 0 ? ` [Reward: ${reward > 0 ? '+' : ''}${reward.toFixed(1)}]` : '';
            console.log(`    → ${status}${reason}${rewardStr}`);
        }
        
        // Store experience
        this.agent.remember(state, actionId, reward, nextState, done);
        
        // Train agent (only every N steps for performance!)
        if (this.totalSteps % this.config.trainInterval === 0) {
            await this.agent.train();
        }
        
        // Update counters
        this.totalSteps++;
        this.episodeSteps++;
        
        // Episode end (deployment)
        if (done) {
            await this._endEpisode(info);
        }
        
        // Safety limit
        if (this.episodeSteps >= this.config.maxStepsPerEpisode) {
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
            episode: this.currentEpisode + 1,
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
        this.episodeSteps = 0;
        
        console.log(`🏆 Episode ${this.currentEpisode} complete! Reward: ${episodeStats.reward.toFixed(0)}, Steps: ${episodeStats.steps}, Tokens: ${info.tokensEarned || 0}`);
        
        // Print action stats every 10 episodes
        if (this.currentEpisode % 10 === 0) {
            this._printActionStats();
        }
    }
    
    /**
     * Print action statistics (for debugging)
     */
    _printActionStats() {
        console.log('\n📊 Action Statistics:');
        console.log('Action Name | Attempts | Successes | Success Rate');
        console.log('------------|----------|-----------|-------------');
        
        for (const [actionName, attempts] of Object.entries(this.actionCounts)) {
            const successes = this.actionSuccesses[actionName] || 0;
            const rate = ((successes / attempts) * 100).toFixed(1);
            console.log(`${actionName.padEnd(11)} | ${attempts.toString().padStart(8)} | ${successes.toString().padStart(9)} | ${rate.padStart(11)}%`);
        }
        console.log('');
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
            episodeSteps: this.episodeSteps,
            ...this.performanceMetrics,
            ...agentStats,
            environment: envInfo,
            recentEpisodes: this.episodeHistory.slice(-10),
            actionStats: {
                counts: this.actionCounts,
                successes: this.actionSuccesses
            }
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
        this.episodeSteps = 0;
        this.episodeHistory = [];
        this.actionCounts = {};
        this.actionSuccesses = {};
        
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
