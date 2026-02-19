/**
 * Deployment UI
 * Tabbed modal: Deploy | Token Shop | Portfolio
 */

import { UPGRADE_DEFINITIONS, canPurchaseUpgrade, purchaseUpgrade } from '../modules/deployment-upgrades.js';
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
        btn.textContent = '🚀 Deploy Model';
        btn.addEventListener('click', () => this._openModal());

        // Insert into the footer-controls so it sits alongside Save/Export/etc.
        const footerControls = document.querySelector('.footer-controls');
        if (footerControls) {
            footerControls.appendChild(btn);
        } else {
            // Fallback: prepend inside #game so it stays above the footer
            const game = document.getElementById('game');
            if (game) {
                const footer = game.querySelector('.game-footer');
                if (footer) {
                    game.insertBefore(btn, footer);
                } else {
                    game.appendChild(btn);
                }
            } else {
                document.body.appendChild(btn);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Modal
    // ─────────────────────────────────────────────────────────────────────────

    _createModal() {
        const existing = document.getElementById('deployment-modal-overlay');
        if (existing) return;

        const overlay = document.createElement('div');
        overlay.id        = 'deployment-modal-overlay';
        overlay.className = 'modal-overlay hidden';
        overlay.innerHTML = `
            <div class="deployment-modal" role="dialog" aria-modal="true" aria-label="Deployment">
                <div class="modal-header">
                    <h2 class="modal-title">🚀 Deployment Center</h2>
                    <button class="modal-close" id="modal-close-btn" aria-label="Close">✕</button>
                </div>
                <div class="modal-tabs">
                    <button class="tab-btn active" data-tab="deploy">Deploy</button>
                    <button class="tab-btn" data-tab="shop">Token Shop</button>
                    <button class="tab-btn" data-tab="portfolio">Portfolio</button>
                </div>
                <div class="modal-body" id="modal-body"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', e => {
            if (e.target === overlay) this._closeModal();
        });

        // Close button
        overlay.querySelector('#modal-close-btn').addEventListener('click', () => this._closeModal());

        // Tab buttons
        overlay.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                this._setActiveTabButton(this.activeTab);
                this._renderActiveTab();
            });
        });
    }

    _openModal() {
        const overlay = document.getElementById('deployment-modal-overlay');
        if (!overlay) return;
        overlay.classList.remove('hidden');
        this.modalOpen = true;
        this._setActiveTabButton(this.activeTab);
        this._renderActiveTab();
    }

    _closeModal() {
        const overlay = document.getElementById('deployment-modal-overlay');
        if (overlay) overlay.classList.add('hidden');
        this.modalOpen = false;
    }

    _renderActiveTab() {
        const body = document.getElementById('modal-body');
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
                        <span class="strategy-icon">${s.icon ?? '📦'}</span>
                        <span class="strategy-name">${s.name}</span>
                        ${isSelected ? '<span class="strategy-badge">Selected</span>' : ''}
                        ${locked ? '<span class="strategy-badge locked-badge">🔒 Locked</span>' : ''}
                    </div>
                    <p class="strategy-desc">${s.description}</p>
                    <div class="strategy-multiplier">Token multiplier: <strong>${s.tokenMultiplier}×</strong></div>
                    ${locked && s.unlockRequirement ? `<div class="strategy-unlock">Unlock: ${s.unlockRequirement}</div>` : ''}
                </div>
            `;
        }).join('');

        const baseEst  = this._estimateBaseTokens();
        const strategy = STRATEGIES.find(s => s.id === selected) ?? STRATEGIES[0];
        const estTokens = Math.floor(baseEst * (strategy?.tokenMultiplier ?? 1));

        return `
            <div class="deploy-tab">
                <div class="deploy-stats">
                    <div class="dstat"><span class="dstat-label">Tokens</span><span class="dstat-value">${tokens}</span></div>
                    <div class="dstat"><span class="dstat-label">Deployments</span><span class="dstat-value">${deployments}</span></div>
                    <div class="dstat"><span class="dstat-label">Est. Reward</span><span class="dstat-value">~${estTokens} tokens</span></div>
                </div>

                <h3 class="section-title">Choose Strategy</h3>
                <div class="strategy-grid">${strategyCards}</div>

                <button class="btn-deploy" id="btn-confirm-deploy">
                    🚀 Deploy Now
                </button>
            </div>
        `;
    }

    _estimateBaseTokens() {
        const gs = this.gameState;
        const models   = gs.stats?.modelsTrained ?? 0;
        const research = gs.deployment?.researchCompletedThisRun ?? 0;
        return Math.max(1, Math.floor(models * 0.5 + research * 2));
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

        // Deploy button
        const deployBtn = document.getElementById('btn-confirm-deploy');
        if (deployBtn) {
            deployBtn.addEventListener('click', () => {
                const result = this.gameState.performDeployment?.();
                if (!result) {
                    this._showNotification('❌ Deployment failed — game state error.', 'error');
                    return;
                }
                if (result.success) {
                    this._showNotification(
                        `🚀 Deployed! Earned ${result.tokensEarned} tokens (${result.strategyId} strategy)`,
                        'success'
                    );
                    this._renderActiveTab();
                    this._updateTokenDisplay();
                } else {
                    this._showNotification(`❌ ${result.reason ?? 'Deployment failed'}`, 'error');
                }
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Token Shop
    // ─────────────────────────────────────────────────────────────────────────

    _renderShopTab() {
        const dep       = this.gameState.deployment;
        const tokens    = dep?.tokens ?? 0;
        const purchased = dep?.upgradesPurchased ?? {};

        const categoryLabels = {
            training:   '⚡ Training',
            efficiency: '🏭 Efficiency',
            research:   '🔬 Research',
            prestige:   '🌟 Prestige',
        };

        // Group UPGRADE_DEFINITIONS by category
        const categories = {};
        for (const upg of Object.values(UPGRADE_DEFINITIONS)) {
            if (!categories[upg.category]) categories[upg.category] = [];
            categories[upg.category].push(upg);
        }

        const sections = Object.entries(categories).map(([cat, upgrades]) => {
            const cards = upgrades.map(upg => {
                const owned = !!purchased[upg.id];
                const { canBuy, reason } = canPurchaseUpgrade(upg.id, purchased, tokens);
                const effectDesc = upg.effect?.multiplier
                    ? `${((upg.effect.multiplier - 1) * 100).toFixed(0)}% ${upg.effect.type}`
                    : upg.effect?.value !== undefined
                        ? `+${upg.effect.value} ${upg.effect.type}`
                        : '';
                const prereqLabel = upg.requires && !purchased[upg.requires]
                    ? `<span class="upgrade-prereq">Requires: ${UPGRADE_DEFINITIONS[upg.requires]?.name ?? upg.requires}</span>`
                    : '';
                const costLabel = `${upg.cost} token${upg.cost !== 1 ? 's' : ''}`;

                return `
                    <div class="upgrade-card ${owned ? 'owned' : ''} ${!canBuy && !owned ? 'unaffordable' : ''}">
                        <div class="upgrade-header">
                            <span class="upgrade-icon">${upg.icon ?? '🔧'}</span>
                            <span class="upgrade-name">${upg.name}</span>
                        </div>
                        <p class="upgrade-desc">${upg.description}</p>
                        ${effectDesc ? `<div class="upgrade-effect">+${effectDesc}</div>` : ''}
                        ${prereqLabel}
                        ${owned
                            ? '<button class="btn-upgrade owned" disabled>✅ Purchased</button>'
                            : `<button class="btn-upgrade ${canBuy ? '' : 'disabled'}"
                                       data-upgrade-id="${upg.id}"
                                       ${canBuy ? '' : 'disabled'}
                                       title="${canBuy ? '' : (reason ?? '')}">
                                   🪙 ${costLabel}
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
                ${sections || '<p class="empty-row">No upgrades available yet.</p>'}
            </div>
        `;
    }

    _bindShopTab() {
        document.querySelectorAll('.btn-upgrade:not(.owned):not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const upgradeId = btn.dataset.upgradeId;
                const dep       = this.gameState.deployment;
                const result    = purchaseUpgrade(upgradeId, dep.upgradesPurchased, dep.tokens);

                if (result.success) {
                    dep.upgradesPurchased = result.upgrades;
                    dep.tokens            = result.remainingTokens;
                    // Invalidate production cache so multipliers are recomputed
                    this.gameState._cachedResearchMultipliers = null;
                    this._renderActiveTab();
                    this._updateTokenDisplay();
                    const upgName = UPGRADE_DEFINITIONS[upgradeId]?.name ?? upgradeId;
                    this._showNotification(`✅ Purchased ${upgName}!`, 'success');
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

            /* ── Deploy button (inside footer-controls) ── */
            .deployment-btn {
                padding: 6px 14px;
                background: linear-gradient(135deg, #6c63ff, #48cfad);
                color: #fff; border: none; border-radius: 6px;
                font-size: 13px; font-weight: 600; cursor: pointer;
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
                display: flex; gap: 4px; padding: 12px 16px 0;
                border-bottom: 1px solid #313244;
            }
            .tab-btn {
                background: none; border: none; color: #a6adc8;
                padding: 8px 16px; cursor: pointer; border-radius: 6px 6px 0 0;
                font-size: 14px; font-weight: 500; transition: all .15s;
            }
            .tab-btn:hover { background: #313244; color: #cdd6f4; }
            .tab-btn.active { background: #313244; color: #cba6f7; border-bottom: 2px solid #cba6f7; }

            /* ── Modal body ── */
            .modal-body { overflow-y: auto; padding: 20px; flex: 1; }

            /* ── Section titles ── */
            .section-title { font-size: 14px; font-weight: 600; color: #a6adc8; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: .05em; }

            /* ── Deploy tab ── */
            .deploy-stats { display: flex; gap: 12px; margin-bottom: 16px; }
            .dstat { background: #313244; border-radius: 8px; padding: 10px 16px; flex: 1; text-align: center; }
            .dstat-label { display: block; font-size: 11px; color: #a6adc8; margin-bottom: 4px; }
            .dstat-value { font-size: 20px; font-weight: 700; color: #cba6f7; }

            .strategy-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; margin-bottom: 20px; }
            .strategy-card {
                background: #313244; border-radius: 8px; padding: 12px;
                border: 2px solid transparent; cursor: pointer; transition: all .15s;
            }
            .strategy-card:hover:not(.locked) { border-color: #6c63ff; }
            .strategy-card.selected { border-color: #cba6f7; background: #3d3a5c; }
            .strategy-card.locked { opacity: .5; cursor: not-allowed; }
            .strategy-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
            .strategy-icon { font-size: 18px; }
            .strategy-name { font-weight: 600; font-size: 14px; }
            .strategy-badge { font-size: 10px; background: #cba6f7; color: #1e1e2e; border-radius: 4px; padding: 1px 5px; margin-left: auto; }
            .locked-badge { background: #585b70; color: #cdd6f4; }
            .strategy-desc { font-size: 12px; color: #a6adc8; margin: 0 0 6px; }
            .strategy-multiplier { font-size: 12px; }
            .strategy-unlock { font-size: 11px; color: #f38ba8; margin-top: 4px; }

            .btn-deploy {
                width: 100%; padding: 12px; font-size: 16px; font-weight: 700;
                background: linear-gradient(135deg, #6c63ff, #48cfad);
                color: #fff; border: none; border-radius: 8px; cursor: pointer;
                transition: opacity .2s;
            }
            .btn-deploy:hover { opacity: .88; }

            /* ── Shop tab ── */
            .shop-balance { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
            .upgrade-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
            .upgrade-card {
                background: #313244; border-radius: 8px; padding: 12px;
                border: 2px solid transparent; transition: border-color .15s;
            }
            .upgrade-card.owned { border-color: #a6e3a1; opacity: .75; }
            .upgrade-card.unaffordable { opacity: .55; }
            .upgrade-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
            .upgrade-icon { font-size: 18px; }
            .upgrade-name { font-weight: 600; font-size: 13px; }
            .upgrade-desc { font-size: 12px; color: #a6adc8; margin: 0 0 6px; }
            .upgrade-effect { font-size: 11px; color: #a6e3a1; margin-bottom: 4px; }
            .upgrade-prereq { font-size: 11px; color: #f9e2af; display: block; margin-bottom: 6px; }
            .btn-upgrade {
                width: 100%; padding: 6px 10px; font-size: 12px; font-weight: 600;
                background: #6c63ff; color: #fff; border: none; border-radius: 6px;
                cursor: pointer; transition: opacity .15s;
            }
            .btn-upgrade:hover:not(:disabled) { opacity: .85; }
            .btn-upgrade.owned { background: #313244; color: #a6e3a1; cursor: default; }
            .btn-upgrade.disabled, .btn-upgrade:disabled { background: #45475a; color: #6c7086; cursor: not-allowed; }

            /* ── Portfolio tab ── */
            .portfolio-rank { display: flex; align-items: center; gap: 12px; background: #313244; border-radius: 8px; padding: 14px; margin-bottom: 16px; }
            .rank-icon { font-size: 36px; }
            .rank-title { font-size: 18px; font-weight: 700; }
            .rank-score { font-size: 13px; color: #a6adc8; }
            .portfolio-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
            .pstat { background: #313244; border-radius: 8px; padding: 10px; text-align: center; }
            .pstat-label { display: block; font-size: 11px; color: #a6adc8; margin-bottom: 4px; }
            .pstat-value { font-size: 16px; font-weight: 700; color: #89dceb; }
            .portfolio-table-wrap { overflow-x: auto; }
            .portfolio-table { width: 100%; border-collapse: collapse; font-size: 13px; }
            .portfolio-table th { background: #313244; padding: 8px 10px; text-align: left; color: #a6adc8; font-weight: 600; }
            .portfolio-table td { padding: 8px 10px; border-bottom: 1px solid #313244; }
            .portfolio-table tr:last-child td { border-bottom: none; }
            .empty-row { color: #6c7086; font-style: italic; text-align: center; padding: 20px !important; }

            /* ── Toast notifications ── */
            .deploy-toast {
                position: fixed; bottom: 60px; right: 16px;
                background: #313244; color: #cdd6f4;
                padding: 10px 16px; border-radius: 8px;
                font-size: 14px; z-index: 2000;
                opacity: 0; transform: translateY(8px);
                transition: opacity .25s, transform .25s;
                max-width: 320px;
            }
            .deploy-toast.visible { opacity: 1; transform: translateY(0); }
            .deploy-toast--success { border-left: 3px solid #a6e3a1; }
            .deploy-toast--error   { border-left: 3px solid #f38ba8; }
            .deploy-toast--info    { border-left: 3px solid #89dceb; }
        `;
        document.head.appendChild(style);
    }
}
