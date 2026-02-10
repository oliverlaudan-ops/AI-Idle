/**
 * AI Interface - Game State API for AI Systems
 * 
 * Provides a clean API for AI agents to interact with the game state.
 * Used by both Achievement Predictor and RL Bot.
 */

export class AIInterface {
    constructor(gameState) {
        this.game = gameState;
    }

    /**
     * Get normalized state vector for ML models
     * Returns 20-dimensional feature vector
     */
    getStateVector() {
        const g = this.game;
        
        // Normalize all values to [0, 1] range for better ML performance
        return [
            // Resources (4 features)
            this.normalize(g.resources.data.amount, 0, 1e6),
            this.normalize(g.resources.data.perSecond, 0, 1e4),
            this.normalize(g.resources.compute.amount, 0, 1e5),
            this.normalize(g.resources.accuracy.amount, 0, 100),
            
            // Building counts (6 features - key buildings)
            this.normalize(this.getBuildingCount('datacenter'), 0, 100),
            this.normalize(this.getBuildingCount('gpu'), 0, 100),
            this.normalize(this.getBuildingCount('tpu'), 0, 50),
            this.normalize(this.getBuildingCount('quantum'), 0, 20),
            this.normalize(this.getBuildingCount('server'), 0, 100),
            this.normalize(this.getBuildingCount('cluster'), 0, 50),
            
            // Research (4 features) - FIXED: Now actually 4!
            this.normalize(g.resources.research.amount, 0, 1e4),
            this.normalize(g.resources.research.perSecond, 0, 100),
            this.normalize(g.stats.completedResearch.length, 0, 20),
            this.normalize(Object.keys(g.research).filter(id => g.research[id].researched).length, 0, 20),
            
            // Training (3 features)
            g.currentTraining ? 1 : 0,
            this.normalize(g.stats.modelsTrained || 0, 0, 100),
            this.normalize(g.resources.accuracy.perSecond, 0, 10),
            
            // Achievements (2 features)
            this.normalize(this.getAchievementCount(), 0, 30),
            this.normalize(this.getTotalAchievementReward(), 0, 500),
            
            // Game progress (1 feature)
            this.normalize(g.stats.totalPlaytime || 0, 0, 3600000) // normalized to 1 hour
        ];
        // Total: 4 + 6 + 4 + 3 + 2 + 1 = 20 features ✓
    }

    /**
     * Get action space info
     * Returns list of possible actions the AI can take
     */
    getActions() {
        return [
            { id: 0, name: 'collect', description: 'Manually collect data' },
            { id: 1, name: 'buy_datacenter', description: 'Purchase Data Center' },
            { id: 2, name: 'buy_server', description: 'Purchase Server Farm' },
            { id: 3, name: 'buy_gpu', description: 'Purchase GPU Cluster' },
            { id: 4, name: 'buy_cluster', description: 'Purchase Compute Cluster' },
            { id: 5, name: 'buy_tpu', description: 'Purchase TPU Array' },
            { id: 6, name: 'buy_quantum', description: 'Purchase Quantum Processor' },
            { id: 7, name: 'train_mnist', description: 'Train MNIST Classifier' },
            { id: 8, name: 'train_cifar', description: 'Train CIFAR-10 Classifier' },
            { id: 9, name: 'train_resnet', description: 'Train ResNet Model' },
            { id: 10, name: 'research_adam', description: 'Research Adam Optimizer' },
            { id: 11, name: 'research_relu', description: 'Research ReLU Activation' },
            { id: 12, name: 'wait', description: 'Wait and accumulate resources' },
            { id: 13, name: 'stop_training', description: 'Stop current training' },
            { id: 14, name: 'buy_best_building', description: 'Buy most efficient building' }
        ];
    }

    /**
     * Execute an action
     */
    executeAction(actionId) {
        const actions = this.getActions();
        const action = actions.find(a => a.id === actionId);
        
        if (!action) {
            console.warn(`[AI] Invalid action ID: ${actionId}`);
            return { success: false, reason: 'Invalid action' };
        }

        switch (action.name) {
            case 'collect':
                return this.collectData();
            case 'buy_datacenter':
                return this.buyBuilding('datacenter');
            case 'buy_server':
                return this.buyBuilding('server');
            case 'buy_gpu':
                return this.buyBuilding('gpu');
            case 'buy_cluster':
                return this.buyBuilding('cluster');
            case 'buy_tpu':
                return this.buyBuilding('tpu');
            case 'buy_quantum':
                return this.buyBuilding('quantum');
            case 'train_mnist':
                return this.startTraining('mnist');
            case 'train_cifar':
                return this.startTraining('cifar10');
            case 'train_resnet':
                return this.startTraining('resnet');
            case 'research_adam':
                return this.unlockResearch('adam');
            case 'research_relu':
                return this.unlockResearch('relu');
            case 'wait':
                return { success: true, reason: 'Waiting' };
            case 'stop_training':
                return this.stopTraining();
            case 'buy_best_building':
                return this.buyBestBuilding();
            default:
                return { success: false, reason: 'Action not implemented' };
        }
    }

    // === Helper Methods ===

    normalize(value, min, max) {
        if (max === min) return 0;
        return Math.max(0, Math.min(1, (value - min) / (max - min)));
    }

    getBuildingCount(buildingId) {
        const building = this.game.buildings[buildingId];
        return building ? building.count : 0;
    }

    getAchievementCount() {
        return Object.values(this.game.achievements).filter(a => a.unlocked).length;
    }
    
    getTotalAchievementReward() {
        return Object.values(this.game.achievements)
            .filter(a => a.unlocked)
            .reduce((sum, a) => sum + (a.reward || 0), 0);
    }

    collectData() {
        const result = this.game.manualCollect();
        return { success: true, gained: result.amount };
    }

    buyBuilding(buildingId) {
        const result = this.game.purchaseBuilding(buildingId, 1);
        return result || { success: false, reason: 'Purchase failed' };
    }

    startTraining(modelId) {
        const success = this.game.startTraining(modelId);
        if (success) {
            return { success: true, model: modelId };
        }
        return { success: false, reason: 'Cannot start training' };
    }

    stopTraining() {
        if (!this.game.currentTraining) {
            return { success: false, reason: 'No training active' };
        }

        this.game.stopTraining();
        return { success: true };
    }

    unlockResearch(researchId) {
        const success = this.game.performResearch(researchId);
        if (success) {
            return { success: true, research: researchId };
        }
        return { success: false, reason: 'Cannot unlock research' };
    }

    buyBestBuilding() {
        // Find most cost-efficient building
        const buildings = ['datacenter', 'server', 'gpu', 'cluster', 'tpu', 'quantum'];
        let bestBuilding = null;
        let bestEfficiency = 0;

        for (const buildingId of buildings) {
            const building = this.game.buildings[buildingId];
            if (!building || !building.unlocked) continue;

            const cost = building.cost.data || 0;
            if (this.game.resources.data.amount < cost) continue;

            const production = building.production.data || 0;
            const efficiency = production / cost;

            if (efficiency > bestEfficiency) {
                bestEfficiency = efficiency;
                bestBuilding = buildingId;
            }
        }

        if (bestBuilding) {
            return this.buyBuilding(bestBuilding);
        }

        return { success: false, reason: 'No affordable buildings' };
    }

    /**
     * Get achievement progress info
     * Returns array of achievements with unlock probability estimates
     */
    getAchievementProgress() {
        const achievements = [];
        
        for (const [id, achievement] of Object.entries(this.game.achievements)) {
            achievements.push({
                id: id,
                name: achievement.name,
                unlocked: achievement.unlocked,
                progress: this.estimateAchievementProgress(id, achievement)
            });
        }

        return achievements;
    }

    estimateAchievementProgress(id, achievement) {
        // Simple heuristic progress estimation
        if (achievement.unlocked) return 1.0;

        // Check condition and estimate progress
        const condition = achievement.condition;
        if (!condition) return 0.0;

        // Example: data threshold achievements
        if (condition.type === 'resource' && condition.resource === 'data') {
            const current = this.game.resources.data.amount;
            const target = condition.amount;
            return Math.min(1.0, current / target);
        }

        // Example: building count achievements
        if (condition.type === 'building') {
            const current = this.getBuildingCount(condition.building);
            const target = condition.amount;
            return Math.min(1.0, current / target);
        }

        return 0.0;
    }

    /**
     * Get reward signal for RL agent
     */
    getReward(previousState, action, newState) {
        let reward = 0;

        // Reward for accuracy gain (primary objective)
        const accuracyGain = newState.resources.accuracy.amount - previousState.resources.accuracy.amount;
        reward += accuracyGain * 0.1;

        // Reward for data production rate increase
        const dataRateGain = newState.resources.data.perSecond - previousState.resources.data.perSecond;
        reward += dataRateGain * 0.05;

        // Big reward for unlocking achievements
        const achievementGain = this.getAchievementCount() - Object.values(previousState.achievements || {}).filter(a => a.unlocked).length;
        reward += achievementGain * 10;

        // Reward for research unlocks
        const researchGain = Object.keys(newState.research || {}).filter(id => newState.research[id].researched).length -
                            Object.keys(previousState.research || {}).filter(id => previousState.research[id].researched).length;
        reward += researchGain * 5;

        // Small penalty for idle time (encourage action)
        if (action.name === 'wait') {
            reward -= 0.1;
        }

        // Reward building diversity
        const buildingTypes = ['datacenter', 'server', 'gpu', 'cluster', 'tpu', 'quantum']
            .filter(id => this.getBuildingCount(id) > 0).length;
        reward += buildingTypes * 0.5;

        return reward;
    }

    /**
     * Check if game is in terminal state (episode done)
     */
    isDone() {
        // Episode ends when first achievement is unlocked or after enough ticks
        const hasAchievement = this.getAchievementCount() > 0;
        const playtime = this.game.stats.totalPlaytime || 0;
        const maxPlaytime = 300000; // 5 minutes
        return hasAchievement || playtime >= maxPlaytime;
    }

    /**
     * Reset environment for new episode
     */
    reset() {
        // Save achievement progress before reset
        const achievementCount = this.getAchievementCount();
        
        // Reset game to initial state
        this.game.reset();
        
        return {
            achievementCount: achievementCount,
            state: this.getStateVector()
        };
    }
}
