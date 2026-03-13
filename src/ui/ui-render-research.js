// Research Rendering

import { research } from '../systems/research/definitions.js';
import { formatNumber } from '../utils/format.js';
import { showToast } from './ui-render-notifications.js';

export function renderResearch(gameState) {
    const categories = {
        'optimizers': document.getElementById('research-optimizers'),
        'activations': document.getElementById('research-activations'),
        'architectures': document.getElementById('research-architectures'),
        'regularization': document.getElementById('research-regularization'),
        'hardware': document.getElementById('research-hardware'),
        'data': document.getElementById('research-data'),
        'meta': document.getElementById('research-meta'),
        'safety': document.getElementById('research-safety')
    };
    
    for (const [id, researchItem] of Object.entries(gameState.research)) {
        if (!researchItem.unlocked) continue;
        
        const container = categories[researchItem.category];
        if (!container) continue;
        
        let card = document.getElementById(`research-${id}`);
        if (!card) {
            // Use current research definition for description
            const researchDef = research[id];
            card = createResearchCard(id, researchDef);
            container.appendChild(card);
        }
        
        updateResearchCard(card, researchItem, gameState);
    }
}

function createResearchCard(id, research) {
    const card = document.createElement('div');
    card.className = 'research-card';
    card.id = `research-${id}`;
    // Add educational tooltip - show realConcept on hover
    card.dataset.tooltip = research.realConcept || 'No description available';
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${research.icon} ${research.name}</div>
        </div>
        <div class="card-description">${research.description}</div>
        <div class="card-cost" id="research-cost-${id}"></div>
        <button class="card-button" id="btn-research-${id}">Research</button>
    `;
    
    const button = card.querySelector(`#btn-research-${id}`);
    button.addEventListener('click', () => {
        if (window.game && window.game.performResearch(id)) {
            showToast(`Researched ${research.name}!`, 'success');
        }
    });
    
    return card;
}

function updateResearchCard(card, research, gameState) {
    const id = research.id;
    
    if (research.researched) {
        card.style.opacity = '0.6';
        card.style.borderColor = 'var(--accent-success)';
    }
    
    // Update cost - NOW DISPLAYS RESEARCH POINTS CORRECTLY
    const costDiv = document.getElementById(`research-cost-${id}`);
    costDiv.innerHTML = '';
    
    for (const [resourceId, amount] of Object.entries(research.cost)) {
        // Research always costs 'research' resource now
        const resource = gameState.resources.research;
        const hasEnough = gameState.resources.research.amount >= amount;
        
        const costItem = document.createElement('span');
        costItem.className = `cost-item ${hasEnough ? 'affordable' : 'unaffordable'}`;
        costItem.textContent = `${resource.icon} ${formatNumber(amount)}`;
        costDiv.appendChild(costItem);
    }
    
    // Update button
    const button = document.getElementById(`btn-research-${id}`);
    button.disabled = research.researched || !gameState.canAfford(research.cost);
    button.textContent = research.researched ? '✓ Completed' : 'Research';
}