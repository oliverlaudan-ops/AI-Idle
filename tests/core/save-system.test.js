import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGame, loadGame, exportSave, importSave } from '../../src/core/save-system.js';

describe('SaveSystem', () => {
  let gameState;

  beforeEach(() => {
    // Clear localStorage before each test
    global.localStorage.clear();
    
    // Create a minimal game state for testing
    gameState = {
      resources: {
        data: { id: 'data', amount: 100, perSecond: 5 },
        compute: { id: 'compute', amount: 50, perSecond: 2 },
        accuracy: { id: 'accuracy', amount: 10, perSecond: 1 },
        research: { id: 'research', amount: 5, perSecond: 0.5 }
      },
      buildings: {
        dataCenter: { id: 'dataCenter', count: 2, unlocked: true },
        computeCluster: { id: 'computeCluster', count: 1, unlocked: true }
      },
      models: {
        linearRegression: { id: 'linearRegression', unlocked: true }
      },
      research: {
        sgd: { id: 'sgd', researched: true, unlocked: true }
      },
      achievements: {
        firstClick: { id: 'firstClick', unlocked: true }
      },
      stats: {
        totalDataGenerated: 1000,
        totalAccuracy: 50,
        maxAccuracy: 25,
        totalCompute: 100,
        totalBuildings: 3,
        modelsTrained: 5,
        uniqueModelsTrained: 2,
        trainedModels: ['linearRegression', 'logisticRegression'],
        completedResearch: ['sgd'],
        deployments: 1,
        startTime: Date.now() - 10000,
        totalPlaytime: 10000,
        lastPlaytimeUpdate: Date.now(),
        manualClicks: 42
      },
      deployment: {
        deployments: 1,
        tokens: 100,
        lifetimeTokens: 150,
        lifetimeStats: {
          totalAccuracy: 500,
          modelsTrained: 10,
          achievements: ['firstClick'],
          researchCompleted: ['sgd']
        },
        history: []
      },
      currentTraining: null,
      trainingProgress: 0,
      training: null,
      achievementBonuses: {
        dataGeneration: 1.5,
        allProduction: 1.2
      },
      lastSaveTime: Date.now()
    };
  });

  describe('saveGame', () => {
    it('should save game state to localStorage', () => {
      const result = saveGame(gameState);
      
      expect(result).toBe(true);
      expect(global.localStorage.getItem('aiIdleSave')).not.toBeNull();
    });

    it('should save all important game state properties', () => {
      saveGame(gameState);
      const saved = JSON.parse(global.localStorage.getItem('aiIdleSave'));
      
      expect(saved.resources).toBeDefined();
      expect(saved.buildings).toBeDefined();
      expect(saved.models).toBeDefined();
      expect(saved.research).toBeDefined();
      expect(saved.achievements).toBeDefined();
      expect(saved.stats).toBeDefined();
      expect(saved.deployment).toBeDefined();
    });

    it('should include save version', () => {
      saveGame(gameState);
      const saved = JSON.parse(global.localStorage.getItem('aiIdleSave'));
      
      expect(saved.version).toBeDefined();
      expect(typeof saved.version).toBe('number');
    });

    it('should include timestamp', () => {
      saveGame(gameState);
      const saved = JSON.parse(global.localStorage.getItem('aiIdleSave'));
      
      expect(saved.timestamp).toBeDefined();
      expect(typeof saved.timestamp).toBe('number');
    });

    it('should handle save errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = global.localStorage.setItem;
      global.localStorage.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });
      
      const result = saveGame(gameState);
      expect(result).toBe(false);
      
      // Restore
      global.localStorage.setItem = originalSetItem;
    });
  });

  describe('loadGame', () => {
    it('should load saved game state', () => {
      // Save first
      saveGame(gameState);
      
      // Create new empty state
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: {},
        models: {},
        research: {},
        achievements: {},
        stats: {},
        deployment: {}
      };
      
      // Load
      const result = loadGame(newState);
      
      expect(result).toBe(true);
      expect(newState.resources.data.amount).toBe(100);
      expect(newState.buildings.dataCenter.count).toBe(2);
    });

    it('should return false when no save exists', () => {
      const newState = { resources: {}, buildings: {} };
      const result = loadGame(newState);
      
      expect(result).toBe(false);
    });

    it('should handle corrupted save data', () => {
      global.localStorage.setItem('aiIdleSave', 'corrupted{invalid]json');
      
      const newState = { resources: {}, buildings: {} };
      const result = loadGame(newState);
      
      expect(result).toBe(false);
    });

    it('should preserve data that was not in save', () => {
      // Save minimal state
      const minimalState = {
        resources: { data: { amount: 50 } }
      };
      global.localStorage.setItem('aiIdleSave', JSON.stringify({
        version: 1,
        timestamp: Date.now(),
        ...minimalState
      }));
      
      // Load into fuller state
      const fullState = {
        resources: { 
          data: { amount: 0, perSecond: 5 },
          compute: { amount: 100 }
        },
        buildings: { dataCenter: { count: 10 } }
      };
      
      loadGame(fullState);
      
      // data.amount should be loaded
      expect(fullState.resources.data.amount).toBe(50);
      // data.perSecond should be preserved
      expect(fullState.resources.data.perSecond).toBe(5);
      // compute should be preserved
      expect(fullState.resources.compute.amount).toBe(100);
      // buildings should be preserved
      expect(fullState.buildings.dataCenter.count).toBe(10);
    });
  });

  describe('exportSave', () => {
    it('should export save as base64 string', () => {
      const exported = exportSave(gameState);
      
      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
    });

    it('should be decodable', () => {
      const exported = exportSave(gameState);
      
      expect(() => {
        const decoded = atob(exported);
        JSON.parse(decoded);
      }).not.toThrow();
    });

    it('should contain game state data', () => {
      const exported = exportSave(gameState);
      const decoded = JSON.parse(atob(exported));
      
      expect(decoded.resources).toBeDefined();
      expect(decoded.resources.data.amount).toBe(100);
    });
  });

  describe('importSave', () => {
    it('should import valid save string', () => {
      const exported = exportSave(gameState);
      
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: {},
        stats: {}
      };
      
      const result = importSave(newState, exported);
      
      expect(result.success).toBe(true);
      expect(newState.resources.data.amount).toBe(100);
    });

    it('should reject invalid base64', () => {
      const newState = { resources: {}, buildings: {} };
      const result = importSave(newState, 'invalid!!!base64');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid JSON after decoding', () => {
      const invalidSave = btoa('not{valid}json');
      const newState = { resources: {}, buildings: {} };
      const result = importSave(newState, invalidSave);
      
      expect(result.success).toBe(false);
    });

    it('should handle empty string', () => {
      const newState = { resources: {}, buildings: {} };
      const result = importSave(newState, '');
      
      expect(result.success).toBe(false);
    });
  });

  describe('save/load roundtrip', () => {
    it('should preserve data through save and load', () => {
      // Save
      saveGame(gameState);
      
      // Create new state
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: { dataCenter: { count: 0 } },
        stats: { totalDataGenerated: 0 },
        deployment: { tokens: 0 }
      };
      
      // Load
      loadGame(newState);
      
      // Verify
      expect(newState.resources.data.amount).toBe(gameState.resources.data.amount);
      expect(newState.buildings.dataCenter.count).toBe(gameState.buildings.dataCenter.count);
      expect(newState.stats.totalDataGenerated).toBe(gameState.stats.totalDataGenerated);
      expect(newState.deployment.tokens).toBe(gameState.deployment.tokens);
    });

    it('should preserve data through export and import', () => {
      const exported = exportSave(gameState);
      
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: { dataCenter: { count: 0 } },
        stats: { modelsTrained: 0 }
      };
      
      importSave(newState, exported);
      
      expect(newState.resources.data.amount).toBe(gameState.resources.data.amount);
      expect(newState.buildings.dataCenter.count).toBe(gameState.buildings.dataCenter.count);
      expect(newState.stats.modelsTrained).toBe(gameState.stats.modelsTrained);
    });
  });

  describe('backwards compatibility', () => {
    it('should handle old save format without version', () => {
      const oldSave = {
        resources: { data: { amount: 75 } },
        buildings: { dataCenter: { count: 3 } }
      };
      global.localStorage.setItem('aiIdleSave', JSON.stringify(oldSave));
      
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: { dataCenter: { count: 0 } }
      };
      
      const result = loadGame(newState);
      
      expect(result).toBe(true);
      expect(newState.resources.data.amount).toBe(75);
    });

    it('should handle missing optional fields', () => {
      const partialSave = {
        version: 1,
        timestamp: Date.now(),
        resources: { data: { amount: 50 } }
        // Missing: buildings, models, research, etc.
      };
      global.localStorage.setItem('aiIdleSave', JSON.stringify(partialSave));
      
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: { dataCenter: { count: 5 } },
        models: {},
        research: {}
      };
      
      const result = loadGame(newState);
      
      expect(result).toBe(true);
      expect(newState.resources.data.amount).toBe(50);
      expect(newState.buildings.dataCenter.count).toBe(5); // Preserved
    });
  });

  describe('edge cases', () => {
    it('should handle very large save data', () => {
      // Create large stats arrays
      gameState.stats.trainedModels = new Array(1000).fill('model');
      gameState.deployment.history = new Array(100).fill({ 
        timestamp: Date.now(), 
        tokens: 10 
      });
      
      const exported = exportSave(gameState);
      expect(exported.length).toBeGreaterThan(1000);
      
      const newState = { stats: { trainedModels: [] }, deployment: { history: [] } };
      const result = importSave(newState, exported);
      
      expect(result.success).toBe(true);
      expect(newState.stats.trainedModels.length).toBe(1000);
    });

    it('should handle special characters in save data', () => {
      gameState.stats.trainedModels = ['model\nwith\nnewlines', 'model"with"quotes'];
      
      const exported = exportSave(gameState);
      const newState = { stats: { trainedModels: [] } };
      importSave(newState, exported);
      
      expect(newState.stats.trainedModels[0]).toBe('model\nwith\nnewlines');
      expect(newState.stats.trainedModels[1]).toBe('model"with"quotes');
    });
  });
});
