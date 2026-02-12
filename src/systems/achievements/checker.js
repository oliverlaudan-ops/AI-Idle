/**
 * Achievement Checker
 * Logic for checking if achievements should be unlocked
 */

import { applyAchievementReward } from './rewards.js';

/**
 * Check if achievement requirements are met
 */
export function checkAchievement(achievement, gameStats) {
    const req = achievement.requirement;
    
    switch (req.type) {
        case 'modelsTrained':
            return gameStats.modelsTrained >= req.value;
        case 'totalDataGenerated':
            return gameStats.totalDataGenerated >= req.value;
        case 'maxAccuracy':
            return gameStats.maxAccuracy >= req.value;
        case 'uniqueModels':
            return gameStats.uniqueModelsTrained >= req.value;
        case 'totalCompute':
            return gameStats.totalCompute >= req.value;
        case 'buildingCount':
            return gameStats.buildings[req.building] >= req.value;
        case 'totalBuildings':
            return gameStats.totalBuildings >= req.value;
        case 'deploymentsCount':
            return gameStats.deployments >= req.value;
        case 'totalAccuracy':
            return gameStats.totalAccuracy >= req.value;
        case 'specificResearch':
            return gameStats.completedResearch.includes(req.research);
        case 'researchCategory':
            return gameStats.researchByCategory[req.category] === gameStats.totalByCategory[req.category];
        case 'allResearch':
            return gameStats.completedResearch.length === gameStats.totalResearch;
        default:
            return false;
    }
}

/**
 * Check all achievements and unlock those that meet requirements
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
