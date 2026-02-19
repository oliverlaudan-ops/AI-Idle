/**
 * Deployment Strategies
 * Players choose a strategy when deploying. Each strategy trades speed for
 * token yield, giving experienced players a meaningful choice.
 */

export const STRATEGIES = {
    fast: {
        id: 'fast',
        name: 'Fast Deployment',
        icon: '⚡',
        description: 'Deploy immediately for reduced token yield. Best for quick iteration.',
        tokenMultiplier: 0.75,
        resetScope: 'standard',   // resources, buildings, models, training, research
        bonuses: [],
        unlockDeployments: 0,     // always available
    },
    standard: {
        id: 'standard',
        name: 'Standard Deployment',
        icon: '🚀',
        description: 'The default deployment. Full token yield, full reset.',
        tokenMultiplier: 1.0,
        resetScope: 'standard',
        bonuses: [],
        unlockDeployments: 0,
    },
    complete: {
        id: 'complete',
        name: 'Complete Deployment',
        icon: '🏆',
        description: 'Thorough evaluation earns +50% tokens. Requires 3 prior deployments.',
        tokenMultiplier: 1.5,
        resetScope: 'standard',
        bonuses: [
            { type: 'globalMultiplier', multiplier: 1.10, description: '+10% production next run' }
        ],
        unlockDeployments: 3,
    },
};

/**
 * Get strategies available to the player given their deployment count.
 * @param {number} deploymentCount
 * @returns {object[]}
 */
export function getAvailableStrategies(deploymentCount) {
    return Object.values(STRATEGIES).filter(s => deploymentCount >= s.unlockDeployments);
}

/**
 * Calculate the actual tokens earned for a given strategy.
 * Applies the upgrade token multiplier on top of the strategy multiplier.
 * @param {number} baseTokens              – tokens from the formula before strategy
 * @param {string} strategyId
 * @param {number} upgradeTokenMultiplier  – from getUpgradeMultiplier(upgrades, 'tokenMultiplier')
 * @returns {number}
 */
export function calculateStrategyTokens(baseTokens, strategyId, upgradeTokenMultiplier = 1) {
    const strategy = STRATEGIES[strategyId];
    if (!strategy) return baseTokens;
    return Math.floor(baseTokens * strategy.tokenMultiplier * upgradeTokenMultiplier);
}

/**
 * Get one-run bonuses granted by a strategy (applied at the start of the next run).
 * @param {string} strategyId
 * @returns {object[]}
 */
export function getStrategyBonuses(strategyId) {
    return STRATEGIES[strategyId]?.bonuses || [];
}
