// Settings UI Component
// Modal interface for game settings

import { showToast } from './ui-render.js';

export class SettingsUI {
    constructor(settings, game) {
        this.settings = settings;
        this.game = game;
        this.modal = null;
        this.initialized = false;
    }
    
    /**
     * Initialize the settings UI
     */
    init() {
        if (this.initialized) return;
        
        // Create settings modal
        this.createModal();
        
        // Setup settings button in footer
        this.setupSettingsButton();
        
        // Listen for settings changes
        this.settings.addListener((change) => this.onSettingChange(change));
        
        this.initialized = true;
        console.log('✅ Settings UI initialized');
    }
    
    /**
     * Create the settings modal
     */
    createModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content settings-modal-content">
                <div class="modal-header">
                    <h2>⚙️ Settings</h2>
                    <button class="modal-close" id="settings-close">×</button>
                </div>
                <div class="modal-body settings-body">
                    <div class="settings-tabs">
                        <button class="settings-tab-btn active" data-tab="notation">🔢 Notation</button>
                        <button class="settings-tab-btn" data-tab="performance">⚡ Performance</button>
                        <button class="settings-tab-btn" data-tab="notifications">🔔 Notifications</button>
                        <button class="settings-tab-btn" data-tab="visual">🎨 Visual</button>
                        <button class="settings-tab-btn" data-tab="gameplay">🎮 Gameplay</button>
                        <button class="settings-tab-btn" data-tab="accessibility">♿ Accessibility</button>
                    </div>
                    <div class="settings-content">
                        ${this.renderNotationTab()}
                        ${this.renderPerformanceTab()}
                        ${this.renderNotificationsTab()}
                        ${this.renderVisualTab()}
                        ${this.renderGameplayTab()}
                        ${this.renderAccessibilityTab()}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="settings-reset">Reset to Defaults</button>
                    <button class="btn-secondary" id="settings-export">Export Settings</button>
                    <button class="btn-secondary" id="settings-import">Import Settings</button>
                    <button class="btn-primary" id="settings-apply">Apply & Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        
        // Setup event handlers
        this.setupModalHandlers();
        this.setupTabHandlers();
        this.setupSettingHandlers();
    }
    
    /**
     * Render Notation settings tab
     */
    renderNotationTab() {
        const notation = this.settings.getCategory('notation');
        return `
            <div class="settings-tab-content active" data-tab="notation">
                <h3>Number Format</h3>
                <div class="setting-item">
                    <label>Notation Style</label>
                    <select class="setting-select" data-category="notation" data-key="style">
                        <option value="standard" ${notation.style === 'standard' ? 'selected' : ''}>Standard (1K, 1M, 1B)</option>
                        <option value="scientific" ${notation.style === 'scientific' ? 'selected' : ''}>Scientific (1e3, 1e6, 1e9)</option>
                        <option value="engineering" ${notation.style === 'engineering' ? 'selected' : ''}>Engineering (1.0K, 1.0M, 1.0G)</option>
                    </select>
                    <p class="setting-description">How large numbers are displayed</p>
                </div>
                <div class="setting-item">
                    <label>Decimal Places</label>
                    <input type="number" class="setting-input" data-category="notation" data-key="decimals" 
                           value="${notation.decimals}" min="0" max="4" />
                    <p class="setting-description">Number of decimal places to show</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Render Performance settings tab
     */
    renderPerformanceTab() {
        const perf = this.settings.getCategory('performance');
        return `
            <div class="settings-tab-content" data-tab="performance">
                <h3>Performance Options</h3>
                <div class="setting-item">
                    <label>Update Frequency</label>
                    <select class="setting-select" data-category="performance" data-key="updateFrequency">
                        <option value="100" ${perf.updateFrequency === 100 ? 'selected' : ''}>10 FPS (Balanced)</option>
                        <option value="50" ${perf.updateFrequency === 50 ? 'selected' : ''}>20 FPS (Smooth)</option>
                        <option value="33" ${perf.updateFrequency === 33 ? 'selected' : ''}>30 FPS (High)</option>
                    </select>
                    <p class="setting-description">How often the game updates (higher = smoother but more CPU)</p>
                </div>
                <div class="setting-item">
                    <label>Animation Quality</label>
                    <select class="setting-select" data-category="performance" data-key="animationQuality">
                        <option value="high" ${perf.animationQuality === 'high' ? 'selected' : ''}>High</option>
                        <option value="medium" ${perf.animationQuality === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="low" ${perf.animationQuality === 'low' ? 'selected' : ''}>Low</option>
                        <option value="off" ${perf.animationQuality === 'off' ? 'selected' : ''}>Off</option>
                    </select>
                    <p class="setting-description">Quality of visual animations</p>
                </div>
                <div class="setting-item">
                    <label>Particle Effects</label>
                    <input type="checkbox" class="setting-checkbox" data-category="performance" data-key="particleEffects" 
                           ${perf.particleEffects ? 'checked' : ''} />
                    <p class="setting-description">Enable floating particle effects</p>
                </div>
                <div class="setting-item">
                    <label>Training Animations</label>
                    <input type="checkbox" class="setting-checkbox" data-category="performance" data-key="trainingAnimations" 
                           ${perf.trainingAnimations ? 'checked' : ''} />
                    <p class="setting-description">Enable canvas-based training visualizations</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Render Notifications settings tab
     */
    renderNotificationsTab() {
        const notif = this.settings.getCategory('notifications');
        return `
            <div class="settings-tab-content" data-tab="notifications">
                <h3>Notification Preferences</h3>
                <div class="setting-item">
                    <label>Desktop Notifications</label>
                    <input type="checkbox" class="setting-checkbox" data-category="notifications" data-key="enabled" 
                           ${notif.enabled ? 'checked' : ''} />
                    <p class="setting-description">Show browser notifications (requires permission)</p>
                </div>
                <div class="setting-item">
                    <label>Achievement Toasts</label>
                    <input type="checkbox" class="setting-checkbox" data-category="notifications" data-key="achievements" 
                           ${notif.achievements ? 'checked' : ''} />
                    <p class="setting-description">Show achievement unlock notifications</p>
                </div>
                <div class="setting-item">
                    <label>Toast Duration</label>
                    <select class="setting-select" data-category="notifications" data-key="toastDuration">
                        <option value="2000" ${notif.toastDuration === 2000 ? 'selected' : ''}>Short (2s)</option>
                        <option value="3000" ${notif.toastDuration === 3000 ? 'selected' : ''}>Medium (3s)</option>
                        <option value="5000" ${notif.toastDuration === 5000 ? 'selected' : ''}>Long (5s)</option>
                    </select>
                    <p class="setting-description">How long toast messages stay visible</p>
                </div>
                <div class="setting-item">
                    <label>Sound Effects</label>
                    <input type="checkbox" class="setting-checkbox" data-category="notifications" data-key="sound" 
                           ${notif.sound ? 'checked' : ''} />
                    <p class="setting-description">Enable sound effects for achievements</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Render Visual settings tab
     */
    renderVisualTab() {
        const visual = this.settings.getCategory('visual');
        return `
            <div class="settings-tab-content" data-tab="visual">
                <h3>Visual Preferences</h3>
                <div class="setting-item">
                    <label>Reduced Motion</label>
                    <input type="checkbox" class="setting-checkbox" data-category="visual" data-key="reducedMotion" 
                           ${visual.reducedMotion ? 'checked' : ''} />
                    <p class="setting-description">Reduce animations for accessibility</p>
                </div>
                <div class="setting-item">
                    <label>Combo Visuals</label>
                    <input type="checkbox" class="setting-checkbox" data-category="visual" data-key="comboVisuals" 
                           ${visual.comboVisuals ? 'checked' : ''} />
                    <p class="setting-description">Show combo multiplier effects</p>
                </div>
                <div class="setting-item">
                    <label>Show Tooltips</label>
                    <input type="checkbox" class="setting-checkbox" data-category="visual" data-key="showTooltips" 
                           ${visual.showTooltips ? 'checked' : ''} />
                    <p class="setting-description">Display helpful tooltips on hover</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Render Gameplay settings tab
     */
    renderGameplayTab() {
        const gameplay = this.settings.getCategory('gameplay');
        return `
            <div class="settings-tab-content" data-tab="gameplay">
                <h3>Gameplay Options</h3>
                <div class="setting-item">
                    <label>Auto-save Interval</label>
                    <select class="setting-select" data-category="gameplay" data-key="autoSaveInterval">
                        <option value="10000" ${gameplay.autoSaveInterval === 10000 ? 'selected' : ''}>10 seconds</option>
                        <option value="30000" ${gameplay.autoSaveInterval === 30000 ? 'selected' : ''}>30 seconds</option>
                        <option value="60000" ${gameplay.autoSaveInterval === 60000 ? 'selected' : ''}>60 seconds</option>
                        <option value="120000" ${gameplay.autoSaveInterval === 120000 ? 'selected' : ''}>2 minutes</option>
                    </select>
                    <p class="setting-description">How often the game auto-saves</p>
                </div>
                <div class="setting-item">
                    <label>Confirm Purchases</label>
                    <input type="checkbox" class="setting-checkbox" data-category="gameplay" data-key="confirmPurchases" 
                           ${gameplay.confirmPurchases ? 'checked' : ''} />
                    <p class="setting-description">Confirm before expensive purchases</p>
                </div>
                <div class="setting-item">
                    <label>Pause on Tab Switch</label>
                    <input type="checkbox" class="setting-checkbox" data-category="gameplay" data-key="pauseOnBlur" 
                           ${gameplay.pauseOnBlur ? 'checked' : ''} />
                    <p class="setting-description">Pause game when tab is hidden</p>
                </div>
                <div class="setting-item">
                    <label>Offline Progress</label>
                    <input type="checkbox" class="setting-checkbox" data-category="gameplay" data-key="offlineProgress" 
                           ${gameplay.offlineProgress ? 'checked' : ''} />
                    <p class="setting-description">Gain resources while away</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Render Accessibility settings tab
     */
    renderAccessibilityTab() {
        const access = this.settings.getCategory('accessibility');
        return `
            <div class="settings-tab-content" data-tab="accessibility">
                <h3>Accessibility</h3>
                <div class="setting-item">
                    <label>High Contrast</label>
                    <input type="checkbox" class="setting-checkbox" data-category="accessibility" data-key="highContrast" 
                           ${access.highContrast ? 'checked' : ''} />
                    <p class="setting-description">Increase color contrast for better visibility</p>
                </div>
                <div class="setting-item">
                    <label>Large Text</label>
                    <input type="checkbox" class="setting-checkbox" data-category="accessibility" data-key="largeText" 
                           ${access.largeText ? 'checked' : ''} />
                    <p class="setting-description">Increase text size throughout the game</p>
                </div>
                <div class="setting-item">
                    <label>Screen Reader Mode</label>
                    <input type="checkbox" class="setting-checkbox" data-category="accessibility" data-key="screenReaderMode" 
                           ${access.screenReaderMode ? 'checked' : ''} />
                    <p class="setting-description">Optimize for screen readers (experimental)</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup modal event handlers
     */
    setupModalHandlers() {
        // Close button
        const closeBtn = this.modal.querySelector('#settings-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Apply & Close button
        const applyBtn = this.modal.querySelector('#settings-apply');
        applyBtn.addEventListener('click', () => {
            this.applySettings();
            this.close();
        });
        
        // Reset button
        const resetBtn = this.modal.querySelector('#settings-reset');
        resetBtn.addEventListener('click', () => this.resetSettings());
        
        // Export button
        const exportBtn = this.modal.querySelector('#settings-export');
        exportBtn.addEventListener('click', () => this.exportSettings());
        
        // Import button
        const importBtn = this.modal.querySelector('#settings-import');
        importBtn.addEventListener('click', () => this.importSettings());
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }
    
    /**
     * Setup tab switching
     */
    setupTabHandlers() {
        const tabBtns = this.modal.querySelectorAll('.settings-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
    }
    
    /**
     * Switch to a different settings tab
     */
    switchTab(tabName) {
        // Update button states
        const tabBtns = this.modal.querySelectorAll('.settings-tab-btn');
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update content visibility
        const tabContents = this.modal.querySelectorAll('.settings-tab-content');
        tabContents.forEach(content => {
            if (content.getAttribute('data-tab') === tabName) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    /**
     * Setup setting input handlers
     */
    setupSettingHandlers() {
        // Checkboxes
        const checkboxes = this.modal.querySelectorAll('.setting-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const category = e.target.getAttribute('data-category');
                const key = e.target.getAttribute('data-key');
                this.settings.set(category, key, e.target.checked);
            });
        });
        
        // Selects
        const selects = this.modal.querySelectorAll('.setting-select');
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                const category = e.target.getAttribute('data-category');
                const key = e.target.getAttribute('data-key');
                let value = e.target.value;
                
                // Parse numbers
                if (!isNaN(value)) {
                    value = parseFloat(value);
                }
                
                this.settings.set(category, key, value);
            });
        });
        
        // Number inputs
        const numberInputs = this.modal.querySelectorAll('.setting-input[type="number"]');
        numberInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const category = e.target.getAttribute('data-category');
                const key = e.target.getAttribute('data-key');
                const value = parseInt(e.target.value);
                this.settings.set(category, key, value);
            });
        });
    }
    
    /**
     * Setup settings button in footer
     */
    setupSettingsButton() {
        const footer = document.querySelector('.footer-controls');
        if (!footer) return;
        
        // Check if button already exists
        if (document.getElementById('btn-settings')) return;
        
        const button = document.createElement('button');
        button.id = 'btn-settings';
        button.className = 'btn-secondary';
        button.innerHTML = '⚙️ Settings';
        button.addEventListener('click', () => this.open());
        
        // Insert before tutorial button
        const tutorialBtn = document.getElementById('btn-restart-tutorial');
        if (tutorialBtn) {
            footer.insertBefore(button, tutorialBtn);
        } else {
            footer.appendChild(button);
        }
    }
    
    /**
     * Open settings modal
     */
    open() {
        this.modal.classList.add('active');
        // Refresh content to reflect current settings
        this.refreshContent();
    }
    
    /**
     * Close settings modal
     */
    close() {
        this.modal.classList.remove('active');
    }
    
    /**
     * Refresh modal content
     */
    refreshContent() {
        const content = this.modal.querySelector('.settings-content');
        content.innerHTML = `
            ${this.renderNotationTab()}
            ${this.renderPerformanceTab()}
            ${this.renderNotificationsTab()}
            ${this.renderVisualTab()}
            ${this.renderGameplayTab()}
            ${this.renderAccessibilityTab()}
        `;
        this.setupSettingHandlers();
    }
    
    /**
     * Apply settings to game
     */
    applySettings() {
        this.settings.apply(this.game);
        showToast('Settings applied!', 'success');
    }
    
    /**
     * Reset all settings
     */
    resetSettings() {
        if (confirm('Reset all settings to defaults?')) {
            this.settings.reset();
            this.refreshContent();
            this.applySettings();
            showToast('Settings reset to defaults', 'success');
        }
    }
    
    /**
     * Export settings
     */
    exportSettings() {
        const exported = this.settings.export();
        navigator.clipboard.writeText(exported).then(() => {
            showToast('Settings copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback: show in modal
            alert('Settings exported:\n\n' + exported);
        });
    }
    
    /**
     * Import settings
     */
    importSettings() {
        const imported = prompt('Paste settings JSON:');
        if (imported) {
            if (this.settings.import(imported)) {
                this.refreshContent();
                this.applySettings();
                showToast('Settings imported successfully!', 'success');
            } else {
                showToast('Failed to import settings', 'error');
            }
        }
    }
    
    /**
     * Handle setting changes
     */
    onSettingChange(change) {
        // Auto-apply certain settings
        if (change.category === 'visual' || change.category === 'accessibility') {
            this.settings.apply(this.game);
        }
    }
}
