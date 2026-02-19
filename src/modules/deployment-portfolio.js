/**
 * Deployment Portfolio
 * Tracks every deployment as a historical record and computes a Portfolio Score
 * that reflects the player's overall progression.
 */

/**
 * Create a portfolio entry for a completed deployment.
 * @param {object} params
 * @returns {object}
 */
export function createPortfolioEntry({
    deploymentNumber,
    strategyId,
    tokensEarned,
    totalAccuracyAtDeploy,
    modelsTrainedThisRun,
    researchCompletedThisRun,
    runDurationMs,
    timestamp = Date.now(),
}) {
    return {
        deploymentNumber,
        strategyId,
        tokensEarned,
        totalAccuracyAtDeploy,
        modelsTrainedThisRun,
        researchCompletedThisRun,
        runDurationMs,
        timestamp,
    };
}

/**
 * Compute the Portfolio Score from the full deployment history.
 *
 * Score formula (additive):
 *   +10  per deployment
 *   +5   per token earned (lifetime)
 *   +2   per model trained (lifetime)
 *   +3   per research completed (lifetime)
 *   +20  bonus for each "complete" strategy deployment
 *
 * @param {object[]} history  – array of portfolio entries
 * @returns {number}
 */
export function calculatePortfolioScore(history) {
    if (!history || history.length === 0) return 0;

    let score = 0;
    for (const entry of history) {
        score += 10;                                          // per deployment
        score += (entry.tokensEarned || 0) * 5;             // per token
        score += (entry.modelsTrainedThisRun || 0) * 2;     // per model
        score += (entry.researchCompletedThisRun || 0) * 3; // per research
        if (entry.strategyId === 'complete') score += 20;   // complete strategy bonus
    }
    return score;
}

/**
 * Get a human-readable rank based on portfolio score.
 * @param {number} score
 * @returns {{ rank: string, icon: string }}
 */
export function getPortfolioRank(score) {
    if (score >= 500) return { rank: 'AGI Pioneer',       icon: '🌟' };
    if (score >= 250) return { rank: 'ML Architect',      icon: '🏆' };
    if (score >= 100) return { rank: 'Senior Researcher', icon: '🔬' };
    if (score >= 40)  return { rank: 'ML Engineer',       icon: '💻' };
    if (score >= 10)  return { rank: 'Junior Researcher', icon: '📚' };
    return                   { rank: 'Intern',            icon: '🎓' };
}

/**
 * Summarise the portfolio for UI display.
 * @param {object[]} history
 * @param {number}   lifetimeTokens
 * @returns {object}
 */
export function getPortfolioSummary(history, lifetimeTokens) {
    const score = calculatePortfolioScore(history);
    const { rank, icon } = getPortfolioRank(score);

    const totalModels   = history.reduce((s, e) => s + (e.modelsTrainedThisRun || 0), 0);
    const totalResearch = history.reduce((s, e) => s + (e.researchCompletedThisRun || 0), 0);
    const bestTokenRun  = history.reduce((best, e) => Math.max(best, e.tokensEarned || 0), 0);
    const fastestRunMs  = history.reduce((best, e) => {
        if (!e.runDurationMs) return best;
        return best === 0 ? e.runDurationMs : Math.min(best, e.runDurationMs);
    }, 0);

    return {
        score,
        rank,
        rankIcon: icon,
        totalDeployments: history.length,
        lifetimeTokens,
        totalModels,
        totalResearch,
        bestTokenRun,
        fastestRunMs,
        recentHistory: history.slice(-5).reverse(), // last 5, newest first
    };
}

/**
 * Format a run duration in milliseconds to a human-readable string.
 * @param {number} ms
 * @returns {string}
 */
export function formatRunDuration(ms) {
    if (!ms || ms <= 0) return '—';
    const totalSeconds = Math.floor(ms / 1000);
    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0)   return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}
