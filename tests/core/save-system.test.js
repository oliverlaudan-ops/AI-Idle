import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame, exportSave, importSave } from '../../src/core/save-system.js';

describe('SaveSystem', () => {
  let gameState;

  beforeEach(() => {
    global.localStorage.clear();
    
    gameState = {
      resources: {
        data: { id: 'data', amount: 100, perSecond: 5 },
        compute: { id: 'compute', amount: 50, perSecond: 2 }
      },
      buildings: {
        dataCenter: { id: 'dataCenter', count: 2 }
      },
      stats: {
        totalDataGenerated: 1000
      }
    };
  });

  describe('saveGame', () => {
    it('should save game state to localStorage', () => {
      const result = saveGame(gameState);
      
      expect(result).toBe(true);
      expect(global.localStorage.getItem('aiIdleSave')).not.toBeNull();
    });

    it('should include timestamp', () => {
      saveGame(gameState);
      const saved = JSON.parse(global.localStorage.getItem('aiIdleSave'));
      
      expect(saved.timestamp).toBeDefined();
      expect(typeof saved.timestamp).toBe('number');
    });
  });

  describe('loadGame', () => {
    it('should load saved game state', () => {
      saveGame(gameState);
      
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: {}
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
  });

  describe('exportSave', () => {
    it('should export save as base64 string', () => {
      const exported = exportSave(gameState);
      
      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
    });
  });

  describe('importSave', () => {
    it('should import valid save string', () => {
      const exported = exportSave(gameState);
      
      const newState = {
        resources: { data: { amount: 0 } },
        buildings: {}
      };
      
      const result = importSave(newState, exported);
      
      expect(result.success).toBe(true);
      expect(newState.resources.data.amount).toBe(100);
    });

    it('should reject invalid base64', () => {
      const newState = { resources: {}, buildings: {} };
      const result = importSave(newState, 'invalid!!!base64');
      
      expect(result.success).toBe(false);
    });
  });
});
