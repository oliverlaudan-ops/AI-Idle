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
        baseCost: { data: 25 },
        costMultiplier: 1.15,
        production: { compute: 0.2 },
        unlocked: true,
        count: 0
    },
    storageserver: {
        id: 'storageserver',
        name: 'Storage Server',
        tier: 1,
        icon: '💾',
        description: 'Stores and indexes datasets for faster access. Each server provides +0.5 data/s',
        baseCost: { data: 75 },
        costMultiplier: 1.15,
        production: { data: 0.5 },
        unlocked: true,
        count: 0
    },
    
    // Tier 2: Acceleration
    gpucluster: {
        id: 'gpucluster',
        name: 'GPU Cluster',
        tier: 2,
        icon: '🎮',
        description: 'Graphics Processing Units optimized for parallel training. Each cluster provides +3 compute/s',
        baseCost: { data: 500, compute: 5 },
        costMultiplier: 1.18,
        production: { compute: 3 },
        unlocked: false,
        unlockRequirement: { compute: 2 },
        count: 0
    },
    datapipeline: {
        id: 'datapipeline',
        name: 'Data Pipeline',
        tier: 2,
        icon: '🔄',
        description: 'Automated ETL processes for continuous data flow. Each pipeline provides +15 data/s',
        baseCost: { data: 2500 },
        costMultiplier: 1.18,
        production: { data: 15 },
        unlocked: false,
        unlockRequirement: { data: 300 },
        count: 0
    },
    coolingsystem: {
        id: 'coolingsystem',
        name: 'Cooling System',
        tier: 2,
        icon: '❄️',
        description: 'Advanced cooling increases efficiency of ALL infrastructure by +15%',
        baseCost: { data: 5000, compute: 15 },
        costMultiplier: 1.2,
        production: {},
        bonus: { globalProduction: 0.15 }, // +15% to all production
        unlocked: false,
        unlockRequirement: { compute: 10 },
        count: 0
    },
    
    // Tier 3: Advanced Infrastructure
    tpuarray: {
        id: 'tpuarray',
        name: 'TPU Array',
        tier: 3,
        icon: '🧮',
        description: 'Tensor Processing Units designed for ML workloads. Each array provides +30 compute/s',
        baseCost: { data: 50000, compute: 50 },
        costMultiplier: 1.22,
        production: { compute: 30 },
        unlocked: false,
        unlockRequirement: { compute: 50 },
        count: 0
    },
    distributedsystem: {
        id: 'distributedsystem',
        name: 'Distributed System',
        tier: 3,
        icon: '🌐',
        description: 'Parallel training across multiple nodes. Each system provides +100 data/s',
        baseCost: { data: 250000 },
        costMultiplier: 1.22,
        production: { data: 100 },
        unlocked: false,
        unlockRequirement: { accuracy: 500 },
        count: 0
    },
    quantumprocessor: {
        id: 'quantumprocessor',
        name: 'Quantum Processor',
        tier: 3,
        icon: '⚛️',
        description: 'Experimental quantum computing for breakthrough performance. Each processor provides +300 compute/s',
        baseCost: { data: 5000000, compute: 500 },
        costMultiplier: 1.25,
        production: { compute: 300 },
        unlocked: false,
        unlockRequirement: { accuracy: 5000, research: 50 },
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