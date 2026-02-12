/**
 * Save System
 * Handles save/load, export/import operations
 */

import { saveToStorage, loadFromStorage } from '../utils/storage.js';
import { recalculateProduction } from './production-calculator.js';
import { initializeDeployment } from '../modules/deployment.js';

const SAVE_VERSION = '0.4';
const SAVE_KEY = 'ai_idle_save';

/**
 * Save game state
 */
export function saveGame(gameState) {
    const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        resources: gameState.resources,
        buildings: gameState.buildings,
        models: gameState.models,
        research: gameState.research,
        achievements: gameState.achievements,
        achievementBonuses: gameState.achievementBonuses,
        deployment: gameState.deployment,
        currentTraining: gameState.currentTraining,
        trainingProgress: gameState.trainingProgress,
        training: gameState.training,
        stats: gameState.stats,
        legacySettings: gameState.legacySettings,
        comboSystem: gameState.comboSystem.save(),
        trainingQueue: gameState.trainingQueue.save(),
        bulkPurchase: gameState.bulkPurchase.save()
    };
    
    gameState.lastSaveTime = Date.now();
    
    // Save to localStorage
    const success = saveToStorage(SAVE_KEY, saveData);
    if (!success) {
        console.error('❌ Failed to save game to localStorage');
    }
    
    return saveData;
}

/**
 * Load game state
 */
export function loadGame(gameState) {
    const saveData = loadFromStorage(SAVE_KEY);
    
    if (!saveData) {
        console.log('ℹ️ No save data found');
        return false;
    }
    
    try {
        if (saveData.version && saveData.version !== SAVE_VERSION) {
            console.warn(`Loading save from version ${saveData.version}, current version is ${SAVE_VERSION}`);
        }
        
        gameState.resources = saveData.resources;
        gameState.buildings = saveData.buildings;
        gameState.models = saveData.models;
        gameState.research = saveData.research;
        gameState.achievements = saveData.achievements;
        
        // Handle migration from prestige to deployment
        if (saveData.deployment) {
            gameState.deployment = saveData.deployment;
        } else if (saveData.prestige) {
            // Migrate old prestige data
            gameState.deployment = initializeDeployment();
            gameState.deployment.tokens = saveData.prestige.tokens || 0;
            gameState.deployment.lifetimeTokens = saveData.prestige.lifetimeTokens || 0;
            gameState.deployment.deployments = saveData.prestige.deployments || 0;
            console.log('✅ Migrated prestige data to deployment system');
        } else {
            gameState.deployment = initializeDeployment();
        }
        
        gameState.currentTraining = saveData.currentTraining;
        gameState.trainingProgress = saveData.trainingProgress;
        gameState.training = saveData.training || null;
        gameState.stats = saveData.stats;
        gameState.legacySettings = saveData.legacySettings || saveData.settings || gameState.legacySettings;
        
        if (saveData.achievementBonuses) {
            gameState.achievementBonuses = {
                ...gameState.achievementBonuses,
                ...saveData.achievementBonuses
            };
        }
        
        if (saveData.comboSystem) {
            gameState.comboSystem.load(saveData.comboSystem);
        }
        
        if (saveData.trainingQueue) {
            gameState.trainingQueue.load(saveData.trainingQueue);
        }
        
        if (saveData.bulkPurchase) {
            gameState.bulkPurchase.load(saveData.bulkPurchase);
        }
        
        if (!gameState.stats.lastPlaytimeUpdate) {
            gameState.stats.lastPlaytimeUpdate = Date.now();
        }
        
        if (gameState.stats.manualClicks === undefined) {
            gameState.stats.manualClicks = 0;
        }
        
        // Initialize achievement check timer
        gameState.timeSinceAchievementCheck = 0;
        
        recalculateProduction(gameState);
        gameState.lastSaveTime = saveData.timestamp || Date.now();
        
        return true;
    } catch (e) {
        console.error('❌ Failed to load save:', e);
        return false;
    }
}

/**
 * Export save as base64 string
 */
export function exportSave(gameState) {
    try {
        const saveData = saveGame(gameState);
        const jsonString = JSON.stringify(saveData);
        return btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
    } catch (e) {
        console.error('❌ Failed to export save:', e);
        return null;
    }
}

/**
 * Import save from base64 string
 */
export function importSave(gameState, saveString) {
    try {
        const jsonString = decodeURIComponent(atob(saveString).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const saveData = JSON.parse(jsonString);
        
        // Manually load the imported data
        gameState.resources = saveData.resources;
        gameState.buildings = saveData.buildings;
        gameState.models = saveData.models;
        gameState.research = saveData.research;
        gameState.achievements = saveData.achievements;
        gameState.deployment = saveData.deployment || initializeDeployment();
        gameState.currentTraining = saveData.currentTraining;
        gameState.trainingProgress = saveData.trainingProgress;
        gameState.training = saveData.training || null;
        gameState.stats = saveData.stats;
        gameState.achievementBonuses = saveData.achievementBonuses || gameState.achievementBonuses;
        
        if (saveData.comboSystem) {
            gameState.comboSystem.load(saveData.comboSystem);
        }
        if (saveData.trainingQueue) {
            gameState.trainingQueue.load(saveData.trainingQueue);
        }
        if (saveData.bulkPurchase) {
            gameState.bulkPurchase.load(saveData.bulkPurchase);
        }
        
        recalculateProduction(gameState);
        
        return true;
    } catch (e) {
        console.error('❌ Failed to import save:', e);
        return false;
    }
}
