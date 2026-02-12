# 🧠 AI Idle Game

**Ein Idle Game über Machine Learning und KI-Training**

Trainiere neuronale Netzwerke, optimiere Algorithmen und skaliere deine KI-Infrastruktur!

[![Tests](https://github.com/oliverlaudan-ops/AI-Idle/actions/workflows/test.yml/badge.svg)](https://github.com/oliverlaudan-ops/AI-Idle/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/oliverlaudan-ops/AI-Idle)

## 🎮 Features

- **Resource Management**: Sammle Data, Compute, Accuracy und Research Points
- **Building System**: Baue Data Centers, Compute Clusters und mehr
- **Model Training**: Trainiere verschiedene ML-Modelle von Linear Regression bis zu Transformers
- **Research Tree**: Erforsche Optimizers, Aktivierungsfunktionen und Architekturen
- **Achievement System**: Schalte Achievements frei für Boni
- **Deployment System**: Deploye deine Modelle für Tokens
- **Offline Progress**: Sammle Ressourcen auch wenn du offline bist
- **Auto-Save**: Automatisches Speichern deines Fortschritts

## 🏗️ Architektur

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
│   │   │   ├── definitions.js
│   │   │   ├── checker.js
│   │   │   ├── rewards.js
│   │   │   └── index.js
│   │   ├── training/
│   │   │   ├── models.js
│   │   │   ├── queue.js
│   │   │   └── index.js
│   │   ├── buildings/
│   │   │   ├── definitions.js
│   │   │   ├── costs.js
│   │   │   └── index.js
│   │   └── research/
│   │       ├── definitions.js
│   │       ├── effects.js
│   │       └── index.js
│   │
│   ├── modules/           # Game modules (legacy, being phased out)
│   │   ├── game-state.js  # Central game state (delegates to core & systems)
│   │   ├── resources.js
│   │   ├── deployment.js
│   │   ├── combo-system.js
│   │   ├── bulk-purchase.js
│   │   └── settings.js
│   │
│   ├── ui/                # UI components
│   │   ├── ui-init.js
│   │   ├── ui-render.js
│   │   ├── ui-tabs.js
│   │   ├── ai-lab-ui.js
│   │   ├── combo-ui.js
│   │   ├── deployment-ui.js
│   │   ├── bulk-purchase-ui.js
│   │   ├── training-queue-ui.js
│   │   ├── settings-ui.js
│   │   ├── tutorial.js
│   │   └── training-animations.js
│   │
│   ├── utils/             # Utility functions
│   │   ├── format.js      # Number, time formatting
│   │   ├── calculations.js # Cost calculations, scaling
│   │   └── storage.js     # LocalStorage helpers
│   │
│   └── main.js            # Application entry point
│
├── tests/                 # Test suite (Vitest)
│   ├── core/
│   │   ├── resource-manager.test.js
│   │   ├── production-calculator.test.js
│   │   └── save-system.test.js
│   └── setup.js
│
├── .github/
│   └── workflows/
│       └── test.yml       # CI/CD pipeline
│
├── styles/                # CSS styles
├── index.html            # Main HTML file
├── package.json          # Dependencies & scripts
├── vitest.config.js      # Test configuration
└── README.md             # This file
```

## 📦 Module Overview

### Core Modules (`src/core/`)

#### `resource-manager.js`
**Verantwortlich für**: Zentrale Ressourcen-Verwaltung
- `addResource(resourceId, amount)` - Fügt Ressourcen hinzu
- `canAfford(costs)` - Prüft ob Kosten bezahlbar sind
- `spendResources(costs)` - Gibt Ressourcen aus
- Aktualisiert automatisch Stats (totalDataGenerated, maxAccuracy, etc.)

#### `production-calculator.js`
**Verantwortlich für**: Berechnung aller Produktionsraten
- `recalculateProduction(gameState)` - Berechnet perSecond für alle Ressourcen
- Berücksichtigt Buildings, Training, Achievement-Boni
- Wendet Multiplikatoren korrekt an (dataGeneration, allProduction, etc.)

#### `save-system.js`
**Verantwortlich für**: Speichern & Laden des Spielstands
- `saveGame(gameState)` - Speichert in localStorage
- `loadGame(gameState)` - Lädt aus localStorage
- `exportSave(gameState)` - Exportiert als Base64 String
- `importSave(gameState, saveString)` - Importiert aus String
- Unterstützt Backwards-Compatibility

#### `offline-progress.js`
**Verantwortlich für**: Offline-Fortschritt Berechnung
- `processOfflineProgress(gameState, offlineTime)` - Simuliert offline Zeit
- Begrenzt auf Maximum (z.B. 24 Stunden)
- Gibt Bericht über generierten Fortschritt

### System Modules (`src/systems/`)

Jedes System folgt dem gleichen Pattern:
- `definitions.js` - Daten & Konfiguration
- `[logic].js` - Geschäftslogik
- `index.js` - Public API (was exportiert wird)

#### Achievement System
- **definitions.js**: Alle Achievement-Definitionen
- **checker.js**: Prüft Unlock-Conditions
- **rewards.js**: Wendet Achievement-Boni an

#### Training System
- **models.js**: ML-Model Definitionen
- **queue.js**: Training Queue Management

#### Buildings System
- **definitions.js**: Building Definitionen
- **costs.js**: Kosten-Berechnung mit Scaling

#### Research System
- **definitions.js**: Research Tree
- **effects.js**: Anwendung von Research-Effekten

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

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🧪 Testing

Das Projekt verwendet **Vitest** für Unit- und Integration-Tests.

### Test Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ModuleName', () => {
  let gameState;
  
  beforeEach(() => {
    // Setup vor jedem Test
    gameState = createTestGameState();
  });
  
  it('should do something', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Coverage Goals

- ✅ Core Modules: **>90% Coverage**
- ✅ System Modules: **>80% Coverage**
- 🔄 UI Modules: **>60% Coverage** (in progress)

## 📊 Architecture Decisions

### Phase 1: Core Refactoring

**Problem**: `game-state.js` war 850+ Zeilen mit vermischten Concerns

**Lösung**: Extraktion in spezialisierte Module
- ✅ `resource-manager.js` - Ressourcen-Logik
- ✅ `production-calculator.js` - Produktions-Berechnung
- ✅ `save-system.js` - Speichern/Laden
- ✅ `offline-progress.js` - Offline-Simulation

**Resultat**: `game-state.js` von 850 → 450 Zeilen (-47%)

### Phase 2: Systems Organization

**Problem**: Große Monolithen (`buildings.js`, `research.js`, etc.)

**Lösung**: Organisation in domain-spezifische Systeme
- ✅ `systems/achievements/` - Achievement-System
- ✅ `systems/training/` - Training-System
- ✅ `systems/buildings/` - Building-System
- ✅ `systems/research/` - Research-System

**Pattern**: `definitions.js` + `logic.js` + `index.js` (Public API)

### Phase 3: Testing & Documentation (Current)

**Ziel**: Validation der Refactorings und Dokumentation
- ✅ Unit Tests für Core Module
- ✅ Architecture Documentation
- 🔄 Integration Tests (in progress)
- 🔄 API Documentation (in progress)

## 🤝 Contributing

### Development Workflow

1. **Fork** das Repository
2. **Create Branch**: `git checkout -b feature/amazing-feature`
3. **Write Tests**: Tests zuerst für neue Features
4. **Implement Feature**: Schreibe den Code
5. **Run Tests**: `npm test` - Stelle sicher alle Tests bestehen
6. **Commit**: `git commit -m 'feat: Add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Pull Request**: Öffne einen PR

### Commit Convention

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Neues Feature
- `fix:` - Bug Fix
- `refactor:` - Code-Refactoring
- `test:` - Test-bezogen
- `docs:` - Dokumentation
- `style:` - Code-Style (formatting)
- `perf:` - Performance-Verbesserung

### Code Style

- **Indentation**: 4 Spaces
- **Quotes**: Single quotes für Strings
- **Semicolons**: Ja
- **Line Length**: Max 100 Zeichen
- **Comments**: JSDoc für Public APIs

## 🗺️ Roadmap

### v0.3.0 - UI Refactoring
- [ ] Komponenten-basierte UI-Architektur
- [ ] State Management verbessern
- [ ] Performance-Optimierung für Rendering

### v0.4.0 - Advanced Features
- [ ] Prestige System erweitern
- [ ] Neue Model-Kategorien
- [ ] Multiplayer-Leaderboards

### v0.5.0 - Polish
- [ ] Animationen & VFX
- [ ] Sound System
- [ ] Mobile Optimierung

## 📝 License

MIT License - siehe [LICENSE](LICENSE) für Details

## 🙏 Acknowledgments

- Inspiriert von klassischen Idle Games
- Machine Learning Concepts von verschiedenen ML-Frameworks
- Community Feedback & Contributions

## 📧 Contact

Oliver Laudan - oliver.laudan@gmail.com

Project Link: [https://github.com/oliverlaudan-ops/AI-Idle](https://github.com/oliverlaudan-ops/AI-Idle)

---

**Made with ❤️ and ☕ in Munich, Germany**
