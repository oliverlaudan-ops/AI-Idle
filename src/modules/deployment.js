// Deployment/Prestige System
// Players can "deploy" their trained model to reset progress and earn permanent bonuses

/**
 * Calculate how many deployment tokens player would earn from current total accuracy
 * Formula: tokens = floor(sqrt(totalAccuracy / 250000))
 * 
 * Adjusted for better early game:
 * - 250K accuracy = 1 token (first deployment!)
 * - 1M accuracy = 2 tokens
 * - 4M accuracy = 4 tokens
 * - 10M accuracy = 6 tokens
 * - 100M accuracy = 20 tokens
 * 
 * @param {number} totalAccuracy - Lifetime total accuracy earned
 * @returns {number} Number of deployment tokens earned
 */
export function calculateDeploymentTokens(totalAccuracy) {
    if (totalAccuracy < 250000) {
        return 0; // Need at least 250K accuracy to deploy
    }
    
    return Math.floor(Math.sqrt(totalAccuracy / 250000));
}

/**
 * Calculate next token milestone
 * @param {number} currentTokens - Current deployment tokens
 * @returns {number} Total accuracy needed for next token
 */
export function getNextTokenMilestone(currentTokens) {
    const nextTokens = currentTokens + 1;
    return Math.pow(nextTokens, 2) * 250000;
}

/**
 * Check if player can deploy (has enough progress to earn at least 1 token)
 * @param {number} totalAccuracy - Lifetime total accuracy
 * @param {number} currentTokens - Current token count
 * @returns {boolean} Whether deployment is available
 */
export function canDeploy(totalAccuracy, currentTokens) {
    const potentialTokens = calculateDeploymentTokens(totalAccuracy);
    return potentialTokens > currentTokens; // Must earn at least 1 new token
}

/**
 * Initialize deployment state
 * @returns {object} Initial deployment state
 */
export function initializeDeployment() {
    return {
        // Permanent progression
        tokens: 0,                    // Total deployment tokens earned
        lifetimeTokens: 0,            // All tokens ever earned (including spent)
        deployments: 0,               // Number of times deployed
        
        // Lifetime stats (never reset)
        lifetimeStats: {
            totalAccuracy: 0,         // All accuracy ever earned
            totalData: 0,             // All data ever generated
            totalCompute: 0,          // All compute ever used
            modelsTrained: 0,         // Total models trained
            researchCompleted: [],    // Research completed (persists)
            achievements: []          // Achievements (persist across deployments)
        },
        
        // Upgrades purchased with tokens (to be implemented)
        upgrades: {},
        
        // Deployment history
        history: []
    };
}

/**
 * Get deployment info for UI display
 * @param {number} totalAccuracy - Current lifetime accuracy
 * @param {number} currentTokens - Current token count
 * @returns {object} Deployment information
 */
export function getDeploymentInfo(totalAccuracy, currentTokens) {
    const potentialTokens = calculateDeploymentTokens(totalAccuracy);
    const tokensOnDeploy = potentialTokens - currentTokens;
    const nextMilestone = getNextTokenMilestone(potentialTokens);
    const progressToNext = totalAccuracy - (Math.pow(potentialTokens, 2) * 250000);
    const requiredForNext = nextMilestone - totalAccuracy;
    
    return {
        canDeploy: tokensOnDeploy > 0,
        currentTokens: currentTokens,
        tokensOnDeploy: tokensOnDeploy,
        potentialTokens: potentialTokens,
        nextMilestone: nextMilestone,
        progressToNext: progressToNext,
        requiredForNext: requiredForNext,
        percentToNext: progressToNext > 0 ? (progressToNext / (nextMilestone - (Math.pow(potentialTokens, 2) * 250000))) * 100 : 0
    };
}