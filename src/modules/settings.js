// Settings Module
// Manages game settings and user preferences

export class Settings {
    constructor() {
        this.data = this.getDefaultSettings();
        this.listeners = [];
    }
    
    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            // Notation
            notation: {
                style: 'standard', // 'standard', 'scientific', 'engineering'
                decimals: 2
            },
            
            // Performance
            performance: {
                updateFrequency: 100, // ms between updates (100ms = 10 FPS)
                animationQuality: 'high', // 'high', 'medium', 'low', 'off'
                particleEffects: true,
                trainingAnimations: true
            },
            
            // Notifications
            notifications: {
                enabled: false, // Desktop notifications
                achievements: true, // Achievement toasts
                toastDuration: 3000, // ms
                sound: true
            },
            
            // Visual
            visual: {
                reducedMotion: false,
                comboVisuals: true,
                darkMode: true, // Reserved for future theme system
                showTooltips: true
            },
            
            // Gameplay
            gameplay: {
                autoSaveInterval: 30000, // ms (30 seconds)
                confirmPurchases: false, // Confirm expensive purchases
                pauseOnBlur: false, // Pause game when tab is hidden
                offlineProgress: true
            },
            
            // Accessibility
            accessibility: {
                highContrast: false,
                largeText: false,
                screenReaderMode: false
            },
            
            // Debug (hidden unless dev mode)
            debug: {
                showFPS: false,
                showDebugInfo: false,
                devMode: false
            }
        };
    }
    
    /**
     * Load settings from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem('ai-idle-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to handle new settings
                this.data = this.mergeSettings(this.getDefaultSettings(), parsed);
                console.log('✅ Settings loaded');
                return true;
            }
        } catch (e) {
            console.error('❌ Failed to load settings:', e);
        }
        return false;
    }
    
    /**
     * Save settings to localStorage
     */
    save() {
        try {
            localStorage.setItem('ai-idle-settings', JSON.stringify(this.data));
            console.log('💾 Settings saved');
            return true;
        } catch (e) {
            console.error('❌ Failed to save settings:', e);
            return false;
        }
    }
    
    /**
     * Merge saved settings with defaults (handles new settings)
     */
    mergeSettings(defaults, saved) {
        const merged = { ...defaults };
        
        for (const category in saved) {
            if (merged[category]) {
                merged[category] = { ...merged[category], ...saved[category] };
            }
        }
        
        return merged;
    }
    
    /**
     * Get a setting value
     */
    get(category, key) {
        if (!this.data[category]) {
            console.warn(`Unknown settings category: ${category}`);
            return undefined;
        }
        return this.data[category][key];
    }
    
    /**
     * Set a setting value
     */
    set(category, key, value) {
        if (!this.data[category]) {
            console.warn(`Unknown settings category: ${category}`);
            return false;
        }
        
        const oldValue = this.data[category][key];
        this.data[category][key] = value;
        
        // Notify listeners
        this.notifyChange(category, key, value, oldValue);
        
        // Auto-save
        this.save();
        
        return true;
    }
    
    /**
     * Get entire category
     */
    getCategory(category) {
        return this.data[category] || {};
    }
    
    /**
     * Set entire category
     */
    setCategory(category, values) {
        if (!this.data[category]) {
            console.warn(`Unknown settings category: ${category}`);
            return false;
        }
        
        this.data[category] = { ...this.data[category], ...values };
        this.save();
        
        // Notify listeners for each changed value
        for (const [key, value] of Object.entries(values)) {
            this.notifyChange(category, key, value, undefined);
        }
        
        return true;
    }
    
    /**
     * Reset settings to defaults
     */
    reset() {
        this.data = this.getDefaultSettings();
        this.save();
        this.notifyChange('all', 'reset', null, null);
        console.log('🔄 Settings reset to defaults');
    }
    
    /**
     * Reset specific category to defaults
     */
    resetCategory(category) {
        const defaults = this.getDefaultSettings();
        if (defaults[category]) {
            this.data[category] = defaults[category];
            this.save();
            this.notifyChange(category, 'reset', null, null);
            return true;
        }
        return false;
    }
    
    /**
     * Add change listener
     */
    addListener(callback) {
        this.listeners.push(callback);
        return () => this.removeListener(callback);
    }
    
    /**
     * Remove change listener
     */
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    /**
     * Notify all listeners of a change
     */
    notifyChange(category, key, newValue, oldValue) {
        for (const listener of this.listeners) {
            try {
                listener({ category, key, newValue, oldValue });
            } catch (e) {
                console.error('Error in settings listener:', e);
            }
        }
    }
    
    /**
     * Export settings as JSON string
     */
    export() {
        return JSON.stringify(this.data, null, 2);
    }
    
    /**
     * Import settings from JSON string
     */
    import(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            this.data = this.mergeSettings(this.getDefaultSettings(), parsed);
            this.save();
            this.notifyChange('all', 'import', null, null);
            return true;
        } catch (e) {
            console.error('Failed to import settings:', e);
            return false;
        }
    }
    
    /**
     * Apply settings to game systems
     */
    apply(game) {
        // Apply performance settings
        this.applyPerformanceSettings(game);
        
        // Apply visual settings
        this.applyVisualSettings();
        
        // Apply notification settings
        this.applyNotificationSettings();
        
        // Apply gameplay settings
        this.applyGameplaySettings(game);
        
        console.log('⚙️ Settings applied');
    }
    
    /**
     * Apply performance settings
     */
    applyPerformanceSettings(game) {
        const perf = this.data.performance;
        
        // Animation quality CSS class
        document.body.classList.remove('anim-high', 'anim-medium', 'anim-low', 'anim-off');
        document.body.classList.add(`anim-${perf.animationQuality}`);
        
        // Particle effects
        if (!perf.particleEffects) {
            document.body.classList.add('no-particles');
        } else {
            document.body.classList.remove('no-particles');
        }
    }
    
    /**
     * Apply visual settings
     */
    applyVisualSettings() {
        const visual = this.data.visual;
        
        // Reduced motion
        if (visual.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        // High contrast
        if (this.data.accessibility.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        // Large text
        if (this.data.accessibility.largeText) {
            document.body.classList.add('large-text');
        } else {
            document.body.classList.remove('large-text');
        }
    }
    
    /**
     * Apply notification settings
     */
    applyNotificationSettings() {
        // Check if browser supports notifications
        if (this.data.notifications.enabled && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission !== 'granted') {
                        this.set('notifications', 'enabled', false);
                    }
                });
            }
        }
    }
    
    /**
     * Apply gameplay settings
     */
    applyGameplaySettings(game) {
        // Auto-save interval will be checked in main game loop
        // Other gameplay settings are checked as needed
    }
    
    /**
     * Get formatted value for display
     */
    getDisplayValue(category, key) {
        const value = this.get(category, key);
        
        // Format based on type
        if (typeof value === 'boolean') {
            return value ? 'On' : 'Off';
        }
        
        if (key === 'updateFrequency') {
            return `${Math.round(1000 / value)} FPS`;
        }
        
        if (key === 'autoSaveInterval') {
            return `${value / 1000}s`;
        }
        
        if (key === 'toastDuration') {
            return `${value / 1000}s`;
        }
        
        // Capitalize first letter
        if (typeof value === 'string') {
            return value.charAt(0).toUpperCase() + value.slice(1);
        }
        
        return value;
    }
}
