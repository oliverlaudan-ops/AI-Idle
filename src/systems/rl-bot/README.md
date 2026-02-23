# 🤖 Reinforcement Learning Bot System

## Overview

An intelligent AI agent that learns to play AI-Idle optimally through **Deep Q-Learning (DQN)**. The bot observes the game state, takes actions, receives rewards, and improves its strategy over time through trial and error.

**Primary Goal:** Maximize deployment tokens by learning optimal building, training, research, and deployment strategies.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              RL Bot System v0.7.0               │
├─────────────────────────────────────────────────┤
│  Phase 1: Core RL Components                    │
│  ├─ DQN Agent (neural network)                  │
│  ├─ Action Space (29 actions)                   │
│  ├─ State Encoder (27 features)                 │
│  ├─ Reward Function (deployment-focused)        │
│  └─ Replay Buffer (experience storage)          │
│                                                  │
│  Phase 2: Game Integration                      │
│  ├─ Game Environment (RL wrapper)               │
│  ├─ Action Executor (game mutations)            │
│  └─ Bot Controller (training orchestration)     │
│                                                  │
│  Phase 3: UI & Visualization                    │
│  ├─ RL Bot UI (controls & metrics)              │
│  └─ CSS Styling (Catppuccin theme)              │
└─────────────────────────────────────────────────┘
```

---

## 📦 Components

### Core Components (Phase 1)

#### 1. **DQN Agent** (`dqn-agent.js`)
- Deep Q-Network with TensorFlow.js
- Network: 27 → 128 → 64 → 29
- Epsilon-greedy exploration
- Experience replay (10K buffer)
- Target network for stability
- Model persistence (IndexedDB)

#### 2. **Action Space** (`action-space.js`)
- 29 discrete actions:
  - 1 Wait action
  - 7 Building purchases
  - 10 Model training actions
  - 8 Research actions
  - **3 Deployment actions** (Fast/Standard/Complete)
- Action validation
- Action masking

#### 3. **State Encoder** (`state-encoder.js`)
- 27-dimensional state vector:
  - 4 Resources (data, compute, accuracy, RP)
  - 7 Building counts
  - 8 Research status (binary)
  - 3 Training state
  - **4 Deployment features** (lifetime accuracy, can deploy, etc.)
  - 1 Time (run duration)
- Normalized to [0, 1] range

#### 4. **Reward Function** (`reward-function.js`)
- **Primary:** +100 per deployment token
- **Bonus:** +50 for Complete strategy
- **Time efficiency:** Reward for optimal run duration
- Secondary rewards: accuracy gain, efficiency, research
- Penalty: Invalid actions, premature deployment

#### 5. **Replay Buffer** (`replay-buffer.js`)
- Stores experiences: (state, action, reward, nextState, done)
- Uniform sampling for training
- Optional prioritized replay

---

### Integration Components (Phase 2)

#### 6. **Game Environment** (`game-environment.js`)
- Wraps GameState for RL
- Standard interface: `observe()`, `step()`, `reset()`
- Episode management (deployment = episode end)
- State cloning for reward calculation

#### 7. **Action Executor** (`action-executor.js`)
- Translates actions → game mutations
- Handles all 29 action types
- Deployment execution (all strategies)
- Standardized result format

#### 8. **Bot Controller** (`bot-controller.js`)
- Training loop orchestration
- Start/stop/pause controls
- Speed control (1x - 10x)
- Auto-save every 10 episodes
- Performance metrics

---

### UI Components (Phase 3)

#### 9. **RL Bot UI** (`src/ui/rl-bot-ui.js`)
- Control panel
- Real-time metrics (4 cards)
- Episode history table
- Speed controls
- Model save/load

#### 10. **Styles** (`styles/rl-bot.css`)
- Catppuccin Mocha theme
- Animated status indicators
- Responsive design
- Card-based layout

---

## 🚀 Quick Start

### Basic Usage

```javascript
import { createBotController } from './systems/rl-bot/index.js';

// Create bot
const bot = createBotController(gameState);

// Start training
bot.start();

// Control speed
bot.setSpeed(5); // 5x speed

// Pause/Resume
bot.pause();
bot.resume();

// Stop
bot.stop();

// Get statistics
const stats = bot.getStats();
console.log(`Episode: ${stats.currentEpisode}`);
console.log(`Avg Reward: ${stats.avgReward}`);
```

### With UI

```javascript
import { createRLBotUI } from './ui/rl-bot-ui.js';

const container = document.getElementById('rl-bot-container');
const ui = createRLBotUI(container, gameState);

// UI handles everything automatically!
```

---

## ⚙️ Configuration

### DQN Agent Config

```javascript
const agent = new DQNAgent({
    // Network
    hiddenLayers: [128, 64],
    activation: 'relu',
    learningRate: 0.001,
    
    // Training
    gamma: 0.99,              // Discount factor
    batchSize: 32,            // Mini-batch size
    
    // Exploration
    epsilonStart: 1.0,        // Initial exploration
    epsilonEnd: 0.01,         // Final exploration
    epsilonDecay: 0.995,      // Decay per episode
    
    // Experience replay
    replayBufferSize: 10000,
    minReplaySize: 1000,
    
    // Optimization
    targetUpdateFreq: 100,    // Update target every N steps
    gradientClipValue: 1.0
});
```

### Bot Controller Config

```javascript
const bot = createBotController(gameState, {
    stepsPerTick: 1,          // Actions per tick
    tickInterval: 1000,       // Ms between ticks
    trainInterval: 1,         // Train every N steps
    maxStepsPerEpisode: 1000, // Safety limit
    autoSaveInterval: 10      // Save every N episodes
});
```

---

## 📊 Metrics

### Training Progress
- **Episodes:** Total completed episodes
- **Steps:** Total actions taken
- **Steps/Second:** Performance metric

### Rewards
- **Total Reward:** Cumulative reward
- **Avg Reward:** Average per episode
- **Last Episode:** Most recent episode reward

### Learning
- **Epsilon (ε):** Exploration rate (1.0 → 0.01)
- **Loss:** Neural network training loss
- **Buffer Size:** Experiences stored

### Environment
- **Can Deploy:** Whether deployment is possible
- **Tokens Available:** Tokens bot can earn
- **Valid Actions:** Number of legal actions

---

## 🎓 Training Tips

### Early Training (Episodes 1-50)
- High exploration (ε ≈ 1.0)
- Random actions, learning basic mechanics
- Expect low/negative rewards

### Mid Training (Episodes 50-200)
- Moderate exploration (ε ≈ 0.3-0.5)
- Discovers building → training patterns
- Learns research priorities
- Starts attempting deployments

### Late Training (Episodes 200+)
- Low exploration (ε ≈ 0.01-0.1)
- Optimizes deployment timing
- Learns Complete strategy
- Maximizes tokens/hour

### Best Practices

1. **Let it explore:** Don't stop training too early
2. **Use 5-10x speed:** Faster iterations = faster learning
3. **Save regularly:** Preserve good models
4. **Monitor epsilon:** Should decay smoothly
5. **Check replay buffer:** Should fill to ~1000+ before good learning
6. **Watch for deployment:** First successful deployment is a milestone!

---

## 🐛 Troubleshooting

### Bot won't start
- Check if GameState is properly initialized
- Verify TensorFlow.js is loaded
- Check browser console for errors

### Bot takes invalid actions
- Action validation should prevent this
- If it happens, check `isActionValid()` logic
- Verify game state methods exist

### Training is slow
- Increase speed (10x recommended)
- Reduce `tickInterval`
- Check system performance

### Loss increases over time
- Normal for early training
- If persistent after 100+ episodes, reduce learning rate
- Try smaller batch size

### Bot never deploys
- Check if accuracy requirement is too high
- Verify deployment detection works
- Monitor "Can Deploy" metric

---

## 🔮 Future Improvements

### Phase 4: Advanced Features
- [ ] Curriculum learning (progressive difficulty)
- [ ] Multi-agent training (competition)
- [ ] Hindsight Experience Replay (HER)
- [ ] Prioritized Experience Replay
- [ ] Dueling DQN architecture
- [ ] Double DQN (reduce overestimation)
- [ ] Rainbow DQN (combine all improvements)

### Phase 5: Visualization
- [ ] Live reward curve chart
- [ ] Action distribution visualization
- [ ] Q-value heatmap
- [ ] State space visualization (t-SNE)
- [ ] Training replay system

### Phase 6: Advanced UI
- [ ] Hyperparameter tuning interface
- [ ] Model comparison tool
- [ ] Training logs export
- [ ] Performance benchmarks
- [ ] Bot vs Human leaderboard

---

## 📚 References

- **DQN Paper:** [Human-level control through deep reinforcement learning](https://www.nature.com/articles/nature14236)
- **TensorFlow.js:** [Official Documentation](https://www.tensorflow.org/js)
- **RL Book:** [Reinforcement Learning: An Introduction (Sutton & Barto)](http://incompleteideas.net/book/the-book.html)

---

## 📄 License

Part of AI-Idle project. See main LICENSE file.

---

## 🙏 Credits

Developed with ❤️ for AI-Idle.
Algorithm: Deep Q-Network (DQN) by DeepMind.
UI Theme: Catppuccin Mocha.
