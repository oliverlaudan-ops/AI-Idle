# Changelog

All notable changes to AI-Idle will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0-dev] - 2026-02-10

### Added - Combo System

#### Core Features
- **Manual Collect Combo System**: Active clicking now rewards players with multipliers
  - x1 (Click 1): Base collection
  - x2 (Click 2 within 5s): Double collection
  - x4 (Click 3 within 5s): Quadruple collection
  - x8 (Click 4+ within 5s): Maximum multiplier
  - 5-second timer window to maintain combo
  - Automatic reset when timer expires

#### Visual Effects
- **Combo Display**: Large animated counter showing current multiplier (x1, x2, x4, x8)
- **Color Progression**:
  - x1: Gray (default)
  - x2: Blue (good)
  - x4: Purple (great)
  - x8: Gold (excellent) with pulsing glow effect
- **Timer Bar**: Visual countdown indicator around collect button
  - Green → Yellow → Red color transition based on time remaining
  - Smooth width animation
- **Particle Effects**: Burst animation on combo level-up
  - Particle count increases with combo level
  - Color-coded particles matching combo tier
- **Screen Shake**: Subtle shake effect at x4, intense at x8
- **Combo Break Flash**: Red screen flash when combo expires
- **Floating Text**: Dynamic +amount display with combo colors

#### Technical Implementation
- `ComboSystem` class: Core combo logic and state management
- `ComboUI` class: All visual effects and animations
- Smooth timer updates using `requestAnimationFrame`
- Callback system for UI synchronization
- Save/load support for combo statistics
- Performance optimized particle system

#### Statistics Tracking
- Total manual clicks
- Times reached each combo level (x2, x4, x8)
- Longest x8 combo duration
- Maximum combo reached

#### Game State Integration
- New `manualCollect()` method with combo integration
- Achievement bonus support for manual collection
- Combo statistics saved with game state
- Version bump to 0.3 for save compatibility

### Changed
- Updated `game-state.js` to integrate `ComboSystem`
- Enhanced `ui-init.js` with combo UI initialization
- Added `id="game"` to game container for screen shake effect
- Version updated to v0.3.0-dev

### Technical Details
- **New Files**:
  - `src/modules/combo-system.js`: Core combo logic
  - `src/ui/combo-ui.js`: Visual effects and UI components
  - `src/ui/combo-styles.css`: Complete styling and animations
- **Modified Files**:
  - `src/modules/game-state.js`: Combo integration
  - `src/ui/ui-init.js`: UI initialization updates
  - `index.html`: CSS link and version update

### Future Combo Features (Planned)
- Combo achievements:
  - "Combo Starter": Reach x2 combo (Reward: +1 base click value)
  - "Combo Expert": Reach x4 combo 10 times (Reward: +5% manual collection)
  - "Combo Master": Reach x8 combo 100 times (Reward: +10% manual collection)
  - "Speed Clicker": Maintain x8 combo for 60 seconds (Reward: +1 second combo timer)
- Sound effects for combo actions
- Combo timer upgrades via research
- Higher combo tiers (x16, x32) as late-game upgrades

---

## [0.2.1] - 2026-02-09

### Fixed
- Training animations rendering correctly
- Minor UI polish

---

## [0.2.0] - 2026-02-09

### Added
- Enhanced training animations with canvas visualization
- Balance improvements
- Particle effects for achievements

### Changed
- Improved visual feedback across the game
- Performance optimizations

---

## [0.1.0] - 2026-01-30

### Added
- Initial MVP release
- Core idle game mechanics
- Building system with 3 tiers
- Model training system
- Research tree with 17 items
- Achievement system (30 achievements)
- Prestige/Deployment system
- Save/Load functionality
- Export/Import save strings
- Offline progress calculation
- Statistics tracking
- Responsive UI design

### Features
- 6 main tabs: Infrastructure, Training, Research, Deployment, Achievements, Statistics
- 8 trainable AI models across different categories
- Resource management: Data, Compute, Accuracy, Research Points
- 4 research categories: Optimizers, Activations, Architectures, Regularization
- Auto-save system (30 second intervals)
- Toast notifications for game events

---

## Development Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed future plans including:
- v0.3.0: Polish & Experience (Tutorial, QoL features, Accessibility)
- v1.0.0: Complete Release (Expanded Prestige, New Models, Events, Mobile Optimization)
- Post-1.0: Community Features, Advanced Features, Multiplayer