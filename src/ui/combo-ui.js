// Combo UI - Visual feedback for combo system

import { ComboSystem } from '../modules/combo-system.js';

export class ComboUI {
    constructor(comboSystem, collectButton) {
        this.comboSystem = comboSystem;
        this.collectButton = collectButton;
        this.container = null;
        this.comboDisplay = null;
        this.timerBar = null;
        this.multiplierBadge = null;
        
        this.init();
        this.setupCallbacks();
    }
    
    /**
     * Initialize UI elements
     */
    init() {
        // Create combo container
        this.container = document.createElement('div');
        this.container.className = 'combo-container';
        this.container.id = 'combo-container';
        
        // Create combo display (large number)
        this.comboDisplay = document.createElement('div');
        this.comboDisplay.className = 'combo-display';
        this.comboDisplay.textContent = 'x1';
        
        // Create multiplier badge
        this.multiplierBadge = document.createElement('div');
        this.multiplierBadge.className = 'combo-badge gray';
        this.multiplierBadge.textContent = 'x1';
        
        // Create timer bar
        this.timerBar = document.createElement('div');
        this.timerBar.className = 'combo-timer-bar';
        const timerFill = document.createElement('div');
        timerFill.className = 'combo-timer-fill';
        this.timerBar.appendChild(timerFill);
        
        // Add elements to container
        this.container.appendChild(this.comboDisplay);
        this.container.appendChild(this.multiplierBadge);
        
        // Insert container above collect button
        this.collectButton.parentElement.insertBefore(this.container, this.collectButton);
        
        // Add timer bar around the button
        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'collect-btn-wrapper';
        this.collectButton.parentElement.insertBefore(btnWrapper, this.collectButton);
        btnWrapper.appendChild(this.timerBar);
        btnWrapper.appendChild(this.collectButton);
    }
    
    /**
     * Setup callbacks for combo system events
     */
    setupCallbacks() {
        this.comboSystem.onComboChange = (combo, count) => {
            this.updateDisplay(combo);
        };
        
        this.comboSystem.onComboBreak = () => {
            this.showBreakEffect();
        };
        
        this.comboSystem.onComboLevelUp = (newCombo, oldCombo) => {
            this.showLevelUpEffect(newCombo);
        };
    }
    
    /**
     * Update the visual display
     */
    updateDisplay(combo) {
        const color = this.comboSystem.getComboColor();
        const label = this.comboSystem.getComboLabel();
        
        // Update combo display
        this.comboDisplay.textContent = label;
        this.comboDisplay.className = `combo-display ${color}`;
        
        // Update badge
        this.multiplierBadge.textContent = label;
        this.multiplierBadge.className = `combo-badge ${color}`;
        
        // Pulse animation
        this.comboDisplay.style.animation = 'none';
        setTimeout(() => {
            this.comboDisplay.style.animation = 'comboPulse 0.3s ease';
        }, 10);
    }
    
    /**
     * Update timer bar (call every frame)
     */
    updateTimer() {
        const progress = this.comboSystem.getTimerProgress();
        const fill = this.timerBar.querySelector('.combo-timer-fill');
        
        if (progress > 0) {
            fill.style.width = `${progress * 100}%`;
            
            // Change color based on time remaining
            if (progress > 0.6) {
                fill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
            } else if (progress > 0.3) {
                fill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            } else {
                fill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
            }
            
            this.timerBar.style.opacity = '1';
        } else {
            fill.style.width = '0%';
            this.timerBar.style.opacity = '0';
        }
    }
    
    /**
     * Show level up effect
     */
    showLevelUpEffect(combo) {
        // Particle burst
        this.createParticleBurst(combo);
        
        // Screen shake for x4 and x8
        if (combo >= 4) {
            this.screenShake(combo === 8 ? 10 : 5);
        }
        
        // Sound effect (optional - placeholder)
        this.playSound('levelup', combo);
    }
    
    /**
     * Show combo break effect
     */
    showBreakEffect() {
        // Red flash
        const flash = document.createElement('div');
        flash.className = 'combo-break-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 300);
        
        // Play break sound
        this.playSound('break');
    }
    
    /**
     * Create particle burst effect
     */
    createParticleBurst(combo) {
        const colors = {
            2: '#3b82f6',  // Blue
            4: '#a855f7',  // Purple
            8: '#fbbf24'   // Gold
        };
        
        const color = colors[combo] || '#6b7280';
        const particleCount = combo * 3; // More particles for higher combos
        
        const rect = this.collectButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'combo-particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.background = color;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }
    
    /**
     * Screen shake effect
     */
    screenShake(intensity = 5) {
        const game = document.getElementById('game');
        if (!game) return;
        
        game.style.animation = `shake ${intensity >= 10 ? '0.5s' : '0.3s'} ease`;
        game.style.setProperty('--shake-intensity', intensity + 'px');
        
        setTimeout(() => {
            game.style.animation = '';
        }, intensity >= 10 ? 500 : 300);
    }
    
    /**
     * Play sound effect (placeholder for future implementation)
     */
    playSound(type, combo = 1) {
        // TODO: Implement sound system in v0.3.0
        // For now, just log
        // console.log(`Sound: ${type} (combo: ${combo})`);
    }
    
    /**
     * Show floating text for data gained
     */
    showFloatingText(amount, combo) {
        const color = this.comboSystem.getComboColor();
        const floater = document.createElement('div');
        floater.className = `floating-combo-text ${color}`;
        floater.textContent = `+${amount}`;
        
        const rect = this.collectButton.getBoundingClientRect();
        floater.style.left = rect.left + rect.width / 2 + 'px';
        floater.style.top = rect.top - 20 + 'px';
        
        document.body.appendChild(floater);
        
        setTimeout(() => floater.remove(), 1000);
    }
}