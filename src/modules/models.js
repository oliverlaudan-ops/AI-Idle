// ML Model / Training Task Definitions

export const models = {
    // Early Game: Basic Classification (OPTIMIZED for quick start)
    digitrecognition: {
        id: 'digitrecognition',
        name: 'Digit Recognition',
        category: 'classification',
        icon: '🔢',
        description: 'Train a neural network to recognize handwritten digits (MNIST-style)',
        requirements: {
            data: 40, // Reduced from 50 for faster first training
            compute: 0.4 // Reduced from 0.5
        },
        production: {
            accuracy: 0.25, // Increased from 0.2 for better feedback
            research: 0.025 // Increased from 0.02
        },
        unlocked: true,
        trainingTime: 10, // seconds for visual progress bar
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
            data: 4000, // Reduced from 5000
            compute: 15 // Reduced from 20
        },
        production: {
            accuracy: 6, // Increased from 5 for better reward
            research: 0.6 // Increased from 0.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 40 }, // Reduced from 50 for earlier unlock
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
            data: 40000, // Reduced from 50000
            compute: 80 // Reduced from 100
        },
        production: {
            accuracy: 30, // Increased from 25
            research: 3 // Increased from 2.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 400 }, // Reduced from 500
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
            data: 400000, // Reduced from 500000
            compute: 400 // Reduced from 500
        },
        production: {
            accuracy: 150, // Increased from 125
            research: 15 // Increased from 12.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 2000, research: 20 }, // Reduced from 2500 accuracy and 25 research
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
            data: 4000000, // Reduced from 5000000
            compute: 2000 // Reduced from 2500
        },
        production: {
            accuracy: 750, // Increased from 625
            research: 75 // Increased from 62.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 10000, research: 40 }, // Reduced from 12500 accuracy and 50 research
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
            data: 40000000, // Reduced from 50000000
            compute: 20000 // Reduced from 25000
        },
        production: {
            accuracy: 3750, // Increased from 3125
            research: 375 // Increased from 312.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 50000, research: 200 }, // Reduced from 62500 accuracy and 250 research
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
            data: 400000000, // Reduced from 500000000
            compute: 200000 // Reduced from 250000
        },
        production: {
            accuracy: 18750, // Increased from 15625
            research: 1875 // Increased from 1562.5
        },
        unlocked: false,
        unlockRequirement: { accuracy: 250000, research: 400 }, // Reduced from 312500 accuracy and 500 research
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