/**
 * Building Cost Calculations
 * Logic for calculating building costs based on count
 */

/**
 * Calculate current cost for a building
 * Uses exponential scaling based on count
 */
export function getBuildingCost(building, count = null) {
    const currentCount = count !== null ? count : building.count;
    const cost = {};
    
    for (const [resource, baseAmount] of Object.entries(building.baseCost)) {
        cost[resource] = Math.floor(baseAmount * Math.pow(building.costMultiplier, currentCount));
    }
    
    return cost;
}

/**
 * Calculate cost for multiple buildings at once
 * Used for bulk purchase calculations
 */
export function getBulkBuildingCost(building, amount) {
    const cost = {};
    const startCount = building.count;
    
    // Sum costs for each building in the range
    for (let i = 0; i < amount; i++) {
        const singleCost = getBuildingCost(building, startCount + i);
        
        for (const [resource, resourceCost] of Object.entries(singleCost)) {
            cost[resource] = (cost[resource] || 0) + resourceCost;
        }
    }
    
    return cost;
}

/**
 * Calculate maximum affordable amount of a building
 */
export function getMaxAffordable(building, resources) {
    let maxAffordable = 0;
    const totalCost = {};
    
    // Try increasing amounts until we can't afford anymore
    for (let i = 1; i <= 1000; i++) { // Cap at 1000 for performance
        const cost = getBuildingCost(building, building.count + i - 1);
        
        // Add to total cost
        for (const [resource, amount] of Object.entries(cost)) {
            totalCost[resource] = (totalCost[resource] || 0) + amount;
        }
        
        // Check if we can afford
        let canAfford = true;
        for (const [resource, amount] of Object.entries(totalCost)) {
            if (!resources[resource] || resources[resource].amount < amount) {
                canAfford = false;
                break;
            }
        }
        
        if (canAfford) {
            maxAffordable = i;
        } else {
            break;
        }
    }
    
    return maxAffordable;
}
