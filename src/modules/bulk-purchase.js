// Bulk Purchase System for Buildings
// Enables buying multiple buildings at once (x1, x10, x100, Max)

import { getBuildingCost } from './buildings.js';

export class BulkPurchase {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentMode = 1; // Default: Buy x1
        this.availableModes = [1, 10, 100, 'max'];
    }
    
    /**
     * Set the current purchase mode
     * @param {number|string} mode - 1, 10, 100, or 'max'
     */
    setMode(mode) {
        if (this.availableModes.includes(mode)) {
            this.currentMode = mode;
            return true;
        }
        return false;
    }
    
    /**
     * Get the current purchase mode
     */
    getMode() {
        return this.currentMode;
    }
    
    /**
     * Calculate the maximum affordable amount of a building
     * @param {string} buildingId - Building identifier
     * @returns {number} Maximum affordable count
     */
    calculateMaxAffordable(buildingId) {
        const building = this.gameState.buildings[buildingId];
        if (!building || !building.unlocked) return 0;
        
        let maxCount = 0;
        const maxIterations = 10000; // Safety limit to prevent infinite loops
        
        // Simulate purchases to find maximum affordable
        // We use a binary search for efficiency with large numbers
        let low = 0;
        let high = maxIterations;
        let result = 0;
        
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const totalCost = this.calculateTotalCost(buildingId, mid);
            
            if (this.canAffordCost(totalCost)) {
                result = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        
        return result;
    }
    
    /**
     * Calculate total cost for buying multiple buildings
     * Uses the building cost scaling formula
     * @param {string} buildingId - Building identifier
     * @param {number} amount - Number of buildings to buy
     * @returns {Object} Total cost object {resourceId: amount}
     */
    calculateTotalCost(buildingId, amount) {
        const building = this.gameState.buildings[buildingId];
        if (!building || amount <= 0) return {};
        
        const totalCost = {};
        const currentCount = building.count;
        
        // Calculate cost for each building and sum them up
        for (let i = 0; i < amount; i++) {
            // Temporarily increase count to get next cost
            building.count = currentCount + i;
            const cost = getBuildingCost(building);
            
            // Apply achievement cost reduction
            const reduction = this.gameState.achievementBonuses.buildingCostReduction || 0;
            
            for (const [resourceId, resourceAmount] of Object.entries(cost)) {
                const adjustedAmount = resourceAmount * (1 - reduction);
                totalCost[resourceId] = (totalCost[resourceId] || 0) + adjustedAmount;
            }
        }
        
        // Restore original count
        building.count = currentCount;
        
        return totalCost;
    }
    
    /**
     * Check if player can afford the given cost
     * @param {Object} cost - Cost object {resourceId: amount}
     * @returns {boolean}
     */
    canAffordCost(cost) {
        for (const [resourceId, amount] of Object.entries(cost)) {
            if (!this.gameState.resources[resourceId] || 
                this.gameState.resources[resourceId].amount < amount) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Purchase multiple buildings based on current mode
     * @param {string} buildingId - Building identifier
     * @param {number|string} amount - Amount to buy, or 'mode' to use current mode
     * @returns {Object} Result object {success: boolean, amount: number, cost: Object}
     */
    purchase(buildingId, amount = 'mode') {
        const building = this.gameState.buildings[buildingId];
        if (!building || !building.unlocked) {
            return { success: false, amount: 0, cost: {} };
        }
        
        // Determine actual amount to buy
        let buyAmount;
        if (amount === 'mode') {
            buyAmount = this.currentMode === 'max' 
                ? this.calculateMaxAffordable(buildingId)
                : this.currentMode;
        } else if (amount === 'max') {
            buyAmount = this.calculateMaxAffordable(buildingId);
        } else {
            buyAmount = amount;
        }
        
        if (buyAmount <= 0) {
            return { success: false, amount: 0, cost: {} };
        }
        
        // Calculate total cost
        const totalCost = this.calculateTotalCost(buildingId, buyAmount);
        
        // Check if affordable
        if (!this.canAffordCost(totalCost)) {
            // Try to buy as many as possible
            buyAmount = this.calculateMaxAffordable(buildingId);
            if (buyAmount <= 0) {
                return { success: false, amount: 0, cost: totalCost };
            }
            // Recalculate cost for affordable amount
            Object.assign(totalCost, this.calculateTotalCost(buildingId, buyAmount));
        }
        
        // Spend resources
        if (!this.gameState.spendResources(totalCost)) {
            return { success: false, amount: 0, cost: totalCost };
        }
        
        // Add buildings
        building.count += buyAmount;
        this.gameState.stats.totalBuildings += buyAmount;
        
        // Recalculate production
        this.gameState.recalculateProduction();
        
        // Check for new unlocks
        this.gameState.checkBuildingUnlocks();
        
        return {
            success: true,
            amount: buyAmount,
            cost: totalCost
        };
    }
    
    /**
     * Get purchase preview information
     * @param {string} buildingId - Building identifier
     * @param {number|string} amount - Amount to preview, or 'mode' to use current mode
     * @returns {Object} Preview object
     */
    getPreview(buildingId, amount = 'mode') {
        const building = this.gameState.buildings[buildingId];
        if (!building || !building.unlocked) {
            return {
                amount: 0,
                cost: {},
                affordable: false,
                maxAffordable: 0
            };
        }
        
        // Determine amount
        let previewAmount;
        if (amount === 'mode') {
            previewAmount = this.currentMode === 'max'
                ? this.calculateMaxAffordable(buildingId)
                : this.currentMode;
        } else if (amount === 'max') {
            previewAmount = this.calculateMaxAffordable(buildingId);
        } else {
            previewAmount = amount;
        }
        
        const maxAffordable = this.calculateMaxAffordable(buildingId);
        const totalCost = this.calculateTotalCost(buildingId, previewAmount);
        const affordable = this.canAffordCost(totalCost);
        
        return {
            amount: previewAmount,
            cost: totalCost,
            affordable,
            maxAffordable
        };
    }
    
    /**
     * Save bulk purchase state
     */
    save() {
        return {
            currentMode: this.currentMode
        };
    }
    
    /**
     * Load bulk purchase state
     */
    load(data) {
        if (data && data.currentMode !== undefined) {
            this.currentMode = data.currentMode;
        }
    }
}
