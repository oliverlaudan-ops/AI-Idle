// Bulk Purchase UI Component
// Handles the visual interface for bulk building purchases

import { formatNumber } from './ui-render.js';

export class BulkPurchaseUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.modeButtons = {};
        this.isShiftPressed = false;
        this.isCtrlPressed = false;
        this.initialized = false;
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
        const infrastructureTab = document.getElementById('infrastructure-tab');
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
            
            // Insert at the top of infrastructure tab, before buildings
            const firstChild = infrastructureTab.firstChild;
            infrastructureTab.insertBefore(modeSelector, firstChild);
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
            if (e.key === 'Shift') this.isShiftPressed = true;
            if (e.key === 'Control' || e.key === 'Meta') this.isCtrlPressed = true;
            this.updateModifierDisplay();
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') this.isShiftPressed = false;
            if (e.key === 'Control' || e.key === 'Meta') this.isCtrlPressed = false;
            this.updateModifierDisplay();
        });
        
        // Handle window blur (user switches tabs)
        window.addEventListener('blur', () => {
            this.isShiftPressed = false;
            this.isCtrlPressed = false;
            this.updateModifierDisplay();
        });
    }
    
    /**
     * Update the visual display based on modifier keys
     */
    updateModifierDisplay() {
        const selector = document.getElementById('bulk-purchase-selector');
        if (!selector) return;
        
        // Remove all modifier classes
        selector.classList.remove('shift-active', 'ctrl-active', 'both-active');
        
        // Add appropriate class
        if (this.isShiftPressed && this.isCtrlPressed) {
            selector.classList.add('both-active');
        } else if (this.isShiftPressed) {
            selector.classList.add('shift-active');
        } else if (this.isCtrlPressed) {
            selector.classList.add('ctrl-active');
        }
    }
    
    /**
     * Set the current purchase mode
     */
    setMode(mode) {
        this.gameState.bulkPurchase.setMode(mode);
        this.updateModeButtons();
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
        
        // Use selected mode
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
        
        // Find or create preview element
        let previewEl = card.querySelector('.bulk-cost-preview');
        if (!previewEl) {
            previewEl = document.createElement('div');
            previewEl.className = 'bulk-cost-preview';
            card.appendChild(previewEl);
        }
        
        // Build cost preview HTML
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
            // Show success toast
            const building = this.gameState.buildings[buildingId];
            const message = result.amount > 1 
                ? `Built ${result.amount}x ${building.name}!`
                : `Built ${building.name}!`;
            
            if (window.showToast) {
                window.showToast(message, 'success');
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Update UI every frame
     */
    update() {
        if (!this.initialized) return;
        
        // Update all building buttons based on current state
        this.updateAllBuildingButtons();
    }
    
    /**
     * Cleanup
     */
    destroy() {
        // Remove keyboard listeners if needed
        this.initialized = false;
    }
}
