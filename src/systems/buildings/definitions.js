/**
 * Building (Infrastructure) Definitions
 * All building data and properties
 */

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
        baseCost: { data: 60 },
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
        baseCost: { data: 400, compute: 5 },
        costMultiplier: 1.18,
        production: { compute: 3 },
        unlocked: false,
        unlockRequirement: { compute: 1.5 },
        count: 0
    },
    datapipeline: {
        id: 'datapipeline',
        name: 'Data Pipeline',
        tier: 2,
        icon: '🔄',
        description: 'Automated ETL processes for continuous data flow. Each pipeline provides +15 data/s',
        baseCost: { data: 2000 },
        costMultiplier: 1.18,
        production: { data: 15 },
        unlocked: false,
        unlockRequirement: { data: 250 },
        count: 0
    },
    coolingsystem: {
        id: 'coolingsystem',
        name: 'Cooling System',
        tier: 2,
        icon: '❄️',
        description: 'Advanced cooling increases efficiency of ALL infrastructure by +15%',
        baseCost: { data: 4000, compute: 12 },
        costMultiplier: 1.2,
        production: {},
        bonus: { globalProduction: 0.15 },
        unlocked: false,
        unlockRequirement: { compute: 8 },
        count: 0
    },
    
    // Tier 3: Advanced Infrastructure
    tpuarray: {
        id: 'tpuarray',
        name: 'TPU Array',
        tier: 3,
        icon: '🧮',
        description: 'Tensor Processing Units designed for ML workloads. Each array provides +30 compute/s',
        baseCost: { data: 40000, compute: 40 },
        costMultiplier: 1.22,
        production: { compute: 30 },
        unlocked: false,
        unlockRequirement: { compute: 40 },
        count: 0
    },
    distributedsystem: {
        id: 'distributedsystem',
        name: 'Distributed System',
        tier: 3,
        icon: '🌐',
        description: 'Parallel training across multiple nodes. Each system provides +100 data/s',
        baseCost: { data: 200000 },
        costMultiplier: 1.22,
        production: { data: 100 },
        unlocked: false,
        unlockRequirement: { accuracy: 400 },
        count: 0
    },
    quantumprocessor: {
        id: 'quantumprocessor',
        name: 'Quantum Processor',
        tier: 3,
        icon: '⚛️',
        description: 'Experimental quantum computing for breakthrough performance. Each processor provides +300 compute/s',
        baseCost: { data: 3000000, compute: 400 },
        costMultiplier: 1.25,
        production: { compute: 300 },
        unlocked: false,
        unlockRequirement: { accuracy: 4000, research: 40 },
        count: 0
    },
    
    // ============================================
    // Tier 4: Cloud Providers (Premium)
    // ============================================
    
    // AWS Services
    aws_credits: {
        id: 'aws_credits',
        name: 'AWS Credits',
        tier: 4,
        premium: true,
        icon: '☁️',
        description: 'AWS cloud credits for on-demand compute. Provides +500 compute/s',
        baseCost: { data: 5000000 },
        costMultiplier: 1.30,
        production: { compute: 500 },
        unlocked: false,
        unlockRequirement: { research: 50 },
        count: 0
    },
    aws_s3: {
        id: 'aws_s3',
        name: 'AWS S3 Storage',
        tier: 4,
        premium: true,
        icon: '🪣',
        description: 'Scalable object storage for training data. Provides +300 data/s',
        baseCost: { data: 3000000 },
        costMultiplier: 1.30,
        production: { data: 300 },
        unlocked: false,
        unlockRequirement: { research: 55 },
        count: 0
    },
    aws_sagemaker: {
        id: 'aws_sagemaker',
        name: 'AWS SageMaker',
        tier: 4,
        premium: true,
        icon: '🤖',
        description: 'Managed ML platform. Provides +800 compute/s and +10% global bonus',
        baseCost: { data: 10000000, compute: 1000 },
        costMultiplier: 1.35,
        production: { compute: 800 },
        bonus: { globalProduction: 0.10 },
        unlocked: false,
        unlockRequirement: { research: 60 },
        count: 0
    },
    
    // GCP Services
    gcp_compute: {
        id: 'gcp_compute',
        name: 'GCP Compute Engine',
        tier: 4,
        premium: true,
        icon: '🔧',
        description: 'Virtual machines in Google Cloud. Provides +550 compute/s',
        baseCost: { data: 5500000 },
        costMultiplier: 1.30,
        production: { compute: 550 },
        unlocked: false,
        unlockRequirement: { research: 50 },
        count: 0
    },
    gcp_bigquery: {
        id: 'gcp_bigquery',
        name: 'GCP BigQuery',
        tier: 4,
        premium: true,
        icon: '📊',
        description: 'Serverless data warehouse. Provides +400 data/s',
        baseCost: { data: 4000000 },
        costMultiplier: 1.30,
        production: { data: 400 },
        unlocked: false,
        unlockRequirement: { research: 55 },
        count: 0
    },
    gcp_vertex: {
        id: 'gcp_vertex',
        name: 'GCP Vertex AI',
        tier: 4,
        premium: true,
        icon: '🎯',
        description: 'Unified ML platform. Provides +850 compute/s and +12% global bonus',
        baseCost: { data: 11000000, compute: 1100 },
        costMultiplier: 1.35,
        production: { compute: 850 },
        bonus: { globalProduction: 0.12 },
        unlocked: false,
        unlockRequirement: { research: 60 },
        count: 0
    },
    
    // Azure Services
    azure_vm: {
        id: 'azure_vm',
        name: 'Azure VMs',
        tier: 4,
        premium: true,
        icon: '🖥️',
        description: 'Azure virtual machines. Provides +600 compute/s',
        baseCost: { data: 6000000 },
        costMultiplier: 1.30,
        production: { compute: 600 },
        unlocked: false,
        unlockRequirement: { research: 50 },
        count: 0
    },
    azure_cosmos: {
        id: 'azure_cosmos',
        name: 'Azure Cosmos DB',
        tier: 4,
        premium: true,
        icon: '🌍',
        description: 'Globally distributed database. Provides +350 data/s',
        baseCost: { data: 3500000 },
        costMultiplier: 1.30,
        production: { data: 350 },
        unlocked: false,
        unlockRequirement: { research: 55 },
        count: 0
    },
    azure_ml: {
        id: 'azure_ml',
        name: 'Azure ML',
        tier: 4,
        premium: true,
        icon: '📈',
        description: 'Enterprise ML service. Provides +900 compute/s and +15% global bonus',
        baseCost: { data: 12000000, compute: 1200 },
        costMultiplier: 1.35,
        production: { compute: 900 },
        bonus: { globalProduction: 0.15 },
        unlocked: false,
        unlockRequirement: { research: 60 },
        count: 0
    }
};

/**
 * Initialize buildings (returns deep copy)
 */
export function initializeBuildings() {
    return JSON.parse(JSON.stringify(buildings));
}
