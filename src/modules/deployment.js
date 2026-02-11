// Deployment/Prestige System
// Players can "deploy" their trained model to reset progress and earn permanent bonuses

/**
 * Calculate how many deployment tokens player would earn from current total accuracy
 * Formula: tokens = floor(sqrt(totalAccuracy / 1000000))
 * 
 * Examples:
 * - 1M accuracy = 1 token
 * - 10M accuracy = 3 tokens (floor(sqrt(10)))
 * - 100M accuracy = 10 tokens
 * - 1B accuracy = 31 tokens
 */
export function calculateDeploymentTokens(totalAccuracy) {
    if (totalAccuracy < 1000000) {
        return 0; // Need at least 1M accuracy to deploy
    }
    
    return Math.floor(Math.sqrt(totalAccuracy / 1000000));
}

/**
 * Calculate next token milestone
 */
export function getNextTokenMilestone(currentTokens) {
    const nextTokens = currentTokens + 1;
    return Math.pow(nextTokens, 2) * 1000000;
}

/**
 * Check if player can deploy (has enough progress to earn at least 1 token)
 */
export function canDeploy(totalAccuracy, currentTokens) {
    const potentialTokens = calculateDeploymentTokens(totalAccuracy);
    return potentialTokens > currentTokens; // Must earn at least 1 new token
}

/**
 * Initialize deployment state
 */
export function initializeDeployment() {
    return {
        tokens: 0,
        lifetimeTokens: 0,
        deployments: 0,
        lifetimeStats: {
            totalAccuracy: 0,
            totalData: 0,
            totalCompute: 0,
            modelsTrained: 0,
            researchCompleted: [],
            achievements: []
        },
        upgrades: {},
        history: []
    };
}

/**
 * Get deployment info for UI display
 */
export function getDeploymentInfo(totalAccuracy, currentTokens) {
    const potentialTokens = calculateDeploymentTokens(totalAccuracy);
    const tokensOnDeploy = potentialTokens - currentTokens;
    const nextMilestone = getNextTokenMilestone(potentialTokens);
    const progressToNext = totalAccuracy - (Math.pow(potentialTokens, 2) * 1000000);
    const requiredForNext = nextMilestone - totalAccuracy;
    
    return {
        canDeploy: tokensOnDeploy > 0,
        currentTokens: currentTokens,
        tokensOnDeploy: tokensOnDeploy,
        potentialTokens: potentialTokens,
        nextMilestone: nextMilestone,
        requiredForNext: requiredForNext
    };
}