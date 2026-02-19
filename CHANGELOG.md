# Changelog

## [Unreleased — v0.3.4] - 2026-02-19

### Added

#### 🔬 Research Tree Expansion (40+ Items)
- **Expanded from 17 → 40 research items** across 8 categories (5 items each)
- **4 new categories added:**
  - **Hardware Innovations** — Neuromorphic Chips, Photonic Computing, Biological Processors, Quantum Neural Networks, Memristive Arrays
  - **Data Engineering** — Synthetic Data Generation, Data Augmentation, Active Learning, Few-Shot Learning, Data Compression
  - **Meta-Learning** — Learning to Learn, Zero-Shot Transfer, AutoML, Neural Architecture Search, Continual Learning
  - **Safety & Ethics** — Interpretability Tools, Adversarial Robustness, AI Alignment, Constitutional AI, Red-Teaming Protocols
- **8 research effect types** now fully implemented and wired into the game loop:
  - `trainingSpeed` — reduces training time
  - `modelPerformance` — boosts model accuracy output
  - `efficiency` — multiplies building production
  - `globalMultiplier` — applies to all resource generation
  - `dataProduction` — multiplies data generation rate
  - `computeEfficiency` — multiplies compute generation rate
  - `researchSpeed` — multiplies research point generation rate
  - `safetyBonus` — contributes to the global multiplier
- **Array-based multi-prerequisites** — research items can now require multiple completed prerequisites before unlocking (e.g. `unlockRequirement: { research: ["id1", "id2"] }`)
- **4 new HTML containers** added to `index.html`: `research-hardware`, `research-data`, `research-meta`, `research-safety`

#### ⚙️ Research Effects Wired into Game Loop
- `production-calculator.js` — new `getResearchMultipliers()` computes all 8 effect types in a single pass over `completedResearch`; results stored in `gameState.multipliers` for UI display and game-loop consumption
- `game-state.js` — `this.multipliers` expanded to all 8 effect types; `update()` now uses `multipliers.trainingSpeed` (achievement × research combined) instead of `achievementBonuses.trainingSpeed` alone
- `research.js` — `applyResearchEffect()` handles all 8 effect types; `canUnlockResearch()` supports both single-string and array prerequisites

### Changed

#### 🗂️ Architecture
- **Research definitions extracted** to `src/systems/research/definitions.js` — single source of truth for all 40 items; `ui-render.js` and `research.js` both import from there
- **`_cachedResearchMultiplier` renamed to `_cachedResearchMultipliers`** (plural) to reflect that the cache now holds an object with all 8 effect types rather than a single scalar
- **`multipliers` is not persisted** in save data — it is always recomputed from `research` + `achievementBonuses` on load, eliminating any risk of stale cached values
- **Save version bumped to `0.5`** to reflect the expanded multipliers shape and cache key rename

#### 🔄 Save/Load
- `GameState.load()` and `GameState.import()` now own the `recalculateProduction()` call: they invalidate `_cachedResearchMultipliers` first, then call `recalculateProduction()` once — avoiding the previous redundant double-pass that existed between `save-system.js` and `game-state.js`

---

## [0.3.3] - 2026-02-18

### Fixed

#### 🐛 Tutorial Button Crash (High Priority — Resolved)
- **Error:** `Cannot read properties of null (reading 'style')` at `TutorialSystem.start`
- **Root Cause:** `updateTooltip()` and `positionTooltip()` accessed DOM elements before they were initialised
- **Fix:** Added null-guards and a `_ensureElements()` helper in `src/ui/tutorial.js` that guarantees all required DOM elements exist before any property access
- **Impact:** Tutorial button no longer crashes the game when clicked

### Performance

#### ⚡ Production Calculator — Research Multiplier Cache
- **Problem:** `recalculateProduction()` ran ~10× per second and iterated over all `completedResearch` entries on every call (O(n) per tick)
- **Fix:** Introduced a lazy-loaded `_cachedResearchMultiplier` in `GameState` and a `getResearchMultiplier(gameState)` helper in `src/core/production-calculator.js`
  - Cache is computed once and reused until invalidated
  - Cache is invalidated (set to `null`) in two places:
    - `GameState.performResearch()` — when new research is completed
    - `GameState.performDeployment()` — after the full state reset
- **Result:** Research multiplier lookup is now O(1) per tick instead of O(n)
- **Files changed:** `src/core/production-calculator.js`, `src/modules/game-state.js`
- **Note:** With 40+ research items planned for v1.0.0 this fix prevents a measurable slowdown in the late-game production loop

---

## [0.3.2] - 2026-02-12

### Added

#### 🧪 Test Infrastructure & CI/CD
- **GitHub Actions CI/CD Pipeline**
  - Automated testing on every push to main branch
  - Tests run on Node.js v18.x, v20.x, and v22.x
  - Vitest test runner with coverage support
  - Automatic build verification
- **Test Suite (26 Tests)**
  - `tests/basic.test.js`: 4 sanity check tests
  - `tests/core/resource-manager.test.js`: 11 tests for ResourceManager
  - `tests/core/production-calculator.test.js`: 11 tests for production calculation
- **Test Setup Files**
  - `tests/setup.js`: localStorage mock for Node.js environment
  - `vitest.config.js`: Test runner configuration

### Fixed

#### GitHub Actions & Dependencies
- **Critical**: Fixed npm dependency installation in CI/CD
  - Changed workflow from `npm ci` to `npm install`
  - Removed corrupted `package-lock.json` with invalid SHA512 checksums
  - npm now auto-generates correct lock file with valid integrity hashes
  - Resolved `EINTEGRITY` errors for vitest packages
- **Test Dependencies**: Added missing gameState properties for tests

### Changed

#### Test Cleanup
- Removed broken/incomplete test files
- Replaced with working, comprehensive test suites

### Known Issues

#### ❌ Tutorial Button Crash (High Priority)
**Error:** Cannot read properties of null (reading 'style') at TutorialSystem.start
**Status:** Not fixed  
**Impact:** Tutorial button crashes game when clicked  
**Workaround:** Avoid clicking Tutorial button  
**Fix Required:** Add null-check before accessing `.style` property

**Root Game Functionality:** ✅ All other features work correctly without errors
