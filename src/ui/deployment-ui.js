// Deployment (Prestige) UI System

export class DeploymentUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.modalOpen = false;
    }
    
    // Initialize UI elements
    init() {
        this.createDeploymentButton();
        this.createDeploymentModal();
        this.addTokenDisplay();
    }
    
    // Add token display to header (next to resources)
    addTokenDisplay() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        // Create token display
        const tokenDisplay = document.createElement('div');
        tokenDisplay.id = 'deployment-tokens';
        tokenDisplay.className = 'deployment-tokens';
        tokenDisplay.innerHTML = `
            <span class="token-icon">🎖️</span>
            <span class="token-count">0</span>
            <span class="token-label">Tokens</span>
        `;
        
        // Insert after resources
        const resources = header.querySelector('.resources');
        if (resources) {
            resources.insertAdjacentElement('afterend', tokenDisplay);
        } else {
            header.appendChild(tokenDisplay);
        }
    }
    
    // Create deployment button in header
    createDeploymentButton() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        const button = document.createElement('button');
        button.id = 'deployment-btn';
        button.className = 'deployment-btn';
        button.innerHTML = `
            <span class="btn-icon">🚀</span>
            <span class="btn-text">Deploy Model</span>
        `;
        
        button.addEventListener('click', () => this.openModal());
        
        header.appendChild(button);
    }
    
    // Create deployment modal
    createDeploymentModal() {
        const modal = document.createElement('div');
        modal.id = 'deployment-modal';
        modal.className = 'deployment-modal hidden';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🚀 Deploy Your Model</h2>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="deployment-warning">
                        <div class="warning-icon">⚠️</div>
                        <div class="warning-text">
                            <strong>Warning:</strong> Deployment will reset your current progress!
                        </div>
                    </div>
                    
                    <div class="deployment-stats">
                        <div class="stat-card">
                            <div class="stat-label">Current Tokens</div>
                            <div class="stat-value" id="current-tokens">0</div>
                        </div>
                        
                        <div class="stat-card highlight">
                            <div class="stat-label">Tokens on Deploy</div>
                            <div class="stat-value" id="tokens-on-deploy">+0</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-label">Total After Deploy</div>
                            <div class="stat-value" id="total-tokens">0</div>
                        </div>
                    </div>
                    
                    <div class="deployment-progress">
                        <div class="progress-label">
                            <span>Progress to Next Token</span>
                            <span id="next-token-eta">250K Accuracy needed</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="token-progress"></div>
                        </div>
                    </div>
                    
                    <div class="deployment-info">
                        <h3>What gets reset:</h3>
                        <ul>
                            <li>🗄️ All Resources (Data, Compute, Accuracy, Research)</li>
                            <li>🏗️ All Buildings and Infrastructure</li>
                            <li>🤖 All Models and Training Progress</li>
                            <li>🔬 All Research (unlocks persist in future runs)</li>
                        </ul>
                        
                        <h3>What you keep:</h3>
                        <ul class="keep-list">
                            <li>🎖️ Deployment Tokens (spend on permanent upgrades)</li>
                            <li>🏆 All Achievements (bonuses stay active)</li>
                            <li>📊 Lifetime Statistics</li>
                        </ul>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-cancel">Cancel</button>
                    <button class="btn-deploy" id="confirm-deploy">
                        <span class="btn-icon">🚀</span>
                        <span>Deploy Model</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        modal.querySelector('.btn-cancel').addEventListener('click', () => this.closeModal());
        modal.querySelector('#confirm-deploy').addEventListener('click', () => this.confirmDeployment());
    }
    
    // Open deployment modal
    openModal() {
        const modal = document.getElementById('deployment-modal');
        if (!modal) return;
        
        this.updateModalContent();
        modal.classList.remove('hidden');
        this.modalOpen = true;
    }
    
    // Close deployment modal
    closeModal() {
        const modal = document.getElementById('deployment-modal');
        if (!modal) return;
        
        modal.classList.add('hidden');
        this.modalOpen = false;
    }
    
    // Update modal content with current stats
    updateModalContent() {
        const info = this.gameState.getDeploymentInfo();
        
        document.getElementById('current-tokens').textContent = info.currentTokens;
        document.getElementById('tokens-on-deploy').textContent = '+' + info.tokensOnDeploy;
        document.getElementById('total-tokens').textContent = info.potentialTokens;
        
        // Update progress bar
        const progress = Math.min(100, Math.max(0, info.percentToNext || 0));
        const progressFill = document.getElementById('token-progress');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        // Update ETA text
        const etaText = document.getElementById('next-token-eta');
        if (etaText) {
            if (info.requiredForNext > 0) {
                etaText.textContent = this.formatNumber(info.requiredForNext) + ' Accuracy needed';
            } else {
                etaText.textContent = 'Next milestone reached!';
            }
        }
        
        // Update deploy button state
        const deployBtn = document.getElementById('confirm-deploy');
        if (deployBtn) {
            if (info.canDeploy) {
                deployBtn.disabled = false;
                deployBtn.classList.remove('disabled');
            } else {
                deployBtn.disabled = true;
                deployBtn.classList.add('disabled');
            }
        }
    }
    
    // Confirm and perform deployment
    confirmDeployment() {
        const result = this.gameState.performDeployment();
        
        if (result.success) {
            // Show success notification
            this.showDeploymentSuccess(result);
            this.closeModal();
            
            // Force UI update
            if (window.renderUI) {
                window.renderUI();
            }
        } else {
            // Show error
            alert('Cannot deploy: ' + result.reason);
        }
    }
    
    // Show deployment success notification
    showDeploymentSuccess(result) {
        const notification = document.createElement('div');
        notification.className = 'deployment-success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🚀</div>
                <div class="notification-text">
                    <strong>Deployment Successful!</strong>
                    <div>Earned ${result.tokensEarned} Token${result.tokensEarned !== 1 ? 's' : ''}!</div>
                    <div class="total-tokens">Total: ${result.newTotalTokens} Tokens</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
    
    // Update deployment button state
    update() {
        const info = this.gameState.getDeploymentInfo();
        
        // Update token display
        const tokenCount = document.querySelector('.token-count');
        if (tokenCount) {
            tokenCount.textContent = info.currentTokens;
        }
        
        // Update deployment button
        const deployBtn = document.getElementById('deployment-btn');
        if (deployBtn) {
            if (info.canDeploy) {
                deployBtn.classList.add('available');
                deployBtn.title = `Deploy to earn ${info.tokensOnDeploy} token${info.tokensOnDeploy !== 1 ? 's' : ''}!`;
            } else {
                deployBtn.classList.remove('available');
                deployBtn.title = `Need ${this.formatNumber(info.requiredForNext)} more Accuracy`;
            }
        }
        
        // Update modal if open
        if (this.modalOpen) {
            this.updateModalContent();
        }
    }
    
    // Format large numbers
    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }
}