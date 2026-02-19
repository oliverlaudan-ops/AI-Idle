/**
 * Production Calculator
 * Calculates resource production rates from buildings, models, bonuses, and multipliers
 */

import { getUpgradeMultiplier } from '../modules/deployment-upgrades.js';

/**
 * Compute all research-derived multipliers in a single pass over completedResearch.
 * Results are cached on gameState._cachedResearchMultipliers and invalidated by
 * setting it to null whenever research is completed (see GameState.performResearch).
 *
 * Supported effect types:
 *   globalMultiplier  – multiplies every resource's perSecond
 *   trainingSpeed     – multiplies training progress rate
 *   modelPerformance  – multiplies model production output
 *   efficiency        – multiplies building production
 *   dataProduction    – multiplies data resource perSecond
 *   computeEfficiency – multiplies compute resource perSecond
 *   researchSpeed     – multiplies research resource perSecond
 *   safetyBonus       – global multiplier variant for safety-themed research
 *
 * @param {object} gameState
 * @returns {{ global: number, trainingSpeed: number, modelPerformance: number,
 *             efficiency: number, dataProduction: number, computeEfficiency: number,
 *             researchSpeed: number, safetyBonus: number }}
 */
function getResearchMultipliers(gameState) {
    if (gameState._cachedResearchMultipliers) {
        return gameState._cachedResearchMultipliers;
    }

    const m = {
        global: 1,
        trainingSpeed: 1,
        modelPerformance: 1,
        efficiency: 1,
        dataProduction: 1,
        computeEfficiency: 1,
        researchSpeed: 1,
        safetyBonus: 1,
    };

    for (const researchId of gameState.stats.completedResearch) {
        const research = gameState.research[researchId];
        if (!research || !research.effect) continue;

        const { type, multiplier } = research.effect;
        if (!multiplier) continue;

        switch (type) {
            case 'globalMultiplier':   m.global            *= multiplier; break;
            case 'trainingSpeed':      m.trainingSpeed     *= multiplier; break;
            case 'modelPerformance':   m.modelPerformance  *= multiplier; break;
            case 'efficiency':         m.efficiency        *= multiplier; break;
            case 'dataProduction':     m.dataProduction    *= multiplier; break;
            case 'computeEfficiency':  m.computeEfficiency *= multiplier; break;
            case 'researchSpeed':      m.researchSpeed     *= multiplier; break;
            case 'safetyBonus':        m.safetyBonus       *= multiplier; break;
            // 'unlockModels' has no numeric multiplier — skip
        }
    }

    gameState._cachedResearchMultipliers = m;
    return m;
}

/**
 * Recalculate all resource production rates
 */
export function recalculateProduction(gameState) {
    // Reset all production
    for (const resource of Object.values(gameState.resources)) {
        resource.perSecond = 0;
    }

    // Gather all research multipliers (single pass, cached)
    const rm = getResearchMultipliers(gameState);

    // ── Prestige upgrade multipliers ────────────────────────────────────────
    // getUpgradeMultiplier is safe to call even when deployment.upgradesPurchased
    // is empty — it returns 1 for any unknown category.
    const purchasedUpgrades = gameState.deployment?.upgradesPurchased ?? {};
    const um = {
        training:   getUpgradeMultiplier(purchasedUpgrades, 'training'),
        efficiency: getUpgradeMultiplier(purchasedUpgrades, 'efficiency'),
        research:   getUpgradeMultiplier(purchasedUpgrades, 'research'),
        prestige:   getUpgradeMultiplier(purchasedUpgrades, 'prestige'),
    };
    // ────────────────────────────────────────────────────────────────────────

    // Calculate base production from buildings, applying efficiency multiplier
    // (research efficiency × prestige efficiency upgrade)
    const efficiencyMultiplier = rm.efficiency * um.efficiency;
    for (const building of Object.values(gameState.buildings)) {
        if (building.count > 0 && building.production) {
            for (const [resourceId, amount] of Object.entries(building.production)) {
                if (gameState.resources[resourceId]) {
                    gameState.resources[resourceId].perSecond +=
                        amount * building.count * efficiencyMultiplier;
                }
            }
        }
    }

    // Apply specific resource bonuses FIRST (before global multipliers)
    if (gameState.resources.data) {
        gameState.resources.data.perSecond *=
            gameState.achievementBonuses.dataGeneration * rm.dataProduction;
    }
    if (gameState.resources.compute) {
        gameState.resources.compute.perSecond *=
            gameState.achievementBonuses.computePower * rm.computeEfficiency;
    }
    if (gameState.resources.research) {
        // Research resource benefits from both research-speed research AND
        // the prestige research upgrade.
        gameState.resources.research.perSecond *=
            gameState.achievementBonuses.researchPoints * rm.researchSpeed * um.research;
    }

    // Calculate building bonuses (e.g. Cooling System)
    let buildingBonusMultiplier = 1;
    for (const building of Object.values(gameState.buildings)) {
        if (building.count > 0 && building.bonus && building.bonus.globalProduction) {
            buildingBonusMultiplier += building.bonus.globalProduction * building.count;
        }
    }

    // Compose global multiplier:
    //   research global × research safetyBonus × achievement bonuses × building bonuses
    //   × prestige global (um.prestige)
    let globalMultiplier = rm.global * rm.safetyBonus * um.prestige;
    globalMultiplier *= gameState.achievementBonuses.globalMultiplier;
    globalMultiplier *= gameState.achievementBonuses.allProduction;
    globalMultiplier *= gameState.achievementBonuses.allResources;
    globalMultiplier *= buildingBonusMultiplier;

    // Store multipliers for UI display
    gameState.multipliers.global             = globalMultiplier;
    gameState.multipliers.trainingSpeed      = gameState.achievementBonuses.trainingSpeed * rm.trainingSpeed * um.training;
    gameState.multipliers.modelPerformance   = rm.modelPerformance;
    gameState.multipliers.efficiency         = efficiencyMultiplier;
    gameState.multipliers.dataProduction     = rm.dataProduction;
    gameState.multipliers.computeEfficiency  = rm.computeEfficiency;
    gameState.multipliers.researchSpeed      = rm.researchSpeed * um.research;
    gameState.multipliers.safetyBonus        = rm.safetyBonus;
    // Expose prestige upgrade multipliers for the stats/debug UI
    gameState.multipliers.prestigeUpgrade    = um.prestige;

    // Apply global multiplier to all resources
    for (const resource of Object.values(gameState.resources)) {
        resource.perSecond *= globalMultiplier;
    }

    // Add production from current training, applying modelPerformance multiplier
    // Training speed upgrade (um.training) is applied to the training *progress rate*
    // in the training system, not here — production output uses modelPerformance only.
    if (gameState.currentTraining) {
        const model = gameState.models[gameState.currentTraining];
        if (model && model.production) {
            for (const [resourceId, amount] of Object.entries(model.production)) {
                if (gameState.resources[resourceId]) {
                    const modifiedAmount =
                        amount *
                        gameState.achievementBonuses.modelPerformance *
                        rm.modelPerformance *
                        globalMultiplier;
                    gameState.resources[resourceId].perSecond += modifiedAmount;
                }
            }
        }
    }
}
