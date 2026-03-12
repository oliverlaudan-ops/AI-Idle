// Training Status Rendering

import { models } from '../modules/models.js';
import { TrainingAnimations } from './training-animations.js';
import { formatNumber, formatTrainingTime } from '../utils/format.js';
import { showToast } from './ui-render-notifications.js';

// Training animations instance
let trainingAnimations = null;

// Enhanced: Render Training Status with Canvas Animations
export function renderTrainingStatus(gameState) {
    const noTrainingMsg = document.getElementById('no-training-msg');
    const activeTraining = document.getElementById('active-training');
    const stopButton = document.getElementById('btn-stop-training');
    const canvas = document.getElementById('training-canvas');
    
    // Safety check for elements
    if (!noTrainingMsg || !activeTraining || !stopButton) {
        return;
    }
    
    // Check if training is active AND training state exists
    if (!gameState.currentTraining || !gameState.training) {
        // Show idle state
        noTrainingMsg.style.display = 'block';
        activeTraining.style.display = 'none';
        stopButton.style.display = 'none';
        
        // Stop animations
        if (trainingAnimations) {
            trainingAnimations.stopTraining();
            trainingAnimations = null;
        }
        return;
    }
    
    // Show active training
    noTrainingMsg.style.display = 'none';
    activeTraining.style.display = 'block';
    stopButton.style.display = 'block';
    
    const model = gameState.models[gameState.currentTraining];
    const modelDef = models[gameState.currentTraining];
    const training = gameState.training;
    
    // Safety checks
    if (!model || !modelDef || !training) {
        return;
    }
    
    // Initialize training animations if not already done
    if (!trainingAnimations && canvas) {
        trainingAnimations = new TrainingAnimations();
        const canvasInitialized = trainingAnimations.initCanvas('training-canvas');
        if (canvasInitialized) {
            trainingAnimations.startTraining(modelDef);
        }
    }
    
    // Update animations with current training state
    if (trainingAnimations && canvas) {
        const progress = (training.elapsedTime / training.duration) * 100;
        const currentAccuracy = gameState.resources.accuracy.amount;
        trainingAnimations.updateProgress(progress, currentAccuracy);
    }
    
    // Update model info
    const trainingIcon = document.getElementById('training-icon');
    const trainingModelName = document.getElementById('training-model-name');
    const trainingModelCategory = document.getElementById('training-model-category');
    
    if (trainingIcon) trainingIcon.textContent = modelDef.icon || '🧠';
    if (trainingModelName) trainingModelName.textContent = modelDef.name;
    if (trainingModelCategory) trainingModelCategory.textContent = model.category;
    
    // Calculate progress
    const progress = Math.min((training.elapsedTime / training.duration) * 100, 100);
    const remainingTime = Math.max(0, training.duration - training.elapsedTime);
    
    // Update progress bar
    const progressFill = document.getElementById('training-progress-fill');
    const progressText = document.getElementById('training-progress-text');
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress.toFixed(1)}%`;
    
    // Update time remaining
    const timeRemaining = document.getElementById('training-time-remaining');
    if (timeRemaining) timeRemaining.textContent = formatTrainingTime(remainingTime);
    
    // Calculate training stats
    const accuracyGain = training.accuracyPerSecond || 0;
    const trainingSpeed = gameState.multipliers?.trainingSpeed || 1.0;
    const currentEpoch = Math.floor((training.elapsedTime / training.duration) * 100);
    
    // Update stats
    const accuracyGainEl = document.getElementById('training-accuracy-gain');
    const trainingSpeedEl = document.getElementById('training-speed');
    const trainingEpochsEl = document.getElementById('training-epochs');
    
    if (accuracyGainEl) accuracyGainEl.textContent = `+${formatNumber(accuracyGain, 2)}/s`;
    if (trainingSpeedEl) trainingSpeedEl.textContent = `${trainingSpeed.toFixed(1)}x`;
    if (trainingEpochsEl) trainingEpochsEl.textContent = `${currentEpoch} / 100`;
    
    // Setup stop button handler (only once)
    if (!stopButton.hasAttribute('data-initialized')) {
        stopButton.setAttribute('data-initialized', 'true');
        stopButton.addEventListener('click', () => {
            if (window.game && confirm('Stop training? Progress will be lost.')) {
                window.game.stopTraining();
                showToast('Training stopped', 'warning');
            }
        });
    }
}