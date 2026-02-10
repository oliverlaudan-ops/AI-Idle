# 🗺️ AI-Idle Development Roadmap

**Last Updated:** February 10, 2026  
**Current Version:** 0.2.1  
**Next Release:** 0.3.0 (Polish & Experience)

---

## 📊 Release Timeline

```
v0.1.0 ✅ (Jan 30, 2026) - MVP Release
v0.2.0 ✅ (Feb 9, 2026)  - Balance & Animations
v0.2.1 ✅ (Feb 9, 2026)  - Hotfix: Training Animations
│
├─ v0.3.0 🔜 (Target: Early March 2026) - Polish & Experience
│
└─ v1.0.0 🎯 (Target: Late March 2026) - Complete Release
```

---

## 🎯 Version 0.3.0 - "Polish & Experience"

**Release Target:** Early March 2026  
**Development Time:** 1-2 weeks  
**Focus:** Enhance player experience without major new systems

### Core Philosophy
- Make the game more intuitive for new players
- Add quality-of-life features for experienced players
- Improve visual feedback and polish
- Enhance engagement without adding complexity

---

## ✨ Version 0.3.0 Features

### 1. 🔥 **Manual Collect Combo System** (High Priority)

**Problem:** Manual data collection is boring and unrewarding  
**Solution:** Engaging combo mechanic that rewards active clicking

#### Mechanics
- **Combo Multipliers:**
  - Click 1: +1 Data (x1)
  - Click 2 (within 5s): +2 Data (x2)
  - Click 3 (within 5s): +4 Data (x4)
  - Click 4+ (within 5s): +8 Data (x8 MAX)
- **Combo Timer:** 5-second window to maintain combo
- **Combo Decay:** Resets to x1 after timer expires
- **Max Combo:** x8 (upgradeable via research later)

#### Visual Feedback
- **Combo Counter:** Large animated number above button
- **Multiplier Badge:** "x2", "x4", "x8" with color progression
  - x1: Gray (default)
  - x2: Blue (good)
  - x4: Purple (great)
  - x8: Gold (excellent)
- **Timer Bar:** Visual countdown around button
  - Green → Yellow → Red as time runs out
- **Particle Effects:** Burst animation on combo level-up
- **Screen Shake:** Subtle shake at x4 and x8
- **Combo Break:** Red flash when combo expires

#### Sound Design (Optional)
- Click sound pitch increases with combo
- Special sound on combo level-up
- Satisfying "break" sound on combo loss

#### Achievements
- **Combo Starter:** Reach x2 combo (Reward: +1 base click value)
- **Combo Expert:** Reach x4 combo 10 times (Reward: +5% manual collection)
- **Combo Master:** Reach x8 combo 100 times (Reward: +10% manual collection)
- **Speed Clicker:** Maintain x8 combo for 60 seconds (Reward: +1 second combo timer)

#### Technical Implementation
- New `ComboSystem` class in `src/modules/combo-system.js`
- Combo state tracked in game state
- Timer using `requestAnimationFrame` for smooth countdown
- CSS animations for visual effects

---

### 2. 🎓 **Tutorial System** (High Priority)

**Problem:** New players don't know where to start  
**Solution:** Interactive step-by-step tutorial

#### Tutorial Flow (7 Steps)

**Step 1: Welcome**
- Modal overlay with game introduction
- "Train AI models and build your ML empire!"
- "Start Tutorial" / "Skip" buttons

**Step 2: Manual Collection**
- Highlight "Collect Data" button
- "Click here to gather your first training data!"
- Wait for first click
- Show combo system explanation

**Step 3: Resources**
- Highlight stats bar
- "These are your resources. Data is used to build and train!"
- Explain each resource icon

**Step 4: First Building**
- Highlight "CPU Core" building
- "Build your first infrastructure to generate data automatically!"
- Wait for first building purchase
- Show passive income increase

**Step 5: First Model Training**
- Unlock "Digit Recognition" if not unlocked
- Highlight training tab
- "Now train your first neural network!"
- Wait for training start
- Show training progress visualization

**Step 6: Research**
- Highlight research tab
- "Unlock new technologies to improve your AI!"
- Show first research item

**Step 7: Achievements & Goals**
- Highlight achievements tab
- "Track your progress and earn permanent bonuses!"
- Show next achievement goals
- Tutorial complete! 🎉

#### Features
- **Spotlight System:** Dim rest of screen, highlight current element
- **Step Indicator:** "Step 2/7" progress bar
- **Skip Anytime:** "Skip Tutorial" button always visible
- **Persist State:** Remember tutorial progress in save file
- **Replay Option:** "Restart Tutorial" in settings
- **Tooltips:** Contextual help after tutorial completion

#### Technical Implementation
- New `TutorialSystem` class in `src/ui/tutorial.js`
- Modal overlay with z-index management
- Event listeners for tutorial progression
- LocalStorage flag for completion status

---

### 3. ✨ **Quality of Life Improvements** (High Priority)

#### A. Auto-Training Queue
**Feature:** Automatically train next model when current training completes

- **Queue UI:**
  - "Add to Queue" button on each model card
  - Queue display showing next 3 models
  - Drag-to-reorder queue (optional)
  - "Clear Queue" button
- **Smart Queue:**
  - Only queues models with sufficient resources
  - Skips models if resources unavailable
  - Shows estimated queue completion time
- **Settings:**
  - Toggle "Auto-queue enabled"
  - "Repeat last model" option
  - Queue notifications

#### B. Bulk Building Purchase
**Feature:** Buy multiple buildings at once

- **Buy Amounts:**
  - Buy x1 (default)
  - Buy x10 (normal click)
  - Buy x100 (Shift + click)
  - Buy Max (Ctrl + click)
- **Visual Feedback:**
  - Show total cost for bulk purchase
  - "Affordable" amount highlighted in green
  - "Max: 47" indicator
- **Keyboard Shortcuts:**
  - 1: Buy x1
  - Shift: Hold for x10
  - Ctrl: Hold for x100
  - Ctrl+Shift: Buy max affordable

#### C. Resource Notifications
**Feature:** Smart notifications for important events

- **Unlock Notifications:**
  - "New Building Unlocked: GPU Cluster! 🖥️"
  - "New Model Available: Image Classification! 🖼️"
  - "New Research: Adam Optimizer! 🔬"
- **Milestone Notifications:**
  - "1,000 data collected! 🎉"
  - "100 TFLOPS reached! ⚡"
  - "First achievement unlocked! 🏆"
- **Settings:**
  - Toggle notification types
  - Notification duration
  - Sound on/off

#### D. Progress Indicators
**Feature:** Show progress to next unlocks and goals

- **"Next Unlock" Section:**
  - Shows closest locked building/model/research
  - Progress bar: "67% to GPU Cluster"
  - Estimated time to unlock
- **Achievement Progress:**
  - "Train 7/10 models for Generalist AI"
  - Progress bars on locked achievements
  - "Closest Achievement" widget
- **Resource Projections:**
  - "At current rate: X hours to next unlock"
  - Hourly production breakdown

---

### 4. 🎨 **Visual Polish** (Medium Priority)

#### A. Enhanced Particle Effects

**Achievement Unlocks:**
- Golden particle burst from center
- Achievement icon floats up with glow
- Screen flash (subtle)
- Confetti rain for major achievements

**Building Purchase:**
- Sparkle effect on building card
- Resource icons fly from stats bar to building
- Building "construction" animation
- Glow pulse on newly built items

**Resource Milestones:**
- Celebration at 1K, 10K, 100K, 1M, etc.
- Unique effects per resource type
  - Data: Blue sparkles
  - Compute: Yellow lightning
  - Accuracy: Green stars
  - Research: Purple wisps

**Training Complete:**
- Enhanced particle celebration (already exists)
- Model card glows on completion
- Accuracy gain numbers float up
- Victory banner animation

#### B. Sound System (Optional)

**Core Sounds:**
- Click/Button press: Satisfying "thunk"
- Building purchase: Cash register "cha-ching"
- Training start: Power-up "whoosh"
- Training complete: Victory "jingle"
- Achievement unlock: Triumphant "fanfare"
- Resource milestone: Celebratory "ding"
- Combo level-up: Rising pitch "bloop"
- UI navigation: Soft "click"

**Features:**
- **Volume Control:** Master slider in settings
- **Mute Toggle:** Hotkey (M) and button
- **Sound Categories:**
  - UI Sounds (clicks, navigation)
  - Game Events (training, building)
  - Achievements (unlocks, milestones)
- **Persist Settings:** Save sound preferences

**Implementation:**
- Web Audio API for precise timing
- Audio sprite for performance
- Fallback for browsers without audio support
- Respectful defaults (off by default, easy to enable)

#### C. Animation Enhancements

**Smooth Transitions:**
- Tab switching with slide animation
- Cards fade in when unlocked
- Counters animate when values change (odometer effect)
- Progress bars fill smoothly

**Hover Effects:**
- Buildings scale slightly on hover
- Cards lift with shadow on hover
- Buttons glow on hover
- Tooltips slide in smoothly

**Loading States:**
- Skeleton screens for initial load
- Spinner for save/load operations
- Progress indicator for export

---

### 5. 📊 **Statistics Dashboard Expansion** (Medium Priority)

#### New Stats Sections

**Production Breakdown:**
- Pie chart of resource sources
- "Data from Buildings: 85%"
- "Data from Manual: 15%"
- "Top Producer: GPU Cluster (45%)"

**Historical Accuracy:**
- Line graph of accuracy over time
- Session markers
- Deployment points marked
- Best/worst sessions highlighted

**Resources Per Hour:**
- Current production rates
- Projected gains in 1h, 8h, 24h
- Comparison to previous sessions
- "You're earning 23% more than average!"

**Most Trained Models:**
- Leaderboard of most-trained models
- "Digit Recognition: 47 times"
- Total time spent training each
- Favorite model badge

**Training History:**
- Timeline of all training sessions
- Accuracy gained per model
- Average training time
- Success rate

#### Session Stats

**This Session:**
- Time played
- Resources gained
- Buildings built
- Models trained
- Achievements unlocked

**All Time vs Session:**
- Side-by-side comparison
- Personal records highlighted
- "New record: Most data in one session!"

**Best Session:**
- Show stats from best historical session
- Date and time
- What made it special
- Try to beat it!

---

### 6. ♿ **Accessibility Features** (Medium Priority)

#### A. Settings Panel

**Animation Settings:**
- **Animation Speed:** Slider (0.5x - 2.0x)
- **Reduce Motion:** Toggle for users with motion sensitivity
- **Particle Effects:** Toggle on/off
- **Screen Shake:** Toggle on/off

**Display Settings:**
- **Font Size:** Small / Medium / Large
- **High Contrast Mode:** Increase contrast for readability
- **Color Blind Mode:** Alternative color palettes
  - Deuteranopia (red-green)
  - Protanopia (red-green)
  - Tritanopia (blue-yellow)
- **Dark/Light Theme:** Toggle (dark is default)

**Gameplay Settings:**
- **Auto-Save Interval:** 10s / 30s / 60s / Manual only
- **Offline Progress:** Toggle on/off
- **Confirmations:** Require confirm for reset, deploy, etc.
- **Hotkeys Enabled:** Toggle keyboard shortcuts

#### B. Keyboard Navigation

**Tab Shortcuts:**
- `1`: Infrastructure
- `2`: Training
- `3`: Research
- `4`: Deployment
- `5`: Achievements
- `6`: Statistics

**Action Shortcuts:**
- `Space`: Collect Data (manual)
- `S`: Save Game
- `E`: Export Save
- `M`: Mute/Unmute
- `?`: Show help/shortcuts

**Modifier Keys:**
- `Shift + Click`: Buy x10
- `Ctrl + Click`: Buy x100
- `Ctrl + Shift + Click`: Buy Max

**Focus Management:**
- Tab through interactive elements
- Visual focus indicators
- Escape to close modals

---

## 📋 Version 0.3.0 Implementation Plan

### Phase 1: Foundation (Days 1-3)
- [ ] Create `ROADMAP.md` ✅
- [ ] Set up feature branches
- [ ] Implement `ComboSystem` class
- [ ] Add tutorial system framework
- [ ] Create settings panel UI

### Phase 2: Core Features (Days 4-7)
- [ ] Complete combo system with visuals
- [ ] Implement all 7 tutorial steps
- [ ] Add auto-training queue
- [ ] Bulk building purchase
- [ ] Resource notifications

### Phase 3: Polish (Days 8-10)
- [ ] Enhanced particle effects
- [ ] Sound system (if included)
- [ ] Animation improvements
- [ ] Statistics expansion
- [ ] Keyboard shortcuts

### Phase 4: Testing & Release (Days 11-14)
- [ ] Bug testing
- [ ] Balance adjustments
- [ ] Documentation updates
- [ ] Create release notes
- [ ] Deploy v0.3.0

---

## 🚀 Version 1.0.0 - "Complete Experience"

**Release Target:** Late March 2026  
**Development Time:** 3-4 weeks  
**Focus:** Complete game with all major systems

---

## 🎯 Version 1.0.0 Features

### 1. 🔄 **Expanded Prestige/Deployment System** (Critical)

#### Current State
- Basic deployment system exists
- Simple token shop with few upgrades
- Linear progression

#### Expansion Goals

**A. Deployment Strategies**

Three deployment options with different trade-offs:

**Fast Deploy** (Quick Return)
- Keep 25% of current resources
- Gain 0.8x tokens (20% penalty)
- 50% of achievements remain unlocked
- Best for: Frequent, smaller runs

**Standard Deploy** (Balanced)
- Reset all resources to 0
- Gain 1.0x tokens (normal rate)
- All achievements remain unlocked
- Best for: Normal progression

**Complete Deploy** (Maximum Tokens)
- Reset everything (resources + achievements)
- Gain 1.5x tokens (50% bonus)
- Start completely fresh
- Best for: Major prestige runs

**B. Token Shop Expansion**

**Current:** ~5 basic upgrades  
**Target:** 20+ diverse upgrades

**Production Category** (Permanent multipliers)
- Data Generation +10% (1 token) [repeatable]
- Compute Boost +15% (2 tokens) [repeatable]
- Accuracy Multiplier +20% (3 tokens) [repeatable]
- Research Speed +25% (2 tokens) [max 5 levels]
- All Resources +5% (5 tokens) [repeatable]

**Training Category** (Training improvements)
- Training Speed +20% (2 tokens) [repeatable]
- Start with Digit Recognition unlocked (1 token)
- Unlock all Tier 1 models at start (3 tokens)
- Training Auto-Complete (5 tokens)
- Instant Training (1 per day) (10 tokens)

**Research Category** (Research bonuses)
- Start with SGD unlocked (1 token)
- Research cost -10% (2 tokens) [max 5 levels]
- Unlock Research tab at start (1 token)
- Research auto-buy (5 tokens)

**Special Category** (Unique bonuses)
- Start with 100 data (1 token)
- Start with 10 compute (2 tokens)
- Offline progress 2x speed (3 tokens)
- Achievement progress carries over (5 tokens)
- Unlock "Prestige Buildings" (10 tokens)
- Unlock "Meta-Research" (15 tokens)

**Meta-Progression Category** (Long-term)
- Deployment token gain +10% (5 tokens) [repeatable]
- Unlock deployment milestones (10 tokens)
- Unlock Model Portfolio system (20 tokens)
- Unlock Transfer Learning (25 tokens)
- Unlock AutoML (50 tokens)

**C. Deployment Milestones**

Special rewards at deployment count thresholds:

**5 Deployments:** "Experienced Deployer"
- Unlock Fast Deploy option
- +10% base deployment token gain
- New token shop category unlocked

**10 Deployments:** "Veteran Deployer"
- Start each run with 1 free building
- +25% offline progress speed
- Unlock Prestige Buildings

**25 Deployments:** "Master Deployer"
- Unlock Complete Deploy option
- Start with all Tier 1 research unlocked
- +50% achievement bonus effects

**50 Deployments:** "Deployment Legend"
- Unlock Transfer Learning system
- Start with 1000 data, 100 compute
- All deployments gain 2x tokens

**100 Deployments:** "Infinite Deployer"
- Unlock AutoML system
- All resources +100% permanently
- Access to secret "Singularity" ending

**D. Model Portfolio System**

*Unlocked after 10 deployments via token shop*

**Concept:** Deployed models passively train in background

**Mechanics:**
- Each deployed model adds to portfolio
- Portfolio models train at 1% speed
- Gain passive accuracy and research points
- Portfolio grows with each deployment
- Special bonuses for complete model sets

**Portfolio Bonuses:**
- 5 Models: +5% all resources
- 10 Models: +10% training speed
- 15 Models: Unlock portfolio specialization
- All Models: +50% everything, special achievement

**E. Transfer Learning**

*Unlocked at 50 deployments*

**Concept:** Previous training improves future training

**Mechanics:**
- Each model training adds to "experience pool"
- Experience reduces training time for future models
- Specialization bonuses for model families
- Cross-model synergies

**Experience Bonuses:**
- Same model: -10% time (stacking)
- Same category: -5% time
- Related models: Special synergies
  - Image Classification ↔ Object Detection
  - NLP ↔ LLM
  - etc.

---

### 2. 🔬 **Expanded Research Tree** (High Priority)

#### Current State
- 17 research items across 4 categories
- Linear progression
- Some items feel mandatory

#### Expansion Goals
- **Target:** 40+ research items
- **New Categories:** 4 additional branches
- **Specialization Paths:** Choose your focus
- **Late-Game Research:** Post-deployment content

#### New Categories

**E. Hardware Innovations** (Tier 3+ Focus)

*Unlock requirement: Own 10+ buildings*

- **Neuromorphic Chips** (Cost: 5K research)
  - Buildings use 20% less compute
  - Unlock specialized hardware buildings
- **Photonic Computing** (Cost: 50K research)
  - +25% all compute generation
  - Unlock Photonic Processor building
- **Biological Processors** (Cost: 500K research)
  - Extremely efficient, low cost buildings
  - Unlock DNA Compute building
- **Quantum Neural Networks** (Cost: 5M research)
  - Quantum processors 3x more powerful
  - Unlock Quantum AI models

**F. Data Engineering** (Early-Mid Game Focus)

*Unlock requirement: Collect 10K data*

- **Synthetic Data Generation** (Cost: 1K research)
  - Buildings generate 15% more data
  - Unlock Synthetic Data Generator building
- **Data Augmentation** (Cost: 10K research)
  - Training costs 10% less data
  - Data multipliers apply to training
- **Active Learning** (Cost: 100K research)
  - Training generates research points
  - Unlock Active Learning models
- **Few-Shot Learning** (Cost: 1M research)
  - Drastically reduce training data requirements
  - Unlock Few-Shot models

**G. Meta-Learning** (Late-Game Focus)

*Unlock requirement: Deploy once*

- **Learning to Learn** (Cost: 10K research, 5 tokens)
  - Each training improves all future training
  - +1% training speed per model trained (stacking)
- **Zero-Shot Transfer** (Cost: 100K research, 10 tokens)
  - New models start at 10% accuracy
  - Unlock Zero-Shot models
- **AutoML** (Cost: 1M research, 25 tokens)
  - Models automatically optimize themselves
  - Training speed +100%, costs -50%
- **Neural Architecture Search** (Cost: 10M research, 50 tokens)
  - Unlock custom model creation
  - Design your own models with unique bonuses

**H. Safety & Ethics** (Optional Specialization)

*Unlock requirement: Reach 1000 accuracy*

- **Interpretability** (Cost: 5K research)
  - See detailed model stats and breakdowns
  - +10% research generation
- **Adversarial Robustness** (Cost: 50K research)
  - Models train more reliably
  - Training time variance -50%
- **AI Alignment** (Cost: 500K research)
  - Accuracy gains are more consistent
  - Unlock Aligned AI models
- **Constitutional AI** (Cost: 5M research)
  - Special bonus: Unlock "Safe AGI" path
  - All resources +20%

#### Research Paths & Specializations

**Vision Specialist Path:**
- Focus on CNN → ResNet → Vision Transformer
- Special models: Video Understanding, 3D Vision
- Bonus: +50% accuracy for vision models

**Language Specialist Path:**
- Focus on RNN → Transformer → GPT
- Special models: Code Generation, Translation
- Bonus: +50% accuracy for NLP models

**Generalist Path:**
- Balanced research across all categories
- Special models: Foundation Models, Multimodal
- Bonus: +25% accuracy for all models

**Hardware Path:**
- Focus on efficiency and scale
- Special buildings: Custom ASICs, Neuromorphic
- Bonus: Buildings cost -30%

---

### 3. 🤖 **New Model Categories** (High Priority)

#### Current Models (8 total)
- Classification: Digit Recognition
- Vision: Image Classification, Object Detection
- NLP: NLP Model, LLM
- Advanced: RL Agent, Multimodal AI

#### New Models (Target: 15-20 total)

**Generative Models Category** (New)

*Unlock requirement: 5K accuracy*

**Text-to-Image Generator** (Stable Diffusion style)
- Cost: 1M data, 5K compute
- Training time: 3 minutes
- Reward: +500 accuracy/s
- Special: Generates "synthetic data" resource

**Text Generator** (GPT style)
- Cost: 5M data, 25K compute
- Training time: 5 minutes
- Reward: +2500 accuracy/s
- Special: Writes research papers (bonus research points)

**Music Generator**
- Cost: 500K data, 2K compute
- Training time: 2 minutes
- Reward: +250 accuracy/s
- Special: Unique audio feedback on training

**Video Generator**
- Cost: 50M data, 100K compute
- Training time: 10 minutes
- Reward: +10000 accuracy/s
- Special: Most expensive generative model

**Specialized Tasks Category** (New)

*Unlock requirement: Research "Domain Specialization"*

**Code Generation Model**
- Cost: 10M data, 50K compute
- Training time: 5 minutes
- Reward: +5000 accuracy/s, +100 research/s
- Special: Occasionally "optimizes game code" for temp bonuses

**Protein Folding Model** (AlphaFold style)
- Cost: 25M data, 100K compute
- Training time: 8 minutes
- Reward: +12500 accuracy/s
- Special: Unlock bio-computing research

**Drug Discovery Model**
- Cost: 100M data, 500K compute
- Training time: 12 minutes
- Reward: +50000 accuracy/s
- Special: Very high value, medical theme

**Climate Modeling AI**
- Cost: 500M data, 2.5M compute
- Training time: 15 minutes
- Reward: +250000 accuracy/s
- Special: Highest-tier specialized model

**Frontier Models Category** (New)

*Unlock requirement: 1M accuracy, deployed 5+ times*

**Multimodal Foundation Model**
- Cost: 1B data, 10M compute
- Training time: 20 minutes
- Reward: +1M accuracy/s
- Special: Understands text, images, audio, video

**Embodied AI** (Robotics)
- Cost: 5B data, 50M compute
- Training time: 30 minutes
- Reward: +5M accuracy/s
- Special: Unlock "Robotics Lab" building

**AGI Prototype**
- Cost: 100B data, 1B compute, 1M research
- Training time: 60 minutes
- Reward: +100M accuracy/s
- Special: Unlock secret ending, "Singularity Achievement"
- Note: Training this triggers prestige automatically

---

### 4. 🏛️ **Model Zoo & Collection System** (High Priority)

#### Model Gallery

**Deployed Models Display:**
- Visual gallery of all trained models
- Cards show model icon, name, stats
- Hover for detailed information
- Click to see full "Model Card"

**Model Stats Tracked:**
- Times trained
- Total training time
- Accuracy contributed (total)
- Best single training run
- First trained date
- Last trained date
- Average training speed

**Favorite System:**
- Mark up to 5 models as "favorites"
- Favorites appear in quick-train menu
- Special bonus for training favorites

#### Model Cards

**Detailed Model Information:**

*Example: Digit Recognition Model Card*

```
🧮 Digit Recognition
━━━━━━━━━━━━━━━━━━━━━━
Category: Classification
First Trained: Jan 30, 2026

STATISTICS
├─ Times Trained: 47
├─ Total Time: 2h 15m
├─ Total Accuracy: 11.75
└─ Best Run: 0.28 accuracy

TRAINING HISTORY
[Graph showing accuracy over time]

DEPLOYMENT IMPACT
├─ Active in Portfolio: Yes
├─ Portfolio Contribution: +0.5 accuracy/s
└─ Transfer Learning: Lvl 3 (+15% speed)

ACHIEVEMENTS
✅ Trained 10 times
✅ Reached max training speed
❌ Complete 100 training runs
```

**Training History Graph:**
- Line chart of accuracy over time
- Marks for each training session
- Deployment points highlighted
- Best/worst runs highlighted

**Deployment Impact:**
- Shows model's contribution to portfolio
- Transfer learning level and bonuses
- Synergies with other models

#### Collection Bonuses

**Complete Sets:**

**Classification Master**
- Train all classification models
- Reward: +20% accuracy for classification tasks

**Vision Expert**
- Train all vision models
- Reward: +20% accuracy for vision tasks

**NLP Specialist**
- Train all NLP models
- Reward: +20% accuracy for NLP tasks

**Generative Guru**
- Train all generative models
- Reward: Unlock "Super Generative Model"

**Master Collector**
- Train every single model at least once
- Reward: +50% all production, special achievement

**Achievements:**
- **Collector**: Train 5 unique models
- **Completionist**: Train 10 unique models
- **Master Collector**: Train all models
- **Specialist**: Train one model 100 times
- **Diversity Champion**: Train 20 different models in one run

---

### 5. 🎪 **Events & Challenges** (Medium Priority)

#### Weekly Challenges

*Reset every Monday at midnight*

**Example Challenges:**

**Week 1: Speed Run**
- "Train 5 models in under 30 minutes"
- Reward: 5 deployment tokens, +10% training speed for 24h

**Week 2: Efficiency Expert**
- "Reach 100 accuracy without building any Tier 3 buildings"
- Reward: 3 tokens, unlock "Efficient AI" achievement

**Week 3: Research Focus**
- "Complete 10 research items in one run"
- Reward: 2 tokens, permanent +5% research generation

**Week 4: Building Spree**
- "Own 50 total buildings"
- Reward: 4 tokens, buildings cost -5% for 48h

**Challenge UI:**
- Challenge panel on main screen
- Progress bar showing completion
- Time remaining countdown
- "Claim Reward" button on completion
- Challenge history and stats

#### Random Events

*Low chance to trigger every 10-30 minutes of active play*

**Positive Events:**

**Hardware Sale** (Duration: 5 minutes)
- "A vendor is selling hardware at a discount!"
- Buildings cost 25% less
- Notification: "Hurry, sale ends soon!"

**Data Leak** (Duration: 10 minutes)
- "A massive dataset has been leaked online!"
- Data generation +100%
- Free data collected every second

**Research Breakthrough** (Instant)
- "Scientists made an unexpected discovery!"
- One random locked research unlocked for free
- If all researched: 50% research cost refund

**Bonus Compute** (Duration: 15 minutes)
- "Cloud provider gave you free compute credits!"
- Compute generation +50%
- Training speed +25%

**Negative Events:**

**Bug in Production** (Duration: 5 minutes)
- "A critical bug is draining resources!"
- All resources drain 10% faster
- Click "Debug" button 10 times to fix early
- Reward for fixing: +50% research for 10 min

**Power Outage** (Duration: 2 minutes)
- "Power outage in the data center!"
- All buildings stop producing
- Training paused
- No permanent loss

**Security Audit** (Instant)
- "Regulators are auditing your AI systems!"
- Pay 10% of current resources OR
- Stop all production for 5 minutes
- Choice matters!

**Event Settings:**
- Toggle random events on/off
- Event frequency slider
- Notification preferences

---

### 6. 📱 **Mobile Optimization** (High Priority)

#### Responsive Design Improvements

**Current Issues:**
- Small buttons hard to tap
- Stats bar cramped on small screens
- Tabs hard to navigate
- Cards too wide

**Solutions:**

**Touch-Optimized Buttons:**
- Minimum 44x44px touch targets
- Increased padding and margins
- Larger fonts on mobile
- Swipe gestures for tabs

**Collapsible Sections:**
- Accordion-style building categories
- "Show More" for long lists
- Minimize inactive tabs
- Compact mode toggle

**Portrait/Landscape Modes:**
- Portrait: Vertical scrolling layout
- Landscape: Side-by-side panels
- Auto-adjust on orientation change
- Optimized for both

**Mobile-Specific Features:**
- Pull-to-refresh
- Haptic feedback on actions (vibration)
- Double-tap to zoom cards
- Long-press for bulk actions

#### Progressive Web App (PWA)

**Installation:**
- "Add to Home Screen" prompt
- Custom app icon and splash screen
- Standalone mode (no browser UI)
- Looks like native app

**Offline Capability:**
- Service worker for offline play
- Cache game assets
- Sync save data when online
- "Offline Mode" indicator

**Push Notifications (Optional):**
- Training complete notification
- Achievement unlocked
- Challenge available
- Event started
- Settings: Enable/disable per type

**PWA Manifest:**
```json
{
  "name": "AI-Idle",
  "short_name": "AI-Idle",
  "description": "Incremental ML Game",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f1e",
  "theme_color": "#00d4ff",
  "icons": [...]
}
```

---

### 7. 🎮 **Mini-Games** (Low Priority / Post-1.0)

*Optional content for variety and engagement*

#### A. GAN Training Mini-Game

**Concept:** Rhythm game representing Generator vs Discriminator

**Gameplay:**
- Two bars moving towards center
- Press spacebar when bars align
- Perfect timing: Generator improves
- Miss: Discriminator wins
- Goal: 10 perfect hits to complete

**Rewards:**
- Completion: 2x data for 10 minutes
- Perfect run: 5x data for 5 minutes
- Unlock "GAN Master" achievement

**Frequency:**
- Available once every hour
- Optional, skip if not interested

#### B. Hyperparameter Tuning

**Concept:** Slider puzzle to find optimal settings

**Gameplay:**
- 5 sliders (learning rate, batch size, etc.)
- Adjust to maximize "validation accuracy"
- Real-time feedback graph
- Goal: Reach 95% accuracy

**Rewards:**
- Completion: +10% training speed (permanent)
- Perfect tuning: +25% training speed
- Unlock "Tuning Expert" achievement

**Frequency:**
- One-time per model
- Unlocks after training model 5 times

#### C. Data Labeling Game

**Concept:** Quick image classification for manual collect boost

**Gameplay:**
- Image appears
- Choose correct label from 4 options
- 10 images in sequence
- Faster = better reward

**Rewards:**
- 10/10 correct: +100 data
- Under 30 seconds: +200 data
- Combo with manual collect

**Frequency:**
- Optional during manual collection
- Toggle in settings

---

## 📋 Version 1.0.0 Implementation Plan

### Phase 1: Prestige Expansion (Week 1)
- [ ] Implement deployment strategies
- [ ] Expand token shop to 20+ items
- [ ] Add deployment milestones
- [ ] Create Model Portfolio system
- [ ] Implement Transfer Learning

### Phase 2: Content Expansion (Week 2)
- [ ] Add 10+ new models
- [ ] Expand research tree to 40+ items
- [ ] Implement research specializations
- [ ] Add new model categories
- [ ] Create model card system

### Phase 3: Collections & Events (Week 3)
- [ ] Build Model Zoo UI
- [ ] Add collection bonuses
- [ ] Implement weekly challenges
- [ ] Create random events system
- [ ] Add event notifications

### Phase 4: Mobile & Polish (Week 4)
- [ ] Mobile responsive redesign
- [ ] PWA implementation
- [ ] Touch optimizations
- [ ] Final balance pass
- [ ] Documentation and release

---

## 🎯 Post-1.0 Roadmap

### Version 1.1 - Community Features
- Leaderboards (global and friends)
- Daily challenges
- Community events
- Share achievements

### Version 1.2 - Advanced Features
- Mini-games integration
- Custom model designer
- Mod support
- Theme customization

### Version 1.3 - Multiplayer (Maybe)
- Co-op research
- Competitive training
- Trade resources
- Guild system

---

## 📊 Feature Priority Matrix

### Critical (Must-Have for v1.0)
1. ✅ Expanded Prestige System
2. ✅ Model Zoo & Collections
3. ✅ Mobile Optimization
4. ✅ New Models (10+)
5. ✅ Expanded Research (40+)

### High Priority (Should-Have)
6. ✅ Tutorial System (v0.3)
7. ✅ Combo System (v0.3)
8. ✅ Auto-Training Queue (v0.3)
9. ✅ Statistics Dashboard (v0.3)
10. ✅ Events & Challenges

### Medium Priority (Nice-to-Have)
11. ✅ Sound System (v0.3)
12. ✅ Visual Polish (v0.3)
13. ✅ Accessibility Features (v0.3)
14. ✅ PWA Features
15. ✅ Challenge System

### Low Priority (Post-1.0)
16. ⏸️ Mini-Games
17. ⏸️ Leaderboards
18. ⏸️ Multiplayer
19. ⏸️ Mod Support
20. ⏸️ Mobile App

---

## 🔄 Development Workflow

### Feature Development Process
1. **Design:** Write detailed feature spec
2. **Branch:** Create feature branch
3. **Implement:** Code the feature
4. **Test:** Thorough testing
5. **Review:** Self-review and cleanup
6. **PR:** Create pull request
7. **Merge:** Merge to main
8. **Deploy:** Test on live site

### Release Process
1. **Code Freeze:** Stop new features
2. **Testing:** Comprehensive bug testing
3. **Balance:** Final balance adjustments
4. **Documentation:** Update README, CHANGELOG
5. **Version Bump:** Update version numbers
6. **Release Notes:** Write release announcement
7. **Deploy:** Push to production
8. **Announce:** Share with community

---

## 📈 Success Metrics

### v0.3 Goals
- 90%+ tutorial completion rate
- Average session length: 15+ minutes
- Combo system used by 80%+ players
- Settings panel accessed by 50%+ players

### v1.0 Goals
- 10+ deployments per player average
- 80%+ model collection rate
- 5+ weekly challenge completions
- 95%+ mobile usability score
- 4.5+ star rating (if published)

---

## 🎉 Summary

This roadmap outlines a clear path from v0.2.1 to v1.0 and beyond:

- **v0.3.0:** Polish and improve player experience (2 weeks)
- **v1.0.0:** Complete game with all major systems (4 weeks)
- **Post-1.0:** Community features and advanced content

Total estimated time to v1.0: **6 weeks from now** (Mid-March 2026)

**Next Steps:**
1. Review and approve roadmap
2. Create GitHub milestones and issues
3. Begin v0.3.0 development
4. Iterate based on feedback

---

**Document Status:** ✅ Complete  
**Last Updated:** February 10, 2026  
**Maintained By:** AI-Idle Development Team