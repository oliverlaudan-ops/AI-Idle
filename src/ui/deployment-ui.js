/**
 * Deployment UI
 * Tabbed modal: Deploy | Token Shop | Portfolio
 */

import { UPGRADES, canPurchaseUpgrade, purchaseUpgrade } from '../modules/deployment-upgrades.js';
import { STRATEGIES, getAvailableStrategies } from '../modules/deployment-strategies.js';
import { getPortfolioSummary, formatRunDuration } from '../modules/deployment-portfolio.js';

export class DeploymentUI {
    constructor(gameState) {
        this.gameState  = gameState;
        this.modalOpen  = false;
        this.activeTab  = 'deploy'; // 'deploy' | 'shop' | 'portfolio'
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Init
    // ─────────────────────────────────────────────────────────────────────────

    init() {
        this._injectStyles();
        this._createDeploymentButton();
        this._createModal();
        this._addTokenDisplay();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public update hook (called by main render loop)
    // ─────────────────────────────────────────────────────────────────────────

    update() {
        this._updateTokenDisplay();
        if (this.modalOpen) this._renderActiveTab();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Token display (always-visible HUD element)
    // ─────────────────────────────────────────────────────────────────────────

    _addTokenDisplay() {
        const existing = document.getElementById('deployment-token-hud');
        if (existing) return;

        const hud = document.createElement('div');
        hud.id        = 'deployment-token-hud';
        hud.className = 'deployment-token-hud';
        hud.innerHTML = `<span class="token-icon">🚀</span> <span id="hud-token-count">0</span> tokens`;
        document.body.appendChild(hud);
    }

    _updateTokenDisplay() {
        const el = document.getElementById('hud-token-count');
        if (el) el.textContent = Math.floor(this.gameState.deployment?.tokens ?? 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Deploy button
    // ─────────────────────────────────────────────────────────────────────────

    _createDeploymentButton() {
        const existing = document.getElementById('deployment-btn');
        if (existing) return;

        const btn = document.createElement('button');
        btn.id        = 'deployment-btn';
        btn.className = 'deployment-btn';
        btn.innerHTML = '🚀 Deploy';
        btn.addEventListener('click', () => this.openModal());

        // Append to sidebar or body fallback
        const sidebar = document.querySelector('.sidebar') || document.body;
        sidebar.appendChild(btn);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Modal scaffold
    // ─────────────────────────────────────────────────────────────────────────

    _createModal() {
        if (document.getElementById('deployment-modal')) return;

        const overlay = document.createElement('div');
        overlay.id        = 'deployment-modal-overlay';
        overlay.className = 'modal-overlay hidden';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });

        overlay.innerHTML = `
            <div class="deployment-modal" id="deployment-modal" role="dialog" aria-modal="true" aria-label="Deployment">
                <div class="modal-header">
                    <h2 class="modal-title">🚀 Deployment</h2>
                    <button class="modal-close" id="deployment-modal-close" aria-label="Close">✕</button>
                </div>

                <!-- Tab bar -->
                <div class="modal-tabs" role="tablist">
                    <button class="tab-btn active" data-tab="deploy"    role="tab">Deploy</button>
                    <button class="tab-btn"         data-tab="shop"     role="tab">Token Shop</button>
                    <button class="tab-btn"         data-tab="portfolio" role="tab">Portfolio</button>
                </div>

                <!-- Tab panels -->
                <div class="modal-body" id="deployment-modal-body">
                    <!-- rendered dynamically -->
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Wire close button
        overlay.querySelector('#deployment-modal-close')
            .addEventListener('click', () => this.closeModal());

        // Wire tab buttons
        overlay.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                overlay.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._renderActiveTab();
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Open / close
    // ─────────────────────────────────────────────────────────────────────────

    openModal() {
        const overlay = document.getElementById('deployment-modal-overlay');
        if (!overlay) return;
        overlay.classList.remove('hidden');
        this.modalOpen = true;
        this.activeTab = 'deploy';
        this._setActiveTabButton('deploy');
        this._renderActiveTab();
    }

    closeModal() {
        const overlay = document.getElementById('deployment-modal-overlay');
        if (overlay) overlay.classList.add('hidden');
        this.modalOpen = false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab routing
    // ─────────────────────────────────────────────────────────────────────────

    _renderActiveTab() {
        const body = document.getElementById('deployment-modal-body');
        if (!body) return;
        switch (this.activeTab) {
            case 'deploy':    body.innerHTML = this._renderDeployTab();    this._bindDeployTab();    break;
            case 'shop':      body.innerHTML = this._renderShopTab();      this._bindShopTab();      break;
            case 'portfolio': body.innerHTML = this._renderPortfolioTab(); break;
        }
    }

    _setActiveTabButton(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === tabId);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Deploy
    // ─────────────────────────────────────────────────────────────────────────

    _renderDeployTab() {
        const dep        = this.gameState.deployment;
        const tokens     = Math.floor(dep?.tokens ?? 0);
        const deployments = dep?.deployments ?? 0;
        const available  = getAvailableStrategies(dep);
        const selected   = dep?.selectedStrategy ?? 'standard';

        const strategyCards = STRATEGIES.map(s => {
            const isAvailable = available.some(a => a.id === s.id);
            const isSelected  = s.id === selected;
            const locked      = !isAvailable;
            return `
                <div class="strategy-card ${isSelected ? 'selected' : ''} ${locked ? 'locked' : ''}"
                     data-strategy="${s.id}" ${locked ? '' : 'role="button" tabindex="0"'}>
                    <div class="strategy-header">
                        <span class="strategy-name">${s.name}</span>
                        <span class="strategy-multiplier">${s.tokenMultiplier}× tokens</span>
                    </div>
                    <p class="strategy-desc">${s.description}</p>
                    ${locked ? `<p class="strategy-lock">🔒 ${s.unlockRequirement}</p>` : ''}
                    ${isSelected ? '<span class="strategy-badge">Selected</span>' : ''}
                </div>
            `;
        }).join('');

        // Estimate tokens for selected strategy
        const stratDef = STRATEGIES.find(s => s.id === selected);
        const mult     = stratDef?.tokenMultiplier ?? 1;
        const baseEst  = this._estimateBaseTokens();
        const estimate = Math.floor(baseEst * mult);

        return `
            <div class="deploy-tab">
                <div class="deploy-stats">
                    <div class="stat-pill">🚀 <strong>${deployments}</strong> deployments</div>
                    <div class="stat-pill">🪙 <strong>${tokens}</strong> tokens available</div>
                </div>

                <h3 class="section-title">Choose Strategy</h3>
                <div class="strategy-grid">${strategyCards}</div>

                <div class="deploy-estimate">
                    Estimated reward: <strong>~${estimate} tokens</strong>
                    <span class="estimate-note">(${mult}× ${stratDef?.name ?? ''} multiplier)</span>
                </div>

                <button class="btn-deploy-confirm" id="btn-confirm-deploy">
                    🚀 Deploy Now
                </button>
                <p class="deploy-warning">⚠️ This will reset your current run. Progress is saved as tokens.</p>
            </div>
        `;
    }

    _bindDeployTab() {
        // Strategy selection
        document.querySelectorAll('.strategy-card:not(.locked)').forEach(card => {
            card.addEventListener('click', () => {
                const stratId = card.dataset.strategy;
                if (this.gameState.deployment) {
                    this.gameState.deployment.selectedStrategy = stratId;
                }
                this._renderActiveTab();
            });
        });

        // Confirm deploy
        const confirmBtn = document.getElementById('btn-confirm-deploy');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this._confirmDeployment());
        }
    }

    _confirmDeployment() {
        const result = this.gameState.performDeployment?.();
        if (!result) return;

        if (result.success) {
            this.closeModal();
            this._showNotification(`✅ Deployed! Earned ${result.tokensEarned} tokens.`, 'success');
            if (typeof window.renderUI === 'function') window.renderUI();
        } else {
            this._showNotification(`❌ ${result.reason ?? 'Cannot deploy yet.'}`, 'error');
        }
    }

    _estimateBaseTokens() {
        const dep = this.gameState.deployment;
        const deployments = dep?.deployments ?? 0;
        // Simple heuristic: base 10 + 2 per previous deployment, capped at 100
        return Math.min(10 + deployments * 2, 100);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Token Shop
    // ─────────────────────────────────────────────────────────────────────────

    _renderShopTab() {
        const dep      = this.gameState.deployment;
        const tokens   = dep?.tokens ?? 0;
        const purchased = dep?.upgradesPurchased ?? {};

        // Group upgrades by category
        const categories = {};
        for (const upg of UPGRADES) {
            if (!categories[upg.category]) categories[upg.category] = [];
            categories[upg.category].push(upg);
        }

        const categoryLabels = {
            training:   '⚡ Training',
            efficiency: '🏭 Efficiency',
            research:   '🔬 Research',
            prestige:   '🌟 Prestige',
        };

        const sections = Object.entries(categories).map(([cat, upgrades]) => {
            const cards = upgrades.map(upg => {
                const level      = purchased[upg.id] ?? 0;
                const maxed      = level >= upg.maxLevel;
                const cost       = upg.baseCost * Math.pow(upg.costScaling ?? 2, level);
                const canAfford  = tokens >= cost;
                const { canPurchase, reason } = canPurchaseUpgrade(purchased, upg.id, tokens);

                return `
                    <div class="upgrade-card ${maxed ? 'maxed' : ''} ${!canPurchase && !maxed ? 'unaffordable' : ''}">
                        <div class="upgrade-header">
                            <span class="upgrade-name">${upg.name}</span>
                            <span class="upgrade-level">${level}/${upg.maxLevel}</span>
                        </div>
                        <p class="upgrade-desc">${upg.description}</p>
                        <div class="upgrade-effect">
                            Effect: +${((upg.effectPerLevel * 100) - 100).toFixed(0)}% per level
                            → current: <strong>${((Math.pow(upg.effectPerLevel, level) * 100) - 100).toFixed(0)}%</strong>
                        </div>
                        ${maxed
                            ? '<button class="btn-upgrade maxed" disabled>✅ Maxed</button>'
                            : `<button class="btn-upgrade ${canPurchase ? '' : 'disabled'}"
                                       data-upgrade-id="${upg.id}"
                                       ${canPurchase ? '' : 'disabled'}
                                       title="${canPurchase ? '' : reason}">
                                   🪙 ${Math.floor(cost)} tokens
                               </button>`
                        }
                    </div>
                `;
            }).join('');

            return `
                <div class="upgrade-section">
                    <h3 class="section-title">${categoryLabels[cat] ?? cat}</h3>
                    <div class="upgrade-grid">${cards}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="shop-tab">
                <div class="shop-balance">
                    🪙 <strong>${Math.floor(tokens)}</strong> tokens available
                </div>
                ${sections}
            </div>
        `;
    }

    _bindShopTab() {
        document.querySelectorAll('.btn-upgrade:not(.maxed):not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const upgradeId = btn.dataset.upgradeId;
                const dep       = this.gameState.deployment;
                const result    = purchaseUpgrade(dep.upgradesPurchased, upgradeId, dep.tokens);

                if (result.success) {
                    dep.upgradesPurchased = result.upgrades;
                    dep.tokens            = result.remainingTokens;
                    // Invalidate production cache so multipliers are recomputed
                    this.gameState._cachedResearchMultipliers = null;
                    this._renderActiveTab();
                    this._updateTokenDisplay();
                    this._showNotification(`✅ Purchased ${upgradeId}!`, 'success');
                } else {
                    this._showNotification(`❌ ${result.reason}`, 'error');
                }
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Portfolio
    // ─────────────────────────────────────────────────────────────────────────

    _renderPortfolioTab() {
        const dep     = this.gameState.deployment;
        const history = dep?.portfolio?.history ?? [];
        const summary = getPortfolioSummary(history, dep?.lifetimeTokens ?? 0);

        const recentRows = summary.recentHistory.length
            ? summary.recentHistory.map(e => `
                <tr>
                    <td>#${e.deploymentNumber}</td>
                    <td>${e.strategyId}</td>
                    <td>${e.tokensEarned}</td>
                    <td>${e.modelsTrainedThisRun}</td>
                    <td>${e.researchCompletedThisRun}</td>
                    <td>${formatRunDuration(e.runDurationMs)}</td>
                </tr>
            `).join('')
            : `<tr><td colspan="6" class="empty-row">No deployments yet — make your first one!</td></tr>`;

        return `
            <div class="portfolio-tab">
                <div class="portfolio-rank">
                    <span class="rank-icon">${summary.rankIcon}</span>
                    <div>
                        <div class="rank-title">${summary.rank}</div>
                        <div class="rank-score">Score: <strong>${summary.score}</strong></div>
                    </div>
                </div>

                <div class="portfolio-stats">
                    <div class="pstat"><span class="pstat-label">Deployments</span><span class="pstat-value">${summary.totalDeployments}</span></div>
                    <div class="pstat"><span class="pstat-label">Lifetime Tokens</span><span class="pstat-value">${summary.lifetimeTokens}</span></div>
                    <div class="pstat"><span class="pstat-label">Models Trained</span><span class="pstat-value">${summary.totalModels}</span></div>
                    <div class="pstat"><span class="pstat-label">Research Done</span><span class="pstat-value">${summary.totalResearch}</span></div>
                    <div class="pstat"><span class="pstat-label">Best Token Run</span><span class="pstat-value">${summary.bestTokenRun}</span></div>
                    <div class="pstat"><span class="pstat-label">Fastest Run</span><span class="pstat-value">${formatRunDuration(summary.fastestRunMs)}</span></div>
                </div>

                <h3 class="section-title">Recent Deployments</h3>
                <div class="portfolio-table-wrap">
                    <table class="portfolio-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Strategy</th><th>Tokens</th>
                                <th>Models</th><th>Research</th><th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>${recentRows}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Notification toast
    // ─────────────────────────────────────────────────────────────────────────

    _showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `deploy-toast deploy-toast--${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Styles (injected once)
    // ─────────────────────────────────────────────────────────────────────────

    _injectStyles() {
        if (document.getElementById('deployment-ui-styles')) return;
        const style = document.createElement('style');
        style.id = 'deployment-ui-styles';
        style.textContent = `
            /* ── HUD token display ── */
            .deployment-token-hud {
                position: fixed; bottom: 16px; right: 16px;
                background: rgba(0,0,0,.75); color: #fff;
                padding: 6px 14px; border-radius: 20px;
                font-size: 14px; z-index: 900;
                display: flex; align-items: center; gap: 6px;
            }

            /* ── Deploy button ── */
            .deployment-btn {
                margin: 8px; padding: 10px 18px;
                background: linear-gradient(135deg, #6c63ff, #48cfad);
                color: #fff; border: none; border-radius: 8px;
                font-size: 15px; font-weight: 600; cursor: pointer;
                transition: opacity .2s;
            }
            .deployment-btn:hover { opacity: .88; }

            /* ── Modal overlay ── */
            .modal-overlay {
                position: fixed; inset: 0;
                background: rgba(0,0,0,.6);
                display: flex; align-items: center; justify-content: center;
                z-index: 1000;
            }
            .modal-overlay.hidden { display: none; }

            /* ── Modal box ── */
            .deployment-modal {
                background: #1e1e2e; color: #cdd6f4;
                border-radius: 12px; width: min(680px, 95vw);
                max-height: 85vh; display: flex; flex-direction: column;
                box-shadow: 0 20px 60px rgba(0,0,0,.5);
                overflow: hidden;
            }
            .modal-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 16px 20px; border-bottom: 1px solid #313244;
            }
            .modal-title { margin: 0; font-size: 20px; }
            .modal-close {
                background: none; border: none; color: #cdd6f4;
                font-size: 18px; cursor: pointer; padding: 4px 8px;
                border-radius: 4px; transition: background .15s;
            }
            .modal-close:hover { background: #313244; }

            /* ── Tabs ── */
            .modal-tabs {
                display: flex; border-bottom: 1px solid #313244;
                padding: 0 12px;
            }
            .tab-btn {
                background: none; border: none; color: #a6adc8;
                padding: 10px 18px; cursor: pointer; font-size: 14px;
                border-bottom: 2px solid transparent; transition: color .15s, border-color .15s;
            }
            .tab-btn:hover { color: #cdd6f4; }
            .tab-btn.active { color: #cba6f7; border-bottom-color: #cba6f7; }

            /* ── Modal body ── */
            .modal-body {
                overflow-y: auto; padding: 20px;
                flex: 1;
            }

            /* ── Shared ── */
            .section-title {
                font-size: 13px; text-transform: uppercase; letter-spacing: .08em;
                color: #a6adc8; margin: 16px 0 8px;
            }

            /* ── Deploy tab ── */
            .deploy-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
            .stat-pill {
                background: #313244; border-radius: 20px;
                padding: 4px 14px; font-size: 13px;
            }
            .strategy-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 10px; margin-bottom: 16px;
            }
            .strategy-card {
                background: #313244; border-radius: 8px; padding: 12px;
                border: 2px solid transparent; cursor: pointer;
                transition: border-color .15s, opacity .15s;
                position: relative;
            }
            .strategy-card:hover:not(.locked) { border-color: #6c63ff; }
            .strategy-card.selected { border-color: #cba6f7; }
            .strategy-card.locked { opacity: .5; cursor: default; }
            .strategy-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .strategy-name { font-weight: 600; font-size: 14px; }
            .strategy-multiplier { color: #a6e3a1; font-size: 13px; }
            .strategy-desc { font-size: 12px; color: #a6adc8; margin: 0 0 6px; }
            .strategy-lock { font-size: 11px; color: #f38ba8; margin: 0; }
            .strategy-badge {
                position: absolute; top: 8px; right: 8px;
                background: #cba6f7; color: #1e1e2e;
                font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px;
            }
            .deploy-estimate {
                background: #313244; border-radius: 8px; padding: 10px 14px;
                font-size: 13px; margin-bottom: 14px;
            }
            .estimate-note { color: #a6adc8; font-size: 12px; margin-left: 6px; }
            .btn-deploy-confirm {
                width: 100%; padding: 12px;
                background: linear-gradient(135deg, #6c63ff, #48cfad);
                color: #fff; border: none; border-radius: 8px;
                font-size: 16px; font-weight: 700; cursor: pointer;
                transition: opacity .2s;
            }
            .btn-deploy-confirm:hover { opacity: .88; }
            .deploy-warning { font-size: 12px; color: #f38ba8; text-align: center; margin-top: 8px; }

            /* ── Shop tab ── */
            .shop-balance {
                background: #313244; border-radius: 8px; padding: 10px 14px;
                font-size: 14px; margin-bottom: 12px;
            }
            .upgrade-section { margin-bottom: 20px; }
            .upgrade-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
            }
            .upgrade-card {
                background: #313244; border-radius: 8px; padding: 12px;
                display: flex; flex-direction: column; gap: 6px;
            }
            .upgrade-card.maxed { opacity: .6; }
            .upgrade-card.unaffordable { opacity: .7; }
            .upgrade-header { display: flex; justify-content: space-between; }
            .upgrade-name { font-weight: 600; font-size: 14px; }
            .upgrade-level { color: #a6adc8; font-size: 12px; }
            .upgrade-desc { font-size: 12px; color: #a6adc8; margin: 0; }
            .upgrade-effect { font-size: 12px; color: #89dceb; }
            .btn-upgrade {
                margin-top: auto; padding: 7px 10px;
                background: #6c63ff; color: #fff;
                border: none; border-radius: 6px; cursor: pointer;
                font-size: 13px; font-weight: 600; transition: opacity .15s;
            }
            .btn-upgrade:hover:not(:disabled) { opacity: .85; }
            .btn-upgrade.maxed { background: #313244; color: #a6adc8; cursor: default; }
            .btn-upgrade.disabled, .btn-upgrade:disabled { background: #45475a; cursor: not-allowed; }

            /* ── Portfolio tab ── */
            .portfolio-rank {
                display: flex; align-items: center; gap: 14px;
                background: #313244; border-radius: 10px; padding: 14px;
                margin-bottom: 14px;
            }
            .rank-icon { font-size: 36px; }
            .rank-title { font-size: 18px; font-weight: 700; }
            .rank-score { font-size: 13px; color: #a6adc8; }
            .portfolio-stats {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 8px; margin-bottom: 16px;
            }
            .pstat {
                background: #313244; border-radius: 8px; padding: 10px;
                display: flex; flex-direction: column; gap: 4px;
            }
            .pstat-label { font-size: 11px; color: #a6adc8; text-transform: uppercase; letter-spacing: .05em; }
            .pstat-value { font-size: 18px; font-weight: 700; }
            .portfolio-table-wrap { overflow-x: auto; }
            .portfolio-table {
                width: 100%; border-collapse: collapse; font-size: 13px;
            }
            .portfolio-table th, .portfolio-table td {
                padding: 8px 10px; text-align: left;
                border-bottom: 1px solid #313244;
            }
            .portfolio-table th { color: #a6adc8; font-weight: 600; }
            .empty-row { text-align: center; color: #a6adc8; padding: 20px; }

            /* ── Toast ── */
            .deploy-toast {
                position: fixed; bottom: 60px; right: 16px;
                padding: 10px 18px; border-radius: 8px;
                font-size: 14px; font-weight: 600;
                opacity: 0; transform: translateY(8px);
                transition: opacity .25s, transform .25s;
                z-index: 2000; pointer-events: none;
            }
            .deploy-toast.visible { opacity: 1; transform: translateY(0); }
            .deploy-toast--success { background: #a6e3a1; color: #1e1e2e; }
            .deploy-toast--error   { background: #f38ba8; color: #1e1e2e; }
            .deploy-toast--info    { background: #89dceb; color: #1e1e2e; }
        `;
        document.head.appendChild(style);
    }
}
