// Statistics Rendering

import { formatNumber, formatTime } from '../utils/format.js';

export function renderStatistics(gameState) {
    // Update playtime
    const playtime = Math.floor((Date.now() - gameState.stats.startTime + gameState.stats.totalPlaytime) / 1000);
    const playtimeElement = document.getElementById('playtime');
    if (playtimeElement) {
        playtimeElement.textContent = formatTime(playtime);
    }
    
    // Update resources table
    const resourcesTable = document.getElementById('stats-resources');
    if (resourcesTable) {
        resourcesTable.innerHTML = `
            <tr><td>Total Data Generated</td><td>${formatNumber(gameState.stats.totalDataGenerated)}</td></tr>
            <tr><td>Total Accuracy</td><td>${formatNumber(gameState.stats.totalAccuracy)}</td></tr>
            <tr><td>Max Accuracy</td><td>${formatNumber(gameState.stats.maxAccuracy)}</td></tr>
            <tr><td>Total Compute</td><td>${formatNumber(gameState.stats.totalCompute)} TFLOPS</td></tr>
        `;
    }
    
    // Update infrastructure table
    const infraTable = document.getElementById('stats-infrastructure');
    if (infraTable) {
        infraTable.innerHTML = `
            <tr><td>Total Buildings</td><td>${gameState.stats.totalBuildings}</td></tr>
        `;
        for (const [id, building] of Object.entries(gameState.buildings)) {
            if (building.count > 0) {
                infraTable.innerHTML += `<tr><td>${building.name}</td><td>${building.count}</td></tr>`;
            }
        }
    }
    
    // Update training table
    const trainingTable = document.getElementById('stats-training');
    if (trainingTable) {
        trainingTable.innerHTML = `
            <tr><td>Models Trained</td><td>${gameState.stats.modelsTrained}</td></tr>
            <tr><td>Unique Models</td><td>${gameState.stats.uniqueModelsTrained}</td></tr>
            <tr><td>Research Completed</td><td>${gameState.stats.completedResearch.length}</td></tr>
            <tr><td>Deployments</td><td>${gameState.stats.deployments}</td></tr>
        `;
    }
    
    // Update game info table
    const gameInfoTable = document.getElementById('stats-game');
    if (gameInfoTable) {
        gameInfoTable.innerHTML = `
            <tr><td>Playtime</td><td>${formatTime(playtime)}</td></tr>
            <tr><td>Game Version</td><td>0.2.0</td></tr>
            <tr><td>Deployments</td><td>${gameState.deployment.deployments}</td></tr>
            <tr><td>Tokens</td><td>${gameState.deployment.tokens}</td></tr>
        `;
    }
}