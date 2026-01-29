// Achievement Checker - Handles checking and unlocking achievements

import { checkAchievement } from './achievements.js';

/**
 * Check all achievements and unlock those that meet requirements
 * Returns array of newly unlocked achievements
 */
export function checkAndUnlockAchievements(gameState) {
    const newlyUnlocked = [];
    
    // Build stats object for checking
    const stats = buildStatsForChecking(gameState);
    
    // Check each achievement
    for (const [id, achievement] of Object.entries(gameState.achievements)) {
        // Skip already unlocked achievements
        if (achievement.unlocked) continue;
        
        // Check if requirements are met
        if (checkAchievement(achievement, stats)) {
            achievement.unlocked = true;
            newlyUnlocked.push({
                id: id,
                achievement: achievement
            });
            
            // Apply achievement rewards
            applyAchievementReward(gameState, achievement);
        }
    }
    
    return newlyUnlocked;
}

/**
 * Build stats object from game state for achievement checking
 */
function buildStatsForChecking(gameState) {
    const stats = {
        modelsTrained: gameState.stats.modelsTrained,
        totalDataGenerated: gameState.stats.totalDataGenerated,
        maxAccuracy: gameState.stats.maxAccuracy,
        uniqueModelsTrained: gameState.stats.uniqueModelsTrained,
        totalCompute: gameState.resources.compute.amount,
        totalAccuracy: gameState.stats.totalAccuracy,
        deployments: gameState.stats.deployments,
        totalBuildings: gameState.stats.totalBuildings,
        buildings: {},
        completedResearch: gameState.stats.completedResearch,
        researchByCategory: {},
        totalByCategory: {},
        totalResearch: 0
    };
    
    // Count buildings by type
    for (const [id, building] of Object.entries(gameState.buildings)) {
        stats.buildings[id] = building.count;
    }
    
    // Count research by category
    const categoryMap = {};
    for (const [id, research] of Object.entries(gameState.research)) {
        if (!categoryMap[research.category]) {
            categoryMap[research.category] = { total: 0, completed: 0 };
        }
        categoryMap[research.category].total++;
        stats.totalResearch++;
        
        if (research.researched) {
            categoryMap[research.category].completed++;
        }
    }
    
    // Fill in category stats
    for (const [category, data] of Object.entries(categoryMap)) {
        stats.researchByCategory[category] = data.completed;
        stats.totalByCategory[category] = data.total;
    }
    
    return stats;
}

/**
 * Apply rewards from unlocked achievements
 */
function applyAchievementReward(gameState, achievement) {
    // Parse reward text and apply effects
    const reward = achievement.reward.toLowerCase();
    
    // Production bonuses
    if (reward.includes('% data generation')) {
        const match = reward.match(/(\d+)% data generation/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.dataGeneration = 
                (gameState.achievementBonuses.dataGeneration || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% all production')) {
        const match = reward.match(/(\d+)% all production/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.allProduction = 
                (gameState.achievementBonuses.allProduction || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% training speed')) {
        const match = reward.match(/(\d+)% training speed/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.trainingSpeed = 
                (gameState.achievementBonuses.trainingSpeed || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% model performance')) {
        const match = reward.match(/(\d+)% model performance/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.modelPerformance = 
                (gameState.achievementBonuses.modelPerformance || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% compute power')) {
        const match = reward.match(/(\d+)% compute power/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.computePower = 
                (gameState.achievementBonuses.computePower || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% all resource generation')) {
        const match = reward.match(/(\d+)% all resource generation/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.allResources = 
                (gameState.achievementBonuses.allResources || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('buildings cost') && reward.includes('% less')) {
        const match = reward.match(/(\d+)% less/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.buildingCostReduction = 
                (gameState.achievementBonuses.buildingCostReduction || 0) + bonus;
        }
    }
    
    if (reward.includes('x multiplier to all resources')) {
        const match = reward.match(/(\d+)x multiplier/);
        if (match) {
            const multiplier = parseInt(match[1]);
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.globalMultiplier = 
                (gameState.achievementBonuses.globalMultiplier || 1) * multiplier;
        }
    }
    
    if (reward.includes('% deployment token gain')) {
        const match = reward.match(/(\d+)% deployment token gain/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.deploymentTokens = 
                (gameState.achievementBonuses.deploymentTokens || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% permanent accuracy gain')) {
        const match = reward.match(/(\d+)% permanent accuracy gain/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.permanentAccuracy = 
                (gameState.achievementBonuses.permanentAccuracy || 1) * (1 + bonus);
        }
    }
    
    if (reward.includes('% research point generation')) {
        const match = reward.match(/(\d+)% research point generation/);
        if (match) {
            const bonus = parseInt(match[1]) / 100;
            gameState.achievementBonuses = gameState.achievementBonuses || {};
            gameState.achievementBonuses.researchPoints = 
                (gameState.achievementBonuses.researchPoints || 1) * (1 + bonus);
        }
    }
    
    // Special unlocks (these would need more complex handling in the game state)
    // For now, just log them
    if (reward.includes('unlock')) {
        console.log(`Achievement unlocked special feature: ${achievement.reward}`);
    }
    
    // Recalculate production with new bonuses
    gameState.recalculateProduction();
}

/**
 * Get total achievement bonus for a specific type
 */
export function getAchievementBonus(gameState, bonusType) {
    if (!gameState.achievementBonuses) return 1;
    return gameState.achievementBonuses[bonusType] || 1;
}

/**
 * Get achievement progress statistics
 */
export function getAchievementProgress(gameState) {
    let total = 0;
    let unlocked = 0;
    
    for (const achievement of Object.values(gameState.achievements)) {
        total++;
        if (achievement.unlocked) unlocked++;
    }
    
    return {
        unlocked,
        total,
        percentage: total > 0 ? (unlocked / total * 100).toFixed(1) : 0
    };
}
