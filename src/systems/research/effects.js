/**
 * Research Effects
 * Logic for applying research effects to game state
 */

/**
 * Check if research can be unlocked
 */
export function canUnlockResearch(researchItem, completedResearch) {
    if (!researchItem.unlockRequirement) return true;
    
    if (researchItem.unlockRequirement.research) {
        return completedResearch.includes(researchItem.unlockRequirement.research);
    }
    
    return true;
}

/**
 * Apply research effects to game state
 * Called after research is completed
 */
export function applyResearchEffect(gameState, research) {
    const effect = research.effect;
    
    switch (effect.type) {
        case 'unlockModels':
            // Unlock specific models
            for (const modelId of effect.models) {
                if (gameState.models[modelId]) {
                    gameState.models[modelId].unlocked = true;
                }
            }
            break;
            
        case 'globalMultiplier':
            // Global production multiplier (handled in production calculator)
            // No immediate action needed, applied during recalculation
            break;
            
        case 'trainingSpeed':
            // Training speed multiplier (handled in production calculator)
            // No immediate action needed, applied during recalculation
            break;
            
        case 'modelPerformance':
            // Model performance multiplier (handled in production calculator)
            // No immediate action needed, applied during recalculation
            break;
            
        case 'efficiency':
            // Efficiency multiplier (handled in production calculator)
            // No immediate action needed, applied during recalculation
            break;
            
        default:
            console.warn(`Unknown research effect type: ${effect.type}`);
    }
}

/**
 * Get total multiplier from research for a specific effect type
 */
export function getResearchMultiplier(gameState, effectType) {
    let multiplier = 1;
    
    for (const researchId of gameState.stats.completedResearch) {
        const research = gameState.research[researchId];
        if (research && research.effect && research.effect.type === effectType) {
            multiplier *= research.effect.multiplier || 1;
        }
    }
    
    return multiplier;
}
