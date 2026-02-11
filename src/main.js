// Main Game Initialization and Loop - OPTIMIZED

import { GameState } from './modules/game-state.js';
import { initializeUI } from './ui/ui-init.js';
import { renderAll, showToast } from './ui/ui-render.js';
import { TutorialSystem } from './ui/tutorial.js';
import { TrainingQueueUI } from './ui/training-queue-ui.js';
import { BulkPurchaseUI } from './ui/bulk-purchase-ui.js';
import { SettingsUI } from './ui/settings-ui.js';
import { HotkeySystem } from './modules/hotkeys.js';
import { initializeSmartPredictor } from './modules/achievements.js';

// Game loop constants - OPTIMIZED
const LOOP_CONSTANTS = {
    TICK_INTERVAL: 100, // Update every 100ms (10 times per second)
    RENDER_INTERVAL: 100, // Render every 100ms (matches tick for now)
    SAVE_INTERVAL: 30000, // Auto-save every 30 seconds
    MAX_OFFLINE_TIME: 24 * 60 * 60 * 1000, // Max 24 hours offline progression
    MIN_OFFLINE_TIME: 5000, // Minimum 5 seconds to show offline progress
    OFFLINE_MODAL_DELAY: 500, // Delay before showing offline modal
    ACHIEVEMENT_DISPLAY_TIME: 5000, // How long to show achievement notifications
    ACHIEVEMENT_ANIMATION_TIME: 300, // Animation duration for achievement toast
    PERFORMANCE_WARNING_THRESHOLD: 200 // Warn if frame takes >200ms
};

// Storage keys
const STORAGE_KEY = 'ai-idle-save';

// Global game instance
window.game = null;
window.tutorial = null;
window.queueUI = null;
window.bulkPurchaseUI = null;
window.settingsUI = null;
window.hotkeys = null;
window.aiLab = null; // Lazy-loaded AI Lab

// Game loop state
let gameLoopInterval = null;
let renderLoopInterval = null;
let lastSave = Date.now();
let performanceWarningCount = 0;

// Initialize the game
async function init() {
    console.log('🤖 AI-Idle starting...');
    
    try {
        // Create game state
        window.game = new GameState();
        
        let hasOfflineProgress = false;
        let offlineGains = null;
        
        // Try to load saved game
        const savedGame = localStorage.getItem(STORAGE_KEY);
        if (savedGame) {
            console.log('📂 Loading saved game...');
            try {
                const saveData = JSON.parse(savedGame);
                const loaded = window.game.load(saveData);
                
                if (!loaded) {
                    throw new Error('Failed to load save data');
                }
                
                // Calculate offline progression
                const offlineTime = Date.now() - window.game.lastSaveTime;
                if (offlineTime > LOOP_CONSTANTS.MIN_OFFLINE_TIME) {
                    console.log(`⏰ Processing ${(offlineTime / 1000).toFixed(0)}s of offline time`);
                    
                    const beforeData = window.game.resources.data.amount;
                    const beforeAccuracy = window.game.resources.accuracy.amount;
                    const beforeResearch = window.game.resources.research.amount;
                    
                    window.game.processOfflineProgress(offlineTime);
                    
                    offlineGains = {
                        time: offlineTime,
                        data: window.game.resources.data.amount - beforeData,
                        accuracy: window.game.resources.accuracy.amount - beforeAccuracy,
                        research: window.game.resources.research.amount - beforeResearch
                    };
                    
                    hasOfflineProgress = true;
                }
            } catch (e) {
                console.error('❌ Failed to load save:', e);
                showToast('Failed to load save game. Starting fresh.', 'warning');
                window.game = new GameState();
            }
        } else {
            console.log('✨ Starting new game');
            const shouldShowWelcome = localStorage.getItem('ai-idle-tutorial-completed') === 'true' || 
                                     localStorage.getItem('ai-idle-tutorial-skipped') === 'true';
            if (shouldShowWelcome) {
                showToast('Welcome to AI-Idle! Click "Collect Data" to begin.', 'success');
            }
        }
        
        // Initialize Smart Achievement Predictor BEFORE UI
        console.log('🧠 Initializing Smart Achievement Predictor...');
        try {
            // Check if TensorFlow.js is available
            if (typeof tf !== 'undefined') {
                await initializeSmartPredictor(window.game);
                console.log('✅ Smart Predictor ready');
            } else {
                console.log('⚠️ TensorFlow.js not loaded - will initialize predictor when AI Lab opens');
            }
        } catch (error) {
            console.warn('⚠️ Smart Predictor initialization deferred:', error.message);
        }
        
        // Initialize UI
        console.log('🎨 Initializing UI...');
        initializeUI(window.game);
        
        // Initialize systems
        console.log('🎓 Initializing systems...');
        window.tutorial = new TutorialSystem(window.game);
        window.tutorial.init();
        
        window.queueUI = new TrainingQueueUI(window.game);
        window.queueUI.init();
        
        window.bulkPurchaseUI = new BulkPurchaseUI(window.game);
        window.bulkPurchaseUI.init();
        
        window.settingsUI = new SettingsUI(window.game.settings, window.game);
        window.settingsUI.init();
        
        window.hotkeys = new HotkeySystem(window.game);
        window.hotkeys.init();
        
        // Setup hotkey button
        const hotkeyBtn = document.getElementById('btn-hotkeys');
        if (hotkeyBtn) {
            hotkeyBtn.addEventListener('click', () => window.hotkeys.showHelp());
        }
        
        // Setup AI Lab lazy loading
        setupAILabLazyLoad();
        
        // Apply settings
        window.game.settings.apply(window.game);
        
        // Initial render
        renderAll(window.game);
        
        // Show offline progress modal
        if (hasOfflineProgress && offlineGains && window.tutorial.isComplete()) {
            setTimeout(() => showOfflineProgressModal(offlineGains), LOOP_CONSTANTS.OFFLINE_MODAL_DELAY);
        }
        
        // Start optimized game loops
        console.log('▶️ Starting optimized game loops...');
        startGameLoops();
        
        console.log('✅ AI-Idle initialized successfully!');
        
    } catch (error) {
        console.error('💥 Critical error during initialization:', error);
        showCriticalError(error);
    }
}

// Setup AI Lab lazy loading (only load TensorFlow.js when tab is opened)
function setupAILabLazyLoad() {
    const aiLabTab = document.querySelector('[data-tab="ai-lab"]');
    if (!aiLabTab) return;
    
    aiLabTab.addEventListener('click', async () => {
        if (window.aiLab) return; // Already loaded
        
        const statusEl = document.getElementById('ai-lab-status');
        if (statusEl) statusEl.textContent = 'Loading TensorFlow.js...';
        
        try {
            // Load TensorFlow.js dynamically if not already loaded
            await loadTensorFlow();
            
            if (statusEl) statusEl.textContent = 'Initializing AI modules...';
            
            // Initialize Smart Predictor now if not already done
            const { getSmartPredictor } = await import('./modules/achievements.js');
            let predictor = getSmartPredictor();
            
            if (!predictor) {
                console.log('[AI Lab] Initializing Smart Predictor...');
                const { initializeSmartPredictor } = await import('./modules/achievements.js');
                predictor = await initializeSmartPredictor(window.game);
            }
            
            // Dynamically import AI modules
            const { AILabUI } = await import('./ui/ai-lab-ui.js');
            
            window.aiLab = new AILabUI(window.game);
            await window.aiLab.init();
            
            console.log('✅ AI Lab loaded successfully!');
        } catch (error) {
            console.error('❌ Failed to load AI Lab:', error);
            const content = document.getElementById('ai-lab-content');
            if (content) {
                content.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #e63946;">
                        <h3>⚠️ Failed to load AI Lab</h3>
                        <p>${error.message}</p>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 1rem;">
                            ${error.stack ? error.stack.split('\n').slice(0, 3).join('<br>') : ''}
                        </p>
                        <button class="btn-primary" onclick="location.reload()" style="margin-top: 1rem;">Reload Page</button>
                    </div>
                `;
            }
        }
    }, { once: true }); // Only fire once
}

// Load TensorFlow.js dynamically
function loadTensorFlow() {
    return new Promise((resolve, reject) => {
        if (typeof tf !== 'undefined') {
            console.log('✅ TensorFlow.js already loaded');
            return resolve();
        }
        
        const loaderScript = document.getElementById('tensorflow-loader');
        if (!loaderScript) {
            return reject(new Error('TensorFlow loader script not found'));
        }
        
        const src = loaderScript.getAttribute('data-src');
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous'; // Prevent tracking prevention issues
        
        script.onload = () => {
            console.log('✅ TensorFlow.js loaded:', tf.version.tfjs);
            resolve();
        };
        
        script.onerror = () => {
            reject(new Error('Failed to load TensorFlow.js from CDN'));
        };
        
        document.head.appendChild(script);
    });
}

// Start optimized game loops using setInterval instead of RAF
function startGameLoops() {
    // Game update loop (10Hz - every 100ms)
    gameLoopInterval = setInterval(() => {
        const startTime = performance.now();
        
        try {
            // Update game state
            window.game.update(LOOP_CONSTANTS.TICK_INTERVAL / 1000);
            
            // Check achievements
            const newAchievements = window.game.popNewlyUnlockedAchievements();
            for (const { id, achievement } of newAchievements) {
                showAchievementUnlock(achievement);
            }
            
            // Auto-save check
            const now = Date.now();
            const autoSaveInterval = window.game.settings.get('gameplay', 'autoSaveInterval');
            if (now - lastSave >= autoSaveInterval) {
                saveGame(true);
                lastSave = now;
            }
            
            // Performance monitoring
            const elapsed = performance.now() - startTime;
            if (elapsed > LOOP_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD) {
                performanceWarningCount++;
                if (performanceWarningCount > 10) {
                    showPerformanceWarning();
                    performanceWarningCount = 0; // Reset counter
                }
            } else {
                performanceWarningCount = Math.max(0, performanceWarningCount - 1);
            }
            
        } catch (error) {
            console.error('💥 Error in game loop:', error);
            saveGame();
            showToast('Game loop error! Check console. Game saved.', 'error');
        }
    }, LOOP_CONSTANTS.TICK_INTERVAL);
    
    // Render loop (10Hz - every 100ms, matches game loop for now)
    renderLoopInterval = setInterval(() => {
        try {
            renderAll(window.game);
            
            if (window.queueUI) window.queueUI.update();
            if (window.bulkPurchaseUI) window.bulkPurchaseUI.update();
            
        } catch (error) {
            console.error('💥 Error in render loop:', error);
        }
    }, LOOP_CONSTANTS.RENDER_INTERVAL);
    
    console.log('✅ Game loops started (setInterval-based)');
}

// Show performance warning
function showPerformanceWarning() {
    const indicator = document.getElementById('performance-indicator');
    const warning = document.getElementById('performance-warning');
    
    if (indicator) indicator.style.display = 'inline';
    if (warning) warning.style.display = 'inline';
    
    console.warn('⚠️ Performance degradation detected. Consider closing other tabs or reducing game settings.');
    
    // Hide after 10 seconds
    setTimeout(() => {
        if (indicator) indicator.style.display = 'none';
        if (warning) warning.style.display = 'none';
    }, 10000);
}

// Show critical error screen
function showCriticalError(error) {
    document.body.innerHTML = `
        <div style="color: white; text-align: center; padding: 50px; font-family: monospace;">
            <h1>❌ Initialization Error</h1>
            <p>Failed to start AI-Idle. Check console for details.</p>
            <pre style="text-align: left; max-width: 800px; margin: 20px auto; background: #1a1a1a; padding: 20px; border-radius: 10px; overflow: auto;">${error.stack || error.message || 'Unknown error'}</pre>
            <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #667eea; color: white; border: none; border-radius: 8px; margin: 10px;">Reload Page</button>
            <button onclick="localStorage.removeItem('${STORAGE_KEY}'); location.reload();" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #e63946; color: white; border: none; border-radius: 8px; margin: 10px;">Reset Save & Reload</button>
        </div>
    `;
}

// Show achievement unlock notification
function showAchievementUnlock(achievement) {
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
    
    if (!window.game.settings.get('notifications', 'achievements')) return;
    
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast achievement';
    toast.innerHTML = `
        <div class="achievement-toast">
            <div class="achievement-toast-icon">${achievement.icon}</div>
            <div class="achievement-toast-content">
                <div class="achievement-toast-title">🏆 Achievement Unlocked!</div>
                <div class="achievement-toast-name">${achievement.name}</div>
                <div class="achievement-toast-reward">+${achievement.reward}</div>
            </div>
        </div>
    `;
    
    container.appendChild(toast);
    
    if (window.game.settings.get('notifications', 'sound')) {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVqzn77BdGAg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2jtXzzn0uBSd7yvLekDcJGGe+7ueXRA0PU6nm8bllHQU4kdXzzn4vBSh9y/LfkjgJGWm/7+aXRA8OU6vl8bplHgU4ktXzzn8wBSl+y/LgkzgKGWm/7+aXRQ8RUqrl8bplHgU4ktXzzoAwBil+y/LgkzkKGWnA7+aXRQ8RUqrl8bpmHgU4ktX0zoAwBil+y/LhlDoKGWnA7+aYRQ8RUqrl8bpmHgU4ktX0z4AwBil+y/LhlzwLGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhlzwLGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4EwBil+y/LhmD0LGWnA7+aYRg8RUqrl8bpmHgU4ktX0z4E');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        } catch (e) {}
    }
    
    const displayTime = window.game.settings.get('notifications', 'toastDuration');
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), LOOP_CONSTANTS.ACHIEVEMENT_ANIMATION_TIME);
    }, displayTime);
}

// Save game
function saveGame(isAutoSave = false) {
    try {
        const saveData = window.game.save();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        
        const lastSaveElement = document.getElementById('last-save-time');
        if (lastSaveElement) {
            lastSaveElement.textContent = new Date().toLocaleTimeString();
        }
        
        if (!isAutoSave) {
            console.log('💾 Game saved');
            showToast('Game saved successfully!', 'success');
        }
    } catch (error) {
        console.error('❌ Failed to save game:', error);
        showToast('Failed to save game! ' + error.message, 'error');
    }
}

// Show offline progress modal
function showOfflineProgressModal(gains) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'offline-modal';
    
    const timeString = formatOfflineTime(gains.time);
    const hasGains = gains.data > 0 || gains.accuracy > 0 || gains.research > 0;
    
    modal.innerHTML = `
        <div class="modal-content offline-modal-content">
            <div class="modal-header">
                <h2>⏰ Welcome Back!</h2>
            </div>
            <div class="modal-body">
                <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">You were away for <strong>${timeString}</strong></p>
                <div class="offline-gains">
                    <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">Resources Gained:</h3>
                    ${gains.data > 0 ? `<div class="offline-gain-item">📊 <strong>${formatNumber(gains.data)}</strong> Training Data</div>` : ''}
                    ${gains.accuracy > 0 ? `<div class="offline-gain-item">🎯 <strong>${formatNumber(gains.accuracy)}</strong> Accuracy</div>` : ''}
                    ${gains.research > 0 ? `<div class="offline-gain-item">🔬 <strong>${formatNumber(gains.research)}</strong> Research Points</div>` : ''}
                    ${!hasGains ? '<p style="color: var(--text-secondary);">No production yet. Build infrastructure to gain offline progress!</p>' : ''}
                </div>
                <div class="modal-actions" style="margin-top: 2rem;">
                    <button class="btn-primary" onclick="document.getElementById('offline-modal').remove()" style="width: 100%; padding: 1rem;">Continue</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeHandler = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeHandler);
        }
    };
    document.addEventListener('keydown', closeHandler);
}

// Format offline time
function formatOfflineTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours % 24} hour${(hours % 24) !== 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes % 60} minute${(minutes % 60) !== 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

// Format number
function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    return (num / 1000000000000).toFixed(1) + 'T';
}

// Handle page visibility
let wasHidden = false;
let hiddenTime = 0;

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (window.game && window.game.settings.get('gameplay', 'pauseOnBlur')) {
            wasHidden = true;
            hiddenTime = Date.now();
        }
        saveGame();
    } else if (wasHidden) {
        const offlineTime = Date.now() - hiddenTime;
        if (offlineTime > LOOP_CONSTANTS.MIN_OFFLINE_TIME) {
            const beforeData = window.game.resources.data.amount;
            const beforeAccuracy = window.game.resources.accuracy.amount;
            const beforeResearch = window.game.resources.research.amount;
            
            window.game.processOfflineProgress(offlineTime);
            
            const gains = [];
            if (window.game.resources.data.amount - beforeData > 0) gains.push(`${formatNumber(window.game.resources.data.amount - beforeData)} Data`);
            if (window.game.resources.accuracy.amount - beforeAccuracy > 0) gains.push(`${formatNumber(window.game.resources.accuracy.amount - beforeAccuracy)} Accuracy`);
            if (window.game.resources.research.amount - beforeResearch > 0) gains.push(`${formatNumber(window.game.resources.research.amount - beforeResearch)} Research`);
            
            if (gains.length > 0) showToast(`Gained while away: ${gains.join(', ')}`, 'success');
            
            renderAll(window.game);
            if (window.queueUI) window.queueUI.update();
            if (window.bulkPurchaseUI) window.bulkPurchaseUI.update();
        }
        wasHidden = false;
    }
});

// Save before closing
window.addEventListener('beforeunload', () => {
    try {
        saveGame();
        // Clean up intervals
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        if (renderLoopInterval) clearInterval(renderLoopInterval);
    } catch (e) {
        console.error('Failed to save on unload:', e);
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('📋 main.js loaded (optimized)');

// Add styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    
    .offline-modal-content { max-width: 500px; }
    
    .offline-gains {
        background: var(--bg-tertiary);
        border: 2px solid var(--accent-primary);
        border-radius: 12px;
        padding: 1.5rem;
    }
    
    .offline-gain-item {
        font-size: 1.1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .offline-gain-item:last-child { border-bottom: none; }
    
    .toast.achievement {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 2px solid #ffd700;
        box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
        min-width: 350px;
        padding: 0;
    }
    
    .achievement-toast {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
    }
    
    .achievement-toast-icon {
        font-size: 3rem;
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
        animation: bounce 0.6s ease infinite alternate;
    }
    
    @keyframes bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-5px); }
    }
    
    .achievement-toast-content { flex: 1; }
    
    .achievement-toast-title {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #ffd700;
        margin-bottom: 0.25rem;
    }
    
    .achievement-toast-name {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
    }
    
    .achievement-toast-reward {
        font-size: 0.9rem;
        opacity: 0.9;
        color: #a0ffb0;
    }
`;
document.head.appendChild(style);