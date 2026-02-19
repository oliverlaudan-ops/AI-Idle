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
        this._spotlightRafId = null;

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
                position: 'above',
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
                position: 'above',
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
        if (!this.overlay) {
            this.overlay = document.getElementById('tutorial-overlay');
        }
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'tutorial-overlay';
            this.overlay.className = 'tutorial-overlay';
            document.body.appendChild(this.overlay);
        }
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: '3000',
            pointerEvents: 'none',
            display: 'none'
        });

        // ── Spotlight ────────────────────────────────────────────────────────
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
            pointerEvents: 'none',
            borderRadius: '4px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            display: 'none'
        });

        // ── Tooltip ──────────────────────────────────────────────────────────
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
            pointerEvents: 'auto',
            display: 'none'
        });
    }

    start() {
        if (this.isCompleted) return;

        this._ensureElements();

        if (!this.overlay) {
            console.error('TutorialSystem: overlay element could not be created');
            return;
        }

        this.isActive = true;
        this.currentStep = 0;
        this.overlay.style.display = 'block';

        setTimeout(() => {
            if (this.overlay) this.overlay.classList.add('active');
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

        // Highlight target first (with rAF sizing), then position tooltip relative to final rect
        if (step.target) {
            this._highlightTarget(step.target, () => {
                this._positionTooltip(step);
            });
        } else {
            this._clearSpotlight();
            this._positionTooltip(step);
        }

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

    /**
     * Highlight the target element with the spotlight.
     * Uses a requestAnimationFrame retry loop to wait until the element has
     * a non-zero rendered size (avoids the 11×11px bug when called before layout).
     * Calls onReady() once the spotlight is correctly positioned.
     */
    _highlightTarget(selector, onReady) {
        // Cancel any pending rAF from a previous step
        if (this._spotlightRafId !== null) {
            cancelAnimationFrame(this._spotlightRafId);
            this._spotlightRafId = null;
        }

        const padding = 8;
        const minSize = 20; // px — anything smaller means the element isn't rendered yet
        let attempts = 0;
        const maxAttempts = 60; // ~1 second at 60fps

        const tryPosition = () => {
            attempts++;
            const target = document.querySelector(selector);

            if (!target) {
                if (attempts < maxAttempts) {
                    this._spotlightRafId = requestAnimationFrame(tryPosition);
                } else {
                    console.warn(`TutorialSystem: target "${selector}" not found after ${maxAttempts} frames`);
                    this._clearSpotlight();
                    if (onReady) onReady(null);
                }
                return;
            }

            const rect = target.getBoundingClientRect();

            // Retry if element has no rendered size yet
            if (rect.width < minSize || rect.height < minSize) {
                if (attempts < maxAttempts) {
                    this._spotlightRafId = requestAnimationFrame(tryPosition);
                } else {
                    console.warn(`TutorialSystem: target "${selector}" still too small (${rect.width}×${rect.height}) after ${maxAttempts} frames — using as-is`);
                    applySpotlight(rect);
                }
                return;
            }

            applySpotlight(rect);
        };

        const applySpotlight = (rect) => {
            this._spotlightRafId = null;
            Object.assign(this.spotlight.style, {
                display: 'block',
                top:    `${rect.top    - padding}px`,
                left:   `${rect.left   - padding}px`,
                width:  `${rect.width  + padding * 2}px`,
                height: `${rect.height + padding * 2}px`
            });
            if (onReady) onReady(rect);
        };

        this._spotlightRafId = requestAnimationFrame(tryPosition);
    }

    _clearSpotlight() {
        if (this._spotlightRafId !== null) {
            cancelAnimationFrame(this._spotlightRafId);
            this._spotlightRafId = null;
        }
        if (this.spotlight) {
            this.spotlight.style.display = 'none';
        }
    }

    /**
     * Position the tooltip so it never overlaps the spotlighted target.
     *
     * Supported positions (from step definition):
     *   'center'  — centred on screen (no target)
     *   'bottom'  — below the target; falls back to above if no room
     *   'above'   — above the target; falls back to below if no room  (use for tab bars)
     *   'top'     — alias for 'above'
     *   'right'   — right of the target; falls back to left if no room
     *   'left'    — left of the target; falls back to right if no room
     *
     * The tooltip is always kept within the viewport with an 8px margin.
     */
    _positionTooltip(step, targetRect) {
        this.tooltipContainer.style.display = 'block';

        // Reset transforms/positions before measuring
        Object.assign(this.tooltipContainer.style, {
            top: '', left: '', right: '', bottom: '', transform: ''
        });

        if (!step.target || step.position === 'center') {
            Object.assign(this.tooltipContainer.style, {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            return;
        }

        // If we weren't given a rect (called before rAF completes), look it up now
        const rect = targetRect || (() => {
            const el = document.querySelector(step.target);
            return el ? el.getBoundingClientRect() : null;
        })();

        if (!rect) {
            Object.assign(this.tooltipContainer.style, {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            return;
        }

        const tooltipW = 320;
        const tooltipH = this.tooltipContainer.offsetHeight || 220;
        const margin   = 12;
        const edge     = 8;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Clamp helper — keeps tooltip inside viewport
        const clampX = (x) => Math.max(edge, Math.min(x, vw - tooltipW - edge));
        const clampY = (y) => Math.max(edge, Math.min(y, vh - tooltipH - edge));

        let top, left;
        const pos = step.position;

        if (pos === 'bottom') {
            // Prefer below; fall back to above
            if (rect.bottom + margin + tooltipH <= vh - edge) {
                top  = rect.bottom + margin;
                left = clampX(rect.left);
            } else {
                top  = clampY(rect.top - tooltipH - margin);
                left = clampX(rect.left);
            }
        } else if (pos === 'above' || pos === 'top') {
            // Prefer above; fall back to below
            if (rect.top - margin - tooltipH >= edge) {
                top  = rect.top - tooltipH - margin;
                left = clampX(rect.left);
            } else {
                top  = rect.bottom + margin;
                left = clampX(rect.left);
            }
        } else if (pos === 'right') {
            // Prefer right; fall back to left
            if (rect.right + margin + tooltipW <= vw - edge) {
                top  = clampY(rect.top);
                left = rect.right + margin;
            } else {
                top  = clampY(rect.top);
                left = clampX(rect.left - tooltipW - margin);
            }
        } else if (pos === 'left') {
            // Prefer left; fall back to right
            if (rect.left - margin - tooltipW >= edge) {
                top  = clampY(rect.top);
                left = rect.left - tooltipW - margin;
            } else {
                top  = clampY(rect.top);
                left = rect.right + margin;
            }
        } else {
            // Unknown position — centre
            Object.assign(this.tooltipContainer.style, {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            return;
        }

        Object.assign(this.tooltipContainer.style, {
            top:  `${top}px`,
            left: `${left}px`,
            transform: ''
        });
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
            if (this.overlay) this.overlay.style.display = 'none';
            this._clearSpotlight();
            if (this.tooltipContainer) this.tooltipContainer.style.display = 'none';
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
