/**
 * Achievement Progress Calculator
 * 
 * Dynamically calculates progress and estimated time for all achievements.
 * Automatically adapts when new achievements are added - no hardcoding needed!
 * 
 * Key Features:
 * - Auto-detects all achievements from game state
 * - Calculates real progress percentage (0-100%)
 * - Estimates time based on current production rates
 * - Works for ANY achievement type
 */

export class AchievementProgressCalculator {
    constructor(gameState) {
        this.game = gameState;
    }

    /**
     * Calculate progress for all unlocked achievements
     * Returns: { achievementId: { progress: 0-1, timeEstimate: seconds, details: {} } }
     */
    calculateAllProgress() {
        const progressData = {};
        
        // Get all achievements that aren't unlocked yet
        Object.entries(this.game.achievements).forEach(([id, achievement]) => {
            if (!achievement.unlocked) {
                const progress = this.calculateProgress(achievement);
                progressData[id] = progress;
            }
        });
        
        return progressData;
    }

    /**
     * Calculate progress for a single achievement
     */
    calculateProgress(achievement) {
        const req = achievement.requirement;
        const stats = this.getGameStats();
        
        let current = 0;
        let target = 0;
        let rate = 0; // per second
        let progress = 0;
        
        switch (req.type) {
            case 'modelsTrained':
                current = stats.modelsTrained;
                target = req.value;
                rate = this.estimateModelsPerSecond();
                break;
                
            case 'totalDataGenerated':
                current = stats.totalDataGenerated;
                target = req.value;
                rate = stats.dataPerSecond || 0;
                break;
                
            case 'maxAccuracy':
                current = stats.maxAccuracy;
                target = req.value;
                // Accuracy improves with training
                rate = this.estimateAccuracyGainPerSecond();
                break;
                
            case 'uniqueModels':
                current = stats.uniqueModelsTrained || 0;
                target = req.value;
                rate = this.estimateUniqueModelsPerSecond();
                break;
                
            case 'totalCompute':
                current = stats.totalCompute;
                target = req.value;
                rate = stats.computePerSecond || 0;
                break;
                
            case 'buildingCount':
                current = stats.buildings[req.building] || 0;
                target = req.value;
                rate = this.estimateBuildingPurchaseRate(req.building);
                break;
                
            case 'totalBuildings':
                current = stats.totalBuildings;
                target = req.value;
                rate = this.estimateTotalBuildingPurchaseRate();
                break;
                
            case 'deploymentsCount':
                current = stats.deployments || 0;
                target = req.value;
                rate = this.estimateDeploymentRate();
                break;
                
            case 'totalAccuracy':
                current = stats.totalAccuracy || 0;
                target = req.value;
                rate = this.estimateTotalAccuracyGainPerSecond();
                break;
                
            case 'specificResearch':
                current = stats.completedResearch.includes(req.research) ? 1 : 0;
                target = 1;
                rate = this.estimateResearchCompletionRate(req.research);
                break;
                
            case 'researchCategory':
                const categoryProgress = stats.researchByCategory?.[req.category] || 0;
                const categoryTotal = stats.totalByCategory?.[req.category] || 1;
                current = categoryProgress;
                target = categoryTotal;
                rate = this.estimateCategoryResearchRate(req.category);
                break;
                
            case 'allResearch':
                current = stats.completedResearch?.length || 0;
                target = stats.totalResearch || 1;
                rate = this.estimateOverallResearchRate();
                break;
                
            default:
                current = 0;
                target = 1;
                rate = 0;
        }
        
        // Calculate progress percentage (0-1)
        progress = target > 0 ? Math.min(current / target, 1) : 0;
        
        // Estimate time to completion
        const remaining = Math.max(target - current, 0);
        const timeEstimate = rate > 0 ? remaining / rate : Infinity;
        
        return {
            progress: progress,
            progressPercent: Math.round(progress * 100 * 10) / 10, // 1 decimal
            current: current,
            target: target,
            remaining: remaining,
            rate: rate,
            timeEstimate: Math.min(timeEstimate, 86400 * 365), // Cap at 1 year
            achievable: rate > 0 && remaining > 0
        };
    }

    /**
     * Get current game statistics
     */
    getGameStats() {
        return {
            // Training stats
            modelsTrained: this.game.stats?.modelsTrained || 0,
            totalDataGenerated: this.game.resources?.totalData || 0,
            maxAccuracy: this.game.stats?.maxAccuracy || 0,
            uniqueModelsTrained: this.game.stats?.uniqueModelsTrained || 0,
            
            // Resource rates
            dataPerSecond: this.game.resources?.dataPerSecond || 0,
            computePerSecond: this.game.resources?.computePerSecond || 0,
            
            // Compute
            totalCompute: this.game.resources?.compute || 0,
            
            // Buildings
            buildings: this.getBuildingCounts(),
            totalBuildings: this.getTotalBuildingCount(),
            
            // Deployments
            deployments: this.game.stats?.deployments || 0,
            
            // Accuracy
            totalAccuracy: this.game.stats?.totalAccuracy || 0,
            
            // Research
            completedResearch: this.game.research?.completed || [],
            totalResearch: this.getTotalResearchCount(),
            researchByCategory: this.getResearchByCategory(),
            totalByCategory: this.getTotalByCategory()
        };
    }

    /**
     * Get building counts by type
     */
    getBuildingCounts() {
        const counts = {};
        
        if (this.game.buildings) {
            Object.entries(this.game.buildings).forEach(([id, building]) => {
                counts[id] = building.count || 0;
            });
        }
        
        return counts;
    }

    /**
     * Get total building count
     */
    getTotalBuildingCount() {
        if (!this.game.buildings) return 0;
        
        return Object.values(this.game.buildings)
            .reduce((sum, building) => sum + (building.count || 0), 0);
    }

    /**
     * Get total research count
     */
    getTotalResearchCount() {
        if (!this.game.research?.tree) return 0;
        return Object.keys(this.game.research.tree).length;
    }

    /**
     * Get completed research by category
     */
    getResearchByCategory() {
        const byCategory = {};
        const completed = this.game.research?.completed || [];
        
        completed.forEach(researchId => {
            const research = this.game.research?.tree?.[researchId];
            if (research && research.category) {
                byCategory[research.category] = (byCategory[research.category] || 0) + 1;
            }
        });
        
        return byCategory;
    }

    /**
     * Get total research by category
     */
    getTotalByCategory() {
        const byCategory = {};
        
        if (this.game.research?.tree) {
            Object.values(this.game.research.tree).forEach(research => {
                if (research.category) {
                    byCategory[research.category] = (byCategory[research.category] || 0) + 1;
                }
            });
        }
        
        return byCategory;
    }

    // === RATE ESTIMATION METHODS ===
    // These estimate how fast the player progresses toward each goal
    
    estimateModelsPerSecond() {
        // Based on average training time
        const avgTrainingTime = this.game.stats?.avgTrainingTime || 60; // default 60s
        return avgTrainingTime > 0 ? 1 / avgTrainingTime : 0;
    }

    estimateAccuracyGainPerSecond() {
        // Accuracy improves with active training
        const activeTraining = this.game.training?.queue?.length > 0;
        if (!activeTraining) return 0;
        
        // Estimate based on recent accuracy gains
        const recentGain = this.game.stats?.recentAccuracyGain || 0.01;
        return recentGain;
    }

    estimateUniqueModelsPerSecond() {
        // Unique models trained less frequently
        return this.estimateModelsPerSecond() * 0.5; // Conservative estimate
    }

    estimateBuildingPurchaseRate(buildingId) {
        const building = this.game.buildings?.[buildingId];
        if (!building) return 0;
        
        // Can we afford it with current income?
        const cost = building.cost || 0;
        const income = this.game.resources?.dataPerSecond || 0;
        
        if (income <= 0) return 0;
        
        // Rate = how often we can buy (purchases per second)
        const timeToBuy = cost / income;
        return timeToBuy > 0 ? 1 / timeToBuy : 0;
    }

    estimateTotalBuildingPurchaseRate() {
        // Average rate across all buildings
        const buildingRates = Object.keys(this.game.buildings || {})
            .map(id => this.estimateBuildingPurchaseRate(id));
        
        if (buildingRates.length === 0) return 0;
        
        const avgRate = buildingRates.reduce((sum, r) => sum + r, 0) / buildingRates.length;
        return avgRate;
    }

    estimateDeploymentRate() {
        // Deployments are manual/prestige events, very slow
        const totalPlaytime = this.game.stats?.totalPlaytime || 3600; // default 1 hour
        const deployments = this.game.stats?.deployments || 0;
        
        if (totalPlaytime <= 0) return 0;
        return deployments / totalPlaytime;
    }

    estimateTotalAccuracyGainPerSecond() {
        // Total accuracy accumulates with each training
        const modelsPerSec = this.estimateModelsPerSecond();
        const avgAccuracy = this.game.stats?.avgAccuracy || 50;
        
        return modelsPerSec * avgAccuracy;
    }

    estimateResearchCompletionRate(researchId) {
        const research = this.game.research?.tree?.[researchId];
        if (!research) return 0;
        
        const cost = research.cost || 0;
        const income = this.game.research?.pointsPerSecond || 0;
        
        if (income <= 0) return 0;
        
        const timeToComplete = cost / income;
        return timeToComplete > 0 ? 1 / timeToComplete : 0;
    }

    estimateCategoryResearchRate(category) {
        // Average completion rate for category
        const categoryResearch = Object.values(this.game.research?.tree || {})
            .filter(r => r.category === category && !r.completed);
        
        if (categoryResearch.length === 0) return 0;
        
        const rates = categoryResearch.map(r => this.estimateResearchCompletionRate(r.id));
        const avgRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
        
        return avgRate;
    }

    estimateOverallResearchRate() {
        // Average across all research
        const allResearch = Object.values(this.game.research?.tree || {})
            .filter(r => !r.completed);
        
        if (allResearch.length === 0) return 0;
        
        const rates = allResearch.map(r => this.estimateResearchCompletionRate(r.id));
        const avgRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
        
        return avgRate;
    }

    /**
     * Get top N achievements closest to completion
     */
    getTopAchievements(n = 5) {
        const allProgress = this.calculateAllProgress();
        
        return Object.entries(allProgress)
            .filter(([id, data]) => data.achievable) // Only achievable ones
            .sort((a, b) => {
                // Sort by: higher progress first, then shorter time
                if (Math.abs(a[1].progress - b[1].progress) > 0.1) {
                    return b[1].progress - a[1].progress;
                }
                return a[1].timeEstimate - b[1].timeEstimate;
            })
            .slice(0, n)
            .map(([id, data]) => ({
                id: id,
                achievement: this.game.achievements[id],
                ...data
            }));
    }

    /**
     * Format time estimate for display
     */
    formatTimeEstimate(seconds) {
        if (!isFinite(seconds) || seconds < 0) {
            return 'Unknown';
        }
        
        if (seconds < 60) {
            return `≈${Math.ceil(seconds)}s`;
        } else if (seconds < 3600) {
            return `≈${Math.ceil(seconds / 60)}m`;
        } else if (seconds < 86400) {
            return `≈${Math.ceil(seconds / 3600)}h`;
        } else {
            return `≈${Math.ceil(seconds / 86400)}d`;
        }
    }
}
