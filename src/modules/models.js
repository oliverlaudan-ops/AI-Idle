// ML Model / Training Task Definitions

export const models = {
    // Early Game: Basic Classification
    digitrecognition: {
        id: 'digitrecognition',
        name: 'Digit Recognition',
        category: 'classification',
        icon: '🔢',
        description: 'Train a neural network to recognize handwritten digits (MNIST-style)',
        requirements: {
            data: 50,
            compute: 0.5
        },
        production: {
            accuracy: 0.2,
            research: 0.02
        },
        unlocked: true,
        trainingTime: 10, // seconds for visual progress bar
        realConcept: 'Basic feedforward neural networks with backpropagation'
    },
    
    // Mid Game: Advanced Vision
    imageclassification: {
        id: 'imageclassification',
        name: 'Image Classification',
        category: 'vision',
        icon: '🖼️',
        description: 'Classify complex images into categories (ImageNet-style)',
        requirements: {
            data: 5000,
            compute: 20
        },
        production: {
            accuracy: 5,
            research: 0.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 50 },
        trainingTime: 30,
        realConcept: 'Convolutional Neural Networks (CNNs) like ResNet, VGG'
    },
    objectdetection: {
        id: 'objectdetection',
        name: 'Object Detection',
        category: 'vision',
        icon: '🎯',
        description: 'Detect and localize multiple objects within images',
        requirements: {
            data: 50000,
            compute: 100
        },
        production: {
            accuracy: 25,
            research: 2.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 500 },
        trainingTime: 60,
        realConcept: 'Region-based CNNs (R-CNN, Fast R-CNN, YOLO)'
    },
    
    // Late Game: Complex Tasks
    nlpmodel: {
        id: 'nlpmodel',
        name: 'Natural Language Processing',
        category: 'advanced',
        icon: '📝',
        description: 'Process and understand human language',
        requirements: {
            data: 500000,
            compute: 500
        },
        production: {
            accuracy: 125,
            research: 12.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 2500, research: 25 },
        trainingTime: 120,
        realConcept: 'Transformers, BERT, attention mechanisms'
    },
    rlagent: {
        id: 'rlagent',
        name: 'Reinforcement Learning Agent',
        category: 'advanced',
        icon: '🎮',
        description: 'Train agents to make sequential decisions',
        requirements: {
            data: 5000000,
            compute: 2500
        },
        production: {
            accuracy: 625,
            research: 62.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 12500, research: 50 },
        trainingTime: 180,
        realConcept: 'Q-Learning, Policy Gradients, Actor-Critic methods'
    },
    
    // End Game: Frontier Models
    llm: {
        id: 'llm',
        name: 'Large Language Model',
        category: 'advanced',
        icon: '🧠',
        description: 'Scale to billions of parameters for emergent capabilities',
        requirements: {
            data: 50000000,
            compute: 25000
        },
        production: {
            accuracy: 3125,
            research: 312.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 62500, research: 250 },
        trainingTime: 300,
        realConcept: 'GPT-style models, scaling laws, emergent abilities'
    },
    multimodal: {
        id: 'multimodal',
        name: 'Multimodal AI',
        category: 'advanced',
        icon: '🌈',
        description: 'Combine vision and language understanding',
        requirements: {
            data: 500000000,
            compute: 250000
        },
        production: {
            accuracy: 15625,
            research: 1562.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 312500, research: 500 },
        trainingTime: 600,
        realConcept: 'CLIP, DALL-E, vision-language models'
    }
};

// Check if a model can be trained
export function canTrainModel(model, resources) {
    for (const [resource, amount] of Object.entries(model.requirements)) {
        if (resources[resource].amount < amount) {
            return false;
        }
    }
    return true;
}

// Initialize models
export function initializeModels() {
    return JSON.parse(JSON.stringify(models));
}