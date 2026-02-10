// Training Queue UI Component

import { showToast } from './ui-render.js';

export class TrainingQueueUI {
    constructor(game) {
        this.game = game;
        this.queueContainer = null;
        this.settingsContainer = null;
        this.buttonsAdded = false; // Track if buttons were added
    }
    
    // Initialize UI
    init() {
        // Create queue UI in training tab
        this.createQueueUI();
        
        // Add queue buttons to existing model cards
        // Delay to ensure model cards are rendered first
        setTimeout(() => {
            this.addQueueButtons();
        }, 100);
        
        // Update UI initially
        this.update();
    }
    
    // Create the queue UI elements
    createQueueUI() {
        const trainingTab = document.getElementById('tab-training');
        if (!trainingTab) {
            console.error('Training tab not found!');
            return;
        }
        
        // Find the training status div to insert queue after it
        const trainingStatus = document.getElementById('current-training');
        if (!trainingStatus) return;
        
        // Create queue section
        const queueSection = document.createElement('div');
        queueSection.className = 'training-queue-section';
        queueSection.innerHTML = `
            <div class="queue-header">
                <h3>📋 Training Queue</h3>
                <div class="queue-info">
                    <span class="queue-count">0 / 10 models</span>
                    <span class="queue-time">Est: 0s</span>
                </div>
            </div>
            
            <div class="queue-settings">
                <label class="queue-setting">
                    <input type="checkbox" id="queue-enabled" checked>
                    <span>Auto-queue enabled</span>
                </label>
                <label class="queue-setting">
                    <input type="checkbox" id="queue-repeat">
                    <span>Repeat last model</span>
                </label>
                <button class="btn-secondary btn-small" id="queue-clear">Clear Queue</button>
            </div>
            
            <div class="queue-list" id="queue-list">
                <div class="queue-empty">
                    <div class="empty-icon">📭</div>
                    <p>Queue is empty</p>
                    <p class="hint">Click "Add to Queue" on any model below</p>
                </div>
            </div>
        `;
        
        // Insert after training status
        trainingStatus.parentNode.insertBefore(queueSection, trainingStatus.nextSibling);
        
        // Store references
        this.queueContainer = queueSection;
        this.settingsContainer = queueSection.querySelector('.queue-settings');
        
        // Add event listeners
        this.setupEventListeners();
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Queue enabled toggle
        const enabledCheckbox = document.getElementById('queue-enabled');
        if (enabledCheckbox) {
            enabledCheckbox.addEventListener('change', (e) => {
                const enabled = this.game.trainingQueue.toggleEnabled();
                showToast(`Auto-queue ${enabled ? 'enabled' : 'disabled'}`, 'info');
                this.update();
            });
        }
        
        // Queue repeat toggle
        const repeatCheckbox = document.getElementById('queue-repeat');
        if (repeatCheckbox) {
            repeatCheckbox.addEventListener('change', (e) => {
                const repeat = this.game.trainingQueue.toggleRepeat();
                showToast(`Repeat last model ${repeat ? 'enabled' : 'disabled'}`, 'info');
                this.update();
            });
        }
        
        // Clear queue button
        const clearBtn = document.getElementById('queue-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (this.game.trainingQueue.isEmpty()) {
                    showToast('Queue is already empty', 'info');
                    return;
                }
                
                if (confirm('Clear all models from queue?')) {
                    this.game.trainingQueue.clearQueue();
                    showToast('Queue cleared', 'success');
                    this.update();
                }
            });
        }
    }
    
    // Add "Add to Queue" buttons to model cards
    addQueueButtons() {
        // Find all model cards
        const modelCards = document.querySelectorAll('.model-card');
        
        if (modelCards.length === 0) {
            if (!this.buttonsAdded) {
                console.log('No model cards found yet, will retry...');
            }
            return;
        }
        
        console.log(`Adding queue buttons to ${modelCards.length} model cards...`);
        
        modelCards.forEach(card => {
            // Skip if button already exists
            if (card.querySelector('.btn-add-queue')) {
                return;
            }
            
            // Extract model ID from card id (format: "model-{id}")
            const cardId = card.id;
            if (!cardId || !cardId.startsWith('model-')) {
                return;
            }
            
            const modelId = cardId.replace('model-', '');
            
            // Find the train button by ID
            const trainBtn = card.querySelector(`#btn-model-${modelId}`);
            if (!trainBtn) {
                console.warn(`Train button not found for model ${modelId}`);
                return;
            }
            
            // Create add to queue button
            const queueBtn = document.createElement('button');
            queueBtn.className = 'btn-secondary btn-small btn-add-queue';
            queueBtn.innerHTML = '📋 Add to Queue';
            queueBtn.dataset.modelId = modelId;
            queueBtn.style.marginTop = '0.5rem';
            queueBtn.style.width = '100%';
            
            // Add click handler
            queueBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addModelToQueue(modelId);
            });
            
            // Insert after train button
            trainBtn.parentNode.insertBefore(queueBtn, trainBtn.nextSibling);
        });
        
        this.buttonsAdded = true;
        console.log('Queue buttons added successfully!');
    }
    
    // Add a model to the queue
    addModelToQueue(modelId) {
        const model = this.game.models[modelId];
        if (!model) return;
        
        // Check if queue is full
        if (this.game.trainingQueue.isFull()) {
            showToast('Queue is full! (Max 10 models)', 'warning');
            return;
        }
        
        // Try to add to queue
        const success = this.game.trainingQueue.addToQueue(modelId);
        
        if (success) {
            showToast(`Added ${model.name} to queue`, 'success');
            this.update();
            
            // Try to start training if nothing is currently training
            if (!this.game.currentTraining) {
                this.game.trainingQueue.tryStartNextTraining();
            }
        } else {
            showToast(`${model.name} is already in queue`, 'warning');
        }
    }
    
    // Remove a model from the queue
    removeModelFromQueue(modelId) {
        const success = this.game.trainingQueue.removeFromQueue(modelId);
        if (success) {
            const model = this.game.models[modelId];
            showToast(`Removed ${model ? model.name : 'model'} from queue`, 'success');
            this.update();
        }
    }
    
    // Move model up in queue
    moveModelUp(modelId) {
        const success = this.game.trainingQueue.moveUp(modelId);
        if (success) {
            this.update();
        }
    }
    
    // Move model down in queue
    moveModelDown(modelId) {
        const success = this.game.trainingQueue.moveDown(modelId);
        if (success) {
            this.update();
        }
    }
    
    // Format time for display
    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.round(seconds % 60);
            return `${minutes}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }
    
    // Update the queue UI
    update() {
        if (!this.queueContainer) return;
        
        const queue = this.game.trainingQueue;
        const queueDetails = queue.getQueueDetails();
        const queueLength = queue.getLength();
        const estimatedTime = queue.estimateQueueTime();
        
        // Update header info
        const queueCount = this.queueContainer.querySelector('.queue-count');
        if (queueCount) {
            queueCount.textContent = `${queueLength} / ${queue.maxQueueSize} models`;
        }
        
        const queueTime = this.queueContainer.querySelector('.queue-time');
        if (queueTime) {
            queueTime.textContent = `Est: ${this.formatTime(estimatedTime)}`;
        }
        
        // Update checkboxes
        const enabledCheckbox = document.getElementById('queue-enabled');
        if (enabledCheckbox) {
            enabledCheckbox.checked = queue.enabled;
        }
        
        const repeatCheckbox = document.getElementById('queue-repeat');
        if (repeatCheckbox) {
            repeatCheckbox.checked = queue.repeatLastModel;
        }
        
        // Update queue list
        const queueList = document.getElementById('queue-list');
        if (!queueList) return;
        
        if (queueLength === 0) {
            // Show empty state
            queueList.innerHTML = `
                <div class="queue-empty">
                    <div class="empty-icon">📭</div>
                    <p>Queue is empty</p>
                    <p class="hint">Click "Add to Queue" on any model below</p>
                </div>
            `;
        } else {
            // Show queue items
            queueList.innerHTML = '';
            
            queueDetails.forEach((item, index) => {
                const queueItem = document.createElement('div');
                queueItem.className = 'queue-item' + (item.canTrain ? '' : ' insufficient-resources');
                queueItem.dataset.modelId = item.id;
                
                queueItem.innerHTML = `
                    <div class="queue-item-order">#${index + 1}</div>
                    <div class="queue-item-icon">${item.icon}</div>
                    <div class="queue-item-info">
                        <div class="queue-item-name">${item.name}</div>
                        <div class="queue-item-status">
                            ${item.canTrain ? '✅ Ready' : '⚠️ Insufficient resources'}
                        </div>
                    </div>
                    <div class="queue-item-controls">
                        <button class="btn-icon btn-queue-up" data-model-id="${item.id}" title="Move up" ${index === 0 ? 'disabled' : ''}>
                            ⬆️
                        </button>
                        <button class="btn-icon btn-queue-down" data-model-id="${item.id}" title="Move down" ${index === queueLength - 1 ? 'disabled' : ''}>
                            ⬇️
                        </button>
                        <button class="btn-icon btn-queue-remove" data-model-id="${item.id}" title="Remove">
                            ❌
                        </button>
                    </div>
                `;
                
                queueList.appendChild(queueItem);
            });
            
            // Add event listeners to queue item controls
            this.setupQueueItemListeners();
        }
        
        // Update "Add to Queue" buttons state
        this.updateQueueButtons();
    }
    
    // Setup event listeners for queue item controls
    setupQueueItemListeners() {
        // Move up buttons
        document.querySelectorAll('.btn-queue-up').forEach(btn => {
            btn.addEventListener('click', () => {
                const modelId = btn.dataset.modelId;
                this.moveModelUp(modelId);
            });
        });
        
        // Move down buttons
        document.querySelectorAll('.btn-queue-down').forEach(btn => {
            btn.addEventListener('click', () => {
                const modelId = btn.dataset.modelId;
                this.moveModelDown(modelId);
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.btn-queue-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const modelId = btn.dataset.modelId;
                this.removeModelFromQueue(modelId);
            });
        });
    }
    
    // Update state of "Add to Queue" buttons
    updateQueueButtons() {
        const queuedModels = this.game.trainingQueue.queue;
        
        document.querySelectorAll('.btn-add-queue').forEach(btn => {
            const modelId = btn.dataset.modelId;
            const isQueued = queuedModels.includes(modelId);
            const isFull = this.game.trainingQueue.isFull();
            
            if (isQueued) {
                btn.textContent = '✓ In Queue';
                btn.disabled = true;
                btn.classList.add('in-queue');
            } else if (isFull) {
                btn.textContent = '📋 Queue Full';
                btn.disabled = true;
                btn.classList.remove('in-queue');
            } else {
                btn.textContent = '📋 Add to Queue';
                btn.disabled = false;
                btn.classList.remove('in-queue');
            }
        });
    }
}