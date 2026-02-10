// Hotkeys System
// Manages keyboard shortcuts and key bindings

import { showToast } from '../ui/ui-render.js';

export class HotkeySystem {
    constructor(game) {
        this.game = game;
        this.enabled = true;
        this.bindings = this.getDefaultBindings();
        this.activeModifiers = new Set();
        this.pressedKeys = new Set();
        this.initialized = false;
    }
    
    /**
     * Get default key bindings
     */
    getDefaultBindings() {
        return {
            // Tab Navigation
            'tab_infrastructure': { key: '1', ctrl: false, shift: false, alt: false, description: 'Infrastructure Tab' },
            'tab_training': { key: '2', ctrl: false, shift: false, alt: false, description: 'Training Tab' },
            'tab_research': { key: '3', ctrl: false, shift: false, alt: false, description: 'Research Tab' },
            'tab_deployment': { key: '4', ctrl: false, shift: false, alt: false, description: 'Deployment Tab' },
            'tab_achievements': { key: '5', ctrl: false, shift: false, alt: false, description: 'Achievements Tab' },
            'tab_statistics': { key: '6', ctrl: false, shift: false, alt: false, description: 'Statistics Tab' },
            
            // Actions
            'collect_data': { key: ' ', ctrl: false, shift: false, alt: false, description: 'Collect Data' },
            'save_game': { key: 's', ctrl: false, shift: false, alt: false, description: 'Save Game' },
            'open_queue': { key: 'q', ctrl: false, shift: false, alt: false, description: 'Toggle Training Queue' },
            'open_settings': { key: 'e', ctrl: false, shift: false, alt: false, description: 'Open Settings' },
            'toggle_training': { key: 't', ctrl: false, shift: false, alt: false, description: 'Start/Stop Training' },
            
            // Modals
            'close_modal': { key: 'Escape', ctrl: false, shift: false, alt: false, description: 'Close Modal/Cancel' },
            'show_help': { key: '?', ctrl: false, shift: false, alt: false, description: 'Show Hotkey Help' },
            
            // Export/Import
            'export_save': { key: 'e', ctrl: true, shift: false, alt: false, description: 'Export Save' },
            'import_save': { key: 'i', ctrl: true, shift: false, alt: false, description: 'Import Save' }
        };
    }
    
    /**
     * Initialize hotkey system
     */
    init() {
        if (this.initialized) return;
        
        // Add keyboard event listeners
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Track modifier keys
        window.addEventListener('blur', () => this.clearModifiers());
        
        this.initialized = true;
        console.log('⌨️ Hotkey system initialized');
    }
    
    /**
     * Handle key down event
     */
    handleKeyDown(e) {
        // Skip if hotkeys are disabled
        if (!this.enabled) return;
        
        // Skip if user is typing in an input field
        if (this.isInputActive()) return;
        
        // Track modifier keys
        if (e.key === 'Control' || e.key === 'Meta') this.activeModifiers.add('ctrl');
        if (e.key === 'Shift') this.activeModifiers.add('shift');
        if (e.key === 'Alt') this.activeModifiers.add('alt');
        
        // Track pressed key
        this.pressedKeys.add(e.key.toLowerCase());
        
        // Check for hotkey matches
        const action = this.findMatchingAction(e);
        if (action) {
            e.preventDefault();
            this.executeAction(action);
        }
    }
    
    /**
     * Handle key up event
     */
    handleKeyUp(e) {
        // Clear modifier keys
        if (e.key === 'Control' || e.key === 'Meta') this.activeModifiers.delete('ctrl');
        if (e.key === 'Shift') this.activeModifiers.delete('shift');
        if (e.key === 'Alt') this.activeModifiers.delete('alt');
        
        // Clear pressed key
        this.pressedKeys.delete(e.key.toLowerCase());
    }
    
    /**
     * Clear all modifier states
     */
    clearModifiers() {
        this.activeModifiers.clear();
        this.pressedKeys.clear();
    }
    
    /**
     * Check if an input field is currently active
     */
    isInputActive() {
        const activeElement = document.activeElement;
        if (!activeElement) return false;
        
        const tagName = activeElement.tagName.toLowerCase();
        return tagName === 'input' || 
               tagName === 'textarea' || 
               tagName === 'select' ||
               activeElement.isContentEditable;
    }
    
    /**
     * Find matching action for key event
     */
    findMatchingAction(e) {
        const key = e.key.toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;
        
        for (const [action, binding] of Object.entries(this.bindings)) {
            if (binding.key.toLowerCase() === key &&
                binding.ctrl === ctrl &&
                binding.shift === shift &&
                binding.alt === alt) {
                return action;
            }
        }
        
        return null;
    }
    
    /**
     * Execute a hotkey action
     */
    executeAction(action) {
        console.log(`⌨️ Hotkey: ${action}`);
        
        switch (action) {
            // Tab Navigation
            case 'tab_infrastructure':
                this.switchTab('infrastructure');
                break;
            case 'tab_training':
                this.switchTab('training');
                break;
            case 'tab_research':
                this.switchTab('research');
                break;
            case 'tab_deployment':
                this.switchTab('deployment');
                break;
            case 'tab_achievements':
                this.switchTab('achievements');
                break;
            case 'tab_statistics':
                this.switchTab('statistics');
                break;
            
            // Actions
            case 'collect_data':
                this.collectData();
                break;
            case 'save_game':
                this.saveGame();
                break;
            case 'open_queue':
                this.toggleQueue();
                break;
            case 'open_settings':
                this.openSettings();
                break;
            case 'toggle_training':
                this.toggleTraining();
                break;
            
            // Modals
            case 'close_modal':
                this.closeModal();
                break;
            case 'show_help':
                this.showHelp();
                break;
            
            // Export/Import
            case 'export_save':
                this.exportSave();
                break;
            case 'import_save':
                this.importSave();
                break;
            
            default:
                console.warn(`Unknown hotkey action: ${action}`);
        }
    }
    
    /**
     * Switch to a different tab
     */
    switchTab(tabName) {
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) {
            tabBtn.click();
            showToast(`Switched to ${tabName.charAt(0).toUpperCase() + tabName.slice(1)} tab`, 'info', 1000);
        }
    }
    
    /**
     * Collect data manually
     */
    collectData() {
        const collectBtn = document.getElementById('btn-collect');
        if (collectBtn && !collectBtn.disabled) {
            collectBtn.click();
        }
    }
    
    /**
     * Save game
     */
    saveGame() {
        const saveBtn = document.getElementById('btn-save');
        if (saveBtn) {
            saveBtn.click();
        }
    }
    
    /**
     * Toggle training queue
     */
    toggleQueue() {
        if (window.queueUI) {
            window.queueUI.toggle();
        }
    }
    
    /**
     * Open settings modal
     */
    openSettings() {
        if (window.settingsUI) {
            window.settingsUI.open();
        }
    }
    
    /**
     * Toggle training (start/stop)
     */
    toggleTraining() {
        if (this.game.currentTraining) {
            // Stop current training
            const stopBtn = document.getElementById('btn-stop-training');
            if (stopBtn) {
                stopBtn.click();
            }
        } else {
            // Switch to training tab
            this.switchTab('training');
            showToast('Select a model to start training', 'info', 2000);
        }
    }
    
    /**
     * Close active modal
     */
    closeModal() {
        // Find active modal
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const closeBtn = activeModal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.click();
            } else {
                activeModal.classList.remove('active');
            }
        }
    }
    
    /**
     * Show hotkey help overlay
     */
    showHelp() {
        this.createHelpModal();
    }
    
    /**
     * Export save
     */
    exportSave() {
        const exportBtn = document.getElementById('btn-export');
        if (exportBtn) {
            exportBtn.click();
        }
    }
    
    /**
     * Import save
     */
    importSave() {
        const importBtn = document.getElementById('btn-import');
        if (importBtn) {
            importBtn.click();
        }
    }
    
    /**
     * Create help modal with all hotkeys
     */
    createHelpModal() {
        // Remove existing help modal if any
        const existing = document.getElementById('hotkey-help-modal');
        if (existing) {
            existing.remove();
            return; // Toggle off
        }
        
        const modal = document.createElement('div');
        modal.id = 'hotkey-help-modal';
        modal.className = 'modal active';
        
        // Group bindings by category
        const categories = {
            'Navigation': ['tab_infrastructure', 'tab_training', 'tab_research', 'tab_deployment', 'tab_achievements', 'tab_statistics'],
            'Actions': ['collect_data', 'save_game', 'open_queue', 'open_settings', 'toggle_training'],
            'System': ['close_modal', 'show_help', 'export_save', 'import_save']
        };
        
        let contentHTML = '<div class="hotkey-categories">';
        
        for (const [category, actions] of Object.entries(categories)) {
            contentHTML += `
                <div class="hotkey-category">
                    <h3>${category}</h3>
                    <div class="hotkey-list">
            `;
            
            for (const action of actions) {
                const binding = this.bindings[action];
                if (!binding) continue;
                
                const keyDisplay = this.formatKeyDisplay(binding);
                contentHTML += `
                    <div class="hotkey-item">
                        <span class="hotkey-keys">${keyDisplay}</span>
                        <span class="hotkey-description">${binding.description}</span>
                    </div>
                `;
            }
            
            contentHTML += '</div></div>';
        }
        
        contentHTML += '</div>';
        
        modal.innerHTML = `
            <div class="modal-content hotkey-help-content">
                <div class="modal-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <button class="modal-close" onclick="document.getElementById('hotkey-help-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${contentHTML}
                </div>
                <div class="modal-footer">
                    <p class="hotkey-hint">Press <kbd>?</kbd> or <kbd>Esc</kbd> to close</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    /**
     * Format key display with modifier keys
     */
    formatKeyDisplay(binding) {
        const keys = [];
        
        if (binding.ctrl) keys.push('<kbd>Ctrl</kbd>');
        if (binding.shift) keys.push('<kbd>Shift</kbd>');
        if (binding.alt) keys.push('<kbd>Alt</kbd>');
        
        // Format main key
        let mainKey = binding.key;
        if (mainKey === ' ') mainKey = 'Space';
        if (mainKey === 'Escape') mainKey = 'Esc';
        
        keys.push(`<kbd>${mainKey}</kbd>`);
        
        return keys.join(' + ');
    }
    
    /**
     * Enable hotkeys
     */
    enable() {
        this.enabled = true;
        console.log('⌨️ Hotkeys enabled');
    }
    
    /**
     * Disable hotkeys
     */
    disable() {
        this.enabled = false;
        this.clearModifiers();
        console.log('⌨️ Hotkeys disabled');
    }
    
    /**
     * Check if hotkeys are enabled
     */
    isEnabled() {
        return this.enabled;
    }
    
    /**
     * Get all bindings
     */
    getBindings() {
        return this.bindings;
    }
    
    /**
     * Update a key binding
     */
    setBinding(action, key, ctrl = false, shift = false, alt = false) {
        if (!this.bindings[action]) {
            console.warn(`Unknown hotkey action: ${action}`);
            return false;
        }
        
        this.bindings[action].key = key;
        this.bindings[action].ctrl = ctrl;
        this.bindings[action].shift = shift;
        this.bindings[action].alt = alt;
        
        return true;
    }
    
    /**
     * Reset all bindings to defaults
     */
    resetBindings() {
        this.bindings = this.getDefaultBindings();
        console.log('⌨️ Hotkey bindings reset to defaults');
    }
    
    /**
     * Save bindings to settings
     */
    save() {
        return {
            enabled: this.enabled,
            bindings: this.bindings
        };
    }
    
    /**
     * Load bindings from settings
     */
    load(data) {
        if (!data) return;
        
        if (data.enabled !== undefined) {
            this.enabled = data.enabled;
        }
        
        if (data.bindings) {
            // Merge with defaults to handle new hotkeys
            this.bindings = { ...this.getDefaultBindings(), ...data.bindings };
        }
    }
}
