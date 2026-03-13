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
    },
    
    // ============================================
    // NEW: Generative AI Models (v0.9.0)
    // ============================================
    speech_recognition: {
        id: 'speech_recognition',
        name: 'Speech Recognition',
        category: 'audio',
        icon: '🎤',
        description: 'Convert spoken words to text',
        requirements: {
            data: 800000,
            compute: 500
        },
        production: {
            accuracy: 500,
            research: 50
        },
        unlocked: false,
        unlockRequirement: { accuracy: 5000, research: 30 },
        trainingTime: 120,
        realConcept: 'Wav2Vec, Whisper, CTC networks'
    },
    vae: {
        id: 'vae',
        name: 'Variational Autoencoder',
        category: 'generative',
        icon: '🎲',
        description: 'Learn latent representations for generation',
        requirements: {
            data: 2000000,
            compute: 1200
        },
        production: {
            accuracy: 1200,
            research: 120
        },
        unlocked: false,
        unlockRequirement: { accuracy: 15000, research: 35 },
        trainingTime: 150,
        realConcept: 'Latent space learning, VAE, reparameterization trick'
    },
    gan: {
        id: 'gan',
        name: 'GAN',
        category: 'generative',
        icon: '🎭',
        description: 'Generate realistic synthetic data',
        requirements: {
            data: 5000000,
            compute: 3000
        },
        production: {
            accuracy: 2500,
            research: 250
        },
        unlocked: false,
        unlockRequirement: { accuracy: 30000, research: 45 },
        trainingTime: 200,
        realConcept: 'Generator-Discriminator adversarial training'
    },
    stable_diffusion: {
        id: 'stable_diffusion',
        name: 'Stable Diffusion',
        category: 'generative',
        icon: '🎨',
        description: 'Text-to-image generation via diffusion',
        requirements: {
            data: 15000000,
            compute: 8000
        },
        production: {
            accuracy: 6000,
            research: 600
        },
        unlocked: false,
        unlockRequirement: { accuracy: 60000, research: 55 },
        trainingTime: 250,
        realConcept: 'Latent diffusion, CLIP text encoders'
    },
    
    // ============================================
    // NEW: Vision & NLP Models (v0.9.0)
    // ============================================
    semantic_segmentation: {
        id: 'semantic_segmentation',
        name: 'Semantic Segmentation',
        category: 'vision',
        icon: '🔲',
        description: 'Pixel-level image understanding',
        requirements: {
            data: 10000000,
            compute: 6000
        },
        production: {
            accuracy: 4500,
            research: 450
        },
        unlocked: false,
        unlockRequirement: { accuracy: 40000, research: 50 },
        trainingTime: 180,
        realConcept: 'U-Net, FCN, Mask R-CNN'
    },
    sentiment_analysis: {
        id: 'sentiment_analysis',
        name: 'Sentiment Analysis',
        category: 'nlp',
        icon: '😊',
        description: 'Detect emotions in text',
        requirements: {
            data: 3000000,
            compute: 1500
        },
        production: {
            accuracy: 1800,
            research: 180
        },
        unlocked: false,
        unlockRequirement: { accuracy: 25000, research: 40 },
        trainingTime: 100,
        realConcept: 'BERT-based sentiment classifiers'
    },
    ner: {
        id: 'ner',
        name: 'Named Entity Recognition',
        category: 'nlp',
        icon: '📛',
        description: 'Extract entities from text',
        requirements: {
            data: 4000000,
            compute: 2000
        },
        production: {
            accuracy: 2200,
            research: 220
        },
        unlocked: false,
        unlockRequirement: { accuracy: 35000, research: 45 },
        trainingTime: 120,
        realConcept: 'Token classification, CRF layers'
    },
    code_generation: {
        id: 'code_generation',
        name: 'Code Generation',
        category: 'nlp',
        icon: '💻',
        description: 'Generate code from natural language',
        requirements: {
            data: 25000000,
            compute: 15000
        },
        production: {
            accuracy: 8000,
            research: 800
        },
        unlocked: false,
        unlockRequirement: { accuracy: 80000, research: 60 },
        trainingTime: 300,
        realConcept: 'Codex, CodeGen, LLMs for programming'
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
