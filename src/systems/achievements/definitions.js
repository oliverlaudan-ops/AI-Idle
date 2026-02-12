/**
 * Achievement Definitions
 * All achievement data and requirements
 */

import { SmartAchievementPredictor } from '../../ai/smart-achievement-predictor.js';

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
 * Initialize achievements (returns deep copy)
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
