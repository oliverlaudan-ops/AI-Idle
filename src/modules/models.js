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
            data: 100,
            compute: 1
        },
        production: {
            accuracy: 0.1,
            research: 0.01
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
            data: 10000,
            compute: 50
        },
        production: {
            accuracy: 5,
            research: 0.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 100 },
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
            data: 100000,
            compute: 200
        },
        production: {
            accuracy: 20,
            research: 2
        },
        unlocked: false,
        unlockRequirement: { accuracy: 1000 },
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
            data: 1000000,
            compute: 1000
        },
        production: {
            accuracy: 100,
            research: 10
        },
        unlocked: false,
        unlockRequirement: { accuracy: 5000, research: 50 },
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
            data: 10000000,
            compute: 5000
        },
        production: {
            accuracy: 500,
            research: 50
        },
        unlocked: false,
        unlockRequirement: { accuracy: 25000, research: 100 },
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
            data: 100000000,
            compute: 50000
        },
        production: {
            accuracy: 5000,
            research: 500
        },
        unlocked: false,
        unlockRequirement: { accuracy: 100000, research: 500 },
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
            data: 1000000000,
            compute: 500000
        },
        production: {
            accuracy: 50000,
            research: 5000
        },
        unlocked: false,
        unlockRequirement: { accuracy: 1000000, research: 1000 },
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