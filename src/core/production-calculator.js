/**
 * Production Calculator
 * Calculates resource production rates from buildings, models, bonuses, and multipliers
 */

/**
 * Recalculate all resource production rates
 */
export function recalculateProduction(gameState) {
    // Reset all production
    for (const resource of Object.values(gameState.resources)) {
        resource.perSecond = 0;
    }
    
    // Calculate base production from buildings
    for (const building of Object.values(gameState.buildings)) {
        if (building.count > 0 && building.production) {
            for (const [resourceId, amount] of Object.entries(building.production)) {
                if (gameState.resources[resourceId]) {
                    gameState.resources[resourceId].perSecond += amount * building.count;
                }
            }
        }
    }
    
    // Apply specific resource bonuses FIRST (before global multipliers)
    if (gameState.resources.data) {
        gameState.resources.data.perSecond *= gameState.achievementBonuses.dataGeneration;
    }
    if (gameState.resources.compute) {
        gameState.resources.compute.perSecond *= gameState.achievementBonuses.computePower;
    }
    if (gameState.resources.research) {
        gameState.resources.research.perSecond *= gameState.achievementBonuses.researchPoints;
    }
    
    // Calculate building bonuses (e.g. Cooling System)
    let buildingBonusMultiplier = 1;
    for (const building of Object.values(gameState.buildings)) {
        if (building.count > 0 && building.bonus && building.bonus.globalProduction) {
            buildingBonusMultiplier += building.bonus.globalProduction * building.count;
        }
    }
    
    // Apply global multipliers from research
    let globalMultiplier = 1;
    for (const researchId of gameState.stats.completedResearch) {
        const research = gameState.research[researchId];
        if (research && research.effect && research.effect.type === 'globalMultiplier') {
            globalMultiplier *= research.effect.multiplier;
        }
    }
    
    // Apply achievement bonuses
    globalMultiplier *= gameState.achievementBonuses.globalMultiplier;
    globalMultiplier *= gameState.achievementBonuses.allProduction;
    globalMultiplier *= gameState.achievementBonuses.allResources;
    
    // Apply building bonuses (e.g. Cooling System +15%)
    globalMultiplier *= buildingBonusMultiplier;
    
    // Store multipliers for UI
    gameState.multipliers.global = globalMultiplier;
    gameState.multipliers.trainingSpeed = gameState.achievementBonuses.trainingSpeed;
    
    // Apply global multiplier to all resources
    for (const resource of Object.values(gameState.resources)) {
        resource.perSecond *= globalMultiplier;
    }
    
    // Add production from current training
    if (gameState.currentTraining) {
        const model = gameState.models[gameState.currentTraining];
        if (model && model.production) {
            for (const [resourceId, amount] of Object.entries(model.production)) {
                if (gameState.resources[resourceId]) {
                    let modifiedAmount = amount * gameState.achievementBonuses.modelPerformance * globalMultiplier;
                    gameState.resources[resourceId].perSecond += modifiedAmount;
                }
            }
        }
    }
}
