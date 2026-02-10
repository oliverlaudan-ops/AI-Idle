# 🤖 AI-Idle

**An incremental idle game about Machine Learning and AI infrastructure**

Train neural networks, optimize algorithms, and scale your AI research facility in this educational idle game that teaches real ML concepts through gameplay.

## 🎮 Play Now

🚀 **[Play AI-Idle](https://ai-idle.future-pulse.tech)**

## 🌟 Features

### Core Gameplay
- 📊 **Train AI Models** - From simple digit recognition to frontier LLMs
- 🏭 **Build Infrastructure** - Data centers, GPU clusters, quantum processors
- 🔬 **Research Technologies** - Unlock real ML algorithms and architectures
- 🚀 **Deploy Models** - Prestige system with permanent upgrades
- 📈 **Watch Progress** - Animated training curves and performance metrics
- 🏆 **Unlock Achievements** - 17+ achievements with permanent bonuses
- 📋 **Queue Training** - Automate model training with the queue system ✨ NEW
- 🛒 **Bulk Purchase** - Buy multiple buildings with Shift+Click ✨ NEW
- ⚙️ **Customize Settings** - Tailor your experience to your playstyle ✨ NEW
- ⌨️ **Keyboard Shortcuts** - Efficient keyboard-driven gameplay ✨ NEW

### Educational Value
- Learn about optimization algorithms (SGD → Adam → AdamW)
- Understand activation functions (Sigmoid → ReLU → GELU)
- Explore architectures (Dense → CNN → Transformer → Diffusion)
- Discover regularization techniques (Dropout, Batch Norm, etc.)
- Experience the ML training lifecycle

### Resource Management
- **Training Data** - Generate and collect datasets
- **Compute Power** - Measured in TFLOPS (like real ML hardware)
- **Model Accuracy** - Your primary currency for progression
- **Research Points** - Unlock cutting-edge technologies

### Progression System
- Start with basic neural networks
- Scale to complex vision and language models
- Research advanced techniques and hardware
- Deploy models for permanent bonuses
- Unlock achievements and milestones
- **Optimized**: Smoother progression curve with balanced costs

## 🆕 What's New in v0.3.0 (Feb 10, 2026)

### 🎮 Quality of Life Improvements

#### 📋 **Training Queue System**
- **Queue multiple models** for automated sequential training
- Visual queue panel with time estimates and model previews
- Drag-and-drop reordering (planned for v0.3.1)
- Persistent across save/load - never lose your queue!
- **Press Q** to toggle queue panel

#### 🛒 **Bulk Purchase System**
- **Shift+Click any building** to buy 10x instantly
- **Flexible modes**: 1x, 10x, 25x, 50x, 100x, Max
- **Smart "Buy Max"** - Automatically calculates how many you can afford
- Cost preview before purchase
- **Hotkeys**: Shift+1 through Shift+6 to switch modes quickly

#### ⚙️ **Comprehensive Settings**
- **Gameplay**: Auto-save interval, offline progress, pause on blur, number formatting
- **Notifications**: Toggle training/research/achievements/building unlocks + sound effects
- **Performance**: Animation quality, particle effects, canvas rendering
- All settings persist between sessions
- **Press E** to open settings

#### ⌨️ **Keyboard Shortcuts**
- **Navigation**: 1-6 to switch tabs instantly
- **Actions**: Space (collect), S (save), Q (queue), T (toggle training)
- **System**: Esc (close modals), H (show hotkey help), Ctrl+E (export), Ctrl+I (import)
- Smart input detection - disabled when typing in text fields
- Visual help modal with all shortcuts
- **Press H** anytime for hotkey reference

#### 📊 **Statistics Tracking** (Enhanced in v0.3.1)
- Lifetime stats: Total resources, buildings, models, achievements
- Session stats: Per-session tracking with reset on load
- Records: Best combo, fastest model, peak production rates
- Time tracking: Total playtime, offline time, longest session

### 🛠️ Technical Improvements
- **6x Performance Boost**: Optimized update loops (60 FPS → 10 FPS where appropriate)
- **Reduced Lag**: Fewer `requestAnimationFrame` warnings
- **Modular Architecture**: Clean separation of concerns for easy maintenance
- **Backward Compatible**: All v0.2.x saves work seamlessly

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with modern animations
- **Storage**: LocalStorage for save games + separate settings storage
- **Architecture**: Modular design with independent systems
- **Visualization**: Canvas-based training curves and animations

## 📁 Project Structure

```
AI-Idle/
├── index.html              # Main game page
├── css/
│   ├── styles.css          # Game styling
│   └── training-animations.css  # Animation styles
├── src/
│   ├── main.js             # Game initialization
│   ├── modules/
│   │   ├── game-state.js   # Central state management
│   │   ├── resources.js    # Resource definitions
│   │   ├── buildings.js    # Infrastructure definitions
│   │   ├── models.js       # ML model definitions
│   │   ├── research.js     # Research tree
│   │   ├── achievements.js  # Achievement definitions
│   │   ├── achievement-checker.js  # Achievement logic
│   │   ├── prestige.js     # Deployment/prestige system
│   │   ├── combo-system.js # Manual click combo mechanics
│   │   ├── training-queue.js  # Training queue logic ✨ NEW
│   │   ├── bulk-purchase.js   # Bulk building purchase ✨ NEW
│   │   ├── settings.js        # User settings system ✨ NEW
│   │   ├── hotkeys.js         # Keyboard shortcuts ✨ NEW
│   │   └── statistics.js      # Stats tracking ✨ NEW
│   └── ui/
│       ├── ui-init.js      # UI initialization
│       ├── ui-render.js    # Rendering functions
│       ├── ui-tabs.js      # Tab management
│       ├── training-animations.js  # Visual training system
│       ├── combo-ui.js     # Combo system UI
│       ├── tutorial.js     # Tutorial system
│       ├── training-queue-ui.js  # Queue panel UI ✨ NEW
│       ├── bulk-purchase-ui.js   # Bulk purchase UI ✨ NEW
│       └── settings-ui.js        # Settings modal ✨ NEW
├── docs/
│   └── v0.3.0-RELEASE-NOTES.md  # Detailed release notes ✨ NEW
├── DESIGN.md               # Comprehensive design document
├── CHANGELOG.md            # Detailed version history
└── README.md               # This file
```

## 🎯 Gameplay Phases

### Phase 1: Foundation (0-10 minutes)
- Click to generate your first training data
- Build data collectors and CPU cores
- Train your first neural network on digit recognition
- **New**: Use **Space** key for quick manual collection
- **Optimized**: 20% faster early game with reduced costs

### Phase 2: Automation (10-60 minutes)
- Unlock passive data generation
- Build GPU clusters for faster training
- Research optimization algorithms
- Train image classification models
- **New**: **Queue multiple models** to train while AFK
- **New**: **Shift+Click** to bulk-buy buildings
- **Optimized**: Smoother transition with earlier Tier 2 unlocks

### Phase 3: Scaling (1-4 hours)
- Deploy distributed systems
- Unlock transformer architectures
- Train NLP and RL agents
- Optimize with advanced regularization
- **New**: Use **keyboard shortcuts** for efficient management
- **New**: Customize **notification preferences** in settings
- **Optimized**: Better balanced mid-game progression

### Phase 4: Prestige Loop (4+ hours)
- Deploy your first model for permanent bonuses
- Unlock transfer learning and AutoML
- Scale to frontier models (LLMs, multimodal AI)
- Compete in the model leaderboard
- **New**: Track all your **stats and records**
- **Optimized**: More achievable late-game goals

## 🏆 Achievements

Track your progress through 17+ achievements across 3 categories:

### Training Milestones
- **First Steps** - Train your first model → Unlock manual data generation
- **Data Hoarder** - Accumulate 1 million training data → +5% data generation
- **Accuracy King** - Reach 99.9% accuracy → +10% all production
- **Generalist AI** - Complete 10 different training tasks → Unlock AutoML features
- **First Deployment** - Deploy your first model → +5% deployment token gain
- **Veteran Researcher** - Deploy 5 models → +10% permanent accuracy gain
- **AGI Researcher** - Reach 1 billion total accuracy → Unlock experimental AGI projects

### Research Breakthroughs
- **Optimization Expert** - Unlock all optimizers → +15% training speed
- **Activation Master** - Research all activation functions → +20% model performance
- **Transformer Revolution** - Unlock transformer architecture → +50% research point generation
- **Research Completionist** - Complete entire research tree → Permanent 2x multiplier

### Infrastructure
- **GPU Enthusiast** - Build 10 GPU clusters → +10% compute power
- **Supercomputer** - Reach 10,000 TFLOPS → Unlock quantum research
- **Quantum Leap** - Build first quantum processor → +25% all resource generation
- **Data Center Tycoon** - Own 100 total buildings → Buildings cost 10% less

Each achievement provides permanent bonuses that stack with your other upgrades!

## 💾 Save System

- **Auto-save** with customizable interval (10s / 30s / 60s / 5min)
- Export/import save files
- Enhanced offline progression (up to 24 hours)
- Intelligent simulation with achievement tracking
- **Separate settings storage** - Settings persist independently
- **Backward compatible** with all previous versions
- Cloud save support (planned)

## 🎨 Visual Features

- Animated training curves - Real-time visualization of model performance
- Progress animations - Smooth progress bars with dynamic effects
- Particle celebrations - Visual feedback for training completion
- Animated achievement unlock notifications
- Real-time resource tracking
- Performance metrics dashboard
- **Keyboard shortcut badges** - Visual `<kbd>` indicators ✨ NEW
- **Modal animations** - Smooth transitions and effects ✨ NEW
- Responsive design for all screen sizes
- Dark mode optimized UI
- Smooth animations and transitions
- **Customizable performance settings** ✨ NEW

## 📚 Learn While Playing

Every game mechanic is based on real Machine Learning concepts:

- **Training Data** represents datasets like MNIST, ImageNet
- **TFLOPS** is the actual metric used for ML hardware
- **Optimization algorithms** are real techniques (Adam, SGD)
- **Model architectures** reflect actual neural network designs
- **Research tree** follows the historical development of ML

Tooltips and explanations help you understand what each upgrade means in the real world of AI research.

## ⌨️ Keyboard Shortcuts Quick Reference

### Navigation
- **1** - Infrastructure Tab
- **2** - Training Tab
- **3** - Research Tab
- **4** - Deployment Tab
- **5** - Achievements Tab
- **6** - Statistics Tab

### Actions
- **Space** - Collect Data
- **S** - Save Game
- **Q** - Toggle Training Queue
- **E** - Open Settings
- **T** - Start/Stop Training

### System
- **Esc** - Close Modal
- **H** - Show Hotkey Help
- **Ctrl+E** - Export Save
- **Ctrl+I** - Import Save

### Bulk Purchase
- **Shift+Click** - Buy 10x
- **Shift+1** through **Shift+6** - Switch bulk modes

**Press H in-game for complete hotkey reference!**

## 🚀 Development Roadmap

### Version 0.1 (MVP) - ✅ Completed (Jan 30, 2026)
- [x] Game design document
- [x] README and documentation
- [x] Basic resource system (data, compute, accuracy)
- [x] Infrastructure buildings (Tier 1-3)
- [x] Training models (8 different tasks)
- [x] Research tree
- [x] UI and rendering
- [x] Game loop and save system

### Version 0.2 (Early Access) - ✅ Completed (Feb 9, 2026)
- [x] Achievement system implementation
- [x] Balance adjustments
- [x] Visual training animations
- [x] Offline progression optimization
- [x] Bug fixes and polish

### Version 0.3 (QoL Update) - ✅ Completed (Feb 10, 2026)
- [x] **Training Queue System** - Multi-model automation
- [x] **Bulk Purchase System** - Shift+Click and flexible modes
- [x] **Settings System** - Comprehensive customization
- [x] **Keyboard Shortcuts** - Efficient controls
- [x] **Statistics Tracking** - Detailed progress metrics
- [x] **Performance Optimizations** - Reduced lag
- [x] **Documentation** - Complete release notes

### Version 0.3.1 (Polish) - 🔜 Next
- [ ] Enhanced Statistics Tab UI with graphs
- [ ] Queue drag-and-drop reordering
- [ ] Balance pass based on community feedback
- [ ] Additional hotkey customization
- [ ] Bug fixes

### Version 1.0 (Full Release) - 📅 Planned
- [ ] Complete model progression
- [ ] Full research tree implementation
- [ ] Prestige/deployment system expansion
- [ ] Tutorial system
- [ ] Mobile optimization

### Future Versions
- [ ] Competitions and leaderboards
- [ ] Model Zoo collection
- [ ] Mini-games (GANs, adversarial training)
- [ ] Multiplayer features
- [ ] Mobile app version

## 🤝 Contributing

This is currently a solo project, but feedback and suggestions are welcome!

- **Report Bugs**: Open an issue on GitHub
- **Feature Requests**: Use the Discussions tab
- **Balance Feedback**: Let us know your thoughts!

## 📄 License

MIT License - Feel free to learn from and remix this project

## 🙏 Acknowledgments

Inspired by:
- Real Machine Learning research and development
- Classic idle games (Cookie Clicker, Universal Paperclips, Idle Loops)
- Educational games teaching programming and math
- The Idle-Game-v2 (Space Colonies) project

**Special Thanks:**
- AI Assistant (Claude/Anthropic) for development support
- Community playtesters for valuable feedback

## 📞 Contact

- **GitHub**: [oliverlaudan-ops](https://github.com/oliverlaudan-ops)
- **Project**: [AI-Idle Repository](https://github.com/oliverlaudan-ops/AI-Idle)
- **Play**: [ai-idle.future-pulse.tech](https://ai-idle.future-pulse.tech)

---

**Status**: ✅ Version 0.3.0 Complete!  
**Version**: 0.3.0  
**Last Updated**: February 10, 2026

**Major QoL Update Released!** 🎉

Start your journey from simple neural networks to frontier AI models. Train, optimize, and deploy - now with powerful automation tools!
