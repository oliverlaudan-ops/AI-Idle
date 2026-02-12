// Central Game State Management

import { initializeResources } from './resources.js';
import { initializeBuildings, getBuildingCost } from './buildings.js';
import { initializeModels } from './models.js';
import { initializeResearch } from './research.js';
import { initializeAchievements } from './achievements.js';
import { initializeDeployment, calculateDeploymentTokens, getDeploymentInfo } from './deployment.js';
import { checkAndUnlockAchievements, getAchievementBonus } from './achievement-checker.js';
import { ComboSystem } from './combo-system.js';
import { TrainingQueue } from './training-queue.js';
import { BulkPurchase } from './bulk-purchase.js';
import { Settings } from './settings.js';

// Game constants
const GAME_CONSTANTS = {
    MAX_OFFLINE_TIME_MS: 24 * 60 * 60 * 1000, // 24 hours
    OFFLINE_TICK_INTERVAL: 60, // Process offline progress in 60 second chunks
    MIN_OFFLINE_TIME_MS: 5000, // Minimum 5 seconds to trigger offline progress
    ACHIEVEMENT_CHECK_INTERVAL: 5.0, // Check achievements every 5 seconds (not every tick!)
    SAVE_VERSION: '0.4' // Updated for deployment system
};

export class GameState {
    constructor() {
        this.resources = initializeResources();
        this.buildings = initializeBuildings();
        this.models = initializeModels();
        this.research = initializeResearch();
        this.achievements = initializeAchievements();
        this.deployment = initializeDeployment(); // Changed from prestige to deployment
        
        // NEW: Settings system
        this.settings = new Settings();
        this.settings.load(); // Load saved settings
        
        // Combo system for manual collection
        this.comboSystem = new ComboSystem();
        
        // Training queue system
        this.trainingQueue = new TrainingQueue(this);
        
        // Bulk purchase system
        this.bulkPurchase = new BulkPurchase(this);
        
        this.currentTraining = null;
        this.trainingProgress = 0;
        
        // Enhanced training state for UI animations
        this.training = null; // Will be set when training starts
        
        // Performance: Track time since last achievement check
        this.timeSinceAchievementCheck = 0;
        
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
            manualCollection: 1
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
            manualClicks: 0
        };
        
        // Legacy settings for backwards compatibility (now handled by Settings module)
        this.legacySettings = {
            autoSave: true,
            autoSaveInterval: 30000,
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
        
        // Update stats (including lifetime stats for deployment)
        if (resourceId === 'data') {
            this.stats.totalDataGenerated += amount;
            this.deployment.lifetimeStats.totalData += amount;
        } else if (resourceId === 'accuracy') {
            this.stats.totalAccuracy += amount;
            this.deployment.lifetimeStats.totalAccuracy += amount;
            this.stats.maxAccuracy = Math.max(this.stats.maxAccuracy, this.resources.accuracy.amount);
        } else if (resourceId === 'compute') {
            this.deployment.lifetimeStats.totalCompute += amount;
        }
    }
    
    // Manual collect with combo system
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
        
        // Check achievements immediately on important events
        this.checkAchievements();
        
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
        // Use bulk purchase system if amount > 1 or using bulk mode
        if (amount !== 1 || this.bulkPurchase.getMode() !== 1) {
            const result = this.bulkPurchase.purchase(buildingId, amount === 1 ? 'mode' : amount);
            // Check achievements after purchase
            if (result && result.success) {
                this.checkAchievements();
            }
            return result;
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
        
        // Check achievements after purchase
        this.checkAchievements();
        
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
        
        // Apply achievement bonuses
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
        
        // Add production from current training
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
    
    // Get training speed multiplier
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
        this.deployment.lifetimeStats.modelsTrained++;
        
        if (!this.stats.trainedModels.includes(modelId)) {
            this.stats.trainedModels.push(modelId);
            this.stats.uniqueModelsTrained++;
        }
        
        this.stopTraining();
        
        // Check achievements after training completion
        this.checkAchievements();
        
        // Notify queue that training completed
        this.trainingQueue.onTrainingComplete();
    }
    
    // Research Management
    performResearch(researchId) {
        const research = this.research[researchId];
        if (!research || !research.unlocked || research.researched) return false;
        
        if (!this.spendResources(research.cost)) return false;
        
        research.researched = true;
        this.stats.completedResearch.push(researchId);
        
        // Track in lifetime stats
        if (!this.deployment.lifetimeStats.researchCompleted.includes(researchId)) {
            this.deployment.lifetimeStats.researchCompleted.push(researchId);
        }
        
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
        
        // Check achievements after research
        this.checkAchievements();
        
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
            
            // Track in lifetime stats
            for (const achievement of newUnlocks) {
                if (!this.deployment.lifetimeStats.achievements.includes(achievement.id)) {
                    this.deployment.lifetimeStats.achievements.push(achievement.id);
                }
            }
        }
        return newUnlocks;
    }
    
    // Get and clear newly unlocked achievements
    popNewlyUnlockedAchievements() {
        const achievements = this.newlyUnlockedAchievements;
        this.newlyUnlockedAchievements = [];
        return achievements;
    }
    
    // Deployment (Prestige) Management
    getDeploymentInfo() {
        return getDeploymentInfo(
            this.deployment.lifetimeStats.totalAccuracy,
            this.deployment.tokens
        );
    }
    
    performDeployment() {
        const deployInfo = this.getDeploymentInfo();
        
        if (!deployInfo.canDeploy) {
            return { success: false, reason: 'Not enough progress for deployment' };
        }
        
        // Calculate tokens earned
        const tokensEarned = deployInfo.tokensOnDeploy;
        
        // Record deployment in history
        const deploymentRecord = {
            timestamp: Date.now(),
            tokensEarned: tokensEarned,
            totalAccuracy: this.deployment.lifetimeStats.totalAccuracy,
            deploymentNumber: this.deployment.deployments + 1
        };
        
        this.deployment.history.push(deploymentRecord);
        this.deployment.tokens += tokensEarned;
        this.deployment.lifetimeTokens += tokensEarned;
        this.deployment.deployments++;
        this.stats.deployments++;
        
        // Reset game state (keep deployment data and achievements)
        this.resources = initializeResources();
        this.buildings = initializeBuildings();
        this.models = initializeModels();
        this.research = initializeResearch();
        
        // Keep achievements but reset current progress
        // Achievements stay unlocked in this.achievements
        
        this.currentTraining = null;
        this.trainingProgress = 0;
        this.training = null;
        
        // Reset current run stats (but keep lifetime stats in deployment)
        this.stats.totalDataGenerated = 0;
        this.stats.totalAccuracy = 0;
        this.stats.maxAccuracy = 0;
        this.stats.totalCompute = 0;
        this.stats.totalBuildings = 0;
        this.stats.modelsTrained = 0;
        this.stats.uniqueModelsTrained = 0;
        this.stats.trainedModels = [];
        this.stats.completedResearch = [];
        this.stats.manualClicks = 0;
        
        // Reset combo
        this.comboSystem = new ComboSystem();
        
        // Reset training queue
        this.trainingQueue = new TrainingQueue(this);
        
        // Recalculate everything
        this.recalculateProduction();
        
        console.log(`🚀 Deployment #${this.deployment.deployments} complete! Earned ${tokensEarned} tokens.`);
        
        return {
            success: true,
            tokensEarned: tokensEarned,
            newTotalTokens: this.deployment.tokens,
            deploymentRecord: deploymentRecord
        };
    }
    
    // Game Loop Update - OPTIMIZED
    update(deltaTime) {
        // Update playtime
        const now = Date.now();
        const playtimeDelta = now - this.stats.lastPlaytimeUpdate;
        this.stats.totalPlaytime += playtimeDelta;
        this.stats.lastPlaytimeUpdate = now;
        
        // Update combo system
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
        
        // Check unlocks (cheap operations)
        this.checkBuildingUnlocks();
        this.checkResearchUnlocks();
        
        // PERFORMANCE FIX: Only check achievements every 5 seconds, not every tick!
        // This reduces operations from 600/minute to 12/minute (50x improvement)
        this.timeSinceAchievementCheck += deltaTime;
        if (this.timeSinceAchievementCheck >= GAME_CONSTANTS.ACHIEVEMENT_CHECK_INTERVAL) {
            this.checkAchievements();
            this.timeSinceAchievementCheck = 0;
        }
        // Note: Manual actions (clicks, purchases, research, training) trigger immediate achievement checks
        
        // Update total compute for stats
        this.stats.totalCompute = this.resources.compute.amount;
    }
    
    // Enhanced offline progression
    processOfflineProgress(offlineTime) {
        const offlineEnabled = this.settings.get('gameplay', 'offlineProgress');
        if (!offlineEnabled) return;
        
        if (offlineTime < GAME_CONSTANTS.MIN_OFFLINE_TIME_MS) return;
        
        const maxTime = GAME_CONSTANTS.MAX_OFFLINE_TIME_MS;
        const actualTime = Math.min(offlineTime, maxTime);
        const timeInSeconds = actualTime / 1000;
        
        // Update playtime
        this.stats.totalPlaytime += actualTime;
        
        // Process in chunks
        const tickInterval = GAME_CONSTANTS.OFFLINE_TICK_INTERVAL;
        const numTicks = Math.floor(timeInSeconds / tickInterval);
        const remainingTime = timeInSeconds % tickInterval;
        
        for (let i = 0; i < numTicks; i++) {
            this._processOfflineTick(tickInterval);
        }
        
        if (remainingTime > 0) {
            this._processOfflineTick(remainingTime);
        }
        
        console.log(`✅ Processed ${timeInSeconds.toFixed(0)}s of offline time (${numTicks} ticks)`);
    }
    
    _processOfflineTick(deltaTime) {
        // Add resources
        for (const [resourceId, resource] of Object.entries(this.resources)) {
            if (resource.perSecond > 0) {
                this.addResource(resourceId, resource.perSecond * deltaTime);
            }
        }
        
        // Check unlocks
        const hadUnlocks = this._checkOfflineUnlocks();
        if (hadUnlocks) {
            this.recalculateProduction();
        }
        
        // Check achievements
        const newAchievements = this.checkAchievements();
        if (newAchievements.length > 0) {
            this.recalculateProduction();
        }
    }
    
    _checkOfflineUnlocks() {
        let hadUnlocks = false;
        
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
            deployment: this.deployment, // Changed from prestige
            currentTraining: this.currentTraining,
            trainingProgress: this.trainingProgress,
            training: this.training,
            stats: this.stats,
            legacySettings: this.legacySettings,
            comboSystem: this.comboSystem.save(),
            trainingQueue: this.trainingQueue.save(),
            bulkPurchase: this.bulkPurchase.save()
        };
        
        this.lastSaveTime = Date.now();
        return saveData;
    }
    
    load(saveData) {
        try {
            if (saveData.version && saveData.version !== GAME_CONSTANTS.SAVE_VERSION) {
                console.warn(`Loading save from version ${saveData.version}, current version is ${GAME_CONSTANTS.SAVE_VERSION}`);
            }
            
            this.resources = saveData.resources;
            this.buildings = saveData.buildings;
            this.models = saveData.models;
            this.research = saveData.research;
            this.achievements = saveData.achievements;
            
            // Handle migration from prestige to deployment
            if (saveData.deployment) {
                this.deployment = saveData.deployment;
            } else if (saveData.prestige) {
                // Migrate old prestige data
                this.deployment = initializeDeployment();
                this.deployment.tokens = saveData.prestige.tokens || 0;
                this.deployment.lifetimeTokens = saveData.prestige.lifetimeTokens || 0;
                this.deployment.deployments = saveData.prestige.deployments || 0;
                console.log('✅ Migrated prestige data to deployment system');
            } else {
                this.deployment = initializeDeployment();
            }
            
            this.currentTraining = saveData.currentTraining;
            this.trainingProgress = saveData.trainingProgress;
            this.training = saveData.training || null;
            this.stats = saveData.stats;
            this.legacySettings = saveData.legacySettings || saveData.settings || this.legacySettings;
            
            if (saveData.achievementBonuses) {
                this.achievementBonuses = {
                    ...this.achievementBonuses,
                    ...saveData.achievementBonuses
                };
            }
            
            if (saveData.comboSystem) {
                this.comboSystem.load(saveData.comboSystem);
            }
            
            if (saveData.trainingQueue) {
                this.trainingQueue.load(saveData.trainingQueue);
            }
            
            if (saveData.bulkPurchase) {
                this.bulkPurchase.load(saveData.bulkPurchase);
            }
            
            if (!this.stats.lastPlaytimeUpdate) {
                this.stats.lastPlaytimeUpdate = Date.now();
            }
            
            if (this.stats.manualClicks === undefined) {
                this.stats.manualClicks = 0;
            }
            
            // Initialize achievement check timer
            this.timeSinceAchievementCheck = 0;
            
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
    
    export() {
        try {
            const saveData = this.save();
            const jsonString = JSON.stringify(saveData);
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