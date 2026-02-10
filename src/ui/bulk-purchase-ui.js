// Bulk Purchase UI Component - PERFORMANCE OPTIMIZED
// Handles the visual interface for bulk building purchases

import { formatNumber } from './ui-render.js';

export class BulkPurchaseUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.modeButtons = {};
        this.isShiftPressed = false;
        this.isCtrlPressed = false;
        this.initialized = false;
        
        // PERFORMANCE: Track if UI needs update
        this.isDirty = true;
        this.lastResourceSnapshot = null;
        this.updateThrottle = 0;
        this.THROTTLE_INTERVAL = 0.5; // Only update UI every 500ms max
    }
    
    /**
     * Initialize the bulk purchase UI
     */
    init() {
        if (this.initialized) return;
        
        // Create mode selector container
        this.createModeSelector();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Update initial button states
        this.updateModeButtons();
        
        this.initialized = true;
        console.log('✅ Bulk Purchase UI initialized');
    }
    
    /**
     * Create the mode selector UI element
     */
    createModeSelector() {
        // Find or create container in the infrastructure tab
        const infrastructureTab = document.getElementById('tab-infrastructure');
        if (!infrastructureTab) {
            console.warn('Infrastructure tab not found');
            return;
        }
        
        // Create mode selector if it doesn't exist
        let modeSelector = document.getElementById('bulk-purchase-selector');
        if (!modeSelector) {
            modeSelector = document.createElement('div');
            modeSelector.id = 'bulk-purchase-selector';
            modeSelector.className = 'bulk-purchase-selector';
            modeSelector.innerHTML = `
                <div class="bulk-purchase-header">
                    <span class="bulk-purchase-label">🛠️ Bulk Buy:</span>
                    <div class="bulk-purchase-modes">
                        <button class="bulk-mode-btn" data-mode="1">x1</button>
                        <button class="bulk-mode-btn" data-mode="10">x10</button>
                        <button class="bulk-mode-btn" data-mode="100">x100</button>
                        <button class="bulk-mode-btn" data-mode="max">Max</button>
                    </div>
                </div>
                <div class="bulk-purchase-hint">
                    <span class="hint-text">
                        <kbd>Shift</kbd> = x10 · 
                        <kbd>Ctrl</kbd> = x100 · 
                        <kbd>Ctrl+Shift</kbd> = Max
                    </span>
                </div>
            `;
            
            // Insert after the tab header, before the manual collection button
            const tabHeader = infrastructureTab.querySelector('.tab-header');
            if (tabHeader && tabHeader.nextSibling) {
                infrastructureTab.insertBefore(modeSelector, tabHeader.nextSibling);
            } else {
                infrastructureTab.insertBefore(modeSelector, infrastructureTab.firstChild);
            }
        }
        
        // Setup button click handlers
        const buttons = modeSelector.querySelectorAll('.bulk-mode-btn');
        buttons.forEach(button => {
            const mode = button.getAttribute('data-mode');
            this.modeButtons[mode] = button;
            
            button.addEventListener('click', () => {
                this.setMode(mode === 'max' ? 'max' : parseInt(mode));
            });
        });
    }
    
    /**
     * Setup keyboard shortcut listeners
     */
    setupKeyboardShortcuts() {
        // Track modifier keys
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                this.isShiftPressed = true;
                this.markDirty(); // Mode changed
            }
            if (e.key === 'Control' || e.key === 'Meta') {
                this.isCtrlPressed = true;
                this.markDirty(); // Mode changed
            }
            this.updateModifierDisplay();
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                this.isShiftPressed = false;
                this.markDirty(); // Mode changed
            }
            if (e.key === 'Control' || e.key === 'Meta') {
                this.isCtrlPressed = false;
                this.markDirty(); // Mode changed
            }
            this.updateModifierDisplay();
        });
        
        // Handle window blur
        window.addEventListener('blur', () => {
            this.isShiftPressed = false;
            this.isCtrlPressed = false;
            this.markDirty();
            this.updateModifierDisplay();
        });
    }
    
    /**
     * Update the visual display based on modifier keys
     */
    updateModifierDisplay() {
        const selector = document.getElementById('bulk-purchase-selector');
        if (!selector) return;
        
        selector.classList.remove('shift-active', 'ctrl-active', 'both-active');
        
        if (this.isShiftPressed && this.isCtrlPressed) {
            selector.classList.add('both-active');
        } else if (this.isShiftPressed) {
            selector.classList.add('shift-active');
        } else if (this.isCtrlPressed) {
            selector.classList.add('ctrl-active');
        }
    }
    
    /**
     * Mark UI as dirty (needs update)
     */
    markDirty() {
        this.isDirty = true;
    }
    
    /**
     * Check if resources changed significantly
     */
    hasResourcesChanged() {
        if (!this.lastResourceSnapshot) return true;
        
        // Only check key resources that affect building affordability
        const current = {
            data: this.gameState.resources.data.amount,
            compute: this.gameState.resources.compute.amount,
            accuracy: this.gameState.resources.accuracy.amount
        };
        
        // Check if any resource changed by more than 1% or crossed affordability threshold
        for (const [key, value] of Object.entries(current)) {
            const old = this.lastResourceSnapshot[key];
            const percentChange = Math.abs((value - old) / Math.max(old, 1));
            if (percentChange > 0.01) { // 1% change
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Save current resource snapshot
     */
    saveResourceSnapshot() {
        this.lastResourceSnapshot = {
            data: this.gameState.resources.data.amount,
            compute: this.gameState.resources.compute.amount,
            accuracy: this.gameState.resources.accuracy.amount
        };
    }
    
    /**
     * Set the current purchase mode
     */
    setMode(mode) {
        this.gameState.bulkPurchase.setMode(mode);
        this.updateModeButtons();
        this.markDirty(); // Force update
        this.updateAllBuildingButtons();
    }
    
    /**
     * Update mode button states
     */
    updateModeButtons() {
        const currentMode = this.gameState.bulkPurchase.getMode();
        
        for (const [mode, button] of Object.entries(this.modeButtons)) {
            const modeValue = mode === 'max' ? 'max' : parseInt(mode);
            if (modeValue === currentMode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }
    
    /**
     * Get the effective purchase amount based on keyboard modifiers
     */
    getEffectiveMode() {
        // Keyboard shortcuts override button selection
        if (this.isCtrlPressed && this.isShiftPressed) {
            return 'max';
        } else if (this.isCtrlPressed) {
            return 100;
        } else if (this.isShiftPressed) {
            return 10;
        }
        
        return this.gameState.bulkPurchase.getMode();
    }
    
    /**
     * Update button text with preview information
     */
    updateBuildingButton(buildingId) {
        const button = document.getElementById(`btn-building-${buildingId}`);
        if (!button) return;
        
        const building = this.gameState.buildings[buildingId];
        if (!building || !building.unlocked) return;
        
        const effectiveMode = this.getEffectiveMode();
        const preview = this.gameState.bulkPurchase.getPreview(buildingId, effectiveMode);
        
        // Update button text
        if (preview.amount > 1) {
            if (effectiveMode === 'max') {
                button.textContent = `Buy Max (${preview.amount})`;
            } else {
                button.textContent = `Buy x${preview.amount}`;
            }
        } else {
            button.textContent = 'Build';
        }
        
        // Update button state
        button.disabled = !preview.affordable || preview.amount === 0;
        
        // Add preview class for styling
        if (preview.amount > 1) {
            button.classList.add('bulk-mode');
        } else {
            button.classList.remove('bulk-mode');
        }
    }
    
    /**
     * Update all building buttons
     */
    updateAllBuildingButtons() {
        for (const buildingId of Object.keys(this.gameState.buildings)) {
            this.updateBuildingButton(buildingId);
        }
        this.saveResourceSnapshot();
    }
    
    /**
     * Add cost preview tooltip to building card
     */
    addCostPreview(buildingId) {
        const card = document.getElementById(`building-${buildingId}`);
        if (!card) return;
        
        const effectiveMode = this.getEffectiveMode();
        const preview = this.gameState.bulkPurchase.getPreview(buildingId, effectiveMode);
        
        if (preview.amount <= 1) return;
        
        let previewEl = card.querySelector('.bulk-cost-preview');
        if (!previewEl) {
            previewEl = document.createElement('div');
            previewEl.className = 'bulk-cost-preview';
            card.appendChild(previewEl);
        }
        
        let costHtml = '<div class="bulk-preview-header">Total Cost:</div>';
        for (const [resourceId, amount] of Object.entries(preview.cost)) {
            const resource = this.gameState.resources[resourceId];
            const hasEnough = this.gameState.resources[resourceId].amount >= amount;
            costHtml += `
                <span class="cost-item ${hasEnough ? 'affordable' : 'unaffordable'}">
                    ${resource.icon} ${formatNumber(amount)}
                </span>
            `;
        }
        
        if (preview.maxAffordable < preview.amount) {
            costHtml += `<div class="bulk-preview-note">Max affordable: ${preview.maxAffordable}</div>`;
        }
        
        previewEl.innerHTML = costHtml;
        previewEl.style.display = 'block';
    }
    
    /**
     * Remove cost preview from building card
     */
    removeCostPreview(buildingId) {
        const card = document.getElementById(`building-${buildingId}`);
        if (!card) return;
        
        const previewEl = card.querySelector('.bulk-cost-preview');
        if (previewEl) {
            previewEl.style.display = 'none';
        }
    }
    
    /**
     * Handle building button click with bulk purchase
     */
    handleBuildingPurchase(buildingId) {
        const effectiveMode = this.getEffectiveMode();
        const result = this.gameState.bulkPurchase.purchase(buildingId, effectiveMode);
        
        if (result.success) {
            const building = this.gameState.buildings[buildingId];
            const message = result.amount > 1 
                ? `Built ${result.amount}x ${building.name}!`
                : `Built ${building.name}!`;
            
            if (window.showToast) {
                window.showToast(message, 'success');
            }
            
            // Force update after purchase
            this.markDirty();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Update UI - PERFORMANCE OPTIMIZED
     * Only updates when resources changed or mode changed
     */
    update(deltaTime = 0.1) {
        if (!this.initialized) return;
        
        // Throttle updates
        this.updateThrottle += deltaTime;
        if (this.updateThrottle < this.THROTTLE_INTERVAL) {
            return; // Skip this update
        }
        this.updateThrottle = 0;
        
        // Only update if something changed
        if (this.isDirty || this.hasResourcesChanged()) {
            this.updateAllBuildingButtons();
            this.isDirty = false;
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.initialized = false;
    }
}
