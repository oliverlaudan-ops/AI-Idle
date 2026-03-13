/**
 * Achievement Definitions
 * All achievement data and requirements
 */


// Global predictor instance

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
    },
    
    // ====== v1.0.0 Additional Achievements ======
    
    // Training Milestones
    traine100: {
        id: 'train100',
        name: 'Century Trainer',
        category: 'training',
        icon: '💯',
        description: 'Train 100 total models',
        requirement: { type: 'modelsTrained', value: 100 },
        reward: '+10% training speed',
        unlocked: false
    },
    traine500: {
        id: 'train500',
        name: 'Half Thousand',
        category: 'training',
        icon: '🏋️',
        description: 'Train 500 total models',
        requirement: { type: 'modelsTrained', value: 500 },
        reward: '+15% training speed',
        unlocked: false
    },
    traine1000: {
        id: 'train1000',
        name: 'Grandmaster Trainer',
        category: 'training',
        icon: '🏆',
        description: 'Train 1,000 total models',
        requirement: { type: 'modelsTrained', value: 1000 },
        reward: '+25% training speed',
        unlocked: false
    },
    firstexpert: {
        id: 'firstexpert',
        name: 'Expert Trainer',
        category: 'training',
        icon: '🎖️',
        description: 'Train your first Expert model',
        requirement: { type: 'uniqueExpertModels', value: 1 },
        reward: 'Unlock all Expert models',
        unlocked: false
    },
    firstspecialized: {
        id: 'firstspecialized',
        name: 'Specialist',
        category: 'training',
        icon: '🔧',
        description: 'Train your first Specialized model',
        requirement: { type: 'uniqueSpecializedModels', value: 1 },
        reward: 'Unlock Specialized category',
        unlocked: false
    },
    
    // Research Milestones
    research25: {
        id: 'research25',
        name: 'Research Scholar',
        category: 'research',
        icon: '📚',
        description: 'Complete 25 research items',
        requirement: { type: 'researchCompleted', value: 25 },
        reward: '+10% research speed',
        unlocked: false
    },
    research50: {
        id: 'research50',
        name: 'Research Master',
        category: 'research',
        icon: '🎓',
        description: 'Complete 50 research items',
        requirement: { type: 'researchCompleted', value: 50 },
        reward: '+20% research speed',
        unlocked: false
    },
    alloptimizers: {
        id: 'alloptimizers',
        name: 'Optimizer Master',
        category: 'research',
        icon: '⚙️',
        description: 'Research all optimizers',
        requirement: { type: 'researchCategory', category: 'optimizers' },
        reward: '+15% all production',
        unlocked: false
    },
    allarchitectures: {
        id: 'allarchitectures',
        name: 'Architecture Expert',
        category: 'research',
        icon: '🏗️',
        description: 'Research all architectures',
        requirement: { type: 'researchCategory', category: 'architectures' },
        reward: '+20% model performance',
        unlocked: false
    },
    
    // Building Milestones
    buildings5: {
        id: 'buildings5',
        name: 'Growing Infrastructure',
        category: 'buildings',
        icon: '🏭',
        description: 'Own 5 different building types',
        requirement: { type: 'uniqueBuildings', value: 5 },
        reward: '+5% all production',
        unlocked: false
    },
    buildings10: {
        id: 'buildings10',
        name: 'Infrastructure Hub',
        category: 'buildings',
        icon: '🏢',
        description: 'Own 10 different building types',
        requirement: { type: 'uniqueBuildings', value: 10 },
        reward: '+10% all production',
        unlocked: false
    },
    buildingsall: {
        id: 'buildingsall',
        name: 'Full Infrastructure',
        category: 'buildings',
        icon: '🌆',
        description: 'Own all building types',
        requirement: { type: 'uniqueBuildings', value: 18 },
        reward: '+25% all production',
        unlocked: false
    },
    totalbuildings100: {
        id: 'totalbuildings100',
        name: 'Construction Tycoon',
        category: 'buildings',
        icon: '👷',
        description: 'Own 100 total buildings',
        requirement: { type: 'totalBuildings', value: 100 },
        reward: '+10% building efficiency',
        unlocked: false
    },
    totalbuildings500: {
        id: 'totalbuildings500',
        name: 'Industrial Empire',
        category: 'buildings',
        icon: '🏙️',
        description: 'Own 500 total buildings',
        requirement: { type: 'totalBuildings', value: 500 },
        reward: '+20% building efficiency',
        unlocked: false
    },
    
    // Deployment Milestones
    deploy10: {
        id: 'deploy10',
        name: 'Deployment Rookie',
        category: 'deployment',
        icon: '🚀',
        description: 'Complete 10 deployments',
        requirement: { type: 'deployments', value: 10 },
        reward: '+5% token generation',
        unlocked: false
    },
    deploy50: {
        id: 'deploy50',
        name: 'Deployment Pro',
        category: 'deployment',
        icon: '🛸',
        description: 'Complete 50 deployments',
        requirement: { type: 'deployments', value: 50 },
        reward: '+10% token generation',
        unlocked: false
    },
    deploy100: {
        id: 'deploy100',
        name: 'Deployment Master',
        category: 'deployment',
        icon: '🌟',
        description: 'Complete 100 deployments',
        requirement: { type: 'deployments', value: 100 },
        reward: '+20% token generation',
        unlocked: false
    },
    deployallstrategies: {
        id: 'deployallstrategies',
        name: 'Strategy Expert',
        category: 'deployment',
        icon: '♟️',
        description: 'Use all deployment strategies',
        requirement: { type: 'uniqueStrategies', value: 3 },
        reward: '+15% token generation',
        unlocked: false
    },
    
    // Time-based Milestones
    play1hour: {
        id: 'play1hour',
        name: 'Dedicated Player',
        category: 'time',
        icon: '⏰',
        description: 'Play for 1 hour total',
        requirement: { type: 'playTime', value: 3600 },
        reward: 'Unlock Statistics tab',
        unlocked: false
    },
    play10hours: {
        id: 'play10hours',
        name: 'Committed Player',
        category: 'time',
        icon: '🕐',
        description: 'Play for 10 hours total',
        requirement: { type: 'playTime', value: 36000 },
        reward: '+10% all production',
        unlocked: false
    },
    play100hours: {
        id: 'play100hours',
        name: 'AI Veteran',
        category: 'time',
        icon: '🕓',
        description: 'Play for 100 hours total',
        requirement: { type: 'playTime', value: 360000 },
        reward: '+25% all production',
        unlocked: false
    },
    day7: {
        id: 'day7',
        name: 'Week Survivor',
        category: 'time',
        icon: '📅',
        description: 'Reach day 7',
        requirement: { type: 'gameDays', value: 7 },
        reward: '+5% all production',
        unlocked: false
    },
    day30: {
        id: 'day30',
        name: 'Monthly Player',
        category: 'time',
        icon: '🗓️',
        description: 'Reach day 30',
        requirement: { type: 'gameDays', value: 30 },
        reward: '+10% all production',
        unlocked: false
    },
    day100: {
        id: 'day100',
        name: 'Century Mark',
        category: 'time',
        icon: '💫',
        description: 'Reach day 100',
        requirement: { type: 'gameDays', value: 100 },
        reward: '+25% all production',
        unlocked: false
    },
    
    // Resource Milestones
    coins1m: {
        id: 'coins1m',
        name: 'Millionaire',
        category: 'resources',
        icon: '💰',
        description: 'Accumulate 1 million coins',
        requirement: { type: 'maxCoins', value: 1000000 },
        reward: 'Unlock premium buildings',
        unlocked: false
    },
    coins1b: {
        id: 'coins1b',
        name: 'Billionaire',
        category: 'resources',
        icon: '💎',
        description: 'Accumulate 1 billion coins',
        requirement: { type: 'maxCoins', value: 1000000000 },
        reward: '+50% coin generation',
        unlocked: false
    },
    tokens100: {
        id: 'tokens100',
        name: 'Token Collector',
        category: 'resources',
        icon: '🪙',
        description: 'Earn 100 deployment tokens',
        requirement: { type: 'totalTokens', value: 100 },
        reward: 'Unlock token shop',
        unlocked: false
    },
    tokens1000: {
        id: 'tokens1000',
        name: 'Token Hoarder',
        category: 'resources',
        icon: '💵',
        description: 'Earn 1,000 deployment tokens',
        requirement: { type: 'totalTokens', value: 1000 },
        reward: '+25% token generation',
        unlocked: false
    },
    
    // Special Achievements
    firstrl: {
        id: 'firstrl',
        name: 'RL Pioneer',
        category: 'special',
        icon: '🤖',
        description: 'Train your first RL Agent',
        requirement: { type: 'specificModel', model: 'rlagent' },
        reward: '+15% RL training speed',
        unlocked: false
    },
    firstllm: {
        id: 'firstllm',
        name: 'LLM Pioneer',
        category: 'special',
        icon: '📝',
        description: 'Train your first LLM',
        requirement: { type: 'specificModel', model: 'llm' },
        reward: '+20% LLM training speed',
        unlocked: false
    },
    firstdeploy: {
        id: 'firstdeploy',
        name: 'First Deployment',
        category: 'special',
        icon: '�🚀',
        description: 'Complete your first deployment',
        requirement: { type: 'deployments', value: 1 },
        reward: 'Unlock deployment strategies',
        unlocked: false
    },
    maxlevel: {
        id: 'maxlevel',
        name: 'Max Level Master',
        category: 'special',
        icon: '⬆️',
        description: 'Reach level 10 on any model',
        requirement: { type: 'maxModelLevel', value: 10 },
        reward: '+20% all training',
        unlocked: false
    },
    allcategories: {
        id: 'allcategories',
        name: 'Full Unlock',
        category: 'special',
        icon: '🔓',
        description: 'Unlock all model categories',
        requirement: { type: 'unlockedCategories', value: 6 },
        reward: 'Unlock secret category',
        unlocked: false
    },
    cloudowner: {
        id: 'cloudowner',
        name: 'Cloud Owner',
        category: 'special',
        icon: '☁️',
        description: 'Own at least one of each cloud provider',
        requirement: { type: 'cloudProviders', value: 3 },
        reward: '+30% premium production',
        unlocked: false
    },
    perfectdeploy: {
        id: 'perfectdeploy',
        name: 'Perfect Deployment',
        category: 'special',
        icon: '💯',
        description: 'Deploy with 100% accuracy',
        requirement: { type: 'deploymentAccuracy', value: 100 },
        reward: '+25% token generation',
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
 */
