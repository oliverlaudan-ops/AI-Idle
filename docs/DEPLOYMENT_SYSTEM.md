# Deployment System (Prestige Mechanic)

The Deployment System is AI-Idle's prestige mechanic. Players "deploy" their trained AI models to reset progress and earn permanent bonuses through **Deployment Tokens**, which can be spent in the **Token Shop** for powerful upgrades.

## Table of Contents

- [Overview](#overview)
- [Deployment Tokens](#deployment-tokens)
- [Deployment Strategies](#deployment-strategies)
- [Token Shop (Upgrades)](#token-shop-upgrades)
- [Portfolio System](#portfolio-system)
- [How to Deploy](#how-to-deploy)
- [Strategic Tips](#strategic-tips)
- [Technical Implementation](#technical-implementation)

---

## Overview

The Deployment System provides long-term progression beyond a single run:

1. **Train models** and accumulate **Total Accuracy**
2. **Deploy** when you've earned enough accuracy to gain tokens
3. **Spend tokens** in the Token Shop for permanent upgrades
4. **Repeat** with stronger multipliers each time

Deployment resets most progress (resources, buildings, models, research) but preserves:
- ✅ Deployment Tokens (current balance)
- ✅ Lifetime Tokens (all tokens ever earned)
- ✅ Token Shop upgrades (purchased upgrades)
- ✅ Deployment count
- ✅ Portfolio history

---

## Deployment Tokens

### Token Formula

Tokens are earned based on **lifetime total accuracy** (all accuracy ever accumulated):

```
tokens = floor(sqrt(totalAccuracy / 250,000))
```

### Token Milestones

| Total Accuracy | Tokens Earned | Progress |
|----------------|---------------|----------|
| 250,000 | 1 token | First deployment! 🎉 |
| 1,000,000 | 2 tokens | 1M milestone |
| 4,000,000 | 4 tokens | 4M milestone |
| 10,000,000 | 6 tokens | 10M milestone |
| 25,000,000 | 10 tokens | 25M milestone |
| 100,000,000 | 20 tokens | 100M milestone |

### Deployment Requirements

You can only deploy when you will earn **at least 1 new token**:

- First deployment: reach 250K total accuracy → earn 1 token
- Second deployment: reach 1M total accuracy → earn 2nd token
- Third deployment: reach 2.25M total accuracy → earn 3rd token

### Next Token Progress

The UI displays progress toward your next token:

```
Next token at: (currentTokens + 1)² × 250,000 accuracy
```

**Example:** If you have 3 tokens, your next token requires:
- `4² × 250,000 = 4,000,000 total accuracy`

---

## Deployment Strategies

Starting in **v0.3.4**, players choose a deployment strategy that trades speed for rewards.

### Strategy Comparison

| Strategy | Icon | Token Multiplier | Bonuses | Unlock Requirement |
|----------|------|------------------|---------|---------------------|
| **Fast Deployment** | ⚡ | 0.75× (−25%) | None | Always available |
| **Standard Deployment** | 🚀 | 1.0× (baseline) | None | Always available |
| **Complete Deployment** | 🏆 | 1.5× (+50%) | +10% production next run | 3 deployments |

### When to Use Each Strategy

**Fast Deployment** (⚡)
- Best for: Quick iteration, testing new strategies
- Use when: You want to rush early Token Shop upgrades
- Drawback: 25% fewer tokens per deployment

**Standard Deployment** (🚀)
- Best for: Balanced progression
- Use when: Default choice for most runs
- Neutral: No bonuses or penalties

**Complete Deployment** (🏆)
- Best for: Maximising long-term gains
- Use when: You've reached a good stopping point
- Bonus: +50% tokens + 10% production boost next run
- Requires: 3 prior deployments to unlock

### Strategy Tokens Calculation

Tokens earned are modified by:
1. **Strategy multiplier** (0.75× / 1.0× / 1.5×)
2. **Token Shop upgrade multiplier** (from "Deployment Bonus")

```javascript
finalTokens = floor(baseTokens × strategyMultiplier × upgradeMultiplier)
```

---

## Token Shop (Upgrades)

The Token Shop contains **15 permanent upgrades** across 4 categories.

### 🏪 Shop Structure

Upgrades are **one-time purchases** that persist forever. Some upgrades have **prerequisites** (must buy Tier I before Tier II).

### 📋 Complete Upgrade List

#### ⚡ Training Category

| Upgrade | Cost | Effect | Requires |
|---------|------|--------|----------|
| Optimised Gradients I | 1 token | +25% training speed | — |
| Optimised Gradients II | 3 tokens | +50% training speed | Gradients I |
| Optimised Gradients III | 8 tokens | +100% training speed | Gradients II |
| Xavier Initialisation | 2 tokens | Models start at 10% accuracy | — |

**Category Total:** 14 tokens for all training upgrades

#### 🗄️ Efficiency Category

| Upgrade | Cost | Effect | Requires |
|---------|------|--------|----------|
| Data Pipeline I | 1 token | +30% data production | — |
| Data Pipeline II | 4 tokens | +60% data production | Pipeline I |
| GPU Overclock I | 1 token | +30% compute production | — |
| GPU Overclock II | 4 tokens | +60% compute production | Overclock I |
| Systems Optimisation | 5 tokens | +20% all production | — |

**Category Total:** 15 tokens for all efficiency upgrades

#### 🔬 Research Category

| Upgrade | Cost | Effect | Requires |
|---------|------|--------|----------|
| Literature Review I | 2 tokens | +40% research speed | — |
| Literature Review II | 6 tokens | +80% research speed | Review I |
| Prior Knowledge | 3 tokens | Start each run with 1 free research | — |

**Category Total:** 11 tokens for all research upgrades

#### 🎖️ Prestige Category

| Upgrade | Cost | Effect | Requires |
|---------|------|--------|----------|
| Deployment Bonus | 5 tokens | +25% tokens per deployment | — |
| Institutional Memory | 4 tokens | Start with 2× building production | — |

**Category Total:** 9 tokens for all prestige upgrades

### 💰 Total Shop Cost

To purchase **all 15 upgrades**: **49 tokens**

### 📈 Upgrade Effects

Upgrades apply **multiplicative stacking**:

```javascript
// Example: All training speed upgrades purchased
totalTrainingSpeed = 1.25 × 1.5 × 2.0 = 3.75× (275% faster)
```

Upgrades integrate into the production calculator and affect:
- `trainingSpeed` — model training duration
- `dataProduction` — Data generation rate
- `computeEfficiency` — Compute generation rate
- `researchSpeed` — Research point accumulation
- `globalMultiplier` — All production (buildings, training, etc.)
- `tokenMultiplier` — Tokens earned on deployment
- `startingAccuracy` — Initial model accuracy (flat bonus)
- `freeResearch` — Free research unlocks at run start (flat bonus)
- `startingProduction` — Base building production multiplier

---

## Portfolio System

The Portfolio tracks your **deployment history** and computes a **Portfolio Score** that reflects overall progression.

### Portfolio Entry

Each deployment creates a permanent record:

```javascript
{
  deploymentNumber: 5,
  strategyId: 'complete',
  tokensEarned: 3,
  totalAccuracyAtDeploy: 4000000,
  modelsTrainedThisRun: 12,
  researchCompletedThisRun: 8,
  runDurationMs: 1800000,  // 30 minutes
  timestamp: 1708531200000
}
```

### Portfolio Score Formula

Score is calculated from all deployments:

```
Score = Σ (per deployment):
  +10  per deployment
  + 5  per token earned
  + 2  per model trained
  + 3  per research completed
  +20  bonus for "Complete Deployment" strategy
```

**Example:** 5 deployments with 15 total tokens, 50 models, 30 research:
```
Score = (5 × 10) + (15 × 5) + (50 × 2) + (30 × 3) = 315 points
```

### Portfolio Ranks

Your portfolio score determines your rank:

| Score | Rank | Icon |
|-------|------|------|
| 500+ | AGI Pioneer | 🌟 |
| 250–499 | ML Architect | 🏆 |
| 100–249 | Senior Researcher | 🔬 |
| 40–99 | ML Engineer | 💻 |
| 10–39 | Junior Researcher | 📚 |
| 0–9 | Intern | 🎓 |

### Portfolio Statistics

The Portfolio tab displays:
- **Rank & Score**
- **Total Deployments**
- **Lifetime Tokens** (all tokens ever earned)
- **Total Models Trained** (across all runs)
- **Total Research Completed** (across all runs)
- **Best Token Run** (highest single-deployment token gain)
- **Fastest Run** (shortest deployment duration)
- **Recent History** (last 5 deployments)

---

## How to Deploy

### Step-by-Step Guide

1. **Check Deployment Tab**
   - View current tokens, total accuracy, and next token milestone
   - Deployment button is **disabled** until you can earn at least 1 new token

2. **Accumulate Accuracy**
   - Train models to increase your total accuracy
   - Higher-tier models (Transformer, LSTM, etc.) grant more accuracy per training

3. **Choose a Strategy**
   - Select Fast (⚡), Standard (🚀), or Complete (🏆)
   - Complete Deployment requires 3 prior deployments

4. **Confirm Deployment**
   - Click "Deploy Model"
   - A confirmation modal shows tokens earned and reset warnings
   - Confirm to proceed

5. **Spend Tokens in Shop**
   - Open Token Shop tab
   - Purchase upgrades to boost your next run
   - Upgrades are permanent and stack multiplicatively

6. **Start Next Run**
   - Resources, buildings, models, and research are reset
   - Your Token Shop upgrades remain active
   - Production multipliers apply immediately

---

## Strategic Tips

### Early Game (0–3 Tokens)

- **First deployment at 250K accuracy** — unlock the Token Shop
- **Buy "Data Pipeline I"** (1 token) for +30% data production
- **Buy "GPU Overclock I"** (1 token) for +30% compute production
- Use **Fast Deployment** to quickly earn your first few tokens

### Mid Game (4–10 Tokens)

- **Upgrade to Tier II** efficiency upgrades (4 tokens each)
- **Buy "Optimised Gradients I–II"** for faster training
- **Switch to Standard Deployment** for balanced token gain
- Save 5 tokens for **"Deployment Bonus"** (25% more tokens forever)

### Late Game (10+ Tokens)

- **Complete all training upgrades** for 3.75× training speed
- **Unlock "Complete Deployment"** (after 3 deployments) for 1.5× tokens
- **Buy "Systems Optimisation"** (5 tokens) for +20% global production
- Focus on **Portfolio Score** by deploying with Complete strategy

### Long-Term Goals

- **49 tokens** — purchase all upgrades
- **500+ Portfolio Score** — achieve "AGI Pioneer" rank
- **Experiment with strategies** — Fast for token farming, Complete for high scores

---

## Technical Implementation

### Architecture

The Deployment System is modular with clear separation of concerns:

```
src/modules/
├── deployment.js               # Core deployment logic & token formula
├── deployment-strategies.js    # Strategy definitions & calculations
├── deployment-upgrades.js      # Token Shop upgrade definitions
├── deployment-portfolio.js     # Portfolio tracking & scoring
└── game-state.js               # Integration with game loop
```

### Key Functions

#### `deployment.js`

```javascript
calculateDeploymentTokens(totalAccuracy)  // Token formula
getNextTokenMilestone(currentTokens)      // Next token requirement
canDeploy(totalAccuracy, currentTokens)   // Deployment availability
getDeploymentInfo(totalAccuracy, tokens)  // UI display data
```

#### `deployment-strategies.js`

```javascript
getAvailableStrategies(deploymentCount)              // Filter by unlock
calculateStrategyTokens(base, strategyId, upgrades) // Apply multipliers
getStrategyBonuses(strategyId)                       // One-run bonuses
```

#### `deployment-upgrades.js`

```javascript
canPurchaseUpgrade(id, purchased, tokens)      // Check purchase validity
purchaseUpgrade(id, purchased, tokens)         // Execute purchase
getUpgradeMultiplier(purchased, effectType)    // Compute multiplier
getUpgradeValue(purchased, effectType)         // Compute flat bonus
```

#### `deployment-portfolio.js`

```javascript
createPortfolioEntry(params)              // Record deployment
calculatePortfolioScore(history)          // Compute score
getPortfolioRank(score)                   // Determine rank
getPortfolioSummary(history, tokens)      // Full stats
```

### Save Data Structure

```javascript
deployment: {
  tokens: 5,                    // Current token balance
  lifetimeTokens: 12,           // All tokens ever earned
  deployments: 8,               // Number of deployments
  upgradesPurchased: {          // One-time purchases
    training_speed_1: true,
    data_pipeline_1: true,
    // ...
  },
  portfolio: [                  // Deployment history
    { deploymentNumber: 1, strategyId: 'fast', tokensEarned: 1, /* ... */ },
    // ...
  ],
  selectedStrategy: 'standard', // Current strategy selection
}
```

### Integration with Production Calculator

Token Shop upgrades are wired into the production calculator:

```javascript
// src/core/production-calculator.js
function getUpgradeMultipliers(gameState) {
  const purchased = gameState.deployment.upgradesPurchased;
  return {
    trainingSpeed:     getUpgradeMultiplier(purchased, 'trainingSpeed'),
    dataProduction:    getUpgradeMultiplier(purchased, 'dataProduction'),
    computeEfficiency: getUpgradeMultiplier(purchased, 'computeEfficiency'),
    researchSpeed:     getUpgradeMultiplier(purchased, 'researchSpeed'),
    globalMultiplier:  getUpgradeMultiplier(purchased, 'globalMultiplier'),
    // ...
  };
}
```

All multipliers are applied **multiplicatively** with achievement bonuses and research effects.

---

## Future Enhancements (Post-v1.0)

Planned improvements to the Deployment System:

- **Transfer Learning** — residual bonuses from previous model types
- **Deployment Milestones** — unlock research categories at 5/10/25/50/100 deployments
- **Token Shop Expansion** — 20+ upgrades with Tier IV–V progression
- **Auto-Deploy** — Token Shop upgrade to automatically deploy when threshold reached
- **Specialisation Paths** — choose Vision/Language/Generalist focus per deployment

---

## Summary

The Deployment System is the core prestige mechanic that enables long-term progression:

1. **Earn tokens** by accumulating total accuracy
2. **Choose a strategy** (Fast/Standard/Complete) for speed vs. reward tradeoffs
3. **Spend tokens** in the Token Shop for permanent upgrades
4. **Build your portfolio** and climb the ranks from Intern to AGI Pioneer

With 15 upgrades, 3 strategies, and a robust portfolio tracking system, the Deployment System provides meaningful choices and replayability beyond a single run.

---

**See also:**
- [ROADMAP.md](../ROADMAP.md) — v1.0.0 Deployment expansion plans
- [README.md](../README.md) — Architecture overview
- [CHANGELOG.md](../CHANGELOG.md) — Recent deployment system updates
