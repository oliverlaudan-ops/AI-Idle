// Building (Infrastructure) Definitions

export const buildings = {
    // Tier 1: Foundation
    datacollector: {
        id: 'datacollector',
        name: 'Data Collector',
        tier: 1,
        icon: '🗄️',
        description: 'Automated systems that gather and label training data',
        baseCost: { data: 10 },
        costMultiplier: 1.15,
        production: { data: 1 },
        unlocked: true,
        count: 0
    },
    cpucore: {
        id: 'cpucore',
        name: 'CPU Core',
        tier: 1,
        icon: '🔲',
        description: 'Basic compute units for model training',
        baseCost: { data: 50 },
        costMultiplier: 1.15,
        production: { compute: 0.1 },
        unlocked: true,
        count: 0
    },
    storageserver: {
        id: 'storageserver',
        name: 'Storage Server',
        tier: 1,
        icon: '💾',
        description: 'Expands your data storage capacity',
        baseCost: { data: 100 },
        costMultiplier: 1.15,
        production: {}, // Special: increases data cap
        bonus: { dataCapacity: 1000 },
        unlocked: true,
        count: 0
    },
    
    // Tier 2: Acceleration
    gpucluster: {
        id: 'gpucluster',
        name: 'GPU Cluster',
        tier: 2,
        icon: '🎮',
        description: 'Graphics Processing Units optimized for parallel training',
        baseCost: { data: 1000, compute: 10 },
        costMultiplier: 1.18,
        production: { compute: 5 },
        unlocked: false,
        unlockRequirement: { compute: 5 },
        count: 0
    },
    datapipeline: {
        id: 'datapipeline',
        name: 'Data Pipeline',
        tier: 2,
        icon: '🔄',
        description: 'Automated ETL processes for continuous data flow',
        baseCost: { data: 5000 },
        costMultiplier: 1.18,
        production: { data: 10 },
        unlocked: false,
        unlockRequirement: { data: 500 },
        count: 0
    },
    coolingsystem: {
        id: 'coolingsystem',
        name: 'Cooling System',
        tier: 2,
        icon: '❄️',
        description: 'Advanced cooling increases efficiency of all infrastructure',
        baseCost: { data: 10000 },
        costMultiplier: 1.2,
        production: {},
        bonus: { globalProduction: 0.15 }, // +15% to all production
        unlocked: false,
        unlockRequirement: { compute: 50 },
        count: 0
    },
    
    // Tier 3: Advanced Infrastructure
    tpuarray: {
        id: 'tpuarray',
        name: 'TPU Array',
        tier: 3,
        icon: '🧮',
        description: 'Tensor Processing Units designed specifically for ML workloads',
        baseCost: { data: 100000, compute: 100 },
        costMultiplier: 1.22,
        production: { compute: 50 },
        unlocked: false,
        unlockRequirement: { compute: 100 },
        count: 0
    },
    distributedsystem: {
        id: 'distributedsystem',
        name: 'Distributed System',
        tier: 3,
        icon: '🌐',
        description: 'Parallel training across multiple nodes',
        baseCost: { data: 500000 },
        costMultiplier: 1.22,
        production: {},
        bonus: { trainingSpeed: 0.5 }, // +50% training speed
        unlocked: false,
        unlockRequirement: { accuracy: 1000 },
        count: 0
    },
    quantumprocessor: {
        id: 'quantumprocessor',
        name: 'Quantum Processor',
        tier: 3,
        icon: '⚛️',
        description: 'Experimental quantum computing for breakthrough performance',
        baseCost: { data: 10000000, compute: 1000 },
        costMultiplier: 1.25,
        production: { compute: 500 },
        unlocked: false,
        unlockRequirement: { accuracy: 10000, research: 100 },
        count: 0
    }
};

// Calculate current cost for a building
export function getBuildingCost(building, count = null) {
    const currentCount = count !== null ? count : building.count;
    const cost = {};
    
    for (const [resource, baseAmount] of Object.entries(building.baseCost)) {
        cost[resource] = Math.floor(baseAmount * Math.pow(building.costMultiplier, currentCount));
    }
    
    return cost;
}

// Initialize buildings
export function initializeBuildings() {
    return JSON.parse(JSON.stringify(buildings));
}