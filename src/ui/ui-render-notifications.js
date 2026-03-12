// Notifications / Toast System

// Toast notification system
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Training Completion Animation
export function showTrainingCompleteAnimation(modelName) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const celebration = document.createElement('div');
    celebration.className = 'toast success';
    celebration.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: bold;">🎉 Training Complete!</div>
        <div>${modelName}</div>
    `;
    celebration.style.background = 'linear-gradient(135deg, var(--accent-success), var(--accent-primary))';
    celebration.style.color = 'white';
    celebration.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.8)';
    
    container.appendChild(celebration);
    
    setTimeout(() => {
        celebration.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => celebration.remove(), 300);
    }, 5000);
}