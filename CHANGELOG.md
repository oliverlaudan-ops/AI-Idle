# Changelog

## [0.7.1] - 2026-03-12

### ✅ Stability & Performance Improvements

#### Storage Safety
- **NEW**: `utils/storage.js` - Safe localStorage wrapper mit try/catch
- **UPDATED**: `dqn-agent.js`, `smart-achievement-predictor.js`, `settings.js`, `main.js` nutzen jetzt den safe wrapper
- **FIX**: QuotaExceeded handling für vollen localStorage

#### UI Refactoring (Modular)
- **NEW**: 8 separate UI-Render-Module:
  - `ui-render-stats.js` - Stats-Anzeige
  - `ui-render-buildings.js` - Building-Management
  - `ui-render-models.js` - Model Training UI
  - `ui-render-training.js` - Training Queue
  - `ui-render-research.js` - Research Tree
  - `ui-render-achievements.js` - Achievements
  - `ui-render-statistics.js` - Statistics Panel
  - `ui-render-notifications.js` - Toast Notifications
- **REFACTORED**: `ui-render.js` von 614 Zeilen aufgeräumt

#### Error Handling
- **NEW**: `utils/error-boundary.js` - Global ErrorHandler class
- **NEW**: `utils/safeExecute` utility für try/catch Wrappers
- **UPDATED**: Alle UI-Render-Funktionen mit error handling
- **FIX**: Inline onclick handler in `main.js` mit try/catch

#### TensorFlow.js Memory Monitoring
- **NEW**: `systems/rl-bot/tf-memory-monitor.js` - Memory leak detection
- **INTEGRATED**: Memory checks in `dqn-agent.js` (every 100 steps)
- **AUTO-CLEANUP**: Automatischer cleanup bei 400MB
- **PROTECTION**: Block replay-buffer sampling below 200MB

#### SmartPredictor Removal (Deprecated Feature)
- **REMOVED**: Complete SmartPredictor feature (PR #13)
- **DELETED**: `smart-achievement-predictor.js` - deprecated predictor module
- **CLEANUP**: Removed all SmartPredictor references from:
  - `definitions.js` - achievement definitions
  - `index.js` - main exports
  - `ai-lab-ui.js` - UI components
  - `main.js` - game initialization
- **FIX**: Removed orphan return statements and unused variables
- **IMPACT**: Reduced codebase complexity, improved maintainability

#### Bug Fixes
- ✅ Global error handling im UI Layer
- ✅ Safe localStorage operations
- ✅ TensorFlow memory leak prevention
- ✅ SmartPredictor completely removed

#### Files Changed
- 19 files changed, +1237 lines, -625 lines (Storage/UI/Error)
- 18 files changed (SmartPredictor removal)

---

## [0.6.0] - 2026-02-23
