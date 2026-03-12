// UI Initialization

import { initializeTabs } from './ui-tabs.js';
import { showToast } from './ui-render.js';
import { ComboUI } from './combo-ui.js';
import { DeploymentUI } from './deployment-ui.js';
import { safeSetItem, safeRemoveItem } from '../utils/storage.js';
import { wrapClickHandler, safeExecute } from '../utils/error-boundary.js';

let comboUI = null;
let deploymentUI = null;

export function initializeUI(game) {
    // Initialize tabs
    initializeTabs();
    
    // Manual collect button with combo system
    const collectBtn = document.getElementById('btn-collect');
    
    // Initialize combo UI
    comboUI = new ComboUI(game.comboSystem, collectBtn);
    
    // Wrap collect button with error handler
    wrapClickHandler(collectBtn, () => {
        // Use the new manualCollect method that integrates with combo system
        const result = game.manualCollect();
        
        // Visual feedback with bounce
        collectBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            collectBtn.style.transform = '';
        }, 100);
        
        // Show floating text with combo info
        comboUI.showFloatingText(result.amount, result.multiplier);
    }, 'collect-data', { log: true, notify: true });
    
    // Initialize Deployment UI
    deploymentUI = new DeploymentUI(game);
    deploymentUI.init();
    
    // Make it globally accessible for updates
    window.deploymentUI = deploymentUI;
    
    // Update combo timer with throttling (10 FPS instead of 60 FPS)
    let lastComboUpdate = 0;
    const COMBO_UPDATE_INTERVAL = 100; // Update every 100ms (10 FPS)
    
    function updateComboTimer() {
        const now = Date.now();
        
        // Only update if enough time has passed
        if (now - lastComboUpdate >= COMBO_UPDATE_INTERVAL) {
            if (comboUI) {
                safeExecute(() => comboUI.updateTimer(), 'comboUI.updateTimer', { log: true, notify: false });
            }
            lastComboUpdate = now;
        }
        
        requestAnimationFrame(updateComboTimer);
    }
    updateComboTimer();
    
    // Save button
    wrapClickHandler(document.getElementById('btn-save'), () => {
        const saveData = game.save();
        safeSetItem('ai-idle-save', saveData);
        showToast('Game saved successfully!', 'success');
    }, 'save-game', { log: true, notify: true });
    
    // Export button - show modal with save string
    wrapClickHandler(document.getElementById('btn-export'), () => {
        const saveString = game.export();
        showExportModal(saveString);
    }, 'export-save', { log: true, notify: false });
    
    // Import button - show modal for paste
    wrapClickHandler(document.getElementById('btn-import'), () => {
        showImportModal(game);
    }, 'import-save', { log: true, notify: false });
    
    // Restart Tutorial button
    wrapClickHandler(document.getElementById('btn-restart-tutorial'), () => {
        if (window.tutorial) {
            window.tutorial.restart();
            showToast('Tutorial restarted!', 'success');
        } else {
            showToast('Tutorial system not available.', 'warning');
        }
    }, 'restart-tutorial', { log: true, notify: false });
    
    // Settings button
    const settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            safeExecute(() => {
                if (window.settingsUI) {
                    window.settingsUI.open();
                } else {
                    showToast('Settings not available yet.', 'warning');
                }
            }, 'settings-open', { log: true, notify: false });
        });
    }
    
    // Hotkeys button
    const hotkeysBtn = document.getElementById('btn-hotkeys');
    if (hotkeysBtn) {
        hotkeysBtn.addEventListener('click', () => {
            safeExecute(() => {
                if (window.hotkeys) {
                    window.hotkeys.showHelp();
                } else {
                    showToast('Hotkeys not available yet.', 'warning');
                }
            }, 'hotkeys-show', { log: true, notify: false });
        });
    }
    
    // Reset button - wrapped with extra care as it's destructive
    wrapClickHandler(document.getElementById('btn-reset'), () => {
        const confirmed = confirm('Are you sure you want to reset? This will delete ALL progress!');
        if (confirmed) {
            const doubleCheck = confirm('This action cannot be undone. Are you REALLY sure?');
            if (doubleCheck) {
                game.reset();
                safeRemoveItem('ai-idle-save');
                location.reload();
            }
        }
    }, 'reset-game', { log: true, notify: true });
    
    // Modal close handlers
    setupModalHandlers();
}

// Show floating text animation (legacy support, now handled by ComboUI)
function showFloatingText(element, text, isCombo = false) {
    const floater = document.createElement('div');
    floater.className = 'floating-text' + (isCombo ? ' combo' : '');
    floater.textContent = text;
    
    const rect = element.getBoundingClientRect();
    floater.style.left = rect.left + rect.width / 2 + 'px';
    floater.style.top = rect.top + 'px';
    
    document.body.appendChild(floater);
    
    setTimeout(() => floater.remove(), 1000);
}

// Show export modal
function showExportModal(saveString) {
    const modal = document.getElementById('save-modal');
    const title = document.getElementById('modal-title');
    const description = document.getElementById('modal-description');
    const textarea = document.getElementById('save-string');
    const actionBtn = document.getElementById('modal-action-btn');
    const downloadBtn = document.getElementById('modal-download-btn');
    const uploadBtn = document.getElementById('modal-upload-btn');
    
    title.textContent = '📤 Export Save';
    description.textContent = 'Copy this save string to backup your progress:';
    textarea.value = saveString;
    textarea.readOnly = true;
    actionBtn.textContent = '📋 Copy to Clipboard';
    actionBtn.className = 'btn-primary';
    downloadBtn.style.display = ''; // Show in export mode
    uploadBtn.style.display = 'none'; // Hide in export mode
    
    // Select all text when modal opens
    setTimeout(() => textarea.select(), 100);
    
    // Copy button handler
    actionBtn.onclick = () => {
        textarea.select();
        navigator.clipboard.writeText(saveString).then(() => {
            showToast('Save string copied to clipboard!', 'success');
            actionBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                actionBtn.textContent = '📋 Copy to Clipboard';
            }, 2000);
        }).catch(() => {
            showToast('Failed to copy. Please copy manually.', 'warning');
        });
    };
    
    // Download button handler
    downloadBtn.onclick = () => {
        const blob = new Blob([saveString], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-idle-save-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Save file downloaded!', 'success');
    };
    
    modal.classList.add('active');
}

// Show import modal
function showImportModal(game) {
    const modal = document.getElementById('save-modal');
    const title = document.getElementById('modal-title');
    const description = document.getElementById('modal-description');
    const textarea = document.getElementById('save-string');
    const actionBtn = document.getElementById('modal-action-btn');
    const downloadBtn = document.getElementById('modal-download-btn');
    const uploadBtn = document.getElementById('modal-upload-btn');
    const fileInput = document.getElementById('file-input');
    
    title.textContent = '📥 Import Save';
    description.textContent = 'Paste your save string or load from file:';
    textarea.value = '';
    textarea.readOnly = false;
    textarea.placeholder = 'Paste your save string here...';
    actionBtn.textContent = '📥 Import Save';
    actionBtn.className = 'btn-primary';
    downloadBtn.style.display = 'none'; // Hide in import mode
    uploadBtn.style.display = ''; // Show in import mode
    
    // Focus textarea when modal opens
    setTimeout(() => textarea.focus(), 100);
    
    // Import button handler
    actionBtn.onclick = () => {
        const saveString = textarea.value.trim();
        if (!saveString) {
            showToast('Please paste a save string first!', 'warning');
            return;
        }
        
        const success = game.import(saveString);
        if (success) {
            showToast('Save imported successfully!', 'success');
            modal.classList.remove('active');
            location.reload();
        } else {
            showToast('Failed to import save! Invalid save string.', 'error');
        }
    };
    
    // Upload button handler - triggers file input
    uploadBtn.onclick = () => {
        fileInput.click();
    };
    
    // File input change handler
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const saveString = event.target.result.trim();
            textarea.value = saveString;
            showToast('File loaded! Click "Import Save" to continue.', 'success');
            
            // Reset file input
            fileInput.value = '';
        };
        reader.onerror = () => {
            showToast('Failed to read file!', 'error');
            fileInput.value = '';
        };
        reader.readAsText(file);
    };
    
    modal.classList.add('active');
}

// Setup modal event handlers
function setupModalHandlers() {
    const modal = document.getElementById('save-modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    
    // Close button
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Click outside modal to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}