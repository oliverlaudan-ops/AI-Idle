# AI-Idle Development Roadmap

## Release Timeline

| Version | Target Date | Status |
|---------|-------------|--------|
| v0.1.0 | Jan 30, 2026 | ✅ Released |
| v0.2.0 | Feb 9, 2026 | ✅ Released |
| v0.3.0 | Feb 12, 2026 | ✅ Released |
| v1.0.0 | Late March 2026 | 🎯 In Progress |

---

## Version 0.3.x — Polish & Stability

### ✅ v0.3.0 — Core QoL (Released Feb 12, 2026)
- ✅ Manual Collect Combo System (PR #2)
- ✅ Tutorial System (PR #3)
- ✅ Auto-Training Queue (PR #4)
- ✅ QoL Improvements — Bulk Building Purchase, Enhanced Resource Notifications, Progress Indicators (PR #5)

### ✅ v0.3.2 — CI/CD & Tests (Released Feb 12, 2026)
- ✅ GitHub Actions CI/CD pipeline (Node 18/20/22)
- ✅ 26 tests for ResourceManager and ProductionCalculator
- ✅ Vitest test runner with coverage support

### ✅ v0.3.3 — Bug Fixes & Performance (Released Feb 18, 2026)
- ✅ **Tutorial button crash fixed** — null-guards added to `TutorialSystem.start()` / `updateTooltip()` / `positionTooltip()`
- ✅ **Research multiplier cache** — lazy-loaded `_cachedResearchMultipliers` in `GameState`; O(1) per tick instead of O(n)

### ✅ v0.3.4 — Research Tree Expansion (Released Feb 19, 2026)
- ✅ **40+ research items** across 8 categories (expanded from 17)
- ✅ **4 new categories:** Hardware Innovations, Data Engineering, Meta-Learning, Safety & Ethics
- ✅ **8 effect types** fully wired into the game loop: `trainingSpeed`, `modelPerformance`, `efficiency`, `globalMultiplier`, `dataProduction`, `computeEfficiency`, `researchSpeed`, `safetyBonus`
- ✅ **Array-based multi-prerequisites** — research items can require multiple completed prerequisites
- ✅ **Research definitions extracted** to `src/systems/research/definitions.js` — single source of truth
- ✅ **Save version bumped to 0.5** — expanded multipliers shape, renamed cache key

---

## Version 1.0.0 — Complete Experience (Target: Late March 2026)

### 1. Expanded Prestige / Deployment System 🔄

**Deployment Strategies**
- Fast Deployment — lower accuracy bonus, quick turnaround
- Standard Deployment — balanced (current behaviour)
- Complete Deployment — maximum accuracy bonus, longer cooldown

**Token Shop Expansion (20+ upgrades)**
- Training Speed Tiers (I–V)
- Building Efficiency Tiers (I–V)
- Research Speed Tiers (I–III)
- Prestige Multiplier Tiers (I–III)
- Special unlocks: Auto-Deploy, Research Automation, Building Synergies

**Deployment Milestones**
- 5 deployments — unlock Hardware category
- 10 deployments — unlock Data Engineering category
- 25 deployments — unlock Meta-Learning category
- 50 deployments — unlock Safety & Ethics category
- 100 deployments — unlock Quantum Computing research

**Model Portfolio System**
- Track all deployed models with accuracy and timestamp
- Portfolio score = sum of all deployed model accuracies
- Portfolio bonuses at 500 / 1000 / 2500 / 5000 portfolio score

**Transfer Learning**
- Each deployment leaves a "knowledge residue"
- Residue reduces training time for the next model of the same type
- Stacks up to 5× per model type

---

### 2. Research Tree — Specialisation Paths 🔬

> **Core expansion (40 items, 8 categories) is complete as of v0.3.4.**
> v1.0.0 adds specialisation paths and late-game research.

**Specialisation Paths (choose one per prestige)**
- 🖼️ Vision Specialist — bonus to CNN/Vision Transformer training speed and accuracy
- 💬 Language Specialist — bonus to Transformer/LLM training speed and accuracy
- 🌐 Generalist — smaller bonuses across all model types, higher global multiplier
- ⚙️ Hardware Path — extreme compute efficiency, reduced building costs

**Late-Game Research (post-50 deployments)**
- Quantum Computing — +50% compute efficiency, unlocks Quantum Neural Networks
- Neuromorphic Integration — buildings produce 2× compute passively
- AGI Foundations — global multiplier ×2, requires all Safety & Ethics research

**Research Automation**
- Token Shop upgrade: "Research Automation" — auto-spends research points on the cheapest available item
- Configurable priority queue (drag-and-drop, planned post-1.0)

---

### 3. New Model Categories (15–20 total) 🤖

**Current models (v0.3.x):** Linear Regression, Logistic Regression, Decision Tree, Random Forest, SVM, K-Means, Neural Network, CNN, RNN, LSTM, Transformer

**New models for v1.0.0:**
- Vision Transformer (ViT)
- Diffusion Model
- Graph Neural Network (GNN)
- Mixture of Experts (MoE)
- Large Language Model (LLM)
- Multimodal Model
- Reinforcement Learning Agent
- World Model

**Model Tiers**
- Tier 1 (Beginner) — Linear Regression → SVM
- Tier 2 (Intermediate) — Neural Network → LSTM
- Tier 3 (Advanced) — Transformer → GNN
- Tier 4 (Expert) — MoE → World Model

---

### 4. Model Zoo & Collection System 🦁

**Model Gallery**
- Visual grid of all deployed models
- Each model card shows: type, accuracy, training time, deployment date
- Training history sparkline graph per model

**Collection Bonuses**
- Complete a tier → +10% training speed for that tier
- Complete all Tier 1 → unlock "Classic ML" achievement (+5% global)
- Complete all Tier 2 → unlock "Deep Learning" achievement (+10% global)
- Complete all Tier 3 → unlock "Modern AI" achievement (+15% global)
- Complete all Tier 4 → unlock "State of the Art" achievement (+25% global)

**Achievements for Collection**
- "First Steps" — deploy your first model
- "Diverse Portfolio" — deploy 5 different model types
- "Completionist" — deploy every model type at least once
- "Accuracy Chaser" — deploy a model with 99%+ accuracy
- "Speed Runner" — deploy a model in under 60 seconds

---

### 5. Events & Challenges ⚡

**Weekly Challenges (rotating)**
- Speed Run — deploy 3 models in 10 minutes
- Efficiency Expert — reach 1000 compute/s using only 5 buildings
- Research Focus — unlock 10 research items in one session
- Building Spree — purchase 50 buildings in 5 minutes

**Random Events (probability-based)**
- 🟢 Hardware Sale — buildings cost 50% less for 60 seconds
- 🟢 Research Breakthrough — research speed ×3 for 30 seconds
- 🟡 Data Leak — data production halved for 45 seconds
- 🟡 Bug in Production — one random building stops producing for 30 seconds
- 🔴 Power Outage — all production stops for 15 seconds
- 🔴 Security Audit — must complete a Safety & Ethics research item to resume

---

### 6. Mobile Optimisation & PWA 📱

**Responsive Design**
- Touch-optimised buttons (min 44×44px tap targets)
- Collapsible sidebar sections
- Portrait and landscape layout modes
- Swipe gestures for tab navigation

**Progressive Web App**
- `manifest.json` with icons (192×192, 512×512)
- Service worker for offline capability
- "Add to Home Screen" prompt
- Push notifications for: research complete, deployment ready, weekly challenge available

---

## Implementation Plan (v1.0.0)

| Phase | Focus | Target |
|-------|-------|--------|
| Phase 1 | Prestige / Deployment expansion | Week 1 |
| Phase 2 | New models + Model Zoo | Week 2 |
| Phase 3 | Events & Challenges | Week 3 |
| Phase 4 | Mobile / PWA + final balance pass | Week 4 |

---

## Post-1.0 Ideas (Backlog)

- Drag-and-drop queue reordering
- Queue presets (save/load training queues)
- Smart training recommendations (AI suggests next model)
- Priority system for training queue
- Multiplayer leaderboard (portfolio score ranking)
- Mod support / plugin API
- Dark/light theme toggle
- Localisation (i18n)

---

## Development Workflow

```
feature/fix branch → PR → review → merge to main → tag release
```

- All features developed on named branches
- PRs required for main branch merges
- Semantic versioning: MAJOR.MINOR.PATCH
- CHANGELOG.md updated with every release

---

## Success Metrics for v1.0.0

- [ ] 40+ research items implemented and balanced ✅ (done in v0.3.4)
- [ ] 15+ model types available
- [ ] Prestige system with 3 deployment strategies
- [ ] Mobile-playable on iOS Safari and Android Chrome
- [ ] PWA installable
- [ ] 0 known crash bugs at release
- [ ] Test coverage ≥ 80% on core modules
