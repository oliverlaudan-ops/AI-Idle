# 🧠 AI Idle Game

**Ein Idle Game über Machine Learning und KI-Training**

Trainiere neuronale Netzwerke, optimiere Algorithmen und skaliere deine KI-Infrastruktur!

[![Tests](https://github.com/oliverlaudan-ops/AI-Idle/actions/workflows/test.yml/badge.svg)](https://github.com/oliverlaudan-ops/AI-Idle/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.7.0-blue.svg)](https://github.com/oliverlaudan-ops/AI-Idle)

## 🎮 Features

### Core Gameplay
- **Resource Management**: Sammle Data, Compute, Accuracy und Research Points
- **Building System**: Baue Data Centers, Compute Clusters, GPU Farms und mehr
- **Model Training**: Trainiere verschiedene ML-Modelle von Linear Regression bis zu Transformers
- **Research Tree**: Erforsche 40+ Technologien in 8 Kategorien (Optimizers, Aktivierungsfunktionen, Hardware, etc.)
- **Achievement System**: Schalte 30+ Achievements frei für permanente Boni
- **Offline Progress**: Sammle Ressourcen auch wenn du offline bist
- **Auto-Save**: Automatisches Speichern deines Fortschritts

### 🚀 Deployment/Prestige System (v0.6.0)
- **3 Deployment Strategien**: Fast (0.75×), Standard (1.0×), Complete (1.5×)
- **Token Shop**: 15 permanente Upgrades in 4 Kategorien
- **Portfolio System**: Tracking aller Deployments mit Ranks (Intern → AGI Pioneer)
- **Lifetime Stats**: Persistente Fortschrittsverfolgung über alle Runs
- **Strategy Unlocks**: Schalte bessere Strategien durch Deployments frei

### 🤖 Reinforcement Learning Bot (v0.7.0) ✅
- **DQN Agent**: Deep Q-Network trainiert mit TensorFlow.js
- **Auto-Pilot Mode**: Bot übernimmt und spielt optimal
- **Live Training**: Zusehen wie der Bot durch Trial & Error lernt
- **Performance Metrics**: Rewards, Loss, Success Rate visualisiert
- **Deployment Strategy**: Bot lernt optimale Deployment-Strategien
- **Accuracy-Based Rewards**: Training Rewards skaliert mit Model Accuracy
- **Cost-Based Scaling**: Building/Training Rewards basieren auf Kosten

## 🎯 Gameplay Guide

### Ressourcen

| Ressource | Beschreibung | Wofür wichtig |
|-----------|--------------|---------------|
| 📊 **Training Data** | Rohdaten fürs Training | Modelle trainieren |
| ⚡ **Compute (TFLOPS)** | Rechenleistung | Training ermöglichen |
| 🎯 **Accuracy** | Modell-Genauigkeit | Bessere Rewards, Deployment |
| 🔬 **Research** | Forschungspunkte | Tech freischalten |

### Buildings (Tiers)

Das Building-System ist in **3 Tiers** unterteilt:

**Tier 1: Foundation**
- 🗄️ **Data Collector** – Sammelt automatisch Training Data (+1/s)
- 🔲 **CPU Core** – Basis-Compute für Training (+0.2 TFLOPS/s)
- 💾 **Storage Server** – Schnellerer Data-Zugriff (+0.5 Data/s)

**Tier 2: Acceleration**
- GPU-basierte Buildings für mehr Compute

**Tier 3: Advanced**
- Fortgeschrittene Infrastruktur

### Bulk Buy Shortcuts

Beim Kaufen mehrerer Buildings gleichzeitig:

| Tastenkürzel | Effekt |
|--------------|--------|
| `SHIFT` | ×10 |
| `CTRL` | ×100 |
| `CTRL+SHIFT` | Max |

### Training Models

Im **Training** Tab findest du verschiedene Modelle:

**Classification Tasks (Beispiel)**
- 🔢 **Digit Recognition** – MNIST-style Ziffernerkennung
  - Generates: +0.25% Accuracy/s, +0.03 Research/s
  - Requires: 40 Data, 0 Compute

Weitere Categories:
- **Vision Tasks** – Bildklassifikation
- **Advanced Tasks** – Complexe Modelle

### AI Lab & RL Bot

Der **Reinforcement Learning Bot** im AI Lab lernt selbstständig zu spielen!

**Features:**
- **DQN (Deep Q-Network)** mit TensorFlow.js
- Epsilon (ε) startet bei 1.0 und decayt über Episodes
- Lernt durch Trial & Error
- Speed-Control: 1x, 2x, 5x, 10x

**Live Training beobachten:**
1. Gehe zum **AI Lab** Tab
2. Wähle **10x Speed**
3. Klicke **▶ Start Training**
4. Schau zu wie der Bot lernt!

**Bot-Stats im Auge behalten:**
- **Episode** – Wie viele Trainings-Durchgänge
- **ε (Epsilon)** – Explorationsrate (sinkt beim Lernen)
- **Reward** – Je höher desto besser
- **Steps/Second** – Wie schnell der Bot actioniert

## 🏭 Architektur

Das Projekt wurde in **Phase 1 & 2** umfassend refactored für bessere Wartbarkeit, Testbarkeit und Skalierbarkeit.

### 📁 Directory Structure

```
ai-idle/
├── src/
│   ├── core/              # Core game logic
│   │   ├── resource-manager.js
│   │   ├── production-calculator.js
│   │   ├── save-system.js
│   │   └── offline-progress.js
│   │
│   ├── systems/           # Game systems (organized by domain)
│   │   ├── achievements/
│   │   ├── training/
│   │   ├── buildings/
│   │   ├── research/
│   │   └── rl-bot/        # ✅ v0.7.0 - RL Bot with TensorFlow.js
│   │
│   ├── modules/           # Game modules (legacy, being phased out)
│   ├── ui/                # UI components
│   ├── utils/             # Utility functions
│   └── main.js            # Application entry point
│
├── tests/                 # Test suite (Vitest)
├── .github/workflows/     # CI/CD pipeline
├── docs/                  # Documentation
├── styles/                # CSS styles
├── index.html            # Main HTML file
└── package.json          # Dependencies & scripts
```

### Core Modules (`src/core/`)

#### `resource-manager.js`
**Verantwortlich für**: Zentrale Ressourcen-Verwaltung
- `addResource(resourceId, amount)` - Fügt Ressourcen hinzu
- `canAfford(costs)` - Prüft ob Kosten bezahlbar sind
- `spendResources(costs)` - Gibt Ressourcen aus

#### `production-calculator.js`
**Verantwortlich für**: Berechnung aller Produktionsraten
- `recalculateProduction(gameState)` - Berechnet perSecond für alle Ressourcen

#### `save-system.js`
**Verantwortlich für**: Speichern & Laden des Spielstands
- `saveGame(gameState)` - Speichert in localStorage
- `exportSave(gameState)` - Exportiert als Base64 String

#### `offline-progress.js`
**Verantwortlich für**: Offline-Fortschritt Berechnung
- `processOfflineProgress(gameState, offlineTime)` - Simuliert offline Zeit

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ oder 20+
- npm oder yarn

### Installation

```bash
# Clone repository
git clone https://github.com/oliverlaudan-ops/AI-Idle.git
cd AI-Idle

# Install dependencies
npm install

# Run development server
npm run dev
```

### Spielen (ohne Installation)
**Live Demo**: [https://ai-idle.future-pulse.tech](https://ai-idle.future-pulse.tech)

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui
```

## 🧪 Testing

Das Projekt verwendet **Vitest** für Unit- und Integration-Tests.

### Coverage Goals
- ✅ Core Modules: **>90% Coverage**
- ✅ System Modules: **>80% Coverage**
- 🔄 UI Modules: **>60% Coverage** (in progress)

## 📊 Architecture Decisions

### Phase 1: Core Refactoring
Extraktion aus 850+ Zeilen monolithischem `game-state.js`:
- ✅ `resource-manager.js` - Ressourcen-Logik
- ✅ `production-calculator.js` - Produktions-Berechnung
- ✅ `save-system.js` - Speichern/Laden
- ✅ `offline-progress.js` - Offline-Simulation

**Resultat**: `game-state.js` von 850 → 450 Zeilen (-47%)

### Phase 2: Systems Organization
- ✅ `systems/achievements/`
- ✅ `systems/training/`
- ✅ `systems/buildings/`
- ✅ `systems/research/`

## 🗺️ Roadmap

### ✅ v0.6.0 - Deployment System
- ✅ 3 Deployment Strategien mit Token-Multiplier
- ✅ Token Shop mit 15 permanenten Upgrades
- ✅ Portfolio System mit Ranks & Tracking

### ✅ v0.7.0 - Reinforcement Learning Bot
- ✅ DQN Agent mit TensorFlow.js
- ✅ Auto-Pilot Mode
- ✅ Live Training Visualisierung

### 🔵 v0.8.0 - UI Refactoring
- [ ] Komponenten-basierte UI-Architektur
- [ ] State Management verbessern
- [ ] Mobile Responsiveness

### 🔵 v1.0.0 - Polish & Release
- [ ] Animationen & VFX
- [ ] Sound System
- [ ] Full Documentation

## 🤝 Contributing

1. **Fork** das Repository
2. **Create Branch**: `git checkout -b feature/amazing-feature`
3. **Write Tests**: Tests zuerst für neue Features
4. **Implement Feature**: Schreibe den Code
5. **Run Tests**: `npm test`
6. **Commit**: `git commit -m 'feat: Add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Pull Request**: Öffne einen PR

### Commit Convention
- `feat:` - Neues Feature
- `fix:` - Bug Fix
- `refactor:` - Code-Refactoring
- `test:` - Test-bezogen
- `docs:` - Dokumentation

## 📝 License

MIT License - siehe [LICENSE](LICENSE) für Details

## 🙏 Acknowledgments

- Inspiriert von klassischen Idle Games (Cookie Clicker, Universal Paperclips)
- Machine Learning Concepts von TensorFlow, PyTorch, und Hugging Face
- Catppuccin Color Theme

## 📧 Contact

Oliver Laudan - oliver.laudan@gmail.com

**Live Demo**: [https://ai-idle.future-pulse.tech](https://ai-idle.future-pulse.tech)

**Made with ❤️ and ☕ in Munich, Germany**