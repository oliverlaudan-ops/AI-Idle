// Achievement Definitions

import { SmartAchievementPredictor } from '../ai/smart-achievement-predictor.js';

// Global predictor instance
let smartPredictor = null;
let gameStateRef = null;

export const achievements = {
    // Training Milestones
    firststeps: {
        id: 'firststeps',
        name: 'First Steps',
        category: 'training',
        icon: '👶',
        description: 'Train your first model',
        requirement: { type: 'modelsTrained', value: 1 },
        reward: 'Unlock manual data generation',
        unlocked: false
    },
    datahoarder: {
        id: 'datahoarder',
        name: 'Data Hoarder',
        category: 'training',
        icon: '💾',
        description: 'Accumulate 1 million training data',
        requirement: { type: 'totalDataGenerated', value: 1000000 },
        reward: '+5% data generation',
        unlocked: false
    },
    accuracyking: {
        id: 'accuracyking',
        name: 'Accuracy King',
        category: 'training',
        icon: '👑',
        description: 'Reach 99.9% accuracy on any model',
        requirement: { type: 'maxAccuracy', value: 99.9 },
        reward: '+10% all production',
        unlocked: false
    },
    generalist: {
        id: 'generalist',
        name: 'Generalist AI',
        category: 'training',
        icon: '🎓',
        description: 'Complete 10 different training tasks',
        requirement: { type: 'uniqueModels', value: 10 },
        reward: 'Unlock AutoML features',
        unlocked: false
    },

    // Research Breakthroughs
    optimizationexpert: {
        id: 'optimizationexpert',
        name: 'Optimization Expert',
        category: 'research',
        icon: '🔬',
        description: 'Unlock all optimization algorithms',
        requirement: { type: 'researchCategory', category: 'optimizers' },
        reward: '+15% training speed',
        unlocked: false
    },
    activationmaster: {
        id: 'activationmaster',
        name: 'Activation Master',
        category: 'research',
        icon: '⚡',
        description: 'Research all activation functions',
        requirement: { type: 'researchCategory', category: 'activations' },
        reward: '+20% model performance',
        unlocked: false
    },
    transformerrevolution: {
        id: 'transformerrevolution',
        name: 'Transformer Revolution',
        category: 'research',
        icon: '🚀',
        description: 'Unlock the transformer architecture',
        requirement: { type: 'specificResearch', research: 'transformer' },
        reward: '+50% research point generation',
        unlocked: false
    },
    completionist: {
        id: 'completionist',
        name: 'Research Completionist',
        category: 'research',
        icon: '📚',
        description: 'Complete the entire research tree',
        requirement: { type: 'allResearch', value: true },
        reward: 'Permanent 2x multiplier to all resources',
        unlocked: false
    },

    // Infrastructure
    gpuenthusiast: {
        id: 'gpuenthusiast',
        name: 'GPU Enthusiast',
        category: 'infrastructure',
        icon: '🎮',
        description: 'Build 10 GPU clusters',
        requirement: { type: 'buildingCount', building: 'gpucluster', value: 10 },
        reward: '+10% compute power',
        unlocked: false
    },
    supercomputer: {
        id: 'supercomputer',
        name: 'Supercomputer',
        category: 'infrastructure',
        icon: '🖥️',
        description: 'Reach 10,000 TFLOPS',
        requirement: { type: 'totalCompute', value: 10000 },
        reward: 'Unlock quantum research',
        unlocked: false
    },
    quantumleap: {
        id: 'quantumleap',
        name: 'Quantum Leap',
        category: 'infrastructure',
        icon: '⚛️',
        description: 'Build your first quantum processor',
        requirement: { type: 'buildingCount', building: 'quantumprocessor', value: 1 },
        reward: '+25% all resource generation',
        unlocked: false
    },
    datacenter: {
        id: 'datacenter',
        name: 'Data Center Tycoon',
        category: 'infrastructure',
        icon: '🏢',
        description: 'Own 100 total buildings',
        requirement: { type: 'totalBuildings', value: 100 },
        reward: 'Buildings cost 10% less',
        unlocked: false
    },

    // Prestige/Deployment
    firstdeployment: {
        id: 'firstdeployment',
        name: 'First Deployment',
        category: 'training',
        icon: '🚀',
        description: 'Deploy your first model',
        requirement: { type: 'deploymentsCount', value: 1 },
        reward: '+5% deployment token gain',
        unlocked: false
    },
    veteranresearcher: {
        id: 'veteranresearcher',
        name: 'Veteran Researcher',
        category: 'training',
        icon: '🎖️',
        description: 'Deploy 5 models',
        requirement: { type: 'deploymentsCount', value: 5 },
        reward: '+10% permanent accuracy gain',
        unlocked: false
    },
    agiresearcher: {
        id: 'agiresearcher',
        name: 'AGI Researcher',
        category: 'training',
        icon: '🧠',
        description: 'Reach 1 billion total accuracy',
        requirement: { type: 'totalAccuracy', value: 1000000000 },
        reward: 'Unlock experimental AGI projects',
        unlocked: false
    }
};

/**
 * Initialize Smart Predictor
 */
export async function initializeSmartPredictor(gameState) {
    gameStateRef = gameState;
    
    try {
        smartPredictor = new SmartAchievementPredictor(gameState);
        await smartPredictor.init();
        
        console.log('[Achievements] Smart Predictor initialized');
        console.log('[Achievements] Training history:', smartPredictor.getModelInfo().trainingDataSize, 'unlocks');
        
        return smartPredictor;
    } catch (error) {
        console.error('[Achievements] Failed to initialize Smart Predictor:', error);
        return null;
    }
}

/**
 * Get Smart Predictor instance
 */
export function getSmartPredictor() {
    return smartPredictor;
}

/**
 * Check if achievement is unlocked
 */
export function checkAchievement(achievement, gameStats) {
    const req = achievement.requirement;
    
    switch (req.type) {
        case 'modelsTrained':
            return gameStats.modelsTrained >= req.value;
        case 'totalDataGenerated':
            return gameStats.totalDataGenerated >= req.value;
        case 'maxAccuracy':
            return gameStats.maxAccuracy >= req.value;
        case 'uniqueModels':
            return gameStats.uniqueModelsTrained >= req.value;
        case 'totalCompute':
            return gameStats.totalCompute >= req.value;
        case 'buildingCount':
            return gameStats.buildings[req.building] >= req.value;
        case 'totalBuildings':
            return gameStats.totalBuildings >= req.value;
        case 'deploymentsCount':
            return gameStats.deployments >= req.value;
        case 'totalAccuracy':
            return gameStats.totalAccuracy >= req.value;
        case 'specificResearch':
            return gameStats.completedResearch.includes(req.research);
        case 'researchCategory':
            return gameStats.researchByCategory[req.category] === gameStats.totalByCategory[req.category];
        case 'allResearch':
            return gameStats.completedResearch.length === gameStats.totalResearch;
        default:
            return false;
    }
}

/**
 * Unlock achievement and record for ML training
 */
export async function unlockAchievement(achievementId, gameState) {
    const achievement = achievements[achievementId];
    
    if (!achievement || achievement.unlocked) {
        return false;
    }
    
    // Mark as unlocked
    achievement.unlocked = true;
    
    console.log(`[Achievements] 🎉 Unlocked: ${achievement.name}`);
    
    // Record unlock for ML training
    if (smartPredictor) {
        smartPredictor.recordUnlock(achievementId);
        
        // Auto-train if we have enough data
        const modelInfo = smartPredictor.getModelInfo();
        if (modelInfo.canTrain && !modelInfo.isTraining) {
            // Train in background (don't wait)
            smartPredictor.train().then(success => {
                if (success) {
                    console.log('[Achievements] ML model retrained with new unlock');
                }
            });
        }
    }
    
    // Trigger UI notification
    if (typeof window !== 'undefined' && window.gameUI) {
        window.gameUI.showAchievementNotification(achievement);
    }
    
    return true;
}

/**
 * Check all achievements and unlock any that are ready
 */
export async function checkAllAchievements(gameStats) {
    const newlyUnlocked = [];
    
    for (const [id, achievement] of Object.entries(achievements)) {
        if (!achievement.unlocked && checkAchievement(achievement, gameStats)) {
            const unlocked = await unlockAchievement(id, gameStateRef);
            if (unlocked) {
                newlyUnlocked.push(achievement);
            }
        }
    }
    
    return newlyUnlocked;
}

/**
 * Initialize achievements
 */
export function initializeAchievements() {
    return JSON.parse(JSON.stringify(achievements));
}

/**
 * Get achievement statistics
 */
export function getAchievementStats() {
    const total = Object.keys(achievements).length;
    const unlocked = Object.values(achievements).filter(a => a.unlocked).length;
    const percentage = (unlocked / total * 100).toFixed(1);
    
    return {
        total,
        unlocked,
        remaining: total - unlocked,
        percentage
    };
}
