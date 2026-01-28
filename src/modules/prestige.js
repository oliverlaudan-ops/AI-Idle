// Prestige (Deployment) System

export const prestigeUpgrades = {
    pretrainedweights: {
        id: 'pretrainedweights',
        name: 'Pre-trained Weights',
        icon: '📦',
        description: 'Start each run with 10% of your previous training data',
        cost: 10,
        maxLevel: 5,
        level: 0,
        effect: { type: 'startingData', value: 0.1 }
    },
    transferlearning: {
        id: 'transferlearning',
        name: 'Transfer Learning',
        icon: '🔄',
        description: 'Permanent +10% training speed per level',
        cost: 15,
        costIncrease: 1.5,
        maxLevel: 10,
        level: 0,
        effect: { type: 'trainingSpeed', value: 0.1 }
    },
    automl: {
        id: 'automl',
        name: 'AutoML Systems',
        icon: '🤖',
        description: 'Automatically purchase the cheapest building when you can afford it',
        cost: 25,
        maxLevel: 1,
        level: 0,
        effect: { type: 'automation', value: 'buildings' }
    },
    neuralarchitecturesearch: {
        id: 'neuralarchitecturesearch',
        name: 'Neural Architecture Search',
        icon: '🔍',
        description: 'Automatically find and train optimal models',
        cost: 50,
        maxLevel: 1,
        level: 0,
        effect: { type: 'automation', value: 'training' },
        requirement: { upgrade: 'automl', level: 1 }
    },
    federatedlearning: {
        id: 'federatedlearning',
        name: 'Federated Learning',
        icon: '🌐',
        description: 'Double offline progression speed',
        cost: 30,
        maxLevel: 3,
        level: 0,
        effect: { type: 'offlineSpeed', value: 2.0 }
    },
    knowledgedistillation: {
        id: 'knowledgedistillation',
        name: 'Knowledge Distillation',
        icon: '🧪',
        description: 'Gain +5% more deployment tokens per level',
        cost: 20,
        costIncrease: 1.3,
        maxLevel: 10,
        level: 0,
        effect: { type: 'tokenGain', value: 0.05 }
    },
    ensemblelearning: {
        id: 'ensemblelearning',
        name: 'Ensemble Learning',
        icon: '🎯',
        description: 'All buildings produce +15% more per level',
        cost: 40,
        costIncrease: 2.0,
        maxLevel: 5,
        level: 0,
        effect: { type: 'globalProduction', value: 0.15 }
    },
    quantization: {
        id: 'quantization',
        name: 'Model Quantization',
        icon: '⚡',
        description: 'Buildings cost 10% less per level',
        cost: 35,
        costIncrease: 1.8,
        maxLevel: 5,
        level: 0,
        effect: { type: 'buildingCost', value: -0.1 }
    }
};

// Calculate deployment tokens gained
export function calculateDeploymentTokens(totalAccuracy, deployments) {
    // Base formula: tokens = sqrt(totalAccuracy / 10000) * (1 + deployments * 0.1)
    const baseTokens = Math.floor(Math.sqrt(totalAccuracy / 10000));
    const multiplier = 1 + (deployments * 0.1);
    return Math.floor(baseTokens * multiplier);
}

// Calculate cost for next level of prestige upgrade
export function getPrestigeCost(upgrade) {
    if (upgrade.level >= upgrade.maxLevel) return Infinity;
    
    if (upgrade.costIncrease) {
        return Math.floor(upgrade.cost * Math.pow(upgrade.costIncrease, upgrade.level));
    }
    
    return upgrade.cost;
}

// Check if prestige upgrade can be unlocked
export function canUnlockPrestigeUpgrade(upgrade, purchasedUpgrades) {
    if (!upgrade.requirement) return true;
    
    const reqUpgrade = purchasedUpgrades[upgrade.requirement.upgrade];
    return reqUpgrade && reqUpgrade.level >= upgrade.requirement.level;
}

// Initialize prestige
export function initializePrestige() {
    return {
        tokens: 0,
        lifetimeTokens: 0,
        deployments: 0,
        upgrades: JSON.parse(JSON.stringify(prestigeUpgrades))
    };
}