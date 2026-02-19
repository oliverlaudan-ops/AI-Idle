/**
 * TutorialSystem - Guides new players through the game mechanics
 *
 * Overlay strategy:
 *   - .tutorial-overlay  : full-screen dim layer, pointer-events: none (clicks pass through)
 *   - .tutorial-spotlight: positioned over the target element, box-shadow creates the dim effect,
 *                          pointer-events: none (clicks pass through to the real element beneath)
 *   - .tutorial-tooltip  : the instruction card, pointer-events: auto (buttons must be clickable)
 *
 * All critical layout properties (display, position, z-index, pointer-events) are set via
 * inline styles in JS so they can never be overridden by CSS specificity or stacking contexts.
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
                content: 'Train AI models, gather resources, and advance through the history of machine learning. Let\'s get you started!',
                target: null,
                position: 'center',
                action: null
            },
            {
                id: 'resources',
                title: 'Your Resources',
                content: 'These are your core resources: Data, Compute, and Model Points. You\'ll need them to train models and unlock research.',
                target: '#resource-panel',
                position: 'bottom',
                action: null
            },
            {
                id: 'first-model',
                title: 'Train Your First Model',
                content: 'Click the Train button on a model card to start training. Each training run costs resources but earns Model Points.',
                target: '.model-card:first-child',
                position: 'right',
                action: {
                    type: 'click',
                    selector: '.model-card:first-child .btn-train',
                    count: 1
                }
            },
            {
                id: 'model-points',
                title: 'Model Points',
                content: 'Model Points are your main currency for unlocking upgrades and research. Keep training to earn more!',
                target: '#model-points-display',
                position: 'bottom',
                action: null
            },
            {
                id: 'research',
                title: 'Research Tree',
                content: 'Unlock powerful improvements by spending Model Points in the Research tab. Click the Research tab to explore!',
                target: '#research-tab',
                position: 'bottom',
                action: {
                    type: 'click',
                    selector: '#research-tab',
                    count: 1
                }
            },
            {
                id: 'upgrades',
                title: 'Upgrades',
                content: 'The Upgrades tab lets you permanently boost your production. Check back often as new upgrades unlock.',
                target: '#upgrades-tab',
                position: 'bottom',
                action: null
            },
            {
                id: 'complete',
                title: 'You\'re Ready!',
                content: 'That\'s the basics! Keep training models, researching improvements, and unlocking upgrades. Good luck!',
                target: null,
                position: 'center',
                action: null
            }
        ];
    }

    init() {
        if (localStorage.getItem('ai-idle-tutorial-completed') === 'true') {
            this.isCompleted = true;
            return;
        }
        this._ensureElements();
        this.start();
    }

    _ensureElements() {
        // ── Overlay ──────────────────────────────────────────────────────────
        // Full-screen dim layer. pointer-events: none so all clicks pass through.
        if (!this.overlay) {
            this.overlay = document.getElementById('tutorial-overlay');
        }
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'tutorial-overlay';
            this.overlay.className = 'tutorial-overlay';
            document.body.appendChild(this.overlay);
        }
        // Force critical properties inline — immune to CSS specificity issues
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: '3000',
            pointerEvents: 'none',   // ← clicks pass through to the game UI
            display: 'none'
        });

        // ── Spotlight ────────────────────────────────────────────────────────
        // Positioned over the target element. The massive box-shadow creates the
        // dimming effect around it. pointer-events: none so the real element
        // underneath is still clickable.
        if (!this.spotlight) {
            this.spotlight = document.getElementById('tutorial-spotlight');
        }
        if (!this.spotlight) {
            this.spotlight = document.createElement('div');
            this.spotlight.id = 'tutorial-spotlight';
            this.spotlight.className = 'tutorial-spotlight';
            document.body.appendChild(this.spotlight);
        }
        Object.assign(this.spotlight.style, {
            position: 'fixed',
            zIndex: '3100',
            pointerEvents: 'none',   // ← clicks pass through to the real element
            borderRadius: '4px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            display: 'none'
        });

        // ── Tooltip ──────────────────────────────────────────────────────────
        // The instruction card. pointer-events: auto so Next/Skip buttons work.
        if (!this.tooltipContainer) {
            this.tooltipContainer = document.getElementById('tutorial-tooltip');
        }
        if (!this.tooltipContainer) {
            this.tooltipContainer = document.createElement('div');
            this.tooltipContainer.id = 'tutorial-tooltip';
            this.tooltipContainer.className = 'tutorial-tooltip';
            document.body.appendChild(this.tooltipContainer);
        }
        Object.assign(this.tooltipContainer.style, {
            position: 'fixed',
            zIndex: '3200',
            pointerEvents: 'auto',   // ← buttons inside must be clickable
            display: 'none'
        });
    }

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

        // Show overlay
        this.overlay.style.display = 'block';

        // Add active class for CSS transitions
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.classList.add('active');
            }
        }, 10);

        this.showStep(0);
    }

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

        // Position tooltip (also sets display: block)
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

    _getActionHint(action) {
        switch (action.type) {
            case 'click':
                return 'Click the highlighted element to continue';
            case 'train':
                return `Train a model ${action.count} time${action.count !== 1 ? 's' : ''} to continue`;
            default:
                return 'Complete the action to continue';
        }
    }

    _positionTooltip(step) {
        // Make visible
        this.tooltipContainer.style.display = 'block';

        if (!step.target || step.position === 'center') {
            Object.assign(this.tooltipContainer.style, {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            return;
        }

        const target = document.querySelector(step.target);
        if (!target) {
            Object.assign(this.tooltipContainer.style, {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            return;
        }

        const rect = target.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        const margin = 12;

        this.tooltipContainer.style.transform = '';

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

    _highlightTarget(selector) {
        const target = document.querySelector(selector);
        if (!target) {
            this._clearSpotlight();
            return;
        }

        const rect = target.getBoundingClientRect();
        const padding = 6;

        Object.assign(this.spotlight.style, {
            display: 'block',
            top: `${rect.top - padding}px`,
            left: `${rect.left - padding}px`,
            width: `${rect.width + padding * 2}px`,
            height: `${rect.height + padding * 2}px`
        });
    }

    _clearSpotlight() {
        if (this.spotlight) {
            this.spotlight.style.display = 'none';
        }
    }

    setupActionListener(step) {
        if (!step.action) return;

        this.actionRequired = step.action.count || 1;
        this.actionProgress = 0;

        const targets = document.querySelectorAll(step.action.selector);
        if (!targets.length) return;

        const handler = () => {
            this.actionProgress++;
            if (this.actionProgress >= this.actionRequired) {
                this.cleanupListeners();
                setTimeout(() => this.nextStep(), 300);
            }
        };

        targets.forEach(el => {
            el.addEventListener(step.action.type, handler);
            this.activeListeners.push({ el, event: step.action.type, handler });
        });
    }

    cleanupListeners() {
        this.activeListeners.forEach(({ el, event, handler }) => {
            el.removeEventListener(event, handler);
        });
        this.activeListeners = [];
    }

    nextStep() {
        this.cleanupListeners();
        this.showStep(this.currentStep + 1);
    }

    skip() {
        this.complete();
    }

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

    complete() {
        this.cleanupListeners();
        this.isActive = false;
        this.isCompleted = true;
        localStorage.setItem('ai-idle-tutorial-completed', 'true');
        this._hideOverlay();
    }

    isComplete() {
        return this.isCompleted;
    }

    restart() {
        localStorage.removeItem('ai-idle-tutorial-completed');
        this.isCompleted = false;
        this.isActive = false;
        this.currentStep = 0;
        this._ensureElements();
        this.start();
    }
}

export { TutorialSystem };
