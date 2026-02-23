# 🚀 Deployment System Guide

**Complete guide to the Deployment/Prestige System in AI-Idle**

Version: 0.6.0 | Last Updated: 2026-02-23

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Deployment Strategies](#deployment-strategies)
4. [Token Shop](#token-shop)
5. [Portfolio System](#portfolio-system)
6. [Progression Guide](#progression-guide)
7. [FAQ](#faq)

---

## Overview

The **Deployment System** is AI-Idle's prestige mechanic that allows you to reset your progress in exchange for **Deployment Tokens**. These tokens can be spent on permanent upgrades that make future runs faster and more efficient.

### Key Features

- ✅ **3 Deployment Strategies** with different token multipliers
- ✅ **15 Permanent Upgrades** across 4 categories
- ✅ **Portfolio Tracking** with 6 achievement ranks
- ✅ **Lifetime Stats** that persist across deployments
- ✅ **Smart Reset** - keeps purchased upgrades and lifetime progress

---

## Getting Started

### How to Unlock Deployments

You need **250,000 lifetime accuracy** to unlock your first deployment.

- Train models to generate accuracy
- Accuracy accumulates across all models
- Progress is shown in the Deploy tab

### Token Formula

```javascript
tokens = floor(sqrt(totalAccuracy / 250000))
```

### Token Milestones

| Lifetime Accuracy | Tokens Earned | Notes |
|-------------------|---------------|-------|
| 250K | 1 | First deployment! |
| 1M | 2 | Double your tokens |
| 4M | 4 | Quadruple milestone |
| 10M | 6 | 6 tokens unlocks multiple upgrades |
| 25M | 10 | Double digits! |
| 100M | 20 | Major milestone |
| 250M | 31 | Can afford most shop upgrades |
| 625M | 50 | Full shop unlock possible |

### How to Deploy

1. **Open Deployment Center** - Click 🚀 Deploy Model button in footer
2. **Select Strategy** - Choose Fast, Standard, or Complete
3. **Review Stats** - Check how many tokens you'll earn
4. **Confirm** - Click "Deploy Now" button
5. **New Run Begins** - Start fresh with permanent upgrades!

---

## Deployment Strategies

Choose your strategy based on your playstyle and goals.

### ⚡ Fast Deployment

**Token Multiplier:** 0.75×  
**Unlock:** Always available  
**Best For:** Quick iteration, learning the game

**Pros:**
- Deploy anytime you're ready
- Good for testing upgrade combinations
- Faster progression in early game

**Cons:**
- 25% fewer tokens per run
- No bonus effects

**When to Use:**
- Your first few deployments
- When you want to test something quickly
- When you're stuck and need a reset

---

### 🚀 Standard Deployment

**Token Multiplier:** 1.0×  
**Unlock:** Always available  
**Best For:** Balanced progression

**Pros:**
- Full token value
- No drawbacks
- Reliable default choice

**Cons:**
- No special bonuses

**When to Use:**
- Most of the time
- When you've hit a natural stopping point
- When you want consistent token income

---

### 🏆 Complete Deployment

**Token Multiplier:** 1.5×  
**Unlock:** After 3 deployments  
**Best For:** Long runs, max efficiency

**Pros:**
- 50% more tokens!
- Shows mastery of the game
- Best token-per-hour ratio

**Cons:**
- Must earn unlock first
- Requires commitment to longer runs

**When to Use:**
- After you've learned the optimal strategy
- When you're ready for a long session
- When you want to maximize token gains

---

## Token Shop

15 permanent upgrades across 4 categories. **Total cost: 49 tokens**

### ⚡ Training Upgrades (10 tokens total)

#### Optimised Gradients I
**Cost:** 1 token  
**Effect:** +25% training speed  
**Value:** ⭐⭐⭐⭐⭐ - Essential first purchase!

#### Optimised Gradients II
**Cost:** 3 tokens  
**Effect:** +50% training speed  
**Requires:** Optimised Gradients I  
**Value:** ⭐⭐⭐⭐ - Strong mid-game pickup

#### Optimised Gradients III
**Cost:** 8 tokens  
**Effect:** +100% training speed  
**Requires:** Optimised Gradients II  
**Value:** ⭐⭐⭐⭐⭐ - End-game powerhouse

#### Xavier Initialisation
**Cost:** 2 tokens  
**Effect:** Models start at 10% accuracy  
**Value:** ⭐⭐⭐ - Nice quality of life

---

### 🏭 Efficiency Upgrades (15 tokens total)

#### Data Pipeline I
**Cost:** 1 token  
**Effect:** +30% data production  
**Value:** ⭐⭐⭐⭐ - Great early purchase

#### Data Pipeline II
**Cost:** 4 tokens  
**Effect:** +60% data production  
**Requires:** Data Pipeline I  
**Value:** ⭐⭐⭐⭐ - Solid mid-game

#### GPU Overclock I
**Cost:** 1 token  
**Effect:** +30% compute production  
**Value:** ⭐⭐⭐⭐ - Equally important as data

#### GPU Overclock II
**Cost:** 4 tokens  
**Effect:** +60% compute production  
**Requires:** GPU Overclock I  
**Value:** ⭐⭐⭐⭐ - Keeps pace with data

#### Systems Optimisation
**Cost:** 5 tokens  
**Effect:** +20% all production  
**Value:** ⭐⭐⭐⭐⭐ - Global multiplier is huge!

---

### 🔬 Research Upgrades (11 tokens total)

#### Literature Review I
**Cost:** 2 tokens  
**Effect:** +40% research speed  
**Value:** ⭐⭐⭐⭐ - Unlocks tech faster

#### Literature Review II
**Cost:** 6 tokens  
**Effect:** +80% research speed  
**Requires:** Literature Review I  
**Value:** ⭐⭐⭐ - Expensive but powerful

#### Prior Knowledge
**Cost:** 3 tokens  
**Effect:** Start each run with 1 free research  
**Value:** ⭐⭐⭐⭐⭐ - Amazing value!

---

### 🌟 Prestige Upgrades (13 tokens total)

#### Deployment Bonus
**Cost:** 5 tokens  
**Effect:** +25% tokens earned per deployment  
**Value:** ⭐⭐⭐⭐⭐ - Compounds over time!

#### Institutional Memory
**Cost:** 4 tokens  
**Effect:** Start runs with 2× building production  
**Value:** ⭐⭐⭐⭐ - Great early boost

---

## Portfolio System

Track your deployment history and earn ranks!

### Portfolio Score Formula

```javascript
score = (deployments × 10) +
        (tokensEarned × 5) +
        (modelsTrained × 2) +
        (researchCompleted × 3) +
        (completeDeployments × 20)
```

### Ranks

| Rank | Score Required | Icon | Description |
|------|---------------|------|-------------|
| **Intern** | 0-9 | 🎓 | Just starting out |
| **Junior Researcher** | 10-39 | 📚 | Learning the ropes |
| **ML Engineer** | 40-99 | 💻 | Building expertise |
| **Senior Researcher** | 100-249 | 🔬 | Mastering the craft |
| **ML Architect** | 250-499 | 🏆 | Top tier performance |
| **AGI Pioneer** | 500+ | 🌟 | Elite status |

### Portfolio Stats

- **Total Deployments** - Number of times you've deployed
- **Lifetime Tokens** - All tokens earned (including spent)
- **Total Models** - All models trained across all runs
- **Total Research** - All research completed across all runs
- **Best Token Run** - Most tokens earned in a single deployment
- **Fastest Run** - Shortest time to deployment

---

## Progression Guide

### Early Game (0-3 Deployments)

**Goals:**
- Reach 250K accuracy for first deployment
- Learn the core game mechanics
- Experiment with different strategies

**Strategy:**
1. Use **Fast Deployment** for your first 1-2 runs
2. Get familiar with building priorities
3. Complete easy research first

**First Token Purchases:**
1. **Optimised Gradients I** (1 token) - Essential!
2. **Data Pipeline I** (1 token) - Resources matter
3. **GPU Overclock I** (1 token) - Balance is key

---

### Mid Game (4-10 Deployments)

**Goals:**
- Unlock Complete Deployment strategy
- Build up token shop upgrades
- Optimize your run efficiency

**Strategy:**
1. Switch to **Standard Deployment**
2. Unlock **Complete Deployment** (after 3 deployments)
3. Start planning upgrade paths

**Recommended Upgrade Path:**
1. Training speed upgrades (make runs faster)
2. Resource production upgrades (more buildings)
3. Research upgrades (unlock tech faster)

---

### Late Game (10+ Deployments)

**Goals:**
- Complete the token shop
- Maximize token-per-hour
- Reach high portfolio ranks

**Strategy:**
1. Always use **Complete Deployment** (1.5× tokens)
2. Focus on longest efficient runs
3. Optimize every aspect of gameplay

**Final Upgrades:**
1. **Systems Optimisation** - Global multiplier
2. **Deployment Bonus** - More tokens per run
3. **Optimised Gradients III** - Max training speed

---

## FAQ

### Q: When should I do my first deployment?
**A:** As soon as you reach 250K lifetime accuracy! Don't wait too long - the permanent upgrades will help your next run significantly.

### Q: Do I lose my achievements when I deploy?
**A:** No! Achievements and their bonuses are permanent and persist across all deployments.

### Q: What happens to my research when I deploy?
**A:** Research is reset, but you can buy "Prior Knowledge" upgrade to start each run with free research unlocked.

### Q: Which strategy should I use?
**A:** 
- **Fast** - First 1-2 deployments while learning
- **Standard** - Most deployments until you master the game
- **Complete** - Once you've unlocked it and can commit to longer runs

### Q: What's the optimal upgrade order?
**A:** Prioritize in this order:
1. Training speed (faster runs)
2. Resource production (more buildings)
3. Research speed (faster tech)
4. Prestige bonuses (long-term gains)

### Q: How long does it take to complete the shop?
**A:** With optimal play: 8-12 deployments. With casual play: 15-20 deployments.

### Q: Can I get all 49 tokens in one run?
**A:** Technically yes (need 625M accuracy), but it's much more efficient to deploy multiple times and use upgrades to speed up future runs.

### Q: Does the Complete Deployment strategy give other bonuses?
**A:** Currently only the 1.5× token multiplier. The 10% production bonus mentioned in early documentation was removed during balancing.

### Q: What's the highest portfolio rank?
**A:** AGI Pioneer (500+ score). Top players will reach 1000+ score with many complete deployments!

---

## Tips & Tricks

✅ **Rush first deployment** - Get 250K ASAP for your first token  
✅ **Balance resources** - Don't neglect data or compute  
✅ **Research early** - Tech unlocks compound over the run  
✅ **Track milestones** - Know when your next token threshold is  
✅ **Use Complete** - 1.5× tokens is worth the extra time  
✅ **Plan purchases** - Don't randomly buy upgrades  
✅ **Track portfolio** - Aim for score milestones  
✅ **Be patient** - The shop takes multiple runs to complete  

---

## Conclusion

The Deployment System adds a powerful progression layer to AI-Idle. Each deployment makes you permanently stronger, creating a satisfying feedback loop of improvement.

**Remember:**
- Deploy when you hit natural stopping points
- Invest tokens wisely
- Use Complete Deployment once unlocked
- Track your portfolio progress
- Have fun optimizing!

---

**Happy Deploying!** 🚀

*For technical details and implementation, see [DEPLOYMENT_SYSTEM.md](DEPLOYMENT_SYSTEM.md)*
