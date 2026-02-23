/**
 * RL Bot System - Public API
 * 
 * Exports all components needed to use the RL bot in the game.
 * 
 * PRIMARY GOAL: The bot learns to maximize deployment tokens!
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
    getActionMask,
    isDeploymentAction,      // NEW: Check if action is deployment
    getDeploymentStrategy    // NEW: Get deployment strategy from action
} from './action-space.js';

// State encoding
export {
    encodeState,
    getStateDimensions,
    getFeatureNames,
    decodeState,
    encodeBatch,
    stateDifference,
    getDeploymentReadiness,  // NEW: Get deployment readiness score
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
 * import { 
 *   DQNAgent, 
 *   encodeState, 
 *   getValidActions, 
 *   calculateReward,
 *   isDeploymentAction 
 * } from './systems/rl-bot/index.js';
 * 
 * // Create agent
 * const agent = new DQNAgent();
 * 
 * // Game loop (one episode = run until deployment)
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
 *   const result = executeAction(gameState, action);
 *   
 *   // Check if deployment happened
 *   const deployed = isDeploymentAction(action) && result.success;
 *   
 *   // Get new state
 *   const nextState = encodeState(gameState);
 *   
 *   // Calculate reward (deployment result needed if deployed)
 *   const reward = calculateReward(
 *     state, 
 *     action, 
 *     nextState, 
 *     result.success,
 *     deployed ? result.deploymentResult : null
 *   );
 *   
 *   // Store experience (done=true if deployed)
 *   agent.remember(state, action, reward, nextState, deployed);
 *   
 *   // Train agent
 *   await agent.train();
 *   
 *   // End episode if deployed
 *   if (deployed) {
 *     agent.endEpisode(episodeReward);
 *     // Reset game state for new run
 *   }
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
    stateDimensions: 27,      // Updated: includes deployment features
    actionSpace: 29,          // Updated: includes deployment actions
    primaryGoal: 'Maximize deployment tokens',
    features: [
        'Epsilon-greedy exploration',
        'Experience replay',
        'Target network',
        'Gradient clipping',
        'Model persistence',
        'Deployment-focused rewards',  // NEW
        'Strategy selection (Fast/Standard/Complete)'  // NEW
    ]
};
