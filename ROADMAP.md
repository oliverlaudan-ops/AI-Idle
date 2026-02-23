# 🗺️ AI-Idle Roadmap

**Long-term development plan for AI-Idle**

Last Updated: 2026-02-23 | Current Version: 0.6.0

---

## ✅ Version 0.6.0 - Deployment System (COMPLETED)

**Released:** 2026-02-23  
**Status:** ✅ Production Ready

### Features Delivered

- ✅ **3 Deployment Strategies** (Fast, Standard, Complete)
- ✅ **Token Shop** with 15 permanent upgrades
- ✅ **Portfolio System** with 6 ranks (Intern → AGI Pioneer)
- ✅ **Lifetime Stats** tracking across all deployments
- ✅ **Smart UI** with performance optimization
- ✅ **Complete Documentation** (DEPLOYMENT.md)

### Technical Achievements

- ✅ Deployment strategies with token multipliers
- ✅ Upgrade prerequisite system
- ✅ Portfolio scoring and ranking algorithm
- ✅ Lifetime accuracy tracking
- ✅ Efficient re-rendering with dirty flags
- ✅ Catppuccin-themed UI components

### Impact

- 🎮 Adds meaningful progression system
- 📈 Increases replayability significantly
- 🏆 Provides long-term goals for players
- 🔧 Permanent upgrades make runs more efficient

---

## 🔴 Version 0.7.0 - Reinforcement Learning Bot (IN DEVELOPMENT)

**Target:** Q1 2026 (March)  
**Status:** 🔴 Phase 1 - Planning & Architecture

### Vision

Create an **AI agent that learns to play AI-Idle optimally** using Deep Q-Learning (DQN). The bot will be a playable feature that:

- Learns from trial and error
- Optimizes building purchases
- Discovers efficient strategies
- Competes with human players

### Core Features

#### 🤖 DQN Agent
- **Neural Network:** 3-layer dense architecture with TensorFlow.js
- **State Space:** Resources, buildings, research status, training state
- **Action Space:** 20+ actions (build, train, research, wait)
- **Reward Function:** Accuracy gain per second

#### 🎮 Auto-Pilot Mode
- Bot takes control and plays automatically
- Watch in real-time as it learns
- Speed controls (1×, 2×, 5×, 10×)
- Pause/resume functionality

#### 📊 Live Training Visualization
- **Metrics Dashboard:**
  - Episode count
  - Total reward
  - Average reward (last 100 episodes)
  - Exploration rate (epsilon)
  - Loss over time
- **Action Distribution Chart**
- **Reward Curve** (smoothed moving average)
- **Q-Value Heatmap**

#### 🏆 Performance Analytics
- Bot vs Human leaderboard
- Best runs comparison
- Strategy discovery tracking
- Token efficiency metrics

### Technical Implementation

#### Module Structure

```
src/systems/rl-bot/
├── dqn-agent.js          # Core DQN algorithm
├── game-environment.js   # GameState wrapper for RL
├── replay-buffer.js      # Experience replay memory
├── state-encoder.js      # Normalize game state to neural net input
├── action-space.js       # Define all possible actions
├── reward-function.js    # Calculate rewards
├── bot-controller.js     # Main bot loop
└── index.js              # Public API
```

#### Neural Network Architecture

```javascript
// State Input (normalized 0-1)
// └── Dense Layer (128 neurons, ReLU)
//     └── Dense Layer (64 neurons, ReLU)
//         └── Dense Layer (action_space, Linear)
//             └── Q-Values Output
```

#### State Representation (20 features)

```javascript
[
  // Resources (normalized by current max)
  data / max_data,
  compute / max_compute,
  accuracy / target_accuracy,
  research_points / max_rp,
  
  // Buildings (normalized by cost)
  data_center_count / 50,
  compute_cluster_count / 50,
  gpu_farm_count / 50,
  // ... (7 building types)
  
  // Research (binary flags)
  has_sgd, has_adam, has_relu, has_transformer,
  // ... (critical research items)
  
  // Training State
  is_training, training_progress,
  current_model_tier,
  
  // Time
  run_duration / max_duration
]
```

#### Action Space (25 actions)

```javascript
[
  'wait',                    // Do nothing this step
  'build_data_center',       // 7 building types
  'build_compute_cluster',
  // ...
  'train_linear_regression', // 10 model types
  'train_neural_network',
  // ...
  'research_sgd',           // 8 critical research items
  'research_adam',
  // ...
]
```

#### Reward Function

```javascript
reward = (
  accuracy_gain * 1.0 +           // Primary objective
  efficiency_bonus * 0.5 +        // Reward efficient resource use
  research_completion * 2.0 +     // Encourage tech progression
  deployment_success * 50.0 -     // Major reward for deployment
  invalid_action_penalty * 5.0    // Discourage illegal moves
)
```

### UI Components

#### AI Lab Tab Enhancement

```
🤖 Reinforcement Learning Bot
┌────────────────────────────────────────┐
│ Status: [Training / Idle / Playing]       │
│                                          │
│ Episode: 1,234                           │
│ Total Reward: 45,678                     │
│ Avg Reward (100): 892                    │
│ Exploration: 15%                         │
│                                          │
│ [Start Training] [Stop] [Reset]          │
│ Speed: [1×] [2×] [5×] [10×]                  │
│                                          │
│ 📊 Reward Curve (Live Chart)           │
│ 🎯 Action Distribution (Pie Chart)     │
│ 🧠 Q-Value Heatmap (State × Action)    │
└────────────────────────────────────────┘
```

### Development Phases

#### Phase 1: Core RL System (❶ week)
- [x] Architecture planning
- [ ] DQN Agent implementation
- [ ] State encoding
- [ ] Action space definition
- [ ] Reward function
- [ ] Experience replay buffer

#### Phase 2: Game Integration (❷ week)
- [ ] GameEnvironment wrapper
- [ ] Bot controller
- [ ] Action executor
- [ ] State observer
- [ ] Training loop

#### Phase 3: UI & Visualization (❸ week)
- [ ] AI Lab tab redesign
- [ ] Metrics dashboard
- [ ] Live charts (Chart.js)
- [ ] Control panel
- [ ] Speed controls

#### Phase 4: Advanced Features (❹ week)
- [ ] Model save/load
- [ ] Pre-trained models
- [ ] Hyperparameter tuning UI
- [ ] Bot vs Human leaderboard
- [ ] Strategy analysis

#### Phase 5: Polish & Documentation (❺ week)
- [ ] Performance optimization
- [ ] Tutorial for RL Bot
- [ ] Documentation
- [ ] Testing
- [ ] Balancing

### Success Criteria

- ✅ Bot can play from start to first deployment
- ✅ Bot discovers efficient building strategies
- ✅ Training converges (reward increases over time)
- ✅ UI provides meaningful insights into learning
- ✅ Players enjoy watching the bot learn

---

## 🔵 Version 0.8.0 - UI Refactoring

**Target:** Q2 2026 (May)  
**Status:** 🔵 Planned

### Goals

- Component-based UI architecture
- Improved state management
- Performance optimization
- Mobile responsiveness

### Features

- [ ] React/Vue/Svelte migration (TBD)
- [ ] Modular component system
- [ ] Centralized state management
- [ ] Responsive design (mobile-first)
- [ ] Dark/Light theme toggle
- [ ] Accessibility improvements (WCAG 2.1)

---

## 🔵 Version 0.9.0 - Advanced Features

**Target:** Q3 2026 (July)  
**Status:** 🔵 Planned

### New Systems

- [ ] **Model Zoo:** 15+ new ML models (LLMs, Multimodal, etc.)
- [ ] **Cloud Providers:** AWS, GCP, Azure as building upgrades
- [ ] **Research Tree Expansion:** 60+ total items
- [ ] **Multiplayer:** Leaderboards, friend comparisons
- [ ] **Challenges:** Time-limited events
- [ ] **Seasons:** Rotating content

### Balance Pass

- Review all progression rates
- Adjust token formula if needed
- Balance upgrade costs
- Fine-tune RL bot difficulty

---

## 🔵 Version 1.0.0 - Polish & Release

**Target:** Q4 2026 (October)  
**Status:** 🔵 Planned

### Polish Features

- [ ] **Animations & VFX**
  - Training animations
  - Deployment effects
  - Achievement celebrations
  - Particle effects

- [ ] **Sound System**
  - Background music
  - UI sound effects
  - Ambient sounds
  - Volume controls

- [ ] **Tutorial System**
  - Interactive guide
  - Contextual hints
  - Feature discovery
  - Tips & tricks

- [ ] **Achievements Expansion**
  - 50+ total achievements
  - Secret achievements
  - Achievement showcase

- [ ] **Full Documentation**
  - Player guide
  - API documentation
  - Contributing guide
  - Architecture docs

### Release Preparation

- [ ] Final balance pass
- [ ] Performance audit
- [ ] Security review
- [ ] Browser compatibility testing
- [ ] Beta testing program
- [ ] Marketing materials
- [ ] Launch announcement

---

## 🔮 Future Ideas (Post-1.0)

### Community Features
- Guild system
- Cooperative deployments
- Trading system
- User-generated content

### Advanced ML Concepts
- Federated learning
- Model compression
- Neural architecture search
- Adversarial training

### Meta-Game
- Prestige layers beyond deployment
- Permanent unlocks
- Cross-run progression
- Long-term goals (months)

---

## 🛠️ Technical Debt & Maintenance

### Ongoing Tasks

- **Code Quality**
  - Maintain >80% test coverage
  - Regular refactoring
  - Code review process
  - Style guide enforcement

- **Performance**
  - Profile rendering bottlenecks
  - Optimize production calculations
  - Lazy loading for large data
  - Web Worker for RL training

- **Documentation**
  - Keep README updated
  - API documentation
  - Architecture decision records
  - Changelog maintenance

---

## 📅 Release Schedule

| Version | Target Date | Status | Key Features |
|---------|------------|--------|-------------|
| 0.6.0 | 2026-02-23 | ✅ Released | Deployment System |
| 0.7.0 | 2026-03-31 | 🔴 In Dev | RL Bot |
| 0.8.0 | 2026-05-31 | 🔵 Planned | UI Refactor |
| 0.9.0 | 2026-07-31 | 🔵 Planned | Advanced Features |
| 1.0.0 | 2026-10-31 | 🔵 Planned | Polish & Release |

---

## 💬 Feedback & Suggestions

We value community input! If you have ideas for features or improvements:

- **GitHub Issues:** [Open an issue](https://github.com/oliverlaudan-ops/AI-Idle/issues)
- **Discussions:** [Join the discussion](https://github.com/oliverlaudan-ops/AI-Idle/discussions)
- **Email:** oliver.laudan@gmail.com

---

**This roadmap is subject to change based on player feedback, technical constraints, and new ideas!**

*Last Updated: 2026-02-23 by Oliver Laudan*
