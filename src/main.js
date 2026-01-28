// Main Game Initialization and Loop

import { GameState } from './modules/game-state.js';
import { initializeUI } from './ui/ui-init.js';
import { renderAll } from './ui/ui-render.js';

// Global game instance
window.game = null;
let lastTick = Date.now();
let lastSave = Date.now();
const TICK_INTERVAL = 100; // Update every 100ms (10 times per second)
const SAVE_INTERVAL = 30000; // Auto-save every 30 seconds
const MAX_OFFLINE_TIME = 24 * 60 * 60 * 1000; // Max 24 hours offline progression

// Initialize the game
function init() {
    console.log('🤖 AI-Idle starting...');
    
    try {
        // Create game state
        window.game = new GameState();
        
        // Try to load saved game
        const savedGame = localStorage.getItem('ai-idle-save');
        if (savedGame) {
            console.log('📂 Loading saved game...');
            try {
                const saveData = JSON.parse(savedGame);
                window.game.load(saveData);
                
                // Calculate offline progression
                const offlineTime = Math.min(Date.now() - window.game.lastSaveTime, MAX_OFFLINE_TIME);
                if (offlineTime > 1000) {
                    console.log(`⏰ Processing ${(offlineTime / 1000).toFixed(0)}s of offline time`);
                    window.game.processOfflineProgress(offlineTime);
                }
            } catch (e) {
                console.error('❌ Failed to load save:', e);
            }
        } else {
            console.log('✨ Starting new game');
        }
        
        // Initialize UI (includes event listeners)
        console.log('🎨 Initializing UI...');
        initializeUI(window.game);
        
        // Initial render
        renderAll(window.game);
        
        // Start game loop
        console.log('▶️ Starting game loop...');
        requestAnimationFrame(gameLoop);
        
        console.log('✅ AI-Idle initialized successfully!');
        
    } catch (error) {
        console.error('💥 Critical error during initialization:', error);
        document.body.innerHTML = `
            <div style="color: white; text-align: center; padding: 50px; font-family: monospace;">
                <h1>❌ Initialization Error</h1>
                <p>Failed to start AI-Idle. Check console for details.</p>
                <pre style="text-align: left; max-width: 800px; margin: 20px auto; background: #1a1a1a; padding: 20px; border-radius: 10px;">${error.stack}</pre>
                <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Reload Page</button>
            </div>
        `;
    }
}

// Main game loop
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - lastTick) / 1000; // Convert to seconds
    
    if (deltaTime >= TICK_INTERVAL / 1000) {
        // Update game state
        window.game.update(deltaTime);
        
        // Render updates
        renderAll(window.game);
        
        lastTick = now;
    }
    
    // Auto-save check
    if (now - lastSave >= SAVE_INTERVAL) {
        saveGame();
        lastSave = now;
    }
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Save game
function saveGame() {
    try {
        const saveData = window.game.save();
        localStorage.setItem('ai-idle-save', JSON.stringify(saveData));
        
        // Update last save time display
        const lastSaveElement = document.getElementById('last-save-time');
        if (lastSaveElement) {
            lastSaveElement.textContent = new Date().toLocaleTimeString();
        }
        
        console.log('💾 Game saved');
    } catch (error) {
        console.error('❌ Failed to save game:', error);
    }
}

// Handle page visibility (pause when tab is hidden)
let wasHidden = false;
let hiddenTime = 0;

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        wasHidden = true;
        hiddenTime = Date.now();
        console.log('👋 Tab hidden - game continues in background');
    } else if (wasHidden) {
        const offlineTime = Date.now() - hiddenTime;
        if (offlineTime > 5000) { // Only show if > 5 seconds
            console.log(`👀 Tab visible again after ${(offlineTime / 1000).toFixed(0)}s`);
            window.game.processOfflineProgress(offlineTime);
            renderAll(window.game);
        }
        wasHidden = false;
    }
});

// Handle beforeunload (save before closing)
window.addEventListener('beforeunload', () => {
    saveGame();
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('📜 main.js loaded');

// Add slideOut animation to CSS if not exists
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);