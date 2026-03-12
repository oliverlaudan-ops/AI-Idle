// Models Rendering

import { models } from '../modules/models.js';
import { formatNumber } from '../utils/format.js';
import { showToast } from './ui-render-notifications.js';

export function renderModels(gameState) {
    const categories = {
        'classification': document.getElementById('models-classification'),
        'vision': document.getElementById('models-vision'),
        'advanced': document.getElementById('models-advanced')
    };
    
    for (const [id, model] of Object.entries(gameState.models)) {
        if (!model.unlocked) continue;
        
        const container = categories[model.category];
        if (!container) continue;
        
        let card = document.getElementById(`model-${id}`);
        if (!card) {
            // Use current model definition for description
            const modelDef = models[id];
            card = createModelCard(id, modelDef);
            container.appendChild(card);
        }
        
        updateModelCard(card, model, gameState);
    }
}

function createModelCard(id, model) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.id = `model-${id}`;
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${model.icon} ${model.name}</div>
        </div>
        <div class="card-description">${model.description}</div>
        <div class="card-stats" id="model-stats-${id}"></div>
        <div class="card-cost" id="model-cost-${id}"></div>
        <button class="card-button" id="btn-model-${id}">Train Model</button>
    `;
    
    const button = card.querySelector(`#btn-model-${id}`);
    button.addEventListener('click', () => {
        if (window.game && window.game.startTraining(id)) {
            showToast(`Training ${model.name}!`, 'success');
        }
    });
    
    return card;
}

function updateModelCard(card, model, gameState) {
    const id = model.id;
    
    // Update stats
    const statsDiv = document.getElementById(`model-stats-${id}`);
    statsDiv.innerHTML = '';
    for (const [resourceId, amount] of Object.entries(model.production)) {
        const resource = gameState.resources[resourceId];
        const stat = document.createElement('div');
        stat.className = 'card-stat';
        stat.innerHTML = `
            <span>Generates:</span>
            <span>${resource.icon} +${formatNumber(amount, 2)}${resource.unit || ''}/s</span>
        `;
        statsDiv.appendChild(stat);
    }
    
    // Update requirements
    const costDiv = document.getElementById(`model-cost-${id}`);
    costDiv.innerHTML = '<strong>Requires:</strong><br>';
    
    for (const [resourceId, amount] of Object.entries(model.requirements)) {
        const resource = gameState.resources[resourceId];
        const hasEnough = gameState.resources[resourceId].amount >= amount;
        
        const costItem = document.createElement('span');
        costItem.className = `cost-item ${hasEnough ? 'affordable' : 'unaffordable'}`;
        costItem.textContent = `${resource.icon} ${formatNumber(amount)}`;
        costDiv.appendChild(costItem);
    }
    
    // Update button
    const button = document.getElementById(`btn-model-${id}`);
    const isTraining = gameState.currentTraining === id;
    button.textContent = isTraining ? 'Training...' : 'Train Model';
    button.disabled = isTraining || !canTrainModel(model, gameState);
}

function canTrainModel(model, gameState) {
    for (const [resourceId, amount] of Object.entries(model.requirements)) {
        if (gameState.resources[resourceId].amount < amount) {
            return false;
        }
    }
    return true;
}