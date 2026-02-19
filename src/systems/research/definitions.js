/**
 * Research Tree Definitions
 * All research nodes and their properties
 */

export const research = {
    // ─── Optimization Algorithms ───────────────────────────────────────────────
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
    lion: {
        id: 'lion',
        name: 'Lion Optimizer',
        category: 'optimizers',
        icon: '🦁',
        description: 'EvoLved Sign Momentum — discovered by AutoML',
        cost: { research: 1200 },
        effect: { type: 'trainingSpeed', multiplier: 1.6 },
        unlocked: false,
        unlockRequirement: { research: 'adamw' },
        researched: false,
        realConcept: 'Uses sign of gradient update, more memory-efficient than Adam'
    },
    sophia: {
        id: 'sophia',
        name: 'Sophia Optimizer',
        category: 'optimizers',
        icon: '🧠',
        description: 'Second-order optimizer using Hessian curvature',
        cost: { research: 5000 },
        effect: { type: 'trainingSpeed', multiplier: 2.0 },
        unlocked: false,
        unlockRequirement: { research: 'lion' },
        researched: false,
        realConcept: '2x faster than Adam on LLM pre-training via curvature-aware steps'
    },

    // ─── Activation Functions ──────────────────────────────────────────────────
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
    mish: {
        id: 'mish',
        name: 'Mish Activation',
        category: 'activations',
        icon: '✨',
        description: 'Smooth, non-monotonic activation with strong regularization',
        cost: { research: 4000 },
        effect: { type: 'modelPerformance', multiplier: 1.65 },
        unlocked: false,
        unlockRequirement: { research: 'swish' },
        researched: false,
        realConcept: 'f(x) = x * tanh(softplus(x)) — outperforms Swish on many benchmarks'
    },

    // ─── Architectures ─────────────────────────────────────────────────────────
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
    moe: {
        id: 'moe',
        name: 'Mixture of Experts',
        category: 'architectures',
        icon: '🧩',
        description: 'Route inputs to specialized sub-networks for massive scale',
        cost: { research: 35000 },
        effect: { type: 'globalMultiplier', multiplier: 3.0 },
        unlocked: false,
        unlockRequirement: { research: 'diffusion' },
        researched: false,
        realConcept: 'Used in GPT-4 and Gemini — sparse activation enables trillion-param models'
    },

    // ─── Regularization Techniques ─────────────────────────────────────────────
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
    },
    gradclip: {
        id: 'gradclip',
        name: 'Gradient Clipping',
        category: 'regularization',
        icon: '✂️',
        description: 'Cap gradient norms to prevent exploding gradients',
        cost: { research: 1800 },
        effect: { type: 'trainingSpeed', multiplier: 1.35 },
        unlocked: false,
        unlockRequirement: { research: 'layernorm' },
        researched: false,
        realConcept: 'Essential for training RNNs and very deep networks stably'
    },

    // ─── Hardware Innovations ──────────────────────────────────────────────────
    gpu_acceleration: {
        id: 'gpu_acceleration',
        name: 'GPU Acceleration',
        category: 'hardware',
        icon: '🖥️',
        description: 'Parallelize matrix ops across thousands of CUDA cores',
        cost: { research: 500 },
        effect: { type: 'trainingSpeed', multiplier: 1.5 },
        unlocked: true,
        researched: false,
        realConcept: 'NVIDIA CUDA enabled the deep learning revolution in 2012'
    },
    mixed_precision: {
        id: 'mixed_precision',
        name: 'Mixed Precision Training',
        category: 'hardware',
        icon: '⚗️',
        description: 'Train in FP16 with FP32 master weights for 2x speedup',
        cost: { research: 2000 },
        effect: { type: 'trainingSpeed', multiplier: 1.8 },
        unlocked: false,
        unlockRequirement: { research: 'gpu_acceleration' },
        researched: false,
        realConcept: 'Halves memory usage and doubles throughput on modern GPUs'
    },
    tensor_cores: {
        id: 'tensor_cores',
        name: 'Tensor Core Ops',
        category: 'hardware',
        icon: '🔷',
        description: 'Dedicated matrix multiply units for transformer workloads',
        cost: { research: 8000 },
        effect: { type: 'trainingSpeed', multiplier: 2.2 },
        unlocked: false,
        unlockRequirement: { research: 'mixed_precision' },
        researched: false,
        realConcept: 'NVIDIA Tensor Cores deliver 312 TFLOPS on A100 GPUs'
    },
    distributed_training: {
        id: 'distributed_training',
        name: 'Distributed Training',
        category: 'hardware',
        icon: '🌐',
        description: 'Shard model and data across multiple accelerators',
        cost: { research: 20000 },
        effect: { type: 'globalMultiplier', multiplier: 2.5 },
        unlocked: false,
        unlockRequirement: { research: 'tensor_cores' },
        researched: false,
        realConcept: 'Data/model/pipeline parallelism used to train GPT-3 on 1024 A100s'
    },
    neuromorphic: {
        id: 'neuromorphic',
        name: 'Neuromorphic Chips',
        category: 'hardware',
        icon: '🧬',
        description: 'Brain-inspired hardware with event-driven spiking neurons',
        cost: { research: 75000 },
        effect: { type: 'efficiency', multiplier: 3.0 },
        unlocked: false,
        unlockRequirement: { research: 'distributed_training' },
        researched: false,
        realConcept: 'Intel Loihi 2 achieves 1000x energy efficiency over GPUs for inference'
    },

    // ─── Data Engineering ──────────────────────────────────────────────────────
    data_augmentation: {
        id: 'data_augmentation',
        name: 'Data Augmentation',
        category: 'data',
        icon: '🔁',
        description: 'Synthetically expand training data with transforms',
        cost: { research: 150 },
        effect: { type: 'modelPerformance', multiplier: 1.2 },
        unlocked: true,
        researched: false,
        realConcept: 'Flips, crops, color jitter — standard practice since AlexNet (2012)'
    },
    transfer_learning: {
        id: 'transfer_learning',
        name: 'Transfer Learning',
        category: 'data',
        icon: '🔀',
        description: 'Fine-tune pretrained weights instead of training from scratch',
        cost: { research: 600 },
        effect: { type: 'trainingSpeed', multiplier: 1.6 },
        unlocked: false,
        unlockRequirement: { research: 'data_augmentation' },
        researched: false,
        realConcept: 'ImageNet pretraining + fine-tuning dominates computer vision tasks'
    },
    synthetic_data: {
        id: 'synthetic_data',
        name: 'Synthetic Data Generation',
        category: 'data',
        icon: '🏭',
        description: 'Generate unlimited training data with GANs and simulators',
        cost: { research: 3500 },
        effect: { type: 'modelPerformance', multiplier: 1.45 },
        unlocked: false,
        unlockRequirement: { research: 'transfer_learning' },
        researched: false,
        realConcept: 'Tesla uses synthetic data from simulation to train Autopilot'
    },
    curriculum_learning: {
        id: 'curriculum_learning',
        name: 'Curriculum Learning',
        category: 'data',
        icon: '📚',
        description: 'Train on easy examples first, gradually increase difficulty',
        cost: { research: 7000 },
        effect: { type: 'trainingSpeed', multiplier: 1.7 },
        unlocked: false,
        unlockRequirement: { research: 'synthetic_data' },
        researched: false,
        realConcept: 'Mimics human learning — used in AlphaGo and LLM pre-training'
    },
    rlhf: {
        id: 'rlhf',
        name: 'RLHF',
        category: 'data',
        icon: '👥',
        description: 'Reinforcement Learning from Human Feedback aligns models to intent',
        cost: { research: 25000 },
        effect: { type: 'globalMultiplier', multiplier: 2.0 },
        unlocked: false,
        unlockRequirement: { research: 'curriculum_learning' },
        researched: false,
        realConcept: 'The technique behind ChatGPT — human raters teach models to be helpful'
    },

    // ─── Meta-Learning ─────────────────────────────────────────────────────────
    hyperparameter_search: {
        id: 'hyperparameter_search',
        name: 'Hyperparameter Search',
        category: 'meta',
        icon: '🔍',
        description: 'Automatically find optimal learning rates and batch sizes',
        cost: { research: 300 },
        effect: { type: 'trainingSpeed', multiplier: 1.25 },
        unlocked: true,
        researched: false,
        realConcept: 'Grid search, random search, and Bayesian optimization'
    },
    nas: {
        id: 'nas',
        name: 'Neural Architecture Search',
        category: 'meta',
        icon: '🏗️',
        description: 'Let algorithms design better neural networks than humans',
        cost: { research: 4000 },
        effect: { type: 'modelPerformance', multiplier: 1.5 },
        unlocked: false,
        unlockRequirement: { research: 'hyperparameter_search' },
        researched: false,
        realConcept: 'EfficientNet and MobileNet discovered via NAS — beats hand-designed nets'
    },
    maml: {
        id: 'maml',
        name: 'MAML (Few-Shot Learning)',
        category: 'meta',
        icon: '🎯',
        description: 'Learn to learn — adapt to new tasks with just a few examples',
        cost: { research: 12000 },
        effect: { type: 'efficiency', multiplier: 1.8 },
        unlocked: false,
        unlockRequirement: { research: 'nas' },
        researched: false,
        realConcept: 'Model-Agnostic Meta-Learning finds initializations that generalize fast'
    },
    knowledge_distillation: {
        id: 'knowledge_distillation',
        name: 'Knowledge Distillation',
        category: 'meta',
        icon: '🧪',
        description: 'Compress a large teacher model into a tiny student model',
        cost: { research: 9000 },
        effect: { type: 'efficiency', multiplier: 2.0 },
        unlocked: false,
        unlockRequirement: { research: 'nas' },
        researched: false,
        realConcept: 'DistilBERT is 60% smaller than BERT with 97% of its performance'
    },
    continual_learning: {
        id: 'continual_learning',
        name: 'Continual Learning',
        category: 'meta',
        icon: '♾️',
        description: 'Learn new tasks without forgetting old ones',
        cost: { research: 40000 },
        effect: { type: 'globalMultiplier', multiplier: 2.5 },
        unlocked: false,
        unlockRequirement: { research: 'maml' },
        researched: false,
        realConcept: 'Elastic Weight Consolidation prevents catastrophic forgetting'
    },

    // ─── Safety & Ethics ───────────────────────────────────────────────────────
    bias_detection: {
        id: 'bias_detection',
        name: 'Bias Detection',
        category: 'safety',
        icon: '🔎',
        description: 'Audit models for demographic and representational bias',
        cost: { research: 400 },
        effect: { type: 'modelPerformance', multiplier: 1.1 },
        unlocked: true,
        researched: false,
        realConcept: 'Fairness metrics like demographic parity and equalized odds'
    },
    interpretability: {
        id: 'interpretability',
        name: 'Model Interpretability',
        category: 'safety',
        icon: '🔬',
        description: 'Understand why your model makes each prediction',
        cost: { research: 1500 },
        effect: { type: 'modelPerformance', multiplier: 1.2 },
        unlocked: false,
        unlockRequirement: { research: 'bias_detection' },
        researched: false,
        realConcept: 'SHAP values and LIME explain black-box model decisions'
    },
    differential_privacy: {
        id: 'differential_privacy',
        name: 'Differential Privacy',
        category: 'safety',
        icon: '🔒',
        description: 'Mathematically guarantee training data cannot be extracted',
        cost: { research: 6000 },
        effect: { type: 'efficiency', multiplier: 1.4 },
        unlocked: false,
        unlockRequirement: { research: 'interpretability' },
        researched: false,
        realConcept: 'Apple and Google use DP to collect usage stats without exposing individuals'
    },
    red_teaming: {
        id: 'red_teaming',
        name: 'Red Teaming',
        category: 'safety',
        icon: '🛡️',
        description: 'Adversarially probe models to find failure modes before deployment',
        cost: { research: 15000 },
        effect: { type: 'modelPerformance', multiplier: 1.35 },
        unlocked: false,
        unlockRequirement: { research: 'differential_privacy' },
        researched: false,
        realConcept: 'OpenAI, Anthropic, and DeepMind all run red teams before major releases'
    },
    constitutional_ai: {
        id: 'constitutional_ai',
        name: 'Constitutional AI',
        category: 'safety',
        icon: '📜',
        description: 'Encode a set of principles the model must follow at all times',
        cost: { research: 50000 },
        effect: { type: 'globalMultiplier', multiplier: 2.0 },
        unlocked: false,
        unlockRequirement: { research: 'red_teaming' },
        researched: false,
        realConcept: "Anthropic's technique — Claude is trained to critique and revise its own outputs"
    }
};

/**
 * Initialize research (returns deep copy)
 */
export function initializeResearch() {
    return JSON.parse(JSON.stringify(research));
}
