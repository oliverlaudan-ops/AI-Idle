/**
 * RL Bot System - Public API
 * 
 * Exports all components needed to use the RL bot in the game.
 * 
 * PRIMARY GOAL: The bot learns to maximize deployment tokens!
 * 
 * USAGE:
 * ```
 * import { createBotController } from './systems/rl-bot/index.js';
 * 
 * const bot = createBotController(gameState);
 * bot.start();        // Start training
 * bot.setSpeed(5);    // 5x speed
 * bot.pause();        // Pause
 * bot.resume();       // Resume
 * bot.stop();         // Stop
 * bot.getStats();     // Get metrics
 * ```
 */

// ========== Phase 1: Core RL Components ==========

// Core agent
export { DQNAgent } from './dqn-agent.js';

// Action space
export {
    ACTION_SPACE,
    ActionType,
    getAction,
    getActionSpaceSize,
    getActionsByType,
    getActionId,
    isActionValid,
    getValidActions,
    getActionMask,
    isDeploymentAction,
    getDeploymentStrategy
} from './action-space.js';

// State encoding
export {
    encodeState,
    getStateDimensions,
    getFeatureNames,
    decodeState,
    encodeBatch,
    stateDifference,
    getDeploymentReadiness,
    STATE_CONSTANTS
} from './state-encoder.js';

// Reward function
export {
    calculateReward,
    calculateShapedReward,
    calculateReturn,
    normalizeRewards,
    calculateAdvantages,
    getRewardStats,
    REWARD_WEIGHTS,
    updateRewardWeights
} from './reward-function.js';

// Experience replay
export {
    ReplayBuffer,
    PrioritizedReplayBuffer
} from './replay-buffer.js';

// ========== Phase 2: Game Integration ==========

// Environment wrapper
export {
    GameEnvironment,
    createEnvironment
} from './game-environment.js';

// Action executor
export {
    executeAction,
    validateAction
} from './action-executor.js';

// Bot controller (main entry point)
export {
    BotController,
    BotState,
    createBotController
} from './bot-controller.js';

// ========== Quick Start Examples ==========

/**
 * Example 1: Simple bot setup
 * 
 * ```javascript
 * import { createBotController } from './systems/rl-bot/index.js';
 * 
 * // Create and start bot
 * const bot = createBotController(gameState);
 * bot.start();
 * 
 * // Control bot
 * bot.setSpeed(5);  // 5x speed
 * bot.pause();
 * bot.resume();
 * bot.stop();
 * 
 * // Get stats
 * const stats = bot.getStats();
 * console.log(`Episode: ${stats.currentEpisode}`);
 * console.log(`Reward: ${stats.avgReward}`);
 * console.log(`Epsilon: ${stats.epsilon}`);
 * ```
 */

/**
 * Example 2: Manual training loop
 * 
 * ```javascript
 * import { 
 *   DQNAgent, 
 *   createEnvironment,
 *   isDeploymentAction 
 * } from './systems/rl-bot/index.js';
 * 
 * const agent = new DQNAgent();
 * const env = createEnvironment(gameState);
 * 
 * async function trainStep() {
 *   const state = env.observe();
 *   const validActions = env.getValidActions();
 *   const action = agent.selectAction(state, validActions);
 *   
 *   const { state: nextState, reward, done, info } = await env.step(action);
 *   
 *   agent.remember(state, action, reward, nextState, done);
 *   await agent.train();
 *   
 *   if (done) {
 *     agent.endEpisode(env.episodeReward);
 *     env.reset();
 *   }
 * }
 * ```
 */

/**
 * Example 3: Custom action execution
 * 
 * ```javascript
 * import { 
 *   getAction,
 *   executeAction,
 *   isDeploymentAction 
 * } from './systems/rl-bot/index.js';
 * 
 * const actionId = 26; // Deploy Fast
 * const action = getAction(actionId);
 * const result = await executeAction(gameState, action);
 * 
 * if (result.success && result.deployed) {
 *   console.log(`Deployment successful! Earned ${result.tokensEarned} tokens`);
 * }
 * ```
 */

// ========== System Info ==========

export const RL_BOT_VERSION = '0.7.0';
export const RL_BOT_INFO = {
    version: RL_BOT_VERSION,
    algorithm: 'DQN (Deep Q-Network)',
    framework: 'TensorFlow.js',
    
    // Phase 1: Core RL
    stateDimensions: 27,
    actionSpace: 29,
    networkArchitecture: '27 → 128 → 64 → 29',
    
    // Phase 2: Integration
    components: [
        'DQN Agent (neural network)',
        'Game Environment (state wrapper)',
        'Action Executor (game mutations)',
        'Bot Controller (training loop)'
    ],
    
    primaryGoal: 'Maximize deployment tokens',
    
    features: [
        'Epsilon-greedy exploration',
        'Experience replay (10K buffer)',
        'Target network (stable learning)',
        'Gradient clipping',
        'Model persistence (IndexedDB)',
        'Deployment-focused rewards',
        'Strategy selection (Fast/Standard/Complete)',
        'Auto-pilot mode',
        'Variable speed (1x-10x)',
        'Real-time metrics'
    ],
    
    status: {
        phase1: 'Complete ✅',
        phase2: 'Complete ✅',
        phase3: 'Pending (UI)',
        phase4: 'Pending (Advanced Features)'
    }
};

/**
 * Log system info to console
 */
export function logSystemInfo() {
    console.log('%c🤖 RL Bot System', 'font-size: 16px; font-weight: bold;');
    console.log(`Version: ${RL_BOT_INFO.version}`);
    console.log(`Algorithm: ${RL_BOT_INFO.algorithm}`);
    console.log(`Network: ${RL_BOT_INFO.networkArchitecture}`);
    console.log(`State Space: ${RL_BOT_INFO.stateDimensions}D`);
    console.log(`Action Space: ${RL_BOT_INFO.actionSpace} actions`);
    console.log(`Goal: ${RL_BOT_INFO.primaryGoal}`);
    console.log('Features:', RL_BOT_INFO.features);
}
