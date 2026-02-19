/**
 * Reinforcement Learning Agent (Stub)
 *
 * Future feature: an RL bot that plays the game autonomously to discover
 * optimal deployment strategies and upgrade purchase orders.
 *
 * Current status: STUB — exposes the interface that the game loop will call,
 * but all methods are no-ops or return sensible defaults.
 *
 * Planned implementation (post-v1.0):
 *   - State vector: [resources, buildings, models, research, tokens, deployments, ...]
 *   - Action space: buy building, train model, research item, deploy
 *   - Reward signal: tokens earned per unit of real time
 *   - Algorithm: PPO or DQN via a lightweight JS tensor library
 */

export class RLAgent {
    constructor(gameState) {
        this.gameState = gameState;
        this.enabled   = false;   // flip to true when implementation is ready
        this.version   = '0.0.1-stub';
    }

    /**
     * Called every game tick when the agent is enabled.
     * Returns an action object or null (no action this tick).
     * @param {number[]} _stateVector
     * @returns {object|null}
     */
    // eslint-disable-next-line no-unused-vars
    selectAction(_stateVector) {
        // STUB: always pass
        return null;
    }

    /**
     * Build a numeric state vector from the current game state.
     * @returns {number[]}
     */
    buildStateVector() {
        // STUB: return empty vector
        return [];
    }

    /**
     * Record a reward signal after an action.
     * @param {number} _reward
     */
    // eslint-disable-next-line no-unused-vars
    recordReward(_reward) {
        // STUB: no-op
    }

    /**
     * Persist the agent's learned policy to localStorage.
     */
    save() {
        // STUB: no-op
    }

    /**
     * Load a previously saved policy from localStorage.
     */
    load() {
        // STUB: no-op
    }
}
