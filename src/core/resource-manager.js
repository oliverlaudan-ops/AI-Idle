/**
 * Resource Manager
 * Handles resource operations (add, spend, check affordability)
 */

export class ResourceManager {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    /**
     * Add resource amount
     */
    addResource(resourceId, amount) {
        if (!this.gameState.resources[resourceId]) return;
        
        this.gameState.resources[resourceId].amount += amount;
        
        // Update stats
        if (resourceId === 'data') {
            this.gameState.stats.totalDataGenerated += amount;
            this.gameState.deployment.lifetimeStats.totalData += amount;
        } else if (resourceId === 'accuracy') {
            this.gameState.stats.totalAccuracy += amount;
            this.gameState.deployment.lifetimeStats.totalAccuracy += amount;
            this.gameState.stats.maxAccuracy = Math.max(
                this.gameState.stats.maxAccuracy,
                this.gameState.resources.accuracy.amount
            );
        } else if (resourceId === 'compute') {
            this.gameState.deployment.lifetimeStats.totalCompute += amount;
        }
    }
    
    /**
     * Check if player can afford costs
     */
    canAfford(costs) {
        for (const [resourceId, amount] of Object.entries(costs)) {
            if (!this.gameState.resources[resourceId] || 
                this.gameState.resources[resourceId].amount < amount) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Spend resources if affordable
     */
    spendResources(costs) {
        if (!this.canAfford(costs)) return false;
        
        for (const [resourceId, amount] of Object.entries(costs)) {
            this.gameState.resources[resourceId].amount -= amount;
        }
        return true;
    }
}
