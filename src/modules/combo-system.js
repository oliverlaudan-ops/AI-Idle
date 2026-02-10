// Combo System for Manual Collection
// Rewards active clicking with multipliers

export class ComboSystem {
    constructor() {
        this.combo = 1; // Current combo level (1, 2, 4, 8)
        this.comboCount = 0; // Number of consecutive clicks
        this.maxCombo = 8; // Maximum combo multiplier
        this.comboTimeout = 5000; // 5 seconds to maintain combo
        this.timerStarted = 0; // When the current timer started
        this.isActive = false; // Is combo currently active
        this.timeRemaining = 0; // Milliseconds remaining
        
        // Statistics for achievements
        this.stats = {
            totalClicks: 0,
            maxComboReached: 1,
            timesReachedX2: 0,
            timesReachedX4: 0,
            timesReachedX8: 0,
            longestX8Duration: 0, // Milliseconds at x8
            currentX8Duration: 0 // Current x8 streak
        };
        
        // Callbacks for UI updates
        this.onComboChange = null;
        this.onComboBreak = null;
        this.onComboLevelUp = null;
    }
    
    /**
     * Handle a manual click
     * @returns {number} The data amount to award (base * multiplier)
     */
    click() {
        this.stats.totalClicks++;
        
        const now = Date.now();
        
        // Check if combo is still valid
        if (this.isActive) {
            const elapsed = now - this.timerStarted;
            if (elapsed > this.comboTimeout) {
                // Combo expired - reset
                this.breakCombo();
            }
        }
        
        // Start or continue combo
        this.comboCount++;
        this.timerStarted = now;
        this.isActive = true;
        
        // Calculate new combo level
        const oldCombo = this.combo;
        this.combo = this.calculateComboMultiplier(this.comboCount);
        
        // Track statistics
        if (this.combo > this.stats.maxComboReached) {
            this.stats.maxComboReached = this.combo;
        }
        
        // Count times reaching each level
        if (this.combo === 2 && oldCombo < 2) {
            this.stats.timesReachedX2++;
        }
        if (this.combo === 4 && oldCombo < 4) {
            this.stats.timesReachedX4++;
        }
        if (this.combo === 8 && oldCombo < 8) {
            this.stats.timesReachedX8++;
            this.stats.currentX8Duration = now;
        }
        
        // Check for combo level up
        if (this.combo > oldCombo && this.onComboLevelUp) {
            this.onComboLevelUp(this.combo, oldCombo);
        }
        
        // Notify UI of combo change
        if (this.onComboChange) {
            this.onComboChange(this.combo, this.comboCount);
        }
        
        return this.combo;
    }
    
    /**
     * Calculate combo multiplier based on click count
     * @param {number} clicks - Number of consecutive clicks
     * @returns {number} Multiplier (1, 2, 4, or 8)
     */
    calculateComboMultiplier(clicks) {
        if (clicks >= 4) return 8;
        if (clicks >= 3) return 4;
        if (clicks >= 2) return 2;
        return 1;
    }
    
    /**
     * Break the combo (timer expired)
     */
    breakCombo() {
        // Track x8 duration before breaking
        if (this.combo === 8 && this.stats.currentX8Duration > 0) {
            const duration = Date.now() - this.stats.currentX8Duration;
            if (duration > this.stats.longestX8Duration) {
                this.stats.longestX8Duration = duration;
            }
            this.stats.currentX8Duration = 0;
        }
        
        const wasActive = this.isActive;
        
        this.combo = 1;
        this.comboCount = 0;
        this.isActive = false;
        this.timeRemaining = 0;
        
        // Notify UI of break
        if (wasActive && this.onComboBreak) {
            this.onComboBreak();
        }
        
        // Notify UI of combo change
        if (this.onComboChange) {
            this.onComboChange(this.combo, this.comboCount);
        }
    }
    
    /**
     * Update the combo timer (call every frame)
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (!this.isActive) return;
        
        const now = Date.now();
        const elapsed = now - this.timerStarted;
        this.timeRemaining = Math.max(0, this.comboTimeout - elapsed);
        
        // Check if combo expired
        if (elapsed >= this.comboTimeout) {
            this.breakCombo();
        }
        
        // Track x8 duration
        if (this.combo === 8 && this.stats.currentX8Duration > 0) {
            const duration = now - this.stats.currentX8Duration;
            if (duration > this.stats.longestX8Duration) {
                this.stats.longestX8Duration = duration;
            }
        }
    }
    
    /**
     * Get the progress of the timer (0-1)
     * @returns {number} Progress from 0 (expired) to 1 (full time)
     */
    getTimerProgress() {
        if (!this.isActive) return 0;
        return this.timeRemaining / this.comboTimeout;
    }
    
    /**
     * Get the color for the current combo level
     * @returns {string} CSS color class name
     */
    getComboColor() {
        if (this.combo >= 8) return 'gold';
        if (this.combo >= 4) return 'purple';
        if (this.combo >= 2) return 'blue';
        return 'gray';
    }
    
    /**
     * Get the label for the current combo
     * @returns {string} Label like "x2", "x4", "x8"
     */
    getComboLabel() {
        return `x${this.combo}`;
    }
    
    /**
     * Check if a specific achievement condition is met
     * @param {string} achievementId - Achievement to check
     * @returns {boolean} True if condition is met
     */
    checkAchievement(achievementId) {
        switch (achievementId) {
            case 'combo_starter':
                return this.stats.timesReachedX2 >= 1;
            case 'combo_expert':
                return this.stats.timesReachedX4 >= 10;
            case 'combo_master':
                return this.stats.timesReachedX8 >= 100;
            case 'speed_clicker':
                return this.stats.longestX8Duration >= 60000; // 60 seconds
            default:
                return false;
        }
    }
    
    /**
     * Get a summary of combo statistics
     * @returns {object} Statistics object
     */
    getStats() {
        return {
            ...this.stats,
            currentCombo: this.combo,
            isActive: this.isActive,
            timeRemaining: this.timeRemaining
        };
    }
    
    /**
     * Save combo system state
     * @returns {object} Saveable state
     */
    save() {
        return {
            stats: { ...this.stats }
        };
    }
    
    /**
     * Load combo system state
     * @param {object} data - Saved state
     */
    load(data) {
        if (data && data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
    }
    
    /**
     * Reset combo system (for game reset)
     */
    reset() {
        this.combo = 1;
        this.comboCount = 0;
        this.isActive = false;
        this.timerStarted = 0;
        this.timeRemaining = 0;
        
        this.stats = {
            totalClicks: 0,
            maxComboReached: 1,
            timesReachedX2: 0,
            timesReachedX4: 0,
            timesReachedX8: 0,
            longestX8Duration: 0,
            currentX8Duration: 0
        };
    }
}