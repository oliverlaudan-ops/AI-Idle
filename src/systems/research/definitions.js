/**
 * Research Tree Definitions
 * All research nodes and their properties
 */

export const research = {
    // Optimization Algorithms
    momentum: {
        id: 'momentum',
        name: 'Momentum Optimizer',
        category: 'optimizers',
        icon: '🚀',
        description: 'Accelerate gradient descent with momentum term',
        cost: { research: 10 },
        effect: { type: 'trainingSpeed', multiplier: 1.1 },
        unlocked: true,
        researched: false,
        realConcept: 'Momentum helps SGD escape local minima and accelerate convergence'
    },
    adam: {
        id: 'adam',
        name: 'Adam Optimizer',
        category: 'optimizers',
        icon: '⚡',
        description: 'Adaptive learning rates per parameter',
        cost: { research: 50 },
        effect: { type: 'trainingSpeed', multiplier: 1.25 },
        unlocked: false,
        unlockRequirement: { research: 'momentum' },
        researched: false,
        realConcept: 'Combines momentum and RMSprop for adaptive learning rates'
    },
    adamw: {
        id: 'adamw',
        name: 'AdamW Optimizer',
        category: 'optimizers',
        icon: '💫',
        description: 'Adam with decoupled weight decay',
        cost: { research: 250 },
        effect: { type: 'trainingSpeed', multiplier: 1.4 },
        unlocked: false,
        unlockRequirement: { research: 'adam' },
        researched: false,
        realConcept: 'Improved weight decay regularization for better generalization'
    },

    // Activation Functions
    relu: {
        id: 'relu',
        name: 'ReLU Activation',
        category: 'activations',
        icon: '📈',
        description: 'Rectified Linear Unit prevents vanishing gradients',
        cost: { research: 25 },
        effect: { type: 'modelPerformance', multiplier: 1.15 },
        unlocked: true,
        researched: false,
        realConcept: 'f(x) = max(0, x) - simple and effective non-linearity'
    },
    leakyrelu: {
        id: 'leakyrelu',
        name: 'Leaky ReLU',
        category: 'activations',
        icon: '📊',
        description: 'Small negative slope prevents dying neurons',
        cost: { research: 100 },
        effect: { type: 'modelPerformance', multiplier: 1.2 },
        unlocked: false,
        unlockRequirement: { research: 'relu' },
        researched: false,
        realConcept: 'f(x) = x if x > 0 else 0.01x - allows gradient flow for negative values'
    },
    gelu: {
        id: 'gelu',
        name: 'GELU Activation',
        category: 'activations',
        icon: '🌊',
        description: 'Gaussian Error Linear Unit used in transformers',
        cost: { research: 500 },
        effect: { type: 'modelPerformance', multiplier: 1.35 },
        unlocked: false,
        unlockRequirement: { research: 'leakyrelu' },
        researched: false,
        realConcept: 'Smooth activation used in BERT and GPT models'
    },
    swish: {
        id: 'swish',
        name: 'Swish Activation',
        category: 'activations',
        icon: '🔮',
        description: 'Self-gated activation discovered by neural architecture search',
        cost: { research: 1500 },
        effect: { type: 'modelPerformance', multiplier: 1.5 },
        unlocked: false,
        unlockRequirement: { research: 'gelu' },
        researched: false,
        realConcept: 'f(x) = x * sigmoid(x) - discovered by AutoML'
    },

    // Architectures
    cnn: {
        id: 'cnn',
        name: 'Convolutional Networks',
        category: 'architectures',
        icon: '🖼️',
        description: 'Specialized architecture for image processing',
        cost: { research: 200 },
        effect: { type: 'unlockModels', models: ['imageclassification'] },
        unlocked: true,
        researched: false,
        realConcept: 'Conv layers learn spatial hierarchies of features'
    },
    rnn: {
        id: 'rnn',
        name: 'Recurrent Networks',
        category: 'architectures',
        icon: '🔄',
        description: 'Process sequential data with memory',
        cost: { research: 800 },
        effect: { type: 'unlockModels', models: ['nlpmodel'] },
        unlocked: false,
        unlockRequirement: { research: 'cnn' },
        researched: false,
        realConcept: 'LSTM and GRU handle sequential dependencies'
    },
    transformer: {
        id: 'transformer',
        name: 'Transformer Architecture',
        category: 'architectures',
        icon: '⚙️',
        description: 'Attention is all you need - revolutionary architecture',
        cost: { research: 3000 },
        effect: { type: 'globalMultiplier', multiplier: 2.0 },
        unlocked: false,
        unlockRequirement: { research: 'rnn' },
        researched: false,
        realConcept: 'Self-attention mechanism enables parallel processing'
    },
    diffusion: {
        id: 'diffusion',
        name: 'Diffusion Models',
        category: 'architectures',
        icon: '🎨',
        description: 'Generate high-quality outputs through iterative denoising',
        cost: { research: 10000 },
        effect: { type: 'unlockModels', models: ['multimodal'] },
        unlocked: false,
        unlockRequirement: { research: 'transformer' },
        researched: false,
        realConcept: 'Used in DALL-E 2, Stable Diffusion, Midjourney'
    },

    // Regularization Techniques
    dropout: {
        id: 'dropout',
        name: 'Dropout',
        category: 'regularization',
        icon: '🎲',
        description: 'Randomly drop neurons during training to prevent overfitting',
        cost: { research: 40 },
        effect: { type: 'efficiency', multiplier: 1.1 },
        unlocked: true,
        researched: false,
        realConcept: 'Ensemble method - prevents co-adaptation of neurons'
    },
    batchnorm: {
        id: 'batchnorm',
        name: 'Batch Normalization',
        category: 'regularization',
        icon: '📦',
        description: 'Normalize activations to stabilize training',
        cost: { research: 200 },
        effect: { type: 'trainingSpeed', multiplier: 1.2 },
        unlocked: false,
        unlockRequirement: { research: 'dropout' },
        researched: false,
        realConcept: 'Reduces internal covariate shift, allows higher learning rates'
    },
    layernorm: {
        id: 'layernorm',
        name: 'Layer Normalization',
        category: 'regularization',
        icon: '📐',
        description: 'Normalize across features instead of batch',
        cost: { research: 800 },
        effect: { type: 'trainingSpeed', multiplier: 1.3 },
        unlocked: false,
        unlockRequirement: { research: 'batchnorm' },
        researched: false,
        realConcept: 'Better for RNNs and Transformers than batch norm'
    },
    weightdecay: {
        id: 'weightdecay',
        name: 'Weight Decay',
        category: 'regularization',
        icon: '⚖️',
        description: 'L2 regularization penalizes large weights',
        cost: { research: 400 },
        effect: { type: 'modelPerformance', multiplier: 1.15 },
        unlocked: false,
        unlockRequirement: { research: 'dropout' },
        researched: false,
        realConcept: 'Prevents overfitting by constraining model complexity'
    }
};

/**
 * Initialize research (returns deep copy)
 */
export function initializeResearch() {
    return JSON.parse(JSON.stringify(research));
}
