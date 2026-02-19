/**
 * Save System
 * Handles save/load, export/import operations
 */

import { saveToStorage, loadFromStorage } from '../utils/storage.js';
import { recalculateProduction } from './production-calculator.js';
import { initializeDeployment } from '../modules/deployment.js';

// Bump to 0.6: adds deployment.upgrades, deployment.strategies, deployment.portfolio
const SAVE_VERSION = '0.6';
const SAVE_KEY = 'ai_idle_save';

/**
 * Default upgrade purchase state — all upgrades start unpurchased.
 */
function defaultUpgradesPurchased() {
    return {};
}

/**
 * Default portfolio state.
 */
function defaultPortfolio() {
    return { history: [] };
}

/**
 * Ensure a deployment object has all v0.6 fields.
 * Safe to call on both fresh and migrated objects.
 */
function migrateDeployment(dep) {
    if (!dep.upgradesPurchased) dep.upgradesPurchased = defaultUpgradesPurchased();
    if (!dep.selectedStrategy)  dep.selectedStrategy  = 'standard';
    if (!dep.portfolio)         dep.portfolio          = defaultPortfolio();
    return dep;
}

/**
 * Save game state.
 * NOTE: `multipliers` is intentionally NOT persisted — it is a derived value
 * that is always recomputed from research/achievements on load via
 * recalculateProduction().  Persisting it would only create stale-data bugs.
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

    const success = saveToStorage(SAVE_KEY, saveData);
    if (!success) {
        console.error('❌ Failed to save game to localStorage');
    }

    return saveData;
}

/**
 * Load game state.
 * recalculateProduction() is called by GameState.load() after this returns,
 * with the research-multiplier cache already invalidated.  We do NOT call it
 * here to avoid a redundant double-pass.
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
        gameState.models    = saveData.models;
        gameState.research  = saveData.research;
        gameState.achievements = saveData.achievements;

        // ── Deployment migration chain ──────────────────────────────────────
        if (saveData.deployment) {
            // v0.5 or later: deployment object exists — migrate to v0.6 shape
            gameState.deployment = migrateDeployment(saveData.deployment);
        } else if (saveData.prestige) {
            // pre-v0.5: prestige → deployment rename
            const dep = initializeDeployment();
            dep.tokens          = saveData.prestige.tokens          || 0;
            dep.lifetimeTokens  = saveData.prestige.lifetimeTokens  || 0;
            dep.deployments     = saveData.prestige.deployments      || 0;
            gameState.deployment = migrateDeployment(dep);
            console.log('✅ Migrated prestige data to deployment system (v0.6)');
        } else {
            gameState.deployment = migrateDeployment(initializeDeployment());
        }
        // ───────────────────────────────────────────────────────────────────

        gameState.currentTraining  = saveData.currentTraining;
        gameState.trainingProgress = saveData.trainingProgress;
        gameState.training         = saveData.training || null;
        gameState.stats            = saveData.stats;
        gameState.legacySettings   = saveData.legacySettings || saveData.settings || gameState.legacySettings;

        if (saveData.achievementBonuses) {
            gameState.achievementBonuses = {
                ...gameState.achievementBonuses,
                ...saveData.achievementBonuses
            };
        }

        if (saveData.comboSystem)    gameState.comboSystem.load(saveData.comboSystem);
        if (saveData.trainingQueue)  gameState.trainingQueue.load(saveData.trainingQueue);
        if (saveData.bulkPurchase)   gameState.bulkPurchase.load(saveData.bulkPurchase);

        if (!gameState.stats.lastPlaytimeUpdate) {
            gameState.stats.lastPlaytimeUpdate = Date.now();
        }
        if (gameState.stats.manualClicks === undefined) {
            gameState.stats.manualClicks = 0;
        }

        gameState.timeSinceAchievementCheck = 0;
        gameState.lastSaveTime = saveData.timestamp || Date.now();

        // recalculateProduction() is intentionally NOT called here.
        // GameState.load() invalidates _cachedResearchMultipliers and then
        // calls recalculateProduction() itself, so one clean pass is enough.

        return true;
    } catch (e) {
        console.error('❌ Failed to load save:', e);
        return false;
    }
}

/**
 * Export save as base64 string.
 */
export function exportSave(gameState) {
    try {
        const saveData   = saveGame(gameState);
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
 * Import save from base64 string.
 * recalculateProduction() is called by GameState.import() after this returns,
 * with the cache already invalidated — same pattern as loadGame().
 */
export function importSave(gameState, saveString) {
    try {
        const jsonString = decodeURIComponent(atob(saveString).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const saveData = JSON.parse(jsonString);

        gameState.resources        = saveData.resources;
        gameState.buildings        = saveData.buildings;
        gameState.models           = saveData.models;
        gameState.research         = saveData.research;
        gameState.achievements     = saveData.achievements;
        gameState.deployment       = migrateDeployment(saveData.deployment || initializeDeployment());
        gameState.currentTraining  = saveData.currentTraining;
        gameState.trainingProgress = saveData.trainingProgress;
        gameState.training         = saveData.training || null;
        gameState.stats            = saveData.stats;
        gameState.achievementBonuses = saveData.achievementBonuses || gameState.achievementBonuses;

        if (saveData.comboSystem)   gameState.comboSystem.load(saveData.comboSystem);
        if (saveData.trainingQueue) gameState.trainingQueue.load(saveData.trainingQueue);
        if (saveData.bulkPurchase)  gameState.bulkPurchase.load(saveData.bulkPurchase);

        // recalculateProduction() is intentionally NOT called here.
        // GameState.import() invalidates _cachedResearchMultipliers and then
        // calls recalculateProduction() itself.

        return true;
    } catch (e) {
        console.error('❌ Failed to import save:', e);
        return false;
    }
}
