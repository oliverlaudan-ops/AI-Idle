/**
 * Tutorial System - Interactive guide for new players
 * Provides step-by-step tutorial with spotlight and tooltip UI
 */

export class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.isCompleted = false;
        this.currentStep = 0;
        this.overlay = null;
        this.spotlight = null;
        this.tooltipContainer = null;
        this.actionProgress = 0;
        this.actionRequired = 1;
        this.activeListeners = [];
        
        this.steps = [
            {
                title: '🤖 Welcome to AI-Idle!',
                description: 'Train AI models to generate Data Points, then use them to unlock research and more powerful models.',
                position: 'center',
                showNext: true,
                showSkip: true,
                additionalInfo: [
                    '💡 Data Points are your main currency',
                    '🔬 Research unlocks multipliers and new features',
                    '🚀 More models = faster progress'
                ]
            },
            {
                title: '🧠 Your First Model',
                description: 'Click the "Train" button on the Perceptron to start generating Data Points.',
                target: '.model-card:first-child .train-btn',
                position: 'right',
                waitForAction: true,
                actionType: 'click',
                actionCount: 1,
                showSkip: true
            },
            {
                title: '📊 Data Points',
                description: 'Great! Your model is now training. Data Points accumulate automatically while models train.',
                target: '#data-points-display',
                position: 'bottom',
                showNext: true,
                showSkip: true
            },
            {
                title: '🔬 Research Tab',
                description: 'Visit the Research tab to spend Data Points on upgrades that multiply your production.',
                target: '[data-tab="research"]',
                position: 'bottom',
                waitForAction: true,
                actionType: 'click',
                actionCount: 1,
                showSkip: true
            },
            {
                title: '🧪 Buy Research',
                description: 'Purchase a research item to boost your Data Point production. Research compounds over time!',
                target: '.research-item:first-child .research-btn',
                position: 'right',
                waitForAction: true,
                actionType: 'purchase',
                actionCount: 1,
                showSkip: true
            },
            {
                title: '⚡ Training Queue',
                description: 'Use the Training tab to queue multiple training runs. Combos give bonus multipliers!',
                target: '[data-tab="training"]',
                position: 'bottom',
                waitForAction: true,
                actionType: 'training',
                actionCount: 1,
                showSkip: true,
                highlightCombo: false
            },
            {
                title: '🎉 You\'re Ready!',
                description: 'You\'ve learned the basics! Keep training models, researching upgrades, and unlocking new AI architectures.',
                position: 'center',
                showNext: true,
                showSkip: false,
                finalStep: true,
                additionalInfo: [
                    '🏆 Unlock Prestige for massive multipliers',
                    '📈 Check the Stats tab to track progress',
                    '💾 Your game saves automatically'
                ]
            }
        ];
    }

    /**
     * Initialize tutorial system - creates DOM elements and auto-starts if needed
     */
    init() {
        // Check if tutorial was already completed
        const completed = localStorage.getItem('ai-idle-tutorial-completed');
        if (completed === 'true') {
            this.isCompleted = true;
            return;
        }
        
        // Create DOM elements (always safe to call)
        this._ensureElements();
        
        // Check if we should auto-start
        const autoStart = !localStorage.getItem('ai-idle-tutorial-skipped');
        if (autoStart) {
            // Small delay to let game initialize
            setTimeout(() => this.start(), 500);
        }
    }

    /**
     * Ensure tutorial DOM elements exist, creating them if necessary.
     * Safe to call multiple times.
     */
    _ensureElements() {
        if (!this.overlay) {
            this.createTutorialElements();
        }
    }

    /**
     * Start the tutorial
     */
    start() {
        if (this.isCompleted) return;
        
        // Ensure DOM elements exist even if init() returned early
        this._ensureElements();
        
        if (!this.overlay) {
            console.error('TutorialSystem: overlay element could not be created');
            return;
        }
        
        this.isActive = true;
        this.currentStep = 0;
        this.overlay.style.display = 'block';
        
        // Add active class for animations
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.classList.add('active');
            }
        }, 10);
        
        this.showStep(0);
    }

    /**
     * Create tutorial DOM elements and append to body
     */
    createTutorialElements() {
        // Main overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.className = 'tutorial-overlay';
        this.overlay.style.display = 'none';
        
        // Spotlight (highlights target element)
        this.spotlight = document.createElement('div');
        this.spotlight.id = 'tutorial-spotlight';
        this.spotlight.className = 'tutorial-spotlight';
        
        // Tooltip container
        this.tooltipContainer = document.createElement('div');
        this.tooltipContainer.id = 'tutorial-tooltip-container';
        this.tooltipContainer.className = 'tutorial-tooltip-container';
        
        this.overlay.appendChild(this.spotlight);
        this.overlay.appendChild(this.tooltipContainer);
        document.body.appendChild(this.overlay);
    }

    /**
     * Show a specific tutorial step
     */
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;
        
        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        
        // Reset action progress
        this.actionProgress = 0;
        this.actionRequired = step.actionCount || 1;
        
        // Update spotlight
        this.updateSpotlight(step);
        
        // Update tooltip
        this.updateTooltip(step);
        
        // Setup action listener if needed
        if (step.waitForAction) {
            this.setupActionListener(step);
        }
        
        // Special handling for combo highlight
        if (step.highlightCombo) {
            this.highlightComboSystem();
        }
    }

    /**
     * Update the spotlight element to highlight the target
     */
    updateSpotlight(step) {
        if (!this.spotlight) return;
        
        if (!step.target) {
            // No target = center modal
            this.spotlight.classList.remove('active');
            return;
        }
        
        const target = document.querySelector(step.target);
        if (!target) {
            console.warn(`Tutorial target not found: ${step.target}`);
            this.spotlight.classList.remove('active');
            return;
        }
        
        // Get target position and size
        const rect = target.getBoundingClientRect();
        const padding = 12;
        
        // Position spotlight
        this.spotlight.style.left = (rect.left - padding) + 'px';
        this.spotlight.style.top = (rect.top - padding) + 'px';
        this.spotlight.style.width = (rect.width + padding * 2) + 'px';
        this.spotlight.style.height = (rect.height + padding * 2) + 'px';
        
        this.spotlight.classList.add('active');
        
        // Make target clickable by increasing z-index
        target.style.position = 'relative';
        target.style.zIndex = '10002';
    }

    /**
     * Update the tooltip with current step content
     */
    updateTooltip(step) {
        if (!this.tooltipContainer) {
            console.error('TutorialSystem: tooltipContainer is not initialized');
            return;
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        
        const header = document.createElement('div');
        header.className = 'tutorial-header';
        
        const progress = document.createElement('div');
        progress.className = 'tutorial-progress';
        progress.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}`;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'tutorial-progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'tutorial-progress-fill';
        progressFill.style.width = ((this.currentStep + 1) / this.steps.length * 100) + '%';
        
        progressBar.appendChild(progressFill);
        header.appendChild(progress);
        header.appendChild(progressBar);
        
        const title = document.createElement('h3');
        title.className = 'tutorial-title';
        title.textContent = step.title;
        
        const description = document.createElement('p');
        description.className = 'tutorial-description';
        description.textContent = step.description;
        
        if (step.additionalInfo && step.additionalInfo.length > 0) {
            const infoList = document.createElement('ul');
            infoList.className = 'tutorial-info-list';
            step.additionalInfo.forEach(info => {
                const li = document.createElement('li');
                li.textContent = info;
                infoList.appendChild(li);
            });
            description.appendChild(infoList);
        }
        
        let actionProgress = null;
        if (step.waitForAction && step.actionCount > 1) {
            actionProgress = document.createElement('div');
            actionProgress.className = 'tutorial-action-progress';
            actionProgress.innerHTML = `
                <span class="action-progress-text">Progress: <span id="action-count">0</span>/${step.actionCount}</span>
                <div class="action-progress-bar">
                    <div class="action-progress-fill" id="action-progress-fill" style="width: 0%"></div>
                </div>
            `;
        }
        
        const buttons = document.createElement('div');
        buttons.className = 'tutorial-buttons';
        
        if (step.showSkip && !step.finalStep) {
            const skipBtn = document.createElement('button');
            skipBtn.className = 'tutorial-btn tutorial-btn-skip';
            skipBtn.textContent = '⏭️ Skip Tutorial';
            skipBtn.onclick = () => this.skip();
            buttons.appendChild(skipBtn);
        }
        
        if (step.showNext && !step.waitForAction) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'tutorial-btn tutorial-btn-next';
            nextBtn.textContent = step.finalStep ? '🎉 Finish Tutorial' : 'Next →';
            nextBtn.onclick = () => step.finalStep ? this.complete() : this.nextStep();
            buttons.appendChild(nextBtn);
        }
        
        if (step.waitForAction) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'tutorial-btn tutorial-btn-action';
            actionBtn.textContent = '⏩ Skip This Step';
            actionBtn.onclick = () => this.nextStep();
            buttons.appendChild(actionBtn);
        }
        
        tooltip.appendChild(header);
        tooltip.appendChild(title);
        tooltip.appendChild(description);
        if (actionProgress) tooltip.appendChild(actionProgress);
        tooltip.appendChild(buttons);
        
        this.tooltipContainer.innerHTML = '';
        this.tooltipContainer.appendChild(tooltip);
        
        // Position after appending so getBoundingClientRect() works
        this.positionTooltip(step, tooltip);
    }

    /**
     * Position the tooltip relative to the target element
     */
    positionTooltip(step, tooltip) {
        if (!tooltip) return;
        
        if (!step.target) {
            tooltip.style.position = 'fixed';
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }
        
        const target = document.querySelector(step.target);
        if (!target) return;
        
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (step.position) {
            case 'top':
                top = targetRect.top - tooltipRect.height - 20;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = targetRect.bottom + 20;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.left - tooltipRect.width - 20;
                break;
            case 'right':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.right + 20;
                break;
            default:
                top = targetRect.bottom + 20;
                left = targetRect.left;
        }
        
        // Clamp to viewport
        top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
        
        tooltip.style.position = 'fixed';
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
        tooltip.style.transform = 'none';
    }

    /**
     * Advance to the next tutorial step
     */
    nextStep() {
        this.cleanupListeners();
        
        if (this.currentStep + 1 >= this.steps.length) {
            this.complete();
            return;
        }
        
        this.showStep(this.currentStep + 1);
    }

    /**
     * Setup action listener based on step type
     */
    setupActionListener(step) {
        switch (step.actionType) {
            case 'click':
                this.setupClickListener(step);
                break;
            case 'purchase':
                this.setupPurchaseListener(step);
                break;
            case 'training':
                this.setupTrainingListener(step);
                break;
        }
    }

    /**
     * Setup click listener for a target element
     */
    setupClickListener(step) {
        if (!step.target) return;
        
        const target = document.querySelector(step.target);
        if (!target) {
            console.warn(`Tutorial click target not found: ${step.target}`);
            return;
        }
        
        const handler = () => {
            this.actionProgress++;
            this.updateActionProgress();
            
            if (this.actionProgress >= this.actionRequired) {
                setTimeout(() => this.nextStep(), 500);
            }
        };
        
        target.addEventListener('click', handler);
        this.activeListeners.push({ element: target, event: 'click', handler });
    }

    /**
     * Setup purchase listener - watches for research purchases
     */
    setupPurchaseListener(step) {
        const checkPurchase = setInterval(() => {
            const completedCount = this.game.gameState?.completedResearch?.length || 0;
            if (completedCount > 0) {
                clearInterval(checkPurchase);
                this.actionProgress = this.actionRequired;
                this.updateActionProgress();
                setTimeout(() => this.nextStep(), 1000);
            }
        }, 200);
        
        this.activeListeners.push({ interval: checkPurchase });
    }

    /**
     * Setup training listener - watches for active training
     */
    setupTrainingListener(step) {
        // First, ensure we're on the training tab
        const trainingTab = document.querySelector('[data-tab="training"]');
        if (trainingTab) {
            trainingTab.click();
        }
        
        const checkTraining = setInterval(() => {
            if (this.game.currentTraining) {
                clearInterval(checkTraining);
                this.actionProgress = this.actionRequired;
                this.updateActionProgress();
                setTimeout(() => this.nextStep(), 1000);
            }
        }, 100);
        
        this.activeListeners.push({ interval: checkTraining });
    }

    /**
     * Update the action progress display
     */
    updateActionProgress() {
        const countEl = document.getElementById('action-count');
        const fillEl = document.getElementById('action-progress-fill');
        
        if (countEl) countEl.textContent = this.actionProgress;
        if (fillEl) fillEl.style.width = (this.actionProgress / this.actionRequired * 100) + '%';
    }

    /**
     * Highlight the combo system UI
     */
    highlightComboSystem() {
        const comboEl = document.querySelector('.combo-display');
        if (comboEl) {
            comboEl.classList.add('tutorial-highlight');
            setTimeout(() => comboEl.classList.remove('tutorial-highlight'), 3000);
        }
    }

    /**
     * Clean up all active event listeners and intervals
     */
    cleanupListeners() {
        this.activeListeners.forEach(listener => {
            if (listener.interval) {
                clearInterval(listener.interval);
            } else if (listener.element && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        this.activeListeners = [];
    }

    /**
     * Skip the tutorial
     */
    skip() {
        this.cleanupListeners();
        this.isActive = false;
        localStorage.setItem('ai-idle-tutorial-skipped', 'true');
        this._hideOverlay();
    }

    /**
     * Complete the tutorial
     */
    complete() {
        this.cleanupListeners();
        this.isActive = false;
        this.isCompleted = true;
        localStorage.setItem('ai-idle-tutorial-completed', 'true');
        this._hideOverlay();
    }

    /**
     * Hide the tutorial overlay safely
     */
    _hideOverlay() {
        if (!this.overlay) return;
        
        this.overlay.classList.remove('active');
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.style.display = 'none';
            }
        }, 300);
    }

    /**
     * Public method alias for isCompleted property.
     * Called by main.js as window.tutorial.isComplete().
     * @returns {boolean} Whether the tutorial has been completed.
     */
    isComplete() {
        return this.isCompleted;
    }
}
