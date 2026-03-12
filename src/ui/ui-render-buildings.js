// Buildings Rendering

import { getBuildingCost } from '../modules/buildings.js';
import { buildings } from '../modules/buildings.js';
import { formatNumber } from '../utils/format.js';

export function renderBuildings(gameState) {
    const tiers = {
        1: document.getElementById('buildings-tier1'),
        2: document.getElementById('buildings-tier2'),
        3: document.getElementById('buildings-tier3')
    };
    
    for (const [id, building] of Object.entries(gameState.buildings)) {
        if (!building.unlocked) continue;
        
        const tier = building.tier;
        const container = tiers[tier];
        if (!container) continue;
        
        let card = document.getElementById(`building-${id}`);
        if (!card) {
            // Use current building definition for description
            const buildingDef = buildings[id];
            card = createBuildingCard(id, buildingDef);
            container.appendChild(card);
        }
        
        updateBuildingCard(card, building, gameState);
    }
}

function createBuildingCard(id, building) {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.id = `building-${id}`;
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${building.icon} ${building.name}</div>
            <div class="card-count" id="building-count-${id}">0</div>
        </div>
        <div class="card-description">${building.description}</div>
        <div class="card-stats" id="building-stats-${id}"></div>
        <div class="card-cost" id="building-cost-${id}"></div>
        <button class="card-button" id="btn-building-${id}">Build</button>
    `;
    
    // Add click handler - NOW USES BULK PURCHASE UI
    const button = card.querySelector(`#btn-building-${id}`);
    button.addEventListener('click', () => {
        if (!window.game || !window.bulkPurchaseUI) return;
        
        // Use bulkPurchaseUI handler which respects modifier keys
        const result = window.bulkPurchaseUI.handleBuildingPurchase(id);
        
        // Success toast is handled by bulkPurchaseUI
    });
    
    return card;
}

function updateBuildingCard(card, building, gameState) {
    const id = building.id;
    
    // Update count
    document.getElementById(`building-count-${id}`).textContent = building.count;
    
    // Update stats (production)
    const statsDiv = document.getElementById(`building-stats-${id}`);
    if (building.production && Object.keys(building.production).length > 0) {
        statsDiv.innerHTML = '';
        for (const [resourceId, amount] of Object.entries(building.production)) {
            const resource = gameState.resources[resourceId];
            const stat = document.createElement('div');
            stat.className = 'card-stat';
            stat.innerHTML = `
                <span>Produces:</span>
                <span>${resource.icon} +${formatNumber(amount, 2)}${resource.unit || ''}/s</span>
            `;
            statsDiv.appendChild(stat);
        }
    }
    
    // Update cost
    const cost = getBuildingCost(building);
    const costDiv = document.getElementById(`building-cost-${id}`);
    costDiv.innerHTML = '';
    
    for (const [resourceId, amount] of Object.entries(cost)) {
        const resource = gameState.resources[resourceId];
        const affordable = gameState.resources[resourceId].amount >= amount;
        
        const costItem = document.createElement('span');
        costItem.className = `cost-item ${affordable ? 'affordable' : 'unaffordable'}`;
        costItem.textContent = `${resource.icon} ${formatNumber(amount)}`;
        costDiv.appendChild(costItem);
    }
    
    // Update button state
    const button = document.getElementById(`btn-building-${id}`);
    const canAfford = gameState.canAfford(cost);
    button.disabled = !canAfford;
}