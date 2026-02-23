/**
 * Experience Replay Buffer
 * 
 * Stores past experiences (state, action, reward, next_state, done) for training.
 * Enables:
 * - Breaking correlation between consecutive experiences
 * - Reusing experiences multiple times
 * - Stable training through random sampling
 */

/**
 * Experience tuple structure
 * @typedef {object} Experience
 * @property {Float32Array} state - Current state
 * @property {number} action - Action taken
 * @property {number} reward - Reward received
 * @property {Float32Array} nextState - Next state
 * @property {boolean} done - Whether episode ended
 */

export class ReplayBuffer {
    /**
     * Create a replay buffer
     * @param {number} capacity - Maximum number of experiences to store
     */
    constructor(capacity = 10000) {
        this.capacity = capacity;
        this.buffer = [];
        this.position = 0;
        this.size = 0;
    }
    
    /**
     * Add an experience to the buffer
     * @param {Float32Array} state - Current state
     * @param {number} action - Action taken
     * @param {number} reward - Reward received
     * @param {Float32Array} nextState - Next state
     * @param {boolean} done - Whether episode ended
     */
    add(state, action, reward, nextState, done) {
        const experience = {
            state: new Float32Array(state),      // Copy to avoid reference issues
            action,
            reward,
            nextState: new Float32Array(nextState),
            done
        };
        
        // Circular buffer: overwrite oldest experience when full
        if (this.buffer.length < this.capacity) {
            this.buffer.push(experience);
        } else {
            this.buffer[this.position] = experience;
        }
        
        this.position = (this.position + 1) % this.capacity;
        this.size = Math.min(this.size + 1, this.capacity);
    }
    
    /**
     * Sample a random batch of experiences
     * @param {number} batchSize - Number of experiences to sample
     * @returns {object} Batch of experiences
     */
    sample(batchSize) {
        if (batchSize > this.size) {
            throw new Error(`Cannot sample ${batchSize} experiences, only ${this.size} available`);
        }
        
        // Random sampling without replacement
        const indices = this._sampleIndices(batchSize);
        
        return this._getBatch(indices);
    }
    
    /**
     * Sample random indices without replacement
     * @param {number} count - Number of indices to sample
     * @returns {array} Array of indices
     */
    _sampleIndices(count) {
        const indices = [];
        const available = new Set();
        
        // Create set of available indices
        for (let i = 0; i < this.size; i++) {
            available.add(i);
        }
        
        // Sample without replacement
        while (indices.length < count && available.size > 0) {
            const randomIndex = Math.floor(Math.random() * available.size);
            const selectedIndex = Array.from(available)[randomIndex];
            indices.push(selectedIndex);
            available.delete(selectedIndex);
        }
        
        return indices;
    }
    
    /**
     * Get batch of experiences by indices
     * @param {array} indices - Indices to retrieve
     * @returns {object} Batch of experiences
     */
    _getBatch(indices) {
        const batch = {
            states: [],
            actions: [],
            rewards: [],
            nextStates: [],
            dones: []
        };
        
        for (const index of indices) {
            const exp = this.buffer[index];
            batch.states.push(exp.state);
            batch.actions.push(exp.action);
            batch.rewards.push(exp.reward);
            batch.nextStates.push(exp.nextState);
            batch.dones.push(exp.done ? 1 : 0);
        }
        
        return batch;
    }
    
    /**
     * Get the number of experiences currently in the buffer
     * @returns {number} Number of experiences
     */
    length() {
        return this.size;
    }
    
    /**
     * Check if buffer has enough experiences for a batch
     * @param {number} batchSize - Required batch size
     * @returns {boolean} Whether buffer has enough experiences
     */
    canSample(batchSize) {
        return this.size >= batchSize;
    }
    
    /**
     * Clear all experiences from the buffer
     */
    clear() {
        this.buffer = [];
        this.position = 0;
        this.size = 0;
    }
    
    /**
     * Get most recent N experiences (for debugging)
     * @param {number} n - Number of recent experiences
     * @returns {array} Recent experiences
     */
    getRecent(n = 10) {
        const recent = [];
        const startPos = Math.max(0, this.position - n);
        
        for (let i = startPos; i < this.position; i++) {
            recent.push(this.buffer[i]);
        }
        
        return recent;
    }
    
    /**
     * Get buffer statistics
     * @returns {object} Statistics
     */
    getStats() {
        if (this.size === 0) {
            return {
                size: 0,
                capacity: this.capacity,
                utilizationPercent: 0,
                avgReward: 0,
                maxReward: 0,
                minReward: 0
            };
        }
        
        const rewards = this.buffer.slice(0, this.size).map(exp => exp.reward);
        const avgReward = rewards.reduce((sum, r) => sum + r, 0) / rewards.length;
        const maxReward = Math.max(...rewards);
        const minReward = Math.min(...rewards);
        
        return {
            size: this.size,
            capacity: this.capacity,
            utilizationPercent: (this.size / this.capacity) * 100,
            avgReward,
            maxReward,
            minReward
        };
    }
    
    /**
     * Save buffer to JSON (for persistence)
     * Warning: Can be large!
     * @returns {string} JSON string
     */
    toJSON() {
        const data = {
            capacity: this.capacity,
            position: this.position,
            size: this.size,
            buffer: this.buffer.slice(0, this.size).map(exp => ({
                state: Array.from(exp.state),
                action: exp.action,
                reward: exp.reward,
                nextState: Array.from(exp.nextState),
                done: exp.done
            }))
        };
        
        return JSON.stringify(data);
    }
    
    /**
     * Load buffer from JSON
     * @param {string} json - JSON string
     */
    fromJSON(json) {
        const data = JSON.parse(json);
        
        this.capacity = data.capacity;
        this.position = data.position;
        this.size = data.size;
        
        this.buffer = data.buffer.map(exp => ({
            state: new Float32Array(exp.state),
            action: exp.action,
            reward: exp.reward,
            nextState: new Float32Array(exp.nextState),
            done: exp.done
        }));
    }
}

/**
 * Prioritized Experience Replay Buffer (advanced, for future use)
 * Samples experiences based on TD-error priority
 * 
 * Not implemented yet - placeholder for future enhancement
 */
export class PrioritizedReplayBuffer extends ReplayBuffer {
    constructor(capacity = 10000, alpha = 0.6, beta = 0.4) {
        super(capacity);
        this.alpha = alpha; // Priority exponent
        this.beta = beta;   // Importance sampling exponent
        this.priorities = new Float32Array(capacity);
        this.maxPriority = 1.0;
    }
    
    /**
     * Add experience with priority
     * @param {Float32Array} state - Current state
     * @param {number} action - Action taken
     * @param {number} reward - Reward received
     * @param {Float32Array} nextState - Next state
     * @param {boolean} done - Whether episode ended
     */
    add(state, action, reward, nextState, done) {
        super.add(state, action, reward, nextState, done);
        
        // New experiences get max priority
        const index = (this.position - 1 + this.capacity) % this.capacity;
        this.priorities[index] = this.maxPriority;
    }
    
    /**
     * Sample batch based on priorities
     * @param {number} batchSize - Batch size
     * @returns {object} Batch with importance weights
     */
    sample(batchSize) {
        // TODO: Implement priority-based sampling
        // For now, fall back to uniform sampling
        return super.sample(batchSize);
    }
    
    /**
     * Update priorities for experiences
     * @param {array} indices - Experience indices
     * @param {array} priorities - New priorities (TD-errors)
     */
    updatePriorities(indices, priorities) {
        for (let i = 0; i < indices.length; i++) {
            this.priorities[indices[i]] = Math.abs(priorities[i]) + 1e-6;
            this.maxPriority = Math.max(this.maxPriority, this.priorities[indices[i]]);
        }
    }
}
