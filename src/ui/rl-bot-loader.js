/**
 * RL Bot Loader for AI Lab Tab
 * 
 * Lazy-loads the RL bot UI when the AI Lab tab is opened.
 * Integrates with the existing TensorFlow.js lazy loading.
 */

import { createRLBotUI } from './rl-bot-ui.js';

/**
 * Initialize RL Bot UI in AI Lab
 * @param {object} gameState - Game state reference
 * @returns {object} RL Bot UI instance
 */
export async function initializeRLBot(gameState) {
    console.log('🤖 Initializing RL Bot...');
    
    try {
        // Get AI Lab container
        const container = document.getElementById('ai-lab-content');
        if (!container) {
            throw new Error('AI Lab container not found');
        }
        
        // Show loading message
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; animation: spin 2s linear infinite;">🤖</div>
                <h3 style="color: var(--text); margin-bottom: 0.5rem;">Initializing RL Bot System...</h3>
                <p style="color: var(--subtext1); font-size: 0.9rem;">Loading neural networks and training infrastructure</p>
            </div>
            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // Wait a moment for visual feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if TensorFlow.js is loaded
        if (typeof tf === 'undefined') {
            throw new Error('TensorFlow.js not loaded. Please reload the page.');
        }
        
        console.log('✅ TensorFlow.js ready:', tf.version.tfjs);
        
        // Create and render RL Bot UI
        const rlBotUI = createRLBotUI(container, gameState);
        
        console.log('✅ RL Bot initialized successfully!');
        
        return rlBotUI;
        
    } catch (error) {
        console.error('❌ Failed to initialize RL Bot:', error);
        
        // Show error message
        const container = document.getElementById('ai-lab-content');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="color: var(--red); margin-bottom: 1rem;">Failed to Initialize RL Bot</h3>
                    <p style="color: var(--text); margin-bottom: 2rem;">${error.message}</p>
                    <button class="btn-primary" onclick="location.reload()" style="margin-right: 0.5rem;">
                        🔄 Reload Page
                    </button>
                    <button class="btn-secondary" onclick="console.log('Error details:', '${error.stack}')">
                        🐛 View Error Details
                    </button>
                </div>
            `;
        }
        
        throw error;
    }
}

/**
 * Check if RL Bot system is ready
 * @returns {boolean} Whether TensorFlow.js is loaded
 */
export function isRLBotReady() {
    return typeof tf !== 'undefined';
}
