# Changelog

## [Unreleased — v0.3.4] - 2026-02-19

### Added

#### 🚀 Expanded Deployment/Prestige System (Phase 1 of v1.0.0)

**Deployment Strategies**
- **3 deployment strategies** with speed/reward tradeoffs:
  - **Fast Deployment** (⚡) — 0.75× tokens, always available, best for quick iteration
  - **Standard Deployment** (🚀) — 1.0× tokens, default balanced strategy
  - **Complete Deployment** (🏆) — 1.5× tokens + 10% production bonus next run, unlocks after 3 deployments
- Strategy selection UI in Deployment modal
- Strategy bonuses applied on deployment and carried into next run
- `src/modules/deployment-strategies.js` — strategy definitions and calculations

**Token Shop (15 Permanent Upgrades)**
- **Token Shop UI** with 4 categories: Training, Efficiency, Research, Prestige
- **Training upgrades (4):**
  - Optimised Gradients I–III (1/3/8 tokens) — +25%/+50%/+100% training speed
  - Xavier Initialisation (2 tokens) — models start at 10% accuracy
- **Efficiency upgrades (5):**
  - Data Pipeline I–II (1/4 tokens) — +30%/+60% data production
  - GPU Overclock I–II (1/4 tokens) — +30%/+60% compute production
  - Systems Optimisation (5 tokens) — +20% all production
- **Research upgrades (3):**
  - Literature Review I–II (2/6 tokens) — +40%/+80% research speed
  - Prior Knowledge (3 tokens) — start each run with 1 free research unlock
- **Prestige upgrades (2):**
  - Deployment Bonus (5 tokens) — +25% tokens earned per deployment
  - Institutional Memory (4 tokens) — start each run with 2× building production
- **Total shop cost:** 49 tokens for all upgrades
- **Prerequisite system** — some upgrades require prior tier (e.g. Gradients II requires Gradients I)
- `src/modules/deployment-upgrades.js` — upgrade definitions, purchase logic, and multiplier calculations

**Portfolio System**
- **Deployment history tracking** — every deployment creates a permanent record with:
  - Strategy used, tokens earned, total accuracy, models trained, research completed, run duration, timestamp
- **Portfolio Score formula:**
  - +10 per deployment
  - +5 per token earned
  - +2 per model trained
  - +3 per research completed
  - +20 bonus for Complete Deployment strategy
- **6 Portfolio Ranks** based on score:
  - Intern (0–9) 🎓
  - Junior Researcher (10–39) 📚
  - ML Engineer (40–99) 💻
  - Senior Researcher (100–249) 🔬
  - ML Architect (250–499) 🏆
  - AGI Pioneer (500+) 🌟
- **Portfolio statistics UI:**
  - Current rank and score
  - Total deployments, lifetime tokens
  - Total models trained and research completed (all-time)
  - Best token run, fastest run duration
  - Recent history (last 5 deployments)
- `src/modules/deployment-portfolio.js` — portfolio tracking, scoring, and ranking

**Deployment UI Overhaul**
- **3-tab Deployment modal:**
  - **Token Shop** — browse and purchase upgrades by category
  - **Strategies** — select deployment strategy and view token preview
  - **Portfolio** — view deployment history, rank, and stats
- **Deploy button** integrated into game footer controls
- Upgrade cards display: name, description, cost, prerequisite, owned status
- Strategy cards display: icon, name, description, token multiplier, unlock requirement
- Toast notifications for purchases and deployments
- `src/ui/deployment-ui.js` — modal rendering, tab switching, purchase/deployment handlers

**Core Integration**
- **Production calculator integration** — Token Shop upgrades feed into `getUpgradeMultipliers()`:
  - `trainingSpeed`, `dataProduction`, `computeEfficiency`, `researchSpeed`, `globalMultiplier`
  - All multipliers stack multiplicatively with research and achievement bonuses
- **Deployment flow rewrite** in `game-state.js`:
  - Strategy selection and token calculation
  - Upgrade multiplier application
  - Portfolio entry creation and history append
  - Strategy bonuses applied to next run (e.g. Complete's +10% production)
- **Save version bumped to 0.6** to accommodate:
  - `deployment.upgradesPurchased` — purchased upgrade map
  - `deployment.selectedStrategy` — currently selected strategy ID
  - `deployment.portfolio` — full deployment history array

**Documentation**
- **`docs/DEPLOYMENT_SYSTEM.md`** — comprehensive 14KB guide covering:
  - Token formula and milestones
  - Strategy comparison table and usage tips
  - Complete Token Shop upgrade list with costs and effects
  - Portfolio scoring and ranking system
  - Strategic progression guide (early/mid/late game)
  - Technical implementation details

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
- **`multipliers` is not persisted** in save data — it is always recomputed from `research` + `achievementBonuses` + `upgrades` on load, eliminating any risk of stale cached values
- **Save version bumped to `0.6`** to reflect:
  - Expanded multipliers shape and cache key rename
  - New deployment fields: `upgradesPurchased`, `selectedStrategy`, `portfolio`
  - Upgrade multipliers integrated into production calculator

#### 🔄 Save/Load
- `GameState.load()` and `GameState.import()` now own the `recalculateProduction()` call: they invalidate `_cachedResearchMultipliers` first, then call `recalculateProduction()` once — avoiding the previous redundant double-pass that existed between `save-system.js` and `game-state.js`
- Save migration from v0.5 → v0.6 initializes:
  - `deployment.upgradesPurchased = {}`
  - `deployment.selectedStrategy = 'standard'`
  - `deployment.portfolio = []`

### Fixed

#### 🐛 Deployment UI Bugs
- **Fixed Token Shop import** — changed from non-existent `UPGRADES` export to `UPGRADE_DEFINITIONS` in `deployment-upgrades.js`
- **Fixed upgrade card rendering** — replaced levelled upgrade logic (maxLevel/baseCost) with flat one-time purchase model (owned boolean)
- **Fixed purchase function call order** — corrected argument order to match `canPurchaseUpgrade(id, purchased, tokens)` and `purchaseUpgrade(id, purchased, tokens)`
- **Fixed Deploy button placement** — now inserted into `.footer-controls` instead of falling back to `document.body`
- **Removed redundant UI elements:**
  - Old `#btn-deploy` button from Deployment tab (replaced by DeploymentUI modal)
  - Static `#training-queue-section` from Training tab (duplicate of dynamic TrainingQueueUI)

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
