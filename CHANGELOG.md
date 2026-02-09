# Changelog

All notable changes to AI-Idle will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-02-09

### Fixed
- **Training Animations Integration**
  - Fixed training-animations.css not being linked in index.html
  - Fixed canvas container missing from training status display
  - Fixed TrainingAnimations class import in ui-render.js
  - Fixed incorrect method calls (start/stop instead of startTraining/stopTraining)
  - Fixed canvas initialization - now properly uses initCanvas() method
  - Training curve visualization now displays correctly during model training

### Changed
- Updated footer version display to show "0.2.0" instead of "0.2-alpha"
- Improved error handling in training animation lifecycle

### Technical
- Properly integrated training-animations.js module into UI rendering pipeline
- Canvas element now correctly initialized with TrainingAnimations instance
- Animation lifecycle properly managed (start on training begin, stop on training end)

## [0.2.0] - 2026-02-09

### Added
- **Visual Training Animations**
  - Canvas-based training curve visualization showing real-time model performance
  - Animated progress bars with dynamic glow effects
  - Particle celebration effects when training completes
  - Training phase indicators showing current stage
  - Milestone markers for accuracy achievements
  - Speed indicators with visual feedback
  - Training metrics display with live updates
  - Split-view graphs for loss and accuracy
  - Training complete banner with celebration animations
- **New CSS Module**
  - `training-animations.css` with comprehensive animation styles
  - Responsive design support for all screen sizes
  - Smooth transitions and visual effects
- **New JavaScript Module**
  - `training-animations.js` with canvas rendering engine
  - `TrainingAnimations` class for curve visualization
  - `TrainingProgressBar` class for enhanced progress tracking
  - `TrainingParticles` class for celebration effects
- **Enhanced Offline Progression**
  - Intelligent simulation processing in 60-second chunks
  - Automatic achievement unlock detection during offline time
  - Production recalculation when new buildings/achievements unlock offline
  - Improved accuracy for long offline sessions
  - Better handling of achievement bonuses affecting production

### Changed
- **Major Balance Adjustments**
  - **Buildings (Tier 1)**
    - Storage Server: 75 → 60 data cost (20% reduction)
  - **Buildings (Tier 2)**
    - GPU Cluster: 500 → 400 data cost, unlock at 1.5 instead of 2 compute
    - Data Pipeline: 2500 → 2000 data cost, unlock at 250 instead of 300 data
    - Cooling System: 5000 → 4000 data, 15 → 12 compute, unlock at 8 instead of 10 compute
  - **Buildings (Tier 3)**
    - TPU Array: 50000 → 40000 data (20%), 50 → 40 compute (20%), unlock at 40 instead of 50
    - Distributed System: 250000 → 200000 data (20%), unlock at 400 instead of 500 accuracy
    - Quantum Processor: 5M → 3M data (40%), 500 → 400 compute (20%), unlock at 4000 instead of 5000 accuracy
  - **Models (All)**
    - Digit Recognition: 50 → 40 data, 0.5 → 0.4 compute, 0.2 → 0.25 accuracy/s (+25%)
    - Image Classification: 5000 → 4000 data, 20 → 15 compute, 5 → 6 accuracy/s (+20%), unlock at 40 instead of 50
    - Object Detection: 50000 → 40000 data, 100 → 80 compute, 25 → 30 accuracy/s (+20%), unlock at 400 instead of 500
    - NLP Model: 500000 → 400000 data, 500 → 400 compute, 125 → 150 accuracy/s (+20%), unlock at 2000 instead of 2500
    - RL Agent: 5M → 4M data, 2500 → 2000 compute, 625 → 750 accuracy/s (+20%), unlock at 10000 instead of 12500
    - LLM: 50M → 40M data, 25000 → 20000 compute, 3125 → 3750 accuracy/s (+20%), unlock at 50000 instead of 62500
    - Multimodal AI: 500M → 400M data, 250000 → 200000 compute, 15625 → 18750 accuracy/s (+20%), unlock at 250000 instead of 312500

### Improved
- **Early Game Experience**
  - Faster initial progression with reduced building costs
  - Quicker access to first model training
  - Better feedback with increased accuracy rewards
- **Mid Game Transition**
  - Smoother unlock thresholds for Tier 2 buildings
  - More accessible GPU clusters and data pipelines
  - Better pacing between early and late game
- **Late Game Accessibility**
  - Significantly reduced quantum processor requirements
  - More achievable frontier model unlocks
  - Better reward scaling for advanced models
- **Overall Progression**
  - 20% cost reduction across most buildings
  - 20% reward increase for all model training
  - 10-40% lower unlock thresholds throughout
- **Code Quality & Maintainability**
  - Extracted magic numbers to `GAME_CONSTANTS` and `LOOP_CONSTANTS`
  - Improved error handling throughout codebase
  - Better null-safety checks for models and prestige upgrades
  - Enhanced logging for debugging
  - Critical error screen with recovery options

### Fixed
- **Offline Progression**
  - Fixed achievement bonuses not applying during offline time
  - Fixed production not updating when buildings unlock offline
  - Improved calculation accuracy for extended offline sessions
  - Better handling of save version mismatches
- **Error Handling**
  - Game loop now catches errors and attempts recovery
  - Save/load operations have better error messages
  - Export function returns null on error instead of crashing
  - Import function properly validates save data
- **Edge Cases**
  - Fixed potential undefined errors with prestige upgrades
  - Added validation for training model existence
  - Better handling of corrupted save files

### Technical
- Improved code modularity with separated animation systems
- Optimized canvas rendering for better performance
- Enhanced CSS animations with GPU acceleration
- Better responsive design for mobile devices
- Chunked offline progression simulation (60s ticks)
- Constants extracted to configuration objects
- Improved type safety and null checks

## [0.1.0] - 2026-01-30

### Added
- Initial game release
- Core resource system (data, compute, accuracy, research)
- 9 building types across 3 tiers
- 8 ML model training tasks
- 17 research technologies
- 17 achievements with permanent bonuses
- Prestige/deployment system
- Save/load functionality with export/import
- Auto-save every 30 seconds
- Offline progression (up to 24 hours)
- Responsive UI with dark theme
- Achievement unlock animations
- Tab-based navigation
- Statistics tracking
- Manual data collection button

### Technical
- Modular JavaScript architecture
- LocalStorage persistence
- Game loop with delta time
- Achievement checking system
- Production calculation engine
- Research tree with dependencies
- Building unlock system
- Training progress tracking

---

## Version History

- **0.2.1** (Feb 9, 2026) - Hotfix: Training animations integration fixes
- **0.2.0** (Feb 9, 2026) - Balance adjustments, visual training animations, and code optimization
- **0.1.0** (Jan 30, 2026) - Initial release with core gameplay

## Upcoming

### Version 0.3 (Planned)
- Additional achievements
- More visual effects and polish
- Performance improvements
- Bug fixes based on user feedback
- Quality of life improvements

### Version 1.0 (Planned)
- Complete prestige system
- Full research tree expansion
- Statistics dashboard
- Mobile optimization
- Additional model types
- Tutorial system