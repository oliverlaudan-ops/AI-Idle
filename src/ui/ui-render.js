// UI Rendering Functions - Main Index File
// This file imports all rendering functions from modular sub-files
// and re-exports them for backwards compatibility

import { renderStatsBar } from './ui-render-stats.js';
import { renderBuildings } from './ui-render-buildings.js';
import { renderModels } from './ui-render-models.js';
import { renderTrainingStatus } from './ui-render-training.js';
import { renderResearch } from './ui-render-research.js';
import { renderAchievements } from './ui-render-achievements.js';
import { renderStatistics } from './ui-render-statistics.js';
import { showToast, showTrainingCompleteAnimation } from './ui-render-notifications.js';
import { formatNumber, formatTime } from '../utils/format.js';
import { safeExecute } from '../utils/error-boundary.js';

// Re-export all functions for backwards compatibility
export {
    renderStatsBar,
    renderBuildings,
    renderModels,
    renderTrainingStatus,
    renderResearch,
    renderAchievements,
    renderStatistics,
    showToast,
    showTrainingCompleteAnimation,
    formatNumber,
    formatTime
};

// Main render function that updates all UI elements
// Each render is wrapped individually to prevent one failure from blocking others
export function renderAll(gameState) {
    safeExecute(() => renderStatsBar(gameState), 'renderStatsBar', { log: true, notify: false });
    safeExecute(() => renderBuildings(gameState), 'renderBuildings', { log: true, notify: false });
    safeExecute(() => renderModels(gameState), 'renderModels', { log: true, notify: false });
    safeExecute(() => renderTrainingStatus(gameState), 'renderTrainingStatus', { log: true, notify: false });
    safeExecute(() => renderResearch(gameState), 'renderResearch', { log: true, notify: false });
    safeExecute(() => renderAchievements(gameState), 'renderAchievements', { log: true, notify: false });
    safeExecute(() => renderStatistics(gameState), 'renderStatistics', { log: true, notify: false });
}