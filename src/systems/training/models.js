/**
 * ML Model / Training Task Definitions
 * All model data and requirements
 */

export const models = {
    // Early Game: Basic Classification (OPTIMIZED for quick start)
    digitrecognition: {
        id: 'digitrecognition',
        name: 'Digit Recognition',
        category: 'classification',
        icon: '🔢',
        description: 'Train a neural network to recognize handwritten digits (MNIST-style)',
        requirements: {
            data: 40,
            compute: 0.4
        },
        production: {
            accuracy: 0.25,
            research: 0.025
        },
        unlocked: true,
        trainingTime: 10,
        realConcept: 'Basic feedforward neural networks with backpropagation'
    },
    
    // Mid Game: Advanced Vision (BALANCED for smooth transition)
    imageclassification: {
        id: 'imageclassification',
        name: 'Image Classification',
        category: 'vision',
        icon: '🖼️',
        description: 'Classify complex images into categories (ImageNet-style)',
        requirements: {
            data: 4000,
            compute: 15
        },
        production: {
            accuracy: 6,
            research: 0.6
        },
        unlocked: false,
        unlockRequirement: { accuracy: 40 },
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
            data: 40000,
            compute: 80
        },
        production: {
            accuracy: 30,
            research: 3
        },
        unlocked: false,
        unlockRequirement: { accuracy: 400 },
        trainingTime: 60,
        realConcept: 'Region-based CNNs (R-CNN, Fast R-CNN, YOLO)'
    },
    
    // Late Game: Complex Tasks (BALANCED for engaging late game)
    nlpmodel: {
        id: 'nlpmodel',
        name: 'Natural Language Processing',
        category: 'advanced',
        icon: '📝',
        description: 'Process and understand human language',
        requirements: {
            data: 400000,
            compute: 400
        },
        production: {
            accuracy: 150,
            research: 15
        },
        unlocked: false,
        unlockRequirement: { accuracy: 2000, research: 20 },
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
            data: 4000000,
            compute: 2000
        },
        production: {
            accuracy: 750,
            research: 75
        },
        unlocked: false,
        unlockRequirement: { accuracy: 10000, research: 40 },
        trainingTime: 180,
        realConcept: 'Q-Learning, Policy Gradients, Actor-Critic methods'
    },
    
    // End Game: Frontier Models (BALANCED but still challenging)
    llm: {
        id: 'llm',
        name: 'Large Language Model',
        category: 'advanced',
        icon: '🧠',
        description: 'Scale to billions of parameters for emergent capabilities',
        requirements: {
            data: 40000000,
            compute: 20000
        },
        production: {
            accuracy: 3750,
            research: 375
        },
        unlocked: false,
        unlockRequirement: { accuracy: 50000, research: 200 },
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
            data: 400000000,
            compute: 200000
        },
        production: {
            accuracy: 18750,
            research: 1875
        },
        unlocked: false,
        unlockRequirement: { accuracy: 250000, research: 400 },
        trainingTime: 600,
        realConcept: 'CLIP, DALL-E, vision-language models'
    }
};

/**
 * Check if a model can be trained
 */
export function canTrainModel(model, resources) {
    for (const [resource, amount] of Object.entries(model.requirements)) {
        if (resources[resource].amount < amount) {
            return false;
        }
    }
    return true;
}

/**
 * Initialize models (returns deep copy)
 */
export function initializeModels() {
    return JSON.parse(JSON.stringify(models));
}
