// Tutorial System - Interactive 7-step guide for new players

export class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.currentStep = 0;
        this.isActive = false;
        this.isCompleted = false;
        
        // Tutorial steps configuration
        this.steps = [
            {
                id: 'welcome',
                title: 'Welcome to AI-Idle! 🤖',
                description: 'Train AI models and build your machine learning empire! This quick tutorial will guide you through the basics.',
                target: null, // No specific target, full screen modal
                position: 'center',
                showSkip: true,
                showNext: true,
                waitForAction: false,
                highlightCombo: false
            },
            {
                id: 'manual-collect',
                title: 'Collect Training Data 📊',
                description: 'Click this button to manually gather training data. Try clicking multiple times quickly to build a combo multiplier!',
                target: '#btn-collect',
                position: 'bottom',
                showSkip: true,
                showNext: false,
                waitForAction: true,
                actionType: 'click',
                actionTarget: '#btn-collect',
                actionCount: 3,
                highlightCombo: true
            },
            {
                id: 'resources',
                title: 'Your Resources 💎',
                description: 'These are your resources. Data is used to build infrastructure and train models. Watch them grow!',
                target: '.stats-bar',
                position: 'bottom',
                showSkip: true,
                showNext: true,
                waitForAction: false,
                highlightCombo: false,
                additionalInfo: [
                    '📊 Data: Used for building and training',
                    '⚡ Compute: Unlocked by buildings, speeds up training',
                    '🎯 Accuracy: Earned from training, goal is 100%',
                    '🔬 Research: Unlocks new technologies'
                ]
            },
            {
                id: 'first-building',
                title: 'Build Infrastructure 🏗️',
                description: 'Buildings generate resources automatically. Purchase your first CPU Core to start passive data generation!',
                target: '#buildings-tier1',
                position: 'top',
                showSkip: true,
                showNext: false,
                waitForAction: true,
                actionType: 'purchase',
                actionTarget: 'cpucore',
                highlightCombo: false
            },
            {
                id: 'first-training',
                title: 'Train Your First Model 🧠',
                description: 'Switch to the Training tab and start training your first neural network! Models generate accuracy and unlock new features.',
                target: '[data-tab="training"]',
                position: 'bottom',
                showSkip: true,
                showNext: false,
                waitForAction: true,
                actionType: 'training',
                highlightCombo: false,
                additionalInfo: [
                    '🧠 Each model has unique requirements',
                    '⏱️ Training takes time (watch the progress bar)',
                    '🎯 Earn accuracy to unlock advanced models'
                ]
            },
            {
                id: 'research',
                title: 'Research & Development 🔬',
                description: 'The Research tab unlocks powerful upgrades and new technologies. Explore it to boost your progress!',
                target: '[data-tab="research"]',
                position: 'bottom',
                showSkip: true,
                showNext: true,
                waitForAction: false,
                highlightCombo: false
            },
            {
                id: 'achievements',
                title: 'Track Your Progress 🏆',
                description: 'Achievements provide permanent bonuses and track your milestones. Check them regularly for rewards!',
                target: '[data-tab="achievements"]',
                position: 'bottom',
                showSkip: false,
                showNext: true,
                waitForAction: false,
                highlightCombo: false,
                finalStep: true
            }
        ];
        
        // Track action progress
        this.actionProgress = 0;
        this.actionRequired = 0;
        
        // DOM elements (initialized in init())
        this.overlay = null;
        this.spotlight = null;
        this.tooltipContainer = null;
        this.tooltip = null;
    }
    
    // Initialize tutorial system
    init() {
        // Check if tutorial was already completed
        const completed = localStorage.getItem('ai-idle-tutorial-completed');
        if (completed === 'true') {
            this.isCompleted = true;
            return;
        }
        
        // Create DOM elements
        this.createTutorialElements();
        
        // Check if we should auto-start
        const autoStart = !localStorage.getItem('ai-idle-tutorial-skipped');
        if (autoStart) {
            // Small delay to let game initialize
            setTimeout(() => this.start(), 500);
        }
    }
    
    // Create tutorial DOM elements
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
    
    // Start tutorial
    start() {
        if (this.isCompleted) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.overlay.style.display = 'block';
        
        // Add active class for animations
        setTimeout(() => this.overlay.classList.add('active'), 10);
        
        this.showStep(0);
    }
    
    // Show specific tutorial step
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
    
    // Update spotlight to highlight target element
    updateSpotlight(step) {
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
    
    // Update tooltip content and position
    updateTooltip(step) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        
        // Header with progress
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
        
        // Title
        const title = document.createElement('h3');
        title.className = 'tutorial-title';
        title.textContent = step.title;
        
        // Description
        const description = document.createElement('p');
        description.className = 'tutorial-description';
        description.textContent = step.description;
        
        // Additional info (if any)
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
        
        // Action progress (if waiting for action)
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
        
        // Buttons
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
        
        // Assemble tooltip
        tooltip.appendChild(header);
        tooltip.appendChild(title);
        tooltip.appendChild(description);
        if (actionProgress) tooltip.appendChild(actionProgress);
        tooltip.appendChild(buttons);
        
        // Clear and add tooltip
        this.tooltipContainer.innerHTML = '';
        this.tooltipContainer.appendChild(tooltip);
        
        // Position tooltip
        this.positionTooltip(step, tooltip);
    }
    
    // Position tooltip relative to target
    positionTooltip(step, tooltip) {
        if (!step.target) {
            // Center on screen
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
        
        // Keep tooltip on screen
        top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
        
        tooltip.style.position = 'fixed';
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
        tooltip.style.transform = 'none';
    }
    
    // Setup action listener for interactive steps
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
    
    // Setup click listener
    setupClickListener(step) {
        const target = document.querySelector(step.actionTarget);
        if (!target) return;
        
        const handler = () => {
            this.actionProgress++;
            this.updateActionProgress();
            
            if (this.actionProgress >= this.actionRequired) {
                target.removeEventListener('click', handler);
                setTimeout(() => this.nextStep(), 800);
            }
        };
        
        target.addEventListener('click', handler);
    }
    
    // Setup purchase listener
    setupPurchaseListener(step) {
        const checkPurchase = setInterval(() => {
            const building = this.game.buildings[step.actionTarget];
            if (building && building.count > 0) {
                clearInterval(checkPurchase);
                this.actionProgress = this.actionRequired;
                this.updateActionProgress();
                setTimeout(() => this.nextStep(), 1000);
            }
        }, 100);
    }
    
    // Setup training listener
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
    }
    
    // Update action progress UI
    updateActionProgress() {
        const countEl = document.getElementById('action-count');
        const fillEl = document.getElementById('action-progress-fill');
        
        if (countEl) {
            countEl.textContent = this.actionProgress;
        }
        
        if (fillEl) {
            const percent = (this.actionProgress / this.actionRequired) * 100;
            fillEl.style.width = percent + '%';
        }
    }
    
    // Highlight combo system
    highlightComboSystem() {
        const comboDisplay = document.querySelector('.combo-display');
        if (comboDisplay) {
            comboDisplay.classList.add('tutorial-highlight-pulse');
        }
    }
    
    // Go to next step
    nextStep() {
        // Remove any temporary highlights
        const highlighted = document.querySelectorAll('.tutorial-highlight-pulse');
        highlighted.forEach(el => el.classList.remove('tutorial-highlight-pulse'));
        
        // Reset z-index of previous target
        const prevStep = this.steps[this.currentStep];
        if (prevStep && prevStep.target) {
            const prevTarget = document.querySelector(prevStep.target);
            if (prevTarget) {
                prevTarget.style.zIndex = '';
            }
        }
        
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.complete();
        }
    }
    
    // Skip tutorial
    skip() {
        if (confirm('Are you sure you want to skip the tutorial? You can restart it later from the settings.')) {
            localStorage.setItem('ai-idle-tutorial-skipped', 'true');
            this.close();
        }
    }
    
    // Complete tutorial
    complete() {
        localStorage.setItem('ai-idle-tutorial-completed', 'true');
        this.isCompleted = true;
        
        // Show completion message
        this.showCompletionMessage();
        
        // Close after delay
        setTimeout(() => this.close(), 3000);
    }
    
    // Show completion message
    showCompletionMessage() {
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip tutorial-completion';
        tooltip.innerHTML = `
            <div class="tutorial-completion-content">
                <div class="completion-icon">🎉</div>
                <h2>Tutorial Complete!</h2>
                <p>You're ready to build your AI empire!</p>
                <p class="completion-hint">💡 Tip: Check the Achievements tab for goals and bonuses!</p>
            </div>
        `;
        
        this.tooltipContainer.innerHTML = '';
        this.tooltipContainer.appendChild(tooltip);
        
        // Center tooltip
        tooltip.style.position = 'fixed';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        
        // Hide spotlight
        this.spotlight.classList.remove('active');
    }
    
    // Close tutorial
    close() {
        this.isActive = false;
        this.overlay.classList.remove('active');
        
        // Remove any z-index overrides
        const currentStep = this.steps[this.currentStep];
        if (currentStep && currentStep.target) {
            const target = document.querySelector(currentStep.target);
            if (target) {
                target.style.zIndex = '';
            }
        }
        
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);
    }
    
    // Restart tutorial (for settings)
    restart() {
        localStorage.removeItem('ai-idle-tutorial-completed');
        localStorage.removeItem('ai-idle-tutorial-skipped');
        this.isCompleted = false;
        this.start();
    }
    
    // Check if tutorial is completed
    isComplete() {
        return this.isCompleted;
    }
}