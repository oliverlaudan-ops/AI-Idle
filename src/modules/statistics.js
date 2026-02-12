// Statistics Tracking System
// Tracks detailed game statistics for the Statistics tab

import { formatNumber, formatTime } from '../utils/format.js';

export class StatisticsTracker {
    constructor() {
        this.stats = this.getDefaultStats();
        this.sessionStart = Date.now();
    }
    
    /**
     * Get default statistics structure
     */
    getDefaultStats() {
        return {
            // Lifetime totals
            lifetime: {
                dataCollected: 0,
                accuracyGained: 0,
                researchGained: 0,
                computeGenerated: 0,
                manualClicks: 0,
                buildingsPurchased: 0,
                researchCompleted: 0,
                modelsCompleted: 0,
                deploymentsPerformed: 0,
                achievementsUnlocked: 0
            },
            
            // Session stats (reset on load)
            session: {
                dataCollected: 0,
                accuracyGained: 0,
                researchGained: 0,
                computeGenerated: 0,
                manualClicks: 0,
                buildingsPurchased: 0,
                researchCompleted: 0,
                modelsCompleted: 0,
                sessionDuration: 0,
                startTime: Date.now()
            },
            
            // Records & Milestones
            records: {
                bestCombo: 0,
                bestComboMultiplier: 1.0,
                fastestModelCompletion: Infinity,
                mostDataPerSecond: 0,
                mostAccuracyPerSecond: 0,
                mostResearchPerSecond: 0,
                highestAccuracy: 0,
                largestSingleClick: 0
            },
            
            // Per-building purchase counts
            buildingCounts: {},
            
            // Per-research purchase counts
            researchCounts: {},
            
            // Per-model completion counts
            modelCounts: {},
            
            // Time tracking
            timeTracking: {
                totalPlaytime: 0,
                totalOfflineTime: 0,
                longestSession: 0,
                totalSessions: 0
            }
        };
    }
    
    /**
     * Track manual data collection
     */
    trackManualClick(amount, multiplier, combo) {
        this.stats.lifetime.dataCollected += amount;
        this.stats.lifetime.manualClicks++;
        this.stats.session.dataCollected += amount;
        this.stats.session.manualClicks++;
        
        // Update records
        if (combo > this.stats.records.bestCombo) {
            this.stats.records.bestCombo = combo;
        }
        if (multiplier > this.stats.records.bestComboMultiplier) {
            this.stats.records.bestComboMultiplier = multiplier;
        }
        if (amount > this.stats.records.largestSingleClick) {
            this.stats.records.largestSingleClick = amount;
        }
    }
    
    /**
     * Track resource gains from production
     */
    trackResourceGain(resource, amount) {
        switch (resource) {
            case 'data':
                this.stats.lifetime.dataCollected += amount;
                this.stats.session.dataCollected += amount;
                break;
            case 'accuracy':
                this.stats.lifetime.accuracyGained += amount;
                this.stats.session.accuracyGained += amount;
                break;
            case 'research':
                this.stats.lifetime.researchGained += amount;
                this.stats.session.researchGained += amount;
                break;
            case 'compute':
                this.stats.lifetime.computeGenerated += amount;
                this.stats.session.computeGenerated += amount;
                break;
        }
    }
    
    /**
     * Track production rates for records
     */
    trackProductionRates(rates) {
        if (rates.data > this.stats.records.mostDataPerSecond) {
            this.stats.records.mostDataPerSecond = rates.data;
        }
        if (rates.accuracy > this.stats.records.mostAccuracyPerSecond) {
            this.stats.records.mostAccuracyPerSecond = rates.accuracy;
        }
        if (rates.research > this.stats.records.mostResearchPerSecond) {
            this.stats.records.mostResearchPerSecond = rates.research;
        }
    }
    
    /**
     * Track building purchase
     */
    trackBuildingPurchase(buildingId, quantity = 1) {
        this.stats.lifetime.buildingsPurchased += quantity;
        this.stats.session.buildingsPurchased += quantity;
        
        if (!this.stats.buildingCounts[buildingId]) {
            this.stats.buildingCounts[buildingId] = 0;
        }
        this.stats.buildingCounts[buildingId] += quantity;
    }
    
    /**
     * Track research completion
     */
    trackResearchComplete(researchId) {
        this.stats.lifetime.researchCompleted++;
        this.stats.session.researchCompleted++;
        
        if (!this.stats.researchCounts[researchId]) {
            this.stats.researchCounts[researchId] = 0;
        }
        this.stats.researchCounts[researchId]++;
    }
    
    /**
     * Track model training completion
     */
    trackModelComplete(modelId, duration) {
        this.stats.lifetime.modelsCompleted++;
        this.stats.session.modelsCompleted++;
        
        if (!this.stats.modelCounts[modelId]) {
            this.stats.modelCounts[modelId] = 0;
        }
        this.stats.modelCounts[modelId]++;
        
        // Track fastest completion
        if (duration < this.stats.records.fastestModelCompletion) {
            this.stats.records.fastestModelCompletion = duration;
        }
    }
    
    /**
     * Track deployment
     */
    trackDeployment() {
        this.stats.lifetime.deploymentsPerformed++;
    }
    
    /**
     * Track achievement unlock
     */
    trackAchievement() {
        this.stats.lifetime.achievementsUnlocked++;
    }
    
    /**
     * Track accuracy milestone
     */
    trackAccuracy(accuracy) {
        if (accuracy > this.stats.records.highestAccuracy) {
            this.stats.records.highestAccuracy = accuracy;
        }
    }
    
    /**
     * Update session duration
     */
    updateSessionDuration() {
        const now = Date.now();
        const sessionTime = now - this.stats.session.startTime;
        this.stats.session.sessionDuration = sessionTime;
        
        // Update total playtime
        const elapsed = now - this.sessionStart;
        this.stats.timeTracking.totalPlaytime += elapsed;
        this.sessionStart = now;
        
        // Update longest session
        if (sessionTime > this.stats.timeTracking.longestSession) {
            this.stats.timeTracking.longestSession = sessionTime;
        }
    }
    
    /**
     * Track offline time
     */
    trackOfflineTime(duration) {
        this.stats.timeTracking.totalOfflineTime += duration;
    }
    
    /**
     * Start new session
     */
    startNewSession() {
        this.stats.session = {
            dataCollected: 0,
            accuracyGained: 0,
            researchGained: 0,
            computeGenerated: 0,
            manualClicks: 0,
            buildingsPurchased: 0,
            researchCompleted: 0,
            modelsCompleted: 0,
            sessionDuration: 0,
            startTime: Date.now()
        };
        this.sessionStart = Date.now();
        this.stats.timeTracking.totalSessions++;
    }
    
    /**
     * Get formatted statistics for display
     */
    getFormattedStats() {
        this.updateSessionDuration();
        
        return {
            lifetime: this.formatStatGroup(this.stats.lifetime),
            session: this.formatStatGroup(this.stats.session),
            records: this.formatRecords(),
            timeTracking: this.formatTimeTracking(),
            topBuildings: this.getTopBuildings(),
            topModels: this.getTopModels()
        };
    }
    
    /**
     * Format stat group for display
     */
    formatStatGroup(group) {
        const formatted = {};
        for (const [key, value] of Object.entries(group)) {
            if (key === 'startTime' || key === 'sessionDuration') continue;
            formatted[key] = formatNumber(value);
        }
        return formatted;
    }
    
    /**
     * Format records for display
     */
    formatRecords() {
        return {
            bestCombo: this.stats.records.bestCombo + 'x',
            bestComboMultiplier: this.stats.records.bestComboMultiplier.toFixed(2) + 'x',
            fastestModel: this.stats.records.fastestModelCompletion === Infinity ? 
                'N/A' : formatTime(this.stats.records.fastestModelCompletion / 1000),
            peakDataRate: formatNumber(this.stats.records.mostDataPerSecond) + '/s',
            peakAccuracyRate: formatNumber(this.stats.records.mostAccuracyPerSecond) + '/s',
            peakResearchRate: formatNumber(this.stats.records.mostResearchPerSecond) + '/s',
            highestAccuracy: this.stats.records.highestAccuracy.toFixed(2) + '%',
            largestClick: formatNumber(this.stats.records.largestSingleClick)
        };
    }
    
    /**
     * Format time tracking
     */
    formatTimeTracking() {
        return {
            totalPlaytime: formatTime(this.stats.timeTracking.totalPlaytime / 1000),
            totalOfflineTime: formatTime(this.stats.timeTracking.totalOfflineTime / 1000),
            longestSession: formatTime(this.stats.timeTracking.longestSession / 1000),
            currentSession: formatTime(this.stats.session.sessionDuration / 1000),
            totalSessions: this.stats.timeTracking.totalSessions
        };
    }
    
    /**
     * Get top 5 most purchased buildings
     */
    getTopBuildings() {
        const sorted = Object.entries(this.stats.buildingCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        return sorted.map(([id, count]) => ({
            id,
            count,
            formatted: formatNumber(count)
        }));
    }
    
    /**
     * Get top 5 most completed models
     */
    getTopModels() {
        const sorted = Object.entries(this.stats.modelCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        return sorted.map(([id, count]) => ({
            id,
            count,
            formatted: formatNumber(count)
        }));
    }
    
    /**
     * Save statistics
     */
    save() {
        this.updateSessionDuration();
        return this.stats;
    }
    
    /**
     * Load statistics
     */
    load(data) {
        if (!data) return;
        
        // Merge with defaults to handle new stats
        this.stats = { ...this.getDefaultStats(), ...data };
        
        // Start new session
        this.startNewSession();
    }
    
    /**
     * Reset all statistics
     */
    reset() {
        this.stats = this.getDefaultStats();
        this.sessionStart = Date.now();
    }
}
