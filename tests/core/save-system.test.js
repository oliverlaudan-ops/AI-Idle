import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame, exportSave, importSave } from '../../src/core/save-system.js';

describe('SaveSystem', () => {
  let gameState;

  beforeEach(() => {
    global.localStorage.clear();
    
    gameState = {
      resources: {
        data: { id: 'data', amount: 100, perSecond: 5 },
        compute: { id: 'compute', amount: 50, perSecond: 2 },
        accuracy: { id: 'accuracy', amount: 25, perSecond: 1 },
        research: { id: 'research', amount: 10, perSecond: 0.5 }
      },
      buildings: {
        dataCenter: { id: 'dataCenter', count: 2 },
        computeCluster: { id: 'computeCluster', count: 1 }
      },
      models: {
        linearRegression: { unlocked: true, trained: 5 }
      },
      stats: {
        totalDataGenerated: 1000,
        modelsTrained: 5,
        manualClicks: 50,
        completedResearch: ['research1']
      },
      achievements: {
        firstClick: { unlocked: true }
      },
      deployment: {
        lifetimeStats: {
          totalData: 5000,
          totalAccuracy: 500
        }
      }
    };
  });

  describe('saveGame', () => {
    it('should save game state to localStorage', () => {
      const result = saveGame(gameState);
      
      expect(result).toBe(true);
      expect(global.localStorage.getItem('aiIdleSave')).not.toBeNull();
    });

    it('should include timestamp in save', () => {
      saveGame(gameState);
      const saved = JSON.parse(global.localStorage.getItem('aiIdleSave'));
      
      expect(saved.timestamp).toBeDefined();
      expect(typeof saved.timestamp).toBe('number');
      expect(saved.timestamp).toBeGreaterThan(0);
    });

    it('should include version in save', () => {
      saveGame(gameState);
      const saved = JSON.parse(global.localStorage.getItem('aiIdleSave'));
      
      expect(saved.version).toBeDefined();
      expect(typeof saved.version).toBe('string');
    });

    it('should save all game state properties', () => {
      saveGame(gameState);
      const saved = JSON.parse(global.localStorage.getItem('aiIdleSave'));
      
      expect(saved.gameState.resources).toBeDefined();
      expect(saved.gameState.buildings).toBeDefined();
      expect(saved.gameState.stats).toBeDefined();
    });
  });

  describe('loadGame', () => {
    it('should load saved game state', () => {
      saveGame(gameState);
      
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: {},
        stats: {}
      };
      
      const result = loadGame(newState);
      
      expect(result).toBe(true);
      expect(newState.resources.data.amount).toBe(100);
    });

    it('should return false when no save exists', () => {
      const newState = { resources: {}, buildings: {} };
      const result = loadGame(newState);
      
      expect(result).toBe(false);
    });

    it('should restore buildings count', () => {
      saveGame(gameState);
      
      const newState = {
        resources: {},
        buildings: { dataCenter: { count: 0 } }
      };
      
      loadGame(newState);
      
      expect(newState.buildings.dataCenter.count).toBe(2);
    });

    it('should restore stats', () => {
      saveGame(gameState);
      
      const newState = {
        resources: {},
        buildings: {},
        stats: { totalDataGenerated: 0 }
      };
      
      loadGame(newState);
      
      expect(newState.stats.totalDataGenerated).toBe(1000);
    });
  });

  describe('exportSave', () => {
    it('should export save as base64 string', () => {
      const exported = exportSave(gameState);
      
      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
    });

    it('should create valid base64', () => {
      const exported = exportSave(gameState);
      
      // Should be decodable
      expect(() => atob(exported)).not.toThrow();
    });

    it('should include all game data', () => {
      const exported = exportSave(gameState);
      const decoded = JSON.parse(atob(exported));
      
      expect(decoded.gameState.resources).toBeDefined();
      expect(decoded.gameState.buildings).toBeDefined();
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

    it('should reject empty string', () => {
      const newState = { resources: {}, buildings: {} };
      const result = importSave(newState, '');
      
      expect(result.success).toBe(false);
    });

    it('should reject non-JSON data', () => {
      const newState = { resources: {}, buildings: {} };
      const invalidBase64 = btoa('not json data');
      const result = importSave(newState, invalidBase64);
      
      expect(result.success).toBe(false);
    });
  });

  describe('roundtrip', () => {
    it('should preserve data through save/load cycle', () => {
      saveGame(gameState);
      
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: { dataCenter: { count: 0 } },
        stats: { totalDataGenerated: 0 }
      };
      
      loadGame(newState);
      
      expect(newState.resources.data.amount).toBe(100);
      expect(newState.buildings.dataCenter.count).toBe(2);
      expect(newState.stats.totalDataGenerated).toBe(1000);
    });

    it('should preserve data through export/import cycle', () => {
      const exported = exportSave(gameState);
      
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: { dataCenter: { count: 0 } },
        stats: { totalDataGenerated: 0 }
      };
      
      importSave(newState, exported);
      
      expect(newState.resources.data.amount).toBe(100);
      expect(newState.buildings.dataCenter.count).toBe(2);
      expect(newState.stats.totalDataGenerated).toBe(1000);
    });
  });
});
