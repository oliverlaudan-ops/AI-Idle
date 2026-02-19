/**
 * Deployment Upgrades (Token Shop)
 * Permanent upgrades purchased with Deployment Tokens.
 * Upgrades persist across all future runs.
 *
 * Categories:
 *   training   – speed up model training
 *   efficiency – boost resource production
 *   research   – accelerate research
 *   prestige   – meta-progression bonuses
 */

export const UPGRADE_DEFINITIONS = {
    // ── Training ──────────────────────────────────────────────
    training_speed_1: {
        id: 'training_speed_1',
        category: 'training',
        name: 'Optimised Gradients I',
        description: '+25% training speed',
        icon: '⚡',
        cost: 1,
        effect: { type: 'trainingSpeed', multiplier: 1.25 },
        requires: null,
    },
    training_speed_2: {
        id: 'training_speed_2',
        category: 'training',
        name: 'Optimised Gradients II',
        description: '+50% training speed',
        icon: '⚡',
        cost: 3,
        effect: { type: 'trainingSpeed', multiplier: 1.5 },
        requires: 'training_speed_1',
    },
    training_speed_3: {
        id: 'training_speed_3',
        category: 'training',
        name: 'Optimised Gradients III',
        description: '+100% training speed',
        icon: '⚡',
        cost: 8,
        effect: { type: 'trainingSpeed', multiplier: 2.0 },
        requires: 'training_speed_2',
    },
    better_init: {
        id: 'better_init',
        category: 'training',
        name: 'Xavier Initialisation',
        description: 'Models start with 10% accuracy already filled',
        icon: '🎯',
        cost: 2,
        effect: { type: 'startingAccuracy', value: 0.10 },
        requires: null,
    },

    // ── Efficiency ────────────────────────────────────────────
    data_pipeline_1: {
        id: 'data_pipeline_1',
        category: 'efficiency',
        name: 'Data Pipeline I',
        description: '+30% data production',
        icon: '🗄️',
        cost: 1,
        effect: { type: 'dataProduction', multiplier: 1.30 },
        requires: null,
    },
    data_pipeline_2: {
        id: 'data_pipeline_2',
        category: 'efficiency',
        name: 'Data Pipeline II',
        description: '+60% data production',
        icon: '🗄️',
        cost: 4,
        effect: { type: 'dataProduction', multiplier: 1.60 },
        requires: 'data_pipeline_1',
    },
    compute_boost_1: {
        id: 'compute_boost_1',
        category: 'efficiency',
        name: 'GPU Overclock I',
        description: '+30% compute production',
        icon: '💻',
        cost: 1,
        effect: { type: 'computeEfficiency', multiplier: 1.30 },
        requires: null,
    },
    compute_boost_2: {
        id: 'compute_boost_2',
        category: 'efficiency',
        name: 'GPU Overclock II',
        description: '+60% compute production',
        icon: '💻',
        cost: 4,
        effect: { type: 'computeEfficiency', multiplier: 1.60 },
        requires: 'compute_boost_1',
    },
    global_efficiency: {
        id: 'global_efficiency',
        category: 'efficiency',
        name: 'Systems Optimisation',
        description: '+20% all production',
        icon: '🌐',
        cost: 5,
        effect: { type: 'globalMultiplier', multiplier: 1.20 },
        requires: null,
    },

    // ── Research ──────────────────────────────────────────────
    research_boost_1: {
        id: 'research_boost_1',
        category: 'research',
        name: 'Literature Review I',
        description: '+40% research speed',
        icon: '🔬',
        cost: 2,
        effect: { type: 'researchSpeed', multiplier: 1.40 },
        requires: null,
    },
    research_boost_2: {
        id: 'research_boost_2',
        category: 'research',
        name: 'Literature Review II',
        description: '+80% research speed',
        icon: '🔬',
        cost: 6,
        effect: { type: 'researchSpeed', multiplier: 1.80 },
        requires: 'research_boost_1',
    },
    head_start: {
        id: 'head_start',
        category: 'research',
        name: 'Prior Knowledge',
        description: 'Start each run with 1 free research unlock',
        icon: '📚',
        cost: 3,
        effect: { type: 'freeResearch', value: 1 },
        requires: null,
    },

    // ── Prestige ──────────────────────────────────────────────
    token_multiplier: {
        id: 'token_multiplier',
        category: 'prestige',
        name: 'Deployment Bonus',
        description: '+25% tokens earned on each deployment',
        icon: '🎖️',
        cost: 5,
        effect: { type: 'tokenMultiplier', multiplier: 1.25 },
        requires: null,
    },
    faster_start: {
        id: 'faster_start',
        category: 'prestige',
        name: 'Institutional Memory',
        description: 'Start each run with 2× the base building production',
        icon: '🏛️',
        cost: 4,
        effect: { type: 'startingProduction', multiplier: 2.0 },
        requires: null,
    },
};

/**
 * Get all upgrades the player has purchased.
 * @param {object} purchasedMap  gameState.deployment.upgradesPurchased  { upgradeId: true }
 * @returns {object[]}
 */
export function getPurchasedUpgrades(purchasedMap) {
    return Object.keys(purchasedMap || {})
        .filter(id => purchasedMap[id] && UPGRADE_DEFINITIONS[id])
        .map(id => UPGRADE_DEFINITIONS[id]);
}

/**
 * Check whether an upgrade can be purchased.
 * @param {string} upgradeId
 * @param {object} purchasedMap
 * @param {number} availableTokens
 * @returns {{ canBuy: boolean, reason: string|null }}
 */
export function canPurchaseUpgrade(upgradeId, purchasedMap, availableTokens) {
    const def = UPGRADE_DEFINITIONS[upgradeId];
    if (!def) return { canBuy: false, reason: 'Unknown upgrade' };
    if (purchasedMap[upgradeId]) return { canBuy: false, reason: 'Already purchased' };
    if (def.requires && !purchasedMap[def.requires]) {
        return { canBuy: false, reason: `Requires ${UPGRADE_DEFINITIONS[def.requires]?.name || def.requires}` };
    }
    if (availableTokens < def.cost) {
        return { canBuy: false, reason: `Need ${def.cost - availableTokens} more token${def.cost - availableTokens !== 1 ? 's' : ''}` };
    }
    return { canBuy: true, reason: null };
}

/**
 * Purchase an upgrade, returning the updated state.
 * @param {string}  upgradeId
 * @param {object}  purchasedMap   gameState.deployment.upgradesPurchased
 * @param {number}  availableTokens
 * @returns {{ success: boolean, reason: string|null, upgrades: object, remainingTokens: number }}
 */
export function purchaseUpgrade(upgradeId, purchasedMap, availableTokens) {
    const { canBuy, reason } = canPurchaseUpgrade(upgradeId, purchasedMap, availableTokens);
    if (!canBuy) {
        return { success: false, reason, upgrades: purchasedMap, remainingTokens: availableTokens };
    }
    const def = UPGRADE_DEFINITIONS[upgradeId];
    return {
        success: true,
        reason: null,
        upgrades: { ...purchasedMap, [upgradeId]: true },
        remainingTokens: availableTokens - def.cost,
    };
}

/**
 * Compute the combined multiplier for a given effect type from all purchased upgrades.
 * @param {object} purchasedMap
 * @param {string} effectType
 * @returns {number}
 */
export function getUpgradeMultiplier(purchasedMap, effectType) {
    let multiplier = 1;
    for (const upgrade of getPurchasedUpgrades(purchasedMap)) {
        if (upgrade.effect.type === effectType && upgrade.effect.multiplier) {
            multiplier *= upgrade.effect.multiplier;
        }
    }
    return multiplier;
}

/**
 * Get a flat value bonus (e.g. startingAccuracy, freeResearch) from purchased upgrades.
 * @param {object} purchasedMap
 * @param {string} effectType
 * @returns {number}
 */
export function getUpgradeValue(purchasedMap, effectType) {
    let total = 0;
    for (const upgrade of getPurchasedUpgrades(purchasedMap)) {
        if (upgrade.effect.type === effectType && upgrade.effect.value !== undefined) {
            total += upgrade.effect.value;
        }
    }
    return total;
}

/**
 * Group upgrade definitions by category for UI rendering.
 * @returns {object}  { training: [...], efficiency: [...], research: [...], prestige: [...] }
 */
export function getUpgradesByCategory() {
    const categories = {};
    for (const def of Object.values(UPGRADE_DEFINITIONS)) {
        if (!categories[def.category]) categories[def.category] = [];
        categories[def.category].push(def);
    }
    return categories;
}
