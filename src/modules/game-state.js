// Central Game State Management - REFACTORED
// Now delegates to specialized core modules

import { initializeResources } from './resources.js';
import { initializeBuildings, getBuildingCost } from './buildings.js';
import { initializeResearch } from './research.js';
import { initializeDeployment, getDeploymentInfo } from './deployment.js';
import { ComboSystem } from './combo-system.js';
import { BulkPurchase } from './bulk-purchase.js';
import { Settings } from './settings.js';

// Achievement system
import { initializeAchievements, checkAndUnlockAchievements } from '../systems/achievements/index.js';

// Training system
import { initializeModels, TrainingQueue } from '../systems/training/index.js';

// Core system imports
import { ResourceManager } from '../core/resource-manager.js';
import { recalculateProduction } from '../core/production-calculator.js';
import { saveGame, loadGame, exportSave, importSave } from '../core/save-system.js';
import { processOfflineProgress } from '../core/offline-progress.js';

// Game constants
const ACHIEVEMENT_CHECK_INTERVAL = 5.0; // Check achievements every 5 seconds

export class GameState {
    constructor() {
        this.resources = initializeResources();
        this.buildings = initializeBuildings();
        this.models = initializeModels();
        this.research = initializeResearch();
        this.achievements = initializeAchievements();
        this.deployment = initializeDeployment();
        
        // Core systems
        this.resourceManager = new ResourceManager(this);
        this.settings = new Settings();
        this.settings.load();
        
        // Game systems
        this.comboSystem = new ComboSystem();
        this.trainingQueue = new TrainingQueue(this);
        this.bulkPurchase = new BulkPurchase(this);
        
        // Training state
        this.currentTraining = null;
        this.trainingProgress = 0;
        this.training = null;
        
        // Performance tracking
        this.timeSinceAchievementCheck = 0;
        
        // Achievement bonuses
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
        
        // Multipliers for UI
        this.multipliers = {
            trainingSpeed: 1.0,
            global: 1.0
        };
        
        // Statistics
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
        
        // Legacy settings for backwards compatibility
        this.legacySettings = {
            autoSave: true,
            autoSaveInterval: 30000,
            offlineProgress: true
        };
        
        this.lastSaveTime = Date.now();
        this.newlyUnlockedAchievements = [];
    }
    
    // ========== Resource Management (delegated to ResourceManager) ==========
    
    addResource(resourceId, amount) {
        this.resourceManager.addResource(resourceId, amount);
    }
    
    canAfford(costs) {
        return this.resourceManager.canAfford(costs);
    }
    
    spendResources(costs) {
        return this.resourceManager.spendResources(costs);
    }
    
    // Manual collect with combo system
    manualCollect() {
        const multiplier = this.comboSystem.click();
        const baseAmount = 1;
        const amount = baseAmount * multiplier * this.achievementBonuses.manualCollection;
        
        this.addResource('data', amount);
        this.stats.manualClicks++;
        this.checkAchievements();
        
        return { amount, multiplier };
    }
    
    // ========== Building Management ==========
    
    purchaseBuilding(buildingId, amount = 1) {
        // Use bulk purchase system
        if (amount !== 1 || this.bulkPurchase.getMode() !== 1) {
            const result = this.bulkPurchase.purchase(buildingId, amount === 1 ? 'mode' : amount);
            if (result && result.success) {
                this.checkAchievements();
            }
            return result;
        }
        
        // Legacy single purchase
        const building = this.buildings[buildingId];
        if (!building || !building.unlocked) return false;
        
        let cost = getBuildingCost(building);
        
        // Apply cost reduction
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
        this.checkBuildingUnlocks();
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
    
    // ========== Production (delegated to ProductionCalculator) ==========
    
    recalculateProduction() {
        recalculateProduction(this);
    }
    
    getTrainingSpeedMultiplier() {
        return this.achievementBonuses.trainingSpeed;
    }
    
    // ========== Training Management ==========
    
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
        
        // Initialize training state
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
        this.checkAchievements();
        this.trainingQueue.onTrainingComplete();
    }
    
    // ========== Research Management ==========
    
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
        
        this.checkResearchUnlocks();
        this.recalculateProduction();
        this.checkAchievements();
        
        return true;
    }
    
    checkResearchUnlocks() {
        // Research unlocks
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
        
        // Model unlocks based on accuracy
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
    
    // ========== Achievement Management (delegated to Achievement System) ==========
    
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
    
    popNewlyUnlockedAchievements() {
        const achievements = this.newlyUnlockedAchievements;
        this.newlyUnlockedAchievements = [];
        return achievements;
    }
    
    // ========== Deployment Management ==========
    
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
        
        const tokensEarned = deployInfo.tokensOnDeploy;
        
        // Record deployment
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
        
        // Reset game state
        this.resources = initializeResources();
        this.buildings = initializeBuildings();
        this.models = initializeModels();
        this.research = initializeResearch();
        
        this.currentTraining = null;
        this.trainingProgress = 0;
        this.training = null;
        
        // Reset stats
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
        
        // Reset systems
        this.comboSystem = new ComboSystem();
        this.trainingQueue = new TrainingQueue(this);
        
        this.recalculateProduction();
        
        console.log(`🚀 Deployment #${this.deployment.deployments} complete! Earned ${tokensEarned} tokens.`);
        
        return {
            success: true,
            tokensEarned: tokensEarned,
            newTotalTokens: this.deployment.tokens,
            deploymentRecord: deploymentRecord
        };
    }
    
    // ========== Game Loop ==========
    
    update(deltaTime) {
        // Update playtime
        const now = Date.now();
        const playtimeDelta = now - this.stats.lastPlaytimeUpdate;
        this.stats.totalPlaytime += playtimeDelta;
        this.stats.lastPlaytimeUpdate = now;
        
        // Update systems
        this.comboSystem.update(deltaTime);
        
        // Add resources from production
        for (const [resourceId, resource] of Object.entries(this.resources)) {
            if (resource.perSecond > 0) {
                this.addResource(resourceId, resource.perSecond * deltaTime);
            }
        }
        
        // Update training
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
        
        // Periodic achievement checks (performance optimization)
        this.timeSinceAchievementCheck += deltaTime;
        if (this.timeSinceAchievementCheck >= ACHIEVEMENT_CHECK_INTERVAL) {
            this.checkAchievements();
            this.timeSinceAchievementCheck = 0;
        }
        
        // Update stats
        this.stats.totalCompute = this.resources.compute.amount;
    }
    
    // ========== Offline Progress (delegated to OfflineProgress) ==========
    
    processOfflineProgress(offlineTime) {
        processOfflineProgress(this, offlineTime);
    }
    
    // ========== Save/Load (delegated to SaveSystem) ==========
    
    save() {
        return saveGame(this);
    }
    
    load(saveData) {
        // Preserve the resource manager instance
        const resourceManager = this.resourceManager;
        const result = loadGame(this);
        this.resourceManager = resourceManager;
        return result;
    }
    
    reset() {
        Object.assign(this, new GameState());
    }
    
    export() {
        return exportSave(this);
    }
    
    import(saveString) {
        const resourceManager = this.resourceManager;
        const result = importSave(this, saveString);
        this.resourceManager = resourceManager;
        return result;
    }
}
