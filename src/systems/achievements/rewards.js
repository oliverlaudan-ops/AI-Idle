/**
 * Achievement Rewards
 * Logic for applying achievement bonuses to game state
 */

/**
 * Apply rewards from unlocked achievements
 */
export function applyAchievementReward(gameState, achievement) {
    // Parse reward text and apply effects
    const reward = achievement.reward.toLowerCase();
    
    // Initialize bonuses if not present
    if (!gameState.achievementBonuses) {
        gameState.achievementBonuses = {};
    }
    
    // Production bonuses
    if (reward.includes('% data generation')) {
        const match = reward.match(/(\d+)% data generation/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.dataGeneration = 
                (gameState.achievementBonuses.dataGeneration || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% all production')) {
        const match = reward.match(/(\d+)% all production/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.allProduction = 
                (gameState.achievementBonuses.allProduction || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% training speed')) {
        const match = reward.match(/(\d+)% training speed/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.trainingSpeed = 
                (gameState.achievementBonuses.trainingSpeed || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% model performance')) {
        const match = reward.match(/(\d+)% model performance/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.modelPerformance = 
                (gameState.achievementBonuses.modelPerformance || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% compute power')) {
        const match = reward.match(/(\d+)% compute power/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.computePower = 
                (gameState.achievementBonuses.computePower || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% all resource generation')) {
        const match = reward.match(/(\d+)% all resource generation/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.allResources = 
                (gameState.achievementBonuses.allResources || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('buildings cost') && reward.includes('% less')) {
        const match = reward.match(/(\d+)% less/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.buildingCostReduction = 
                (gameState.achievementBonuses.buildingCostReduction || 0) + bonus;
        }
    }
    
    if (reward.includes('x multiplier to all resources')) {
        const match = reward.match(/(\d+)x multiplier/);
        if (match) {
            const multiplier = parseInt(match[1]);
            gameState.achievementBonuses.globalMultiplier = 
                (gameState.achievementBonuses.globalMultiplier || 1) * multiplier;
        }
    }
    
    if (reward.includes('% deployment token gain')) {
        const match = reward.match(/(\d+)% deployment token gain/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.deploymentTokens = 
                (gameState.achievementBonuses.deploymentTokens || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% permanent accuracy gain')) {
        const match = reward.match(/(\d+)% permanent accuracy gain/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.permanentAccuracy = 
                (gameState.achievementBonuses.permanentAccuracy || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% research point generation')) {
        const match = reward.match(/(\d+)% research point generation/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses.researchPoints = 
                (gameState.achievementBonuses.researchPoints || 1) * (1 + bonus);
        }
    }
    
    // Special unlocks (these would need more complex handling in the game state)
    if (reward.includes('unlock')) {
        console.log(`✅ Achievement unlocked special feature: ${achievement.reward}`);
    }
    
    // Recalculate production with new bonuses
    if (gameState.recalculateProduction) {
        gameState.recalculateProduction();
    }
}

/**
 * Get total achievement bonus for a specific type
 */
export function getAchievementBonus(gameState, bonusType) {
    if (!gameState.achievementBonuses) return 1;
    return gameState.achievementBonuses[bonusType] || 1;
}
