// Training Queue System - Automatic model training queue

export class TrainingQueue {
    constructor(game) {
        this.game = game;
        this.queue = []; // Array of model IDs
        this.enabled = true; // Auto-queue enabled by default
        this.repeatLastModel = false; // Repeat last trained model
        this.maxQueueSize = 10; // Maximum queue size
        this.lastTrainedModel = null; // Track last trained model for repeat
    }
    
    // Add a model to the queue
    addToQueue(modelId) {
        // Check if model exists
        const model = this.game.models[modelId];
        if (!model) {
            console.warn(`Model not found: ${modelId}`);
            return false;
        }
        
        // Check if already in queue
        if (this.queue.includes(modelId)) {
            console.log(`Model ${modelId} already in queue`);
            return false;
        }
        
        // Check queue size limit
        if (this.queue.length >= this.maxQueueSize) {
            console.warn('Queue is full!');
            return false;
        }
        
        // Add to queue
        this.queue.push(modelId);
        console.log(`Added ${model.name} to training queue. Queue size: ${this.queue.length}`);
        return true;
    }
    
    // Remove a model from the queue
    removeFromQueue(modelId) {
        const index = this.queue.indexOf(modelId);
        if (index === -1) {
            return false;
        }
        
        this.queue.splice(index, 1);
        console.log(`Removed ${modelId} from queue. Queue size: ${this.queue.length}`);
        return true;
    }
    
    // Move model up in queue (decrease index)
    moveUp(modelId) {
        const index = this.queue.indexOf(modelId);
        if (index <= 0) return false; // Already at top or not found
        
        // Swap with previous item
        [this.queue[index - 1], this.queue[index]] = [this.queue[index], this.queue[index - 1]];
        return true;
    }
    
    // Move model down in queue (increase index)
    moveDown(modelId) {
        const index = this.queue.indexOf(modelId);
        if (index === -1 || index >= this.queue.length - 1) return false; // Not found or at bottom
        
        // Swap with next item
        [this.queue[index], this.queue[index + 1]] = [this.queue[index + 1], this.queue[index]];
        return true;
    }
    
    // Clear entire queue
    clearQueue() {
        this.queue = [];
        console.log('Training queue cleared');
    }
    
    // Get next model from queue
    getNextModel() {
        if (this.queue.length === 0) {
            return null;
        }
        
        return this.queue[0];
    }
    
    // Check if model can be trained (has resources)
    canTrainModel(modelId) {
        const model = this.game.models[modelId];
        if (!model) return false;
        
        // Check if unlocked
        if (!model.unlocked) return false;
        
        // Check resource requirements
        const hasData = this.game.resources.data.amount >= model.cost.data;
        const hasCompute = this.game.resources.compute.amount >= model.cost.compute;
        
        return hasData && hasCompute;
    }
    
    // Process queue when training completes
    onTrainingComplete() {
        if (!this.enabled) return;
        
        // Remove completed model from queue (it should be first)
        if (this.queue.length > 0) {
            const completedModel = this.queue.shift();
            this.lastTrainedModel = completedModel;
            console.log(`Training complete for ${completedModel}. Queue size: ${this.queue.length}`);
        }
        
        // Try to start next training
        this.tryStartNextTraining();
    }
    
    // Try to start the next model in queue
    tryStartNextTraining() {
        if (!this.enabled) return false;
        if (this.game.currentTraining) return false; // Already training
        
        // Handle repeat last model
        if (this.repeatLastModel && this.lastTrainedModel && this.queue.length === 0) {
            // Add last model back to queue if it can be trained
            if (this.canTrainModel(this.lastTrainedModel)) {
                this.addToQueue(this.lastTrainedModel);
            }
        }
        
        // Try each model in queue until one can be trained
        while (this.queue.length > 0) {
            const nextModelId = this.queue[0];
            
            // Check if we can train this model
            if (this.canTrainModel(nextModelId)) {
                // Start training
                const success = this.game.startTraining(nextModelId);
                if (success) {
                    console.log(`Auto-started training: ${nextModelId}`);
                    return true;
                }
            }
            
            // Can't train this model, remove it from queue
            console.log(`Skipping ${nextModelId} - insufficient resources or locked`);
            this.queue.shift();
        }
        
        return false;
    }
    
    // Get queue with model details
    getQueueDetails() {
        return this.queue.map(modelId => {
            const model = this.game.models[modelId];
            return {
                id: modelId,
                name: model ? model.name : 'Unknown',
                icon: model ? model.icon : '❓',
                canTrain: this.canTrainModel(modelId),
                cost: model ? model.cost : null
            };
        });
    }
    
    // Estimate total queue completion time
    estimateQueueTime() {
        if (this.queue.length === 0) return 0;
        
        let totalTime = 0;
        
        // Add remaining time of current training
        if (this.game.currentTraining) {
            totalTime += this.game.currentTraining.timeRemaining;
        }
        
        // Add time for each model in queue
        for (const modelId of this.queue) {
            const model = this.game.models[modelId];
            if (model) {
                // Base time divided by training speed
                const trainingSpeed = this.game.getTrainingSpeedMultiplier();
                totalTime += model.trainingTime / trainingSpeed;
            }
        }
        
        return totalTime;
    }
    
    // Toggle auto-queue
    toggleEnabled() {
        this.enabled = !this.enabled;
        console.log(`Auto-queue ${this.enabled ? 'enabled' : 'disabled'}`);
        
        // Try to start training if enabled and queue has items
        if (this.enabled) {
            this.tryStartNextTraining();
        }
        
        return this.enabled;
    }
    
    // Toggle repeat last model
    toggleRepeat() {
        this.repeatLastModel = !this.repeatLastModel;
        console.log(`Repeat last model ${this.repeatLastModel ? 'enabled' : 'disabled'}`);
        return this.repeatLastModel;
    }
    
    // Check if queue is empty
    isEmpty() {
        return this.queue.length === 0;
    }
    
    // Check if queue is full
    isFull() {
        return this.queue.length >= this.maxQueueSize;
    }
    
    // Get queue length
    getLength() {
        return this.queue.length;
    }
    
    // Save queue state
    save() {
        return {
            queue: this.queue,
            enabled: this.enabled,
            repeatLastModel: this.repeatLastModel,
            lastTrainedModel: this.lastTrainedModel
        };
    }
    
    // Load queue state
    load(data) {
        if (!data) return;
        
        this.queue = data.queue || [];
        this.enabled = data.enabled !== undefined ? data.enabled : true;
        this.repeatLastModel = data.repeatLastModel || false;
        this.lastTrainedModel = data.lastTrainedModel || null;
        
        console.log(`Loaded training queue with ${this.queue.length} models`);
    }
}