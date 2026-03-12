// Stats Bar Rendering

import { formatNumber } from '../utils/format.js';

export function renderStatsBar(gameState) {
    // Data
    document.getElementById('data-amount').textContent = formatNumber(gameState.resources.data.amount);
    document.getElementById('data-rate').textContent = `(+${formatNumber(gameState.resources.data.perSecond)}/s)`;
    
    // Compute
    document.getElementById('compute-amount').textContent = formatNumber(gameState.resources.compute.amount, 1);
    document.getElementById('compute-rate').textContent = `(+${formatNumber(gameState.resources.compute.perSecond, 2)}/s)`;
    
    // Accuracy
    document.getElementById('accuracy-amount').textContent = formatNumber(gameState.resources.accuracy.amount, 2);
    document.getElementById('accuracy-rate').textContent = `(+${formatNumber(gameState.resources.accuracy.perSecond, 1)}/s)`;
    
    // Research
    document.getElementById('research-amount').textContent = formatNumber(gameState.resources.research.amount);
    document.getElementById('research-rate').textContent = `(+${formatNumber(gameState.resources.research.perSecond, 2)}/s)`;
}