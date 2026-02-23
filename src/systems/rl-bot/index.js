/**
 * RL Bot System - Public API
 * 
 * Exports all components needed to use the RL bot in the game.
 */

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
    getActionMask
} from './action-space.js';

// State encoding
export {
    encodeState,
    getStateDimensions,
    getFeatureNames,
    decodeState,
    encodeBatch,
    stateDifference,
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

/**
 * Quick start example:
 * 
 * ```javascript
 * import { DQNAgent, encodeState, getValidActions, calculateReward } from './systems/rl-bot/index.js';
 * 
 * // Create agent
 * const agent = new DQNAgent();
 * 
 * // Game loop
 * function step(gameState) {
 *   // Encode state
 *   const state = encodeState(gameState);
 *   
 *   // Get valid actions
 *   const validActions = getValidActions(gameState);
 *   
 *   // Agent selects action
 *   const action = agent.selectAction(state, validActions);
 *   
 *   // Execute action in game
 *   const success = executeAction(gameState, action);
 *   
 *   // Get new state
 *   const nextState = encodeState(gameState);
 *   
 *   // Calculate reward
 *   const reward = calculateReward(state, action, nextState, success);
 *   
 *   // Store experience
 *   agent.remember(state, action, reward, nextState, false);
 *   
 *   // Train agent
 *   agent.train();
 * }
 * ```
 */

/**
 * System info
 */
export const RL_BOT_VERSION = '0.7.0';
export const RL_BOT_INFO = {
    version: RL_BOT_VERSION,
    algorithm: 'DQN (Deep Q-Network)',
    framework: 'TensorFlow.js',
    stateDimensions: 23,
    actionSpace: 26,
    features: [
        'Epsilon-greedy exploration',
        'Experience replay',
        'Target network',
        'Gradient clipping',
        'Model persistence'
    ]
};
