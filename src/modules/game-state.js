// Central Game State Management

import { initializeResources } from './resources.js';
import { initializeBuildings, getBuildingCost } from './buildings.js';
import { initializeModels } from './models.js';
import { initializeResearch } from './research.js';
import { initializeAchievements } from './achievements.js';
import { initializePrestige } from './prestige.js';
import { checkAndUnlockAchievements, getAchievementBonus } from './achievement-checker.js';
import { ComboSystem } from './combo-system.js';
import { TrainingQueue } from './training-queue.js';
import { BulkPurchase } from './bulk-purchase.js';

// Game constants
const GAME_CONSTANTS = {
    MAX_OFFLINE_TIME_MS: 24 * 60 * 60 * 1000, // 24 hours
    OFFLINE_TICK_INTERVAL: 60, // Process offline progress in 60 second chunks
    MIN_OFFLINE_TIME_MS: 5000, // Minimum 5 seconds to trigger offline progress
    SAVE_VERSION: '0.3'
};

export class GameState {
    constructor() {
        this.resources = initializeResources();
        this.buildings = initializeBuildings();
        this.models = initializeModels();
        this.research = initializeResearch();
        this.achievements = initializeAchievements();
        this.prestige = initializePrestige();
        
        // NEW: Combo system for manual collection
        this.comboSystem = new ComboSystem();
        
        // NEW: Training queue system
        this.trainingQueue = new TrainingQueue(this);
        
        // NEW: Bulk purchase system
        this.bulkPurchase = new BulkPurchase(this);
        
        this.currentTraining = null;
        this.trainingProgress = 0;
        
        // Enhanced training state for UI animations
        this.training = null; // Will be set when training starts
        
        // Achievement bonuses storage
        this.achievementBonuses = {
            dataGeneration: 1,
            allProduction: 1,
            trainingSpeed: 1,
            modelPerformance: 1,
            computePower: 1,
            allResources: 1,
            buildingCostReduction: 0,
            globalMultiplier: 1,
            deploymentTokens: 1,
            permanentAccuracy: 1,
            researchPoints: 1,
            manualCollection: 1 // NEW: For combo achievements
        };
        
        // Multipliers object for UI
        this.multipliers = {
            trainingSpeed: 1.0,
            global: 1.0
        };
        
        this.stats = {
            totalDataGenerated: 0,
            totalAccuracy: 0,
            maxAccuracy: 0,
            totalCompute: 0,
            totalBuildings: 0,
            modelsTrained: 0,
            uniqueModelsTrained: 0,
            trainedModels: [],
            completedResearch: [],
            deployments: 0,
            startTime: Date.now(),
            totalPlaytime: 0,
            lastPlaytimeUpdate: Date.now(),
            manualClicks: 0 // NEW: Track manual clicks
        };
        
        this.settings = {
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            offlineProgress: true
        };
        
        this.lastSaveTime = Date.now();
        
        // Queue for newly unlocked achievements (for notifications)
        this.newlyUnlockedAchievements = [];
    }
    
    // Resource Management
    addResource(resourceId, amount) {
        if (!this.resources[resourceId]) return;
        
        this.resources[resourceId].amount += amount;
        
        // Update stats
        if (resourceId === 'data') {
            this.stats.totalDataGenerated += amount;
        } else if (resourceId === 'accuracy') {
            this.stats.totalAccuracy += amount;
            this.stats.maxAccuracy = Math.max(this.stats.maxAccuracy, this.resources.accuracy.amount);
        }
    }
    
    // NEW: Manual collect with combo system
    manualCollect() {
        // Get combo multiplier
        const multiplier = this.comboSystem.click();
        
        // Base amount is 1, modified by combo and achievement bonuses
        const baseAmount = 1;
        const amount = baseAmount * multiplier * this.achievementBonuses.manualCollection;
        
        // Add the resource
        this.addResource('data', amount);
        
        // Update stats
        this.stats.manualClicks++;
        
        return { amount, multiplier };
    }
    
    canAfford(costs) {
        for (const [resourceId, amount] of Object.entries(costs)) {
            if (!this.resources[resourceId] || this.resources[resourceId].amount < amount) {
                return false;
            }
        }
        return true;
    }
    
    spendResources(costs) {
        if (!this.canAfford(costs)) return false;
        
        for (const [resourceId, amount] of Object.entries(costs)) {
            this.resources[resourceId].amount -= amount;
        }
        return true;
    }
    
    // Building Management
    purchaseBuilding(buildingId, amount = 1) {
        // NEW: Use bulk purchase system if amount > 1 or using bulk mode
        if (amount !== 1 || this.bulkPurchase.getMode() !== 1) {
            return this.bulkPurchase.purchase(buildingId, amount === 1 ? 'mode' : amount);
        }
        
        // Legacy single purchase for backwards compatibility
        const building = this.buildings[buildingId];
        if (!building || !building.unlocked) return false;
        
        let cost = getBuildingCost(building);
        
        // Apply achievement cost reduction
        if (this.achievementBonuses.buildingCostReduction > 0) {
            const reduction = this.achievementBonuses.buildingCostReduction;
            const adjustedCost = {};
            for (const [resourceId, amount] of Object.entries(cost)) {
                adjustedCost[resourceId] = amount * (1 - reduction);
            }
            cost = adjustedCost;
        }
        
        if (!this.spendResources(cost)) return false;
        
        building.count++;
        this.stats.totalBuildings++;
        this.recalculateProduction();
        
        // Check for building unlocks
        this.checkBuildingUnlocks();
        
        return { success: true, amount: 1, cost };
    }
    
    checkBuildingUnlocks() {
        for (const building of Object.values(this.buildings)) {
            if (!building.unlocked && building.unlockRequirement) {
                let canUnlock = true;
                for (const [resourceId, amount] of Object.entries(building.unlockRequirement)) {
                    if (this.resources[resourceId].amount < amount) {
                        canUnlock = false;
                        break;
                    }
                }
                if (canUnlock) {
                    building.unlocked = true;
                }
            }
        }
    }
    
    // Production Calculation
    recalculateProduction() {
        // Reset all production
        for (const resource of Object.values(this.resources)) {
            resource.perSecond = 0;
        }
        
        // Calculate base production from buildings
        for (const building of Object.values(this.buildings)) {
            if (building.count > 0 && building.production) {
                for (const [resourceId, amount] of Object.entries(building.production)) {
                    if (this.resources[resourceId]) {
                        this.resources[resourceId].perSecond += amount * building.count;
                    }
                }
            }
        }
        
        // Apply specific resource bonuses FIRST (before global multipliers)
        // This ensures they show up correctly in the UI
        if (this.resources.data) {
            this.resources.data.perSecond *= this.achievementBonuses.dataGeneration;
        }
        if (this.resources.compute) {
            this.resources.compute.perSecond *= this.achievementBonuses.computePower;
        }
        if (this.resources.research) {
            this.resources.research.perSecond *= this.achievementBonuses.researchPoints;
        }
        
        // Apply global multipliers from research
        let globalMultiplier = 1;
        for (const researchId of this.stats.completedResearch) {
            const research = this.research[researchId];
            if (research && research.effect && research.effect.type === 'globalMultiplier') {
                globalMultiplier *= research.effect.multiplier;
            }
        }
        
        // Apply prestige bonuses
        if (this.prestige.upgrades.ensemblelearning && this.prestige.upgrades.ensemblelearning.level > 0) {
            const bonus = this.prestige.upgrades.ensemblelearning.effect.value * this.prestige.upgrades.ensemblelearning.level;
            globalMultiplier *= (1 + bonus);
        }
        
        // Apply achievement bonuses to global multiplier
        globalMultiplier *= this.achievementBonuses.globalMultiplier;
        globalMultiplier *= this.achievementBonuses.allProduction;
        globalMultiplier *= this.achievementBonuses.allResources;
        
        // Store multipliers for UI
        this.multipliers.global = globalMultiplier;
        this.multipliers.trainingSpeed = this.achievementBonuses.trainingSpeed;
        
        // Apply global multiplier to all resources
        for (const resource of Object.values(this.resources)) {
            resource.perSecond *= globalMultiplier;
        }
        
        // Add production from current training (with bonuses)
        if (this.currentTraining) {
            const model = this.models[this.currentTraining];
            if (model && model.production) {
                for (const [resourceId, amount] of Object.entries(model.production)) {
                    if (this.resources[resourceId]) {
                        let modifiedAmount = amount * this.achievementBonuses.modelPerformance * globalMultiplier;
                        this.resources[resourceId].perSecond += modifiedAmount;
                    }
                }
            }
        }
    }
    
    // NEW: Get training speed multiplier (used by queue for estimates)
    getTrainingSpeedMultiplier() {
        return this.achievementBonuses.trainingSpeed;
    }
    
    // Training Management
    startTraining(modelId) {
        const model = this.models[modelId];
        if (!model || !model.unlocked) return false;
        
        // Check requirements
        for (const [resourceId, amount] of Object.entries(model.requirements)) {
            if (this.resources[resourceId].amount < amount) {
                return false;
            }
        }
        
        this.currentTraining = modelId;
        this.trainingProgress = 0;
        
        // Initialize training state for UI
        this.training = {
            modelId: modelId,
            elapsedTime: 0,
            duration: model.trainingTime,
            accuracyPerSecond: model.production.accuracy || 0,
            startTime: Date.now()
        };
        
        this.recalculateProduction();
        
        return true;
    }
    
    stopTraining() {
        this.currentTraining = null;
        this.trainingProgress = 0;
        this.training = null;
        this.recalculateProduction();
    }
    
    completeTraining() {
        if (!this.currentTraining) return;
        
        const modelId = this.currentTraining;
        this.stats.modelsTrained++;
        
        if (!this.stats.trainedModels.includes(modelId)) {
            this.stats.trainedModels.push(modelId);
            this.stats.uniqueModelsTrained++;
        }
        
        this.stopTraining();
        
        // NEW: Notify queue that training completed
        this.trainingQueue.onTrainingComplete();
    }
    
    // Research Management
    performResearch(researchId) {
        const research = this.research[researchId];
        if (!research || !research.unlocked || research.researched) return false;
        
        if (!this.spendResources(research.cost)) return false;
        
        research.researched = true;
        this.stats.completedResearch.push(researchId);
        
        // Apply research effects
        if (research.effect.type === 'unlockModels') {
            for (const modelId of research.effect.models) {
                if (this.models[modelId]) {
                    this.models[modelId].unlocked = true;
                }
            }
        }
        
        // Check for research unlocks
        this.checkResearchUnlocks();
        this.recalculateProduction();
        
        return true;
    }
    
    checkResearchUnlocks() {
        for (const research of Object.values(this.research)) {
            if (!research.unlocked && research.unlockRequirement) {
                if (research.unlockRequirement.research) {
                    const reqResearch = this.research[research.unlockRequirement.research];
                    if (reqResearch && reqResearch.researched) {
                        research.unlocked = true;
                    }
                }
            }
        }
        
        // Check model unlocks based on accuracy
        for (const model of Object.values(this.models)) {
            if (!model.unlocked && model.unlockRequirement) {
                let canUnlock = true;
                for (const [resourceId, amount] of Object.entries(model.unlockRequirement)) {
                    if (this.resources[resourceId].amount < amount) {
                        canUnlock = false;
                        break;
                    }
                }
                if (canUnlock) {
                    model.unlocked = true;
                }
            }
        }
    }
    
    // Achievement Management
    checkAchievements() {
        const newUnlocks = checkAndUnlockAchievements(this);
        if (newUnlocks.length > 0) {
            this.newlyUnlockedAchievements.push(...newUnlocks);
        }
        return newUnlocks;
    }
    
    // Get and clear newly unlocked achievements (for UI notifications)
    popNewlyUnlockedAchievements() {
        const achievements = this.newlyUnlockedAchievements;
        this.newlyUnlockedAchievements = [];
        return achievements;
    }
    
    // Game Loop Update
    update(deltaTime) {
        // Update playtime
        const now = Date.now();
        const playtimeDelta = now - this.stats.lastPlaytimeUpdate;
        this.stats.totalPlaytime += playtimeDelta;
        this.stats.lastPlaytimeUpdate = now;
        
        // NEW: Update combo system
        this.comboSystem.update(deltaTime);
        
        // Add resources from production
        for (const [resourceId, resource] of Object.entries(this.resources)) {
            if (resource.perSecond > 0) {
                this.addResource(resourceId, resource.perSecond * deltaTime);
            }
        }
        
        // Update training progress
        if (this.currentTraining && this.training) {
            const model = this.models[this.currentTraining];
            if (model) {
                const trainingSpeedBonus = this.achievementBonuses.trainingSpeed;
                
                this.trainingProgress += deltaTime * trainingSpeedBonus;
                this.training.elapsedTime += deltaTime * trainingSpeedBonus;
                
                if (this.trainingProgress >= model.trainingTime) {
                    this.completeTraining();
                }
            }
        }
        
        // Check unlocks
        this.checkBuildingUnlocks();
        this.checkResearchUnlocks();
        
        // Check achievements
        this.checkAchievements();
        
        // Update total compute for stats
        this.stats.totalCompute = this.resources.compute.amount;
    }
    
    // Enhanced offline progression with simulation
    processOfflineProgress(offlineTime) {
        if (!this.settings.offlineProgress) return;
        if (offlineTime < GAME_CONSTANTS.MIN_OFFLINE_TIME_MS) return;
        
        const maxTime = GAME_CONSTANTS.MAX_OFFLINE_TIME_MS;
        const actualTime = Math.min(offlineTime, maxTime);
        const timeInSeconds = actualTime / 1000;
        
        // Update playtime
        this.stats.totalPlaytime += actualTime;
        
        // Process in chunks to handle achievement unlocks and production changes
        const tickInterval = GAME_CONSTANTS.OFFLINE_TICK_INTERVAL;
        const numTicks = Math.floor(timeInSeconds / tickInterval);
        const remainingTime = timeInSeconds % tickInterval;
        
        // Process full ticks
        for (let i = 0; i < numTicks; i++) {
            this._processOfflineTick(tickInterval);
        }
        
        // Process remaining time
        if (remainingTime > 0) {
            this._processOfflineTick(remainingTime);
        }
        
        console.log(`✅ Processed ${timeInSeconds.toFixed(0)}s of offline time (${numTicks} ticks)`);
    }
    
    // Helper: Process a single offline tick
    _processOfflineTick(deltaTime) {
        // Add resources from production
        for (const [resourceId, resource] of Object.entries(this.resources)) {
            if (resource.perSecond > 0) {
                this.addResource(resourceId, resource.perSecond * deltaTime);
            }
        }
        
        // Check for new unlocks and recalculate if needed
        const hadUnlocks = this._checkOfflineUnlocks();
        if (hadUnlocks) {
            this.recalculateProduction();
        }
        
        // Check achievements (they may unlock and change bonuses)
        const newAchievements = this.checkAchievements();
        if (newAchievements.length > 0) {
            // Recalculate production with new achievement bonuses
            this.recalculateProduction();
        }
    }
    
    // Helper: Check for unlocks during offline progression
    _checkOfflineUnlocks() {
        let hadUnlocks = false;
        
        // Check building unlocks
        for (const building of Object.values(this.buildings)) {
            if (!building.unlocked && building.unlockRequirement) {
                let canUnlock = true;
                for (const [resourceId, amount] of Object.entries(building.unlockRequirement)) {
                    if (this.resources[resourceId].amount < amount) {
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
        for (const model of Object.values(this.models)) {
            if (!model.unlocked && model.unlockRequirement) {
                let canUnlock = true;
                for (const [resourceId, amount] of Object.entries(model.unlockRequirement)) {
                    if (this.resources[resourceId].amount < amount) {
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
    
    // Save/Load
    save() {
        const saveData = {
            version: GAME_CONSTANTS.SAVE_VERSION,
            timestamp: Date.now(),
            resources: this.resources,
            buildings: this.buildings,
            models: this.models,
            research: this.research,
            achievements: this.achievements,
            achievementBonuses: this.achievementBonuses,
            prestige: this.prestige,
            currentTraining: this.currentTraining,
            trainingProgress: this.trainingProgress,
            training: this.training,
            stats: this.stats,
            settings: this.settings,
            comboSystem: this.comboSystem.save(),
            trainingQueue: this.trainingQueue.save(),
            bulkPurchase: this.bulkPurchase.save() // NEW: Save bulk purchase state
        };
        
        this.lastSaveTime = Date.now();
        return saveData;
    }
    
    load(saveData) {
        try {
            // Validate save version
            if (saveData.version && saveData.version !== GAME_CONSTANTS.SAVE_VERSION) {
                console.warn(`Loading save from version ${saveData.version}, current version is ${GAME_CONSTANTS.SAVE_VERSION}`);
            }
            
            // Restore state
            this.resources = saveData.resources;
            this.buildings = saveData.buildings;
            this.models = saveData.models;
            this.research = saveData.research;
            this.achievements = saveData.achievements;
            this.prestige = saveData.prestige;
            this.currentTraining = saveData.currentTraining;
            this.trainingProgress = saveData.trainingProgress;
            this.training = saveData.training || null;
            this.stats = saveData.stats;
            this.settings = saveData.settings || this.settings; // Use default if missing
            
            // Load achievement bonuses if they exist
            if (saveData.achievementBonuses) {
                this.achievementBonuses = {
                    ...this.achievementBonuses,
                    ...saveData.achievementBonuses
                };
            }
            
            // NEW: Load combo system state
            if (saveData.comboSystem) {
                this.comboSystem.load(saveData.comboSystem);
            }
            
            // NEW: Load training queue state
            if (saveData.trainingQueue) {
                this.trainingQueue.load(saveData.trainingQueue);
            }
            
            // NEW: Load bulk purchase state
            if (saveData.bulkPurchase) {
                this.bulkPurchase.load(saveData.bulkPurchase);
            }
            
            // Ensure lastPlaytimeUpdate is set
            if (!this.stats.lastPlaytimeUpdate) {
                this.stats.lastPlaytimeUpdate = Date.now();
            }
            
            // Ensure manualClicks stat exists
            if (this.stats.manualClicks === undefined) {
                this.stats.manualClicks = 0;
            }
            
            this.recalculateProduction();
            this.lastSaveTime = saveData.timestamp || Date.now();
            
            return true;
        } catch (e) {
            console.error('Failed to load save:', e);
            return false;
        }
    }
    
    reset() {
        Object.assign(this, new GameState());
    }
    
    // Export/Import with Unicode-safe Base64
    export() {
        try {
            const saveData = this.save();
            const jsonString = JSON.stringify(saveData);
            // Use Unicode-safe encoding
            return btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
                return String.fromCharCode('0x' + p1);
            }));
        } catch (e) {
            console.error('Failed to export save:', e);
            return null;
        }
    }
    
    import(saveString) {
        try {
            // Decode Unicode-safe Base64
            const jsonString = decodeURIComponent(atob(saveString).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const saveData = JSON.parse(jsonString);
            return this.load(saveData);
        } catch (e) {
            console.error('Failed to import save:', e);
            return false;
        }
    }
}