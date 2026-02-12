/**
 * Offline Progress Processor
 * Handles time-based progression when player is offline
 */

import { recalculateProduction } from './production-calculator.js';

// Constants
const MAX_OFFLINE_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours
const OFFLINE_TICK_INTERVAL = 60; // Process in 60 second chunks
const MIN_OFFLINE_TIME_MS = 5000; // Minimum 5 seconds

/**
 * Process offline progression
 */
export function processOfflineProgress(gameState, offlineTime) {
    const offlineEnabled = gameState.settings.get('gameplay', 'offlineProgress');
    if (!offlineEnabled) return;
    
    if (offlineTime < MIN_OFFLINE_TIME_MS) return;
    
    const maxTime = MAX_OFFLINE_TIME_MS;
    const actualTime = Math.min(offlineTime, maxTime);
    const timeInSeconds = actualTime / 1000;
    
    // Update playtime
    gameState.stats.totalPlaytime += actualTime;
    
    // Process in chunks
    const numTicks = Math.floor(timeInSeconds / OFFLINE_TICK_INTERVAL);
    const remainingTime = timeInSeconds % OFFLINE_TICK_INTERVAL;
    
    for (let i = 0; i < numTicks; i++) {
        processOfflineTick(gameState, OFFLINE_TICK_INTERVAL);
    }
    
    if (remainingTime > 0) {
        processOfflineTick(gameState, remainingTime);
    }
    
    console.log(`✅ Processed ${timeInSeconds.toFixed(0)}s of offline time (${numTicks} ticks)`);
}

/**
 * Process a single offline tick
 */
function processOfflineTick(gameState, deltaTime) {
    // Add resources
    for (const [resourceId, resource] of Object.entries(gameState.resources)) {
        if (resource.perSecond > 0) {
            gameState.resourceManager.addResource(resourceId, resource.perSecond * deltaTime);
        }
    }
    
    // Check unlocks
    const hadUnlocks = checkOfflineUnlocks(gameState);
    if (hadUnlocks) {
        recalculateProduction(gameState);
    }
    
    // Check achievements
    const newAchievements = gameState.checkAchievements();
    if (newAchievements.length > 0) {
        recalculateProduction(gameState);
    }
}

/**
 * Check for unlocks during offline time
 */
function checkOfflineUnlocks(gameState) {
    let hadUnlocks = false;
    
    // Check building unlocks
    for (const building of Object.values(gameState.buildings)) {
        if (!building.unlocked && building.unlockRequirement) {
            let canUnlock = true;
            for (const [resourceId, amount] of Object.entries(building.unlockRequirement)) {
                if (gameState.resources[resourceId].amount < amount) {
                    canUnlock = false;
                    break;
                }
            }
            if (canUnlock) {
                building.unlocked = true;
                hadUnlocks = true;
            }
        }
    }
    
    // Check model unlocks
    for (const model of Object.values(gameState.models)) {
        if (!model.unlocked && model.unlockRequirement) {
            let canUnlock = true;
            for (const [resourceId, amount] of Object.entries(model.unlockRequirement)) {
                if (gameState.resources[resourceId].amount < amount) {
                    canUnlock = false;
                    break;
                }
            }
            if (canUnlock) {
                model.unlocked = true;
                hadUnlocks = true;
            }
        }
    }
    
    return hadUnlocks;
}
