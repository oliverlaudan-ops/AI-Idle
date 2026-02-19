/**
 * Tutorial System - Interactive guide for new players
 * Provides step-by-step onboarding with spotlight highlighting and tooltips
 */

class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.isCompleted = false;
        this.currentStep = 0;
        this.overlay = null;
        this.spotlight = null;
        this.tooltipContainer = null;
        this.actionProgress = 0;
        this.actionRequired = 0;
        this.activeListeners = [];

        this.steps = [
            {
                id: 'welcome',
                title: 'Welcome to AI Idle!',
                content: 'Train AI models, gather resources, and advance through the history of machine learning. Let\'s get started!',
                target: null,
                position: 'center',
                action: null
            },
            {
                id: 'resources',
                title: 'Your Resources',
                content: 'These are your core resources. <strong>Data</strong> and <strong>Compute</strong> are needed to train models. Watch them grow!',
                target: '#resource-panel',
                position: 'bottom',
                action: null
            },
            {
                id: 'first-model',
                title: 'Train Your First Model',
                content: 'Click <strong>Train</strong> on the Perceptron to start your first training run. This is how you earn Model Points!',
                target: '.model-card:first-child',
                position: 'right',
                action: { type: 'click', selector: '.model-card:first-child .btn-train', count: 1 }
            },
            {
                id: 'model-points',
                title: 'Model Points',
                content: 'Great! Model Points (MP) unlock upgrades and research. Keep training to earn more!',
                target: '#model-points-display',
                position: 'bottom',
                action: null
            },
            {
                id: 'research',
                title: 'Research Tree',
                content: 'Spend Model Points on <strong>Research</strong> to unlock powerful multipliers and new capabilities. Try researching something!',
                target: '#research-tab',
                position: 'bottom',
                action: { type: 'click', selector: '#research-tab', count: 1 }
            },
            {
                id: 'upgrades',
                title: 'Upgrades',
                content: 'The <strong>Upgrades</strong> tab lets you permanently boost your production. Check it out when you have enough MP!',
                target: '#upgrades-tab',
                position: 'bottom',
                action: null
            },
            {
                id: 'complete',
                title: 'You\'re Ready!',
                content: 'You know the basics! Keep training models, researching new techniques, and unlocking upgrades. Good luck on your AI journey!',
                target: null,
                position: 'center',
                action: null
            }
        ];
    }

    /**
     * Initialize the tutorial system.
     * Checks localStorage to see if tutorial was already completed.
     */
    init() {
        if (localStorage.getItem('ai-idle-tutorial-completed') === 'true') {
            this.isCompleted = true;
            return;
        }

        this._ensureElements();
        this.start();
    }

    /**
     * Ensure tutorial DOM elements exist, creating them if necessary.
     */
    _ensureElements() {
        if (!this.overlay) {
            this.overlay = document.getElementById('tutorial-overlay');
        }
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'tutorial-overlay';
            this.overlay.className = 'tutorial-overlay';
            document.body.appendChild(this.overlay);
        }

        if (!this.spotlight) {
            this.spotlight = document.getElementById('tutorial-spotlight');
        }
        if (!this.spotlight) {
            this.spotlight = document.createElement('div');
            this.spotlight.id = 'tutorial-spotlight';
            this.spotlight.className = 'tutorial-spotlight';
            document.body.appendChild(this.spotlight);
        }

        if (!this.tooltipContainer) {
            this.tooltipContainer = document.getElementById('tutorial-tooltip');
        }
        if (!this.tooltipContainer) {
            this.tooltipContainer = document.createElement('div');
            this.tooltipContainer.id = 'tutorial-tooltip';
            this.tooltipContainer.className = 'tutorial-tooltip';
            document.body.appendChild(this.tooltipContainer);
        }
    }

    /**
     * Start the tutorial from the beginning.
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
     * Display a specific tutorial step.
     * @param {number} stepIndex - Index of the step to show.
     */
    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.complete();
            return;
        }

        this.currentStep = stepIndex;
        this.actionProgress = 0;
        const step = this.steps[stepIndex];

        // Build tooltip HTML
        const progress = `${stepIndex + 1} / ${this.steps.length}`;
        const isLast = stepIndex === this.steps.length - 1;

        this.tooltipContainer.innerHTML = `
            <div class="tutorial-header">
                <span class="tutorial-progress">${progress}</span>
                <button class="tutorial-skip" id="tutorial-skip-btn">Skip</button>
            </div>
            <h3 class="tutorial-title">${step.title}</h3>
            <p class="tutorial-content">${step.content}</p>
            ${step.action ? `<div class="tutorial-action-hint">👆 ${this._getActionHint(step.action)}</div>` : ''}
            <div class="tutorial-footer">
                ${!step.action ? `<button class="btn btn-primary tutorial-next" id="tutorial-next-btn">${isLast ? 'Finish' : 'Next'}</button>` : ''}
            </div>
        `;

        // Position tooltip
        this._positionTooltip(step);

        // Highlight target element
        if (step.target) {
            this._highlightTarget(step.target);
        } else {
            this._clearSpotlight();
        }

        // Attach button listeners
        const nextBtn = document.getElementById('tutorial-next-btn');
        if (nextBtn) {
            const nextHandler = () => this.nextStep();
            nextBtn.addEventListener('click', nextHandler);
            this.activeListeners.push({ el: nextBtn, event: 'click', handler: nextHandler });
        }

        const skipBtn = document.getElementById('tutorial-skip-btn');
        if (skipBtn) {
            const skipHandler = () => this.skip();
            skipBtn.addEventListener('click', skipHandler);
            this.activeListeners.push({ el: skipBtn, event: 'click', handler: skipHandler });
        }

        // Set up action listener if step requires one
        if (step.action) {
            this.setupActionListener(step);
        }
    }

    /**
     * Get a human-readable hint for an action.
     * @param {object} action
     * @returns {string}
     */
    _getActionHint(action) {
        if (action.type === 'click') {
            return action.count > 1 ? `Click ${action.count} times to continue` : 'Click to continue';
        }
        return 'Complete the action to continue';
    }

    /**
     * Position the tooltip relative to the target element.
     * @param {object} step
     */
    _positionTooltip(step) {
        this.tooltipContainer.style.display = 'block';

        if (!step.target || step.position === 'center') {
            this.tooltipContainer.style.position = 'fixed';
            this.tooltipContainer.style.top = '50%';
            this.tooltipContainer.style.left = '50%';
            this.tooltipContainer.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const target = document.querySelector(step.target);
        if (!target) {
            this.tooltipContainer.style.position = 'fixed';
            this.tooltipContainer.style.top = '50%';
            this.tooltipContainer.style.left = '50%';
            this.tooltipContainer.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = target.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        const margin = 12;

        this.tooltipContainer.style.transform = '';
        this.tooltipContainer.style.position = 'fixed';

        switch (step.position) {
            case 'bottom':
                this.tooltipContainer.style.top = `${rect.bottom + margin}px`;
                this.tooltipContainer.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - tooltipWidth - 8))}px`;
                break;
            case 'top':
                this.tooltipContainer.style.top = `${rect.top - tooltipHeight - margin}px`;
                this.tooltipContainer.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - tooltipWidth - 8))}px`;
                break;
            case 'right':
                this.tooltipContainer.style.top = `${Math.max(8, rect.top)}px`;
                this.tooltipContainer.style.left = `${rect.right + margin}px`;
                break;
            case 'left':
                this.tooltipContainer.style.top = `${Math.max(8, rect.top)}px`;
                this.tooltipContainer.style.left = `${rect.left - tooltipWidth - margin}px`;
                break;
            default:
                this.tooltipContainer.style.top = '50%';
                this.tooltipContainer.style.left = '50%';
                this.tooltipContainer.style.transform = 'translate(-50%, -50%)';
        }
    }

    /**
     * Highlight a target element with the spotlight.
     * @param {string} selector
     */
    _highlightTarget(selector) {
        const target = document.querySelector(selector);
        if (!target) {
            this._clearSpotlight();
            return;
        }

        const rect = target.getBoundingClientRect();
        const padding = 6;

        this.spotlight.style.display = 'block';
        this.spotlight.style.position = 'fixed';
        this.spotlight.style.top = `${rect.top - padding}px`;
        this.spotlight.style.left = `${rect.left - padding}px`;
        this.spotlight.style.width = `${rect.width + padding * 2}px`;
        this.spotlight.style.height = `${rect.height + padding * 2}px`;
    }

    /**
     * Clear the spotlight highlight.
     */
    _clearSpotlight() {
        if (this.spotlight) {
            this.spotlight.style.display = 'none';
        }
    }

    /**
     * Set up a listener for the required action on the current step.
     * @param {object} step
     */
    setupActionListener(step) {
        if (!step.action) return;

        this.actionRequired = step.action.count || 1;
        this.actionProgress = 0;

        const target = document.querySelector(step.action.selector);
        if (!target) return;

        const handler = () => {
            this.actionProgress++;
            if (this.actionProgress >= this.actionRequired) {
                this.cleanupListeners();
                setTimeout(() => this.nextStep(), 300);
            }
        };

        target.addEventListener(step.action.type, handler);
        this.activeListeners.push({ el: target, event: step.action.type, handler });
    }

    /**
     * Remove all active event listeners.
     */
    cleanupListeners() {
        this.activeListeners.forEach(({ el, event, handler }) => {
            el.removeEventListener(event, handler);
        });
        this.activeListeners = [];
    }

    /**
     * Advance to the next step.
     */
    nextStep() {
        this.cleanupListeners();
        this.showStep(this.currentStep + 1);
    }

    /**
     * Skip the tutorial entirely.
     */
    skip() {
        this.complete();
    }

    /**
     * Hide the tutorial overlay with a fade-out animation.
     */
    _hideOverlay() {
        if (!this.overlay) return;
        this.overlay.classList.remove('active');
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.style.display = 'none';
            }
            this._clearSpotlight();
            if (this.tooltipContainer) {
                this.tooltipContainer.style.display = 'none';
            }
        }, 300);
    }

    /**
     * Mark the tutorial as complete, save to localStorage, and hide the UI.
     */
    complete() {
        this.cleanupListeners();
        this.isActive = false;
        this.isCompleted = true;
        localStorage.setItem('ai-idle-tutorial-completed', 'true');
        this._hideOverlay();
    }

    /**
     * Public method alias for isCompleted property.
     * Called by main.js as window.tutorial.isComplete().
     * @returns {boolean} Whether the tutorial has been completed.
     */
    isComplete() {
        return this.isCompleted;
    }

    /**
     * Restart the tutorial from the beginning.
     * Resets the completed flag and localStorage key, then calls start().
     * Called by the "Restart Tutorial" button in ui-init.js.
     */
    restart() {
        this.isCompleted = false;
        localStorage.removeItem('ai-idle-tutorial-completed');
        this.isActive = false;
        this.currentStep = 0;
        this.start();
    }
}

export { TutorialSystem };
