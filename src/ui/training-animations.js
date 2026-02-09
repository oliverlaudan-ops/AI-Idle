// Training Animation and Visualization Module

export class TrainingAnimations {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.trainingCurve = [];
        this.maxDataPoints = 100;
    }

    // Initialize canvas for training visualization
    initCanvas(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return false;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        return true;
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = 200; // Fixed height for training curve
    }

    // Start training animation
    startTraining(model) {
        this.trainingCurve = [];
        this.currentModel = model;
        this.startTime = Date.now();
        
        // Start animation loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.animate();
    }

    // Stop training animation
    stopTraining() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.trainingCurve = [];
    }

    // Update training progress
    updateProgress(progress, currentAccuracy) {
        // Add data point to curve
        this.trainingCurve.push({
            time: progress,
            accuracy: currentAccuracy
        });

        // Keep only the last maxDataPoints
        if (this.trainingCurve.length > this.maxDataPoints) {
            this.trainingCurve.shift();
        }
    }

    // Animation loop
    animate() {
        if (!this.ctx || !this.canvas) return;
        
        this.drawTrainingCurve();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    // Draw the training curve
    drawTrainingCurve() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        this.drawGrid(ctx, width, height, padding);

        // If no data, show placeholder
        if (this.trainingCurve.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '14px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Training curve will appear here...', width / 2, height / 2);
            return;
        }

        // Draw the curve
        this.drawCurve(ctx, width, height, padding);

        // Draw axes labels
        this.drawLabels(ctx, width, height, padding);
    }

    // Draw grid lines
    drawGrid(ctx, width, height, padding) {
        ctx.strokeStyle = '#2a2a3e';
        ctx.lineWidth = 1;

        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height - 2 * padding) * (i / 5);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Vertical lines
        for (let i = 0; i <= 5; i++) {
            const x = padding + (width - 2 * padding) * (i / 5);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
    }

    // Draw the actual training curve
    drawCurve(ctx, width, height, padding) {
        if (this.trainingCurve.length < 2) return;

        // Find min/max for scaling
        const maxTime = Math.max(...this.trainingCurve.map(p => p.time));
        const maxAccuracy = Math.max(...this.trainingCurve.map(p => p.accuracy));
        const minAccuracy = Math.min(...this.trainingCurve.map(p => p.accuracy));
        const accuracyRange = maxAccuracy - minAccuracy || 1;

        // Scale points to canvas
        const scaleX = (width - 2 * padding) / maxTime;
        const scaleY = (height - 2 * padding) / accuracyRange;

        // Draw the curve with gradient
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(1, '#0066ff');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        for (let i = 0; i < this.trainingCurve.length; i++) {
            const point = this.trainingCurve[i];
            const x = padding + point.time * scaleX;
            const y = height - padding - (point.accuracy - minAccuracy) * scaleY;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw glow effect
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw data points
        ctx.fillStyle = '#00d4ff';
        for (let i = 0; i < this.trainingCurve.length; i += Math.max(1, Math.floor(this.trainingCurve.length / 20))) {
            const point = this.trainingCurve[i];
            const x = padding + point.time * scaleX;
            const y = height - padding - (point.accuracy - minAccuracy) * scaleY;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw axis labels
    drawLabels(ctx, width, height, padding) {
        ctx.fillStyle = '#999';
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';

        // X-axis label
        ctx.fillText('Training Time', width / 2, height - 10);

        // Y-axis label (rotated)
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Accuracy', 0, 0);
        ctx.restore();

        // Current values
        if (this.trainingCurve.length > 0) {
            const lastPoint = this.trainingCurve[this.trainingCurve.length - 1];
            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 14px "Segoe UI", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`Current: ${lastPoint.accuracy.toFixed(2)}`, width - padding - 10, padding + 20);
        }
    }
}

// Training Progress Bar with animation
export class TrainingProgressBar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.progressBar = null;
        this.progressText = null;
        this.setupProgressBar();
    }

    setupProgressBar() {
        if (!this.container) return;

        // Create progress bar elements
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'training-progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'training-progress-fill';
        this.progressBar.appendChild(progressFill);

        this.progressText = document.createElement('div');
        this.progressText.className = 'training-progress-text';
        this.progressText.textContent = '0%';

        this.container.appendChild(this.progressBar);
        this.container.appendChild(this.progressText);
    }

    update(progress, maxProgress) {
        if (!this.progressBar || !this.progressText) return;

        const percentage = Math.min(100, (progress / maxProgress) * 100);
        const fill = this.progressBar.querySelector('.training-progress-fill');
        
        if (fill) {
            fill.style.width = `${percentage}%`;
            // Add pulse animation when near completion
            if (percentage > 90) {
                fill.style.animation = 'pulse 0.5s ease-in-out infinite';
            } else {
                fill.style.animation = 'none';
            }
        }

        this.progressText.textContent = `${Math.floor(percentage)}%`;
    }

    reset() {
        this.update(0, 100);
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }
}

// Particle effect for training completion
export class TrainingParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationFrame = null;
    }

    // Trigger completion celebration
    celebrate(x, y) {
        // Create particles
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 2,
                life: 1.0,
                color: this.getRandomColor()
            });
        }

        // Start animation if not already running
        if (!this.animationFrame) {
            this.animate();
        }
    }

    getRandomColor() {
        const colors = ['#00d4ff', '#0066ff', '#00ff88', '#ff00ff', '#ffff00'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animate() {
        if (!this.ctx || !this.canvas) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.life -= 0.02;

            if (p.life > 0) {
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.life;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                this.ctx.fill();
                return true;
            }
            return false;
        });

        this.ctx.globalAlpha = 1.0;

        // Continue animation if particles remain
        if (this.particles.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.animationFrame = null;
        }
    }
}

// Export instances (to be initialized in main.js)
export let trainingAnimations = null;
export let trainingProgressBar = null;
export let trainingParticles = null;

export function initializeTrainingAnimations() {
    trainingAnimations = new TrainingAnimations();
    trainingProgressBar = new TrainingProgressBar('training-progress-container');
    trainingParticles = new TrainingParticles('particles-canvas');
    
    return {
        trainingAnimations,
        trainingProgressBar,
        trainingParticles
    };
}