// Research Module - Game state and logic for the research tree
// Definitions are in src/systems/research/definitions.js
// This module handles initialization, unlock checks, and effect application

import { RESEARCH_DEFINITIONS } from '../systems/research/definitions.js';

// Re-export for backwards compatibility
export const research = RESEARCH_DEFINITIONS;

// Check if a research item can be unlocked given completed research
export function canUnlockResearch(researchItem, completedResearch) {
    if (!researchItem.unlockRequirement) return true;

    if (researchItem.unlockRequirement.research) {
        const req = researchItem.unlockRequirement.research;
        if (Array.isArray(req)) {
            return req.every(r => completedResearch.includes(r));
        }
        return completedResearch.includes(req);
    }

    return true;
}

// Initialize research state (deep clone of definitions)
export function initializeResearch() {
    return JSON.parse(JSON.stringify(RESEARCH_DEFINITIONS));
}

// Apply a research effect to the game state
export function applyResearchEffect(effect, gameState) {
    if (!effect) return;

    switch (effect.type) {
        case 'trainingSpeed':
            gameState.multipliers = gameState.multipliers || {};
            gameState.multipliers.trainingSpeed = (gameState.multipliers.trainingSpeed || 1) * effect.multiplier;
            break;

        case 'modelPerformance':
            gameState.multipliers = gameState.multipliers || {};
            gameState.multipliers.modelPerformance = (gameState.multipliers.modelPerformance || 1) * effect.multiplier;
            break;

        case 'efficiency':
            gameState.multipliers = gameState.multipliers || {};
            gameState.multipliers.efficiency = (gameState.multipliers.efficiency || 1) * effect.multiplier;
            break;

        case 'globalMultiplier':
            gameState.multipliers = gameState.multipliers || {};
            gameState.multipliers.global = (gameState.multipliers.global || 1) * effect.multiplier;
            break;

        case 'dataProduction':
            gameState.multipliers = gameState.multipliers || {};
            gameState.multipliers.dataProduction = (gameState.multipliers.dataProduction || 1) * effect.multiplier;
            break;

        case 'computeEfficiency':
            gameState.multipliers = gameState.multipliers || {};
            gameState.multipliers.computeEfficiency = (gameState.multipliers.computeEfficiency || 1) * effect.multiplier;
            break;

        case 'researchSpeed':
            gameState.multipliers = gameState.multipliers || {};
            gameState.multipliers.researchSpeed = (gameState.multipliers.researchSpeed || 1) * effect.multiplier;
            break;

        case 'safetyBonus':
            gameState.multipliers = gameState.multipliers || {};
            gameState.multipliers.safetyBonus = (gameState.multipliers.safetyBonus || 1) * effect.multiplier;
            break;

        case 'unlockModels':
            // Handled by the model system — no-op here
            break;

        default:
            console.warn(`[Research] Unknown effect type: ${effect.type}`);
    }
}

// Get all researched item IDs from game state
export function getCompletedResearch(researchState) {
    return Object.keys(researchState).filter(id => researchState[id].researched);
}

// Get all items in a given category
export function getResearchByCategory(category) {
    return Object.values(RESEARCH_DEFINITIONS).filter(item => item.category === category);
}

// Get all categories present in the definitions
export function getResearchCategories() {
    const cats = new Set(Object.values(RESEARCH_DEFINITIONS).map(item => item.category));
    return Array.from(cats);
}
