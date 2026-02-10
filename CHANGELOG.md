# Changelog

All notable changes to AI-Idle will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned for v0.3.1
- Enhanced Statistics Tab UI with visual graphs and leaderboards
- Training Queue drag-and-drop reordering
- Balance pass based on community feedback
- Additional hotkey customization options
- Bug fixes and performance improvements

---

## [0.3.0] - 2026-02-10

### 🎉 Major Release: Quality of Life Improvements

This release focuses on **automation**, **customization**, and **efficiency** without changing core game balance. All new features are designed to reduce tedium and enhance the player experience.

### Added

#### 📋 Training Queue System
- **Multi-model queuing**: Queue up to 10 models for automated sequential training
- **Visual queue panel**: Expandable sidebar showing queued models with icons and time estimates
- **Smart scheduling**: Queue automatically processes when training completes
- **Time estimates**: Shows individual and total queue duration with speed multipliers
- **Persistent state**: Queue survives game save/load
- **Add to queue**: Click model cards to add to queue (visual feedback on success)
- **Remove from queue**: Click queued items to remove them
- **Hotkey support**: Press `Q` to toggle queue panel
- **Empty state**: Clear visual indicator when queue is empty

**New Files:**
- `src/modules/training-queue.js`: Core queue logic and state management
- `src/ui/training-queue-ui.js`: Queue panel UI and interactions
- `src/ui/training-queue-styles.css`: Complete styling for queue interface

#### 🛒 Bulk Purchase System
- **Shift+Click functionality**: Hold Shift and click any building to buy 10x
- **Flexible purchase modes**: 1x, 10x, 25x, 50x, 100x, Max
- **Smart "Buy Max" calculation**: Automatically determines affordable quantity
- **Cost preview**: Shows total cost for selected quantity before purchase
- **Mode indicator**: Visual feedback for active bulk purchase mode
- **Hotkey integration**: 
  - Shift+1: 1x mode
  - Shift+2: 10x mode
  - Shift+3: 25x mode
  - Shift+4: 50x mode
  - Shift+5: 100x mode
  - Shift+6: Max mode
- **Persistent mode**: Selected mode saved between sessions
- **Visual panel**: Dedicated bulk purchase control panel in Infrastructure tab

**New Files:**
- `src/modules/bulk-purchase.js`: Bulk purchase logic and calculations
- `src/ui/bulk-purchase-ui.js`: Bulk purchase panel and interactions
- `src/ui/bulk-purchase-styles.css`: Complete styling for bulk purchase UI

#### ⚙️ Comprehensive Settings System
- **Gameplay Settings:**
  - Auto-save interval: 10s / 30s / 60s / 5min (default: 30s)
  - Offline progress: Enable/Disable (default: enabled)
  - Pause on blur: Pause game when tab loses focus (default: disabled)
  - Number formatting: Scientific / Short / Full (default: Short)
- **Notification Settings:**
  - Training complete notifications: Toggle on/off
  - Research complete notifications: Toggle on/off
  - Achievement unlock notifications: Toggle on/off
  - Building unlock notifications: Toggle on/off
  - Sound effects: Enable/Disable (default: enabled)
  - Toast duration: 1s / 2s / 3s / 5s (default: 3s)
- **Performance Settings:**
  - Animation quality: Low / Medium / High (default: High)
  - Particle effects: Enable/Disable (default: enabled)
  - Canvas rendering: Toggle training visualizations (default: enabled)
- **Settings persistence**: All settings stored in separate localStorage key
- **Modal interface**: Beautiful modal with tabbed categories
- **Reset to defaults**: One-click reset for all settings
- **Hotkey support**: Press `E` to open settings

**New Files:**
- `src/modules/settings.js`: Settings storage and management
- `src/ui/settings-ui.js`: Settings modal UI and interactions
- `src/ui/settings-styles.css`: Complete styling for settings interface

#### ⌨️ Keyboard Shortcuts System
- **Navigation Hotkeys:**
  - 1-6: Switch between tabs (Infrastructure, Training, Research, Deployment, Achievements, Statistics)
- **Action Hotkeys:**
  - Space: Collect Data manually
  - S: Save Game
  - Q: Toggle Training Queue panel
  - E: Open Settings modal
  - T: Start/Stop current training
- **System Hotkeys:**
  - Escape: Close active modal
  - H: Show Hotkey Help modal
  - Ctrl+E: Export Save
  - Ctrl+I: Import Save
- **Smart input detection**: Hotkeys automatically disabled when typing in text fields
- **Visual help modal**: Comprehensive keyboard shortcut reference with categories
- **Keyboard-first gameplay**: Efficient navigation without mouse
- **Visual `<kbd>` styling**: Beautiful 3D keyboard key indicators

**New Files:**
- `src/modules/hotkeys.js`: Hotkey system and event handling
- `src/ui/hotkey-styles.css`: Styling for hotkey help modal and badges

#### 📊 Statistics Tracking System
- **Lifetime Statistics:**
  - Total data collected
  - Total accuracy gained
  - Total research points earned
  - Total compute generated
  - Manual clicks performed
  - Buildings purchased
  - Research completed
  - Models completed
  - Deployments performed
  - Achievements unlocked
- **Session Statistics:**
  - Per-session resource tracking (resets on load)
  - Session duration tracking
  - Resources gained this session
- **Records & Milestones:**
  - Best combo achieved
  - Best combo multiplier
  - Fastest model completion time
  - Peak production rates (Data/s, Accuracy/s, Research/s)
  - Highest accuracy reached
  - Largest single click value
- **Time Tracking:**
  - Total playtime across all sessions
  - Total offline time
  - Longest session duration
  - Total session count
- **Per-item tracking:**
  - Building purchase counts by type
  - Research completion counts
  - Model training counts by type

**New Files:**
- `src/modules/statistics.js`: Comprehensive statistics tracking

*Note: Statistics Tab UI enhancement planned for v0.3.1*

### Changed

#### Performance Optimizations
- **Throttled Combo Timer**: Reduced update frequency from 60 FPS to 10 FPS (6x performance improvement)
- **Conditional UI updates**: Only update visible elements
- **Efficient event listeners**: Debounced input handlers
- **Reduced requestAnimationFrame warnings**: Significantly fewer performance warnings in console

#### UI/UX Improvements
- **New footer buttons**: Added ⚙️ Settings and ⌨️ Hotkeys buttons
- **Modal animations**: Smooth slide-in effects for all modals
- **Visual feedback**: Enhanced button states and hover effects
- **Keyboard navigation**: Tab-accessible controls throughout
- **Hotkey badges**: Visual indicators for keyboard shortcuts in tooltips

#### Technical Architecture
- **Modular systems**: All new features as independent modules
- **Clean separation**: Game logic separated from UI components
- **State management**: Improved state handling across systems
- **Save system**: Extended to support all new systems
- **Backward compatibility**: Full compatibility with v0.2.x saves

### Modified Files
- `index.html`: Added CSS links for new systems, footer buttons
- `src/main.js`: Initialize all new systems, enhanced error handling
- `src/ui/ui-init.js`: Added button listeners, optimized combo timer, setup new UIs
- `src/modules/game-state.js`: Integrated new systems into save/load (minimal changes)

### Fixed
- Performance warnings reduced through throttling
- Combo timer optimization
- Better error handling for modal interactions
- Improved save/load reliability

### Documentation
- Added `docs/v0.3.0-RELEASE-NOTES.md`: Comprehensive release documentation
- Updated `README.md`: Complete v0.3.0 feature documentation
- Added keyboard shortcuts quick reference
- Included upgrade guide from v0.2.x

### Known Issues
1. **Performance Warning (Minor)**: `requestAnimationFrame` occasionally >50ms during heavy updates. Mitigated by throttling, not gameplay-affecting.
2. **Queue Reordering**: Drag-and-drop not yet implemented. Items added to end of queue.
3. **Statistics UI**: Tracker implemented but Statistics Tab UI not updated yet.

### Migration Notes
- Existing v0.2.x saves work seamlessly
- New systems start with default values
- Settings stored in separate localStorage key
- No manual migration steps required

---

## [0.2.1] - 2026-02-09

### Fixed
- Training animations rendering correctly
- Minor UI polish

---

## [0.2.0] - 2026-02-09

### Added

#### Combo System
- **Manual Collect Combo System**: Active clicking now rewards players with multipliers
  - x1 (Click 1): Base collection
  - x2 (Click 2 within 5s): Double collection
  - x4 (Click 3 within 5s): Quadruple collection
  - x8 (Click 4+ within 5s): Maximum multiplier
  - 5-second timer window to maintain combo
  - Automatic reset when timer expires

#### Visual Effects
- **Combo Display**: Large animated counter showing current multiplier
- **Color Progression**: Gray → Blue → Purple → Gold with pulsing effects
- **Timer Bar**: Visual countdown indicator around collect button
- **Particle Effects**: Burst animation on combo level-up
- **Screen Shake**: Subtle shake at x4, intense at x8
- **Combo Break Flash**: Red screen flash when combo expires
- **Floating Text**: Dynamic +amount display with combo colors

#### Balance Improvements
- Enhanced training animations with canvas visualization
- Particle effects for achievements
- Improved visual feedback across the game
- Performance optimizations

### Changed
- Updated `game-state.js` to integrate `ComboSystem`
- Enhanced `ui-init.js` with combo UI initialization
- Version updated to v0.2.0

### Technical Details
- **New Files**:
  - `src/modules/combo-system.js`: Core combo logic
  - `src/ui/combo-ui.js`: Visual effects and UI components
  - `src/ui/combo-styles.css`: Complete styling and animations

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

### v0.3.1 (Next) - Polish
- Enhanced Statistics Tab UI with graphs and leaderboards
- Training Queue drag-and-drop reordering
- Balance pass based on community feedback
- Additional hotkey customization
- Bug fixes

### v1.0.0 (Future) - Complete Release
- Expanded Prestige system
- New models and content
- Tutorial system
- Mobile optimization
- Cloud saves

### Post-1.0 - Community & Advanced Features
- Leaderboards and competitions
- Multiplayer features
- Mini-games
- Mobile app
- Advanced automation
