import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceManager } from '../../src/core/resource-manager.js';

describe('ResourceManager', () => {
  let gameState;
  let resourceManager;

  beforeEach(() => {
    // Create a minimal game state for testing
    gameState = {
      resources: {
        data: { id: 'data', amount: 100, perSecond: 0 },
        compute: { id: 'compute', amount: 50, perSecond: 0 },
        accuracy: { id: 'accuracy', amount: 0, perSecond: 0 },
        research: { id: 'research', amount: 0, perSecond: 0 }
      },
      stats: {
        totalDataGenerated: 0,
        totalAccuracy: 0,
        maxAccuracy: 0
      },
      deployment: {
        lifetimeStats: {
          totalAccuracy: 0
        }
      }
    };
    resourceManager = new ResourceManager(gameState);
  });

  describe('addResource', () => {
    it('should add resources correctly', () => {
      resourceManager.addResource('data', 50);
      expect(gameState.resources.data.amount).toBe(150);
    });

    it('should update total stats for data', () => {
      resourceManager.addResource('data', 50);
      expect(gameState.stats.totalDataGenerated).toBe(50);
    });

    it('should update total and max accuracy', () => {
      resourceManager.addResource('accuracy', 10);
      expect(gameState.stats.totalAccuracy).toBe(10);
      expect(gameState.stats.maxAccuracy).toBe(10);
      expect(gameState.deployment.lifetimeStats.totalAccuracy).toBe(10);
    });

    it('should not decrease max accuracy when adding less', () => {
      resourceManager.addResource('accuracy', 100);
      resourceManager.addResource('accuracy', -50);
      expect(gameState.resources.accuracy.amount).toBe(50);
      expect(gameState.stats.maxAccuracy).toBe(100);
    });

    it('should handle negative amounts', () => {
      resourceManager.addResource('data', -30);
      expect(gameState.resources.data.amount).toBe(70);
    });

    it('should not let resources go below zero', () => {
      resourceManager.addResource('data', -200);
      expect(gameState.resources.data.amount).toBe(0);
    });

    it('should do nothing for invalid resource IDs', () => {
      const initialData = gameState.resources.data.amount;
      resourceManager.addResource('invalid', 100);
      expect(gameState.resources.data.amount).toBe(initialData);
    });
  });

  describe('canAfford', () => {
    it('should return true when player can afford costs', () => {
      const costs = { data: 50, compute: 30 };
      expect(resourceManager.canAfford(costs)).toBe(true);
    });

    it('should return false when player cannot afford costs', () => {
      const costs = { data: 150, compute: 30 };
      expect(resourceManager.canAfford(costs)).toBe(false);
    });

    it('should return true for empty costs', () => {
      expect(resourceManager.canAfford({})).toBe(true);
    });

    it('should return false if any single resource is insufficient', () => {
      const costs = { data: 50, compute: 100 };
      expect(resourceManager.canAfford(costs)).toBe(false);
    });

    it('should handle exact amounts', () => {
      const costs = { data: 100, compute: 50 };
      expect(resourceManager.canAfford(costs)).toBe(true);
    });
  });

  describe('spendResources', () => {
    it('should spend resources when affordable', () => {
      const costs = { data: 50, compute: 30 };
      const result = resourceManager.spendResources(costs);
      
      expect(result).toBe(true);
      expect(gameState.resources.data.amount).toBe(50);
      expect(gameState.resources.compute.amount).toBe(20);
    });

    it('should not spend resources when unaffordable', () => {
      const costs = { data: 150, compute: 30 };
      const result = resourceManager.spendResources(costs);
      
      expect(result).toBe(false);
      expect(gameState.resources.data.amount).toBe(100);
      expect(gameState.resources.compute.amount).toBe(50);
    });

    it('should not partially spend on failure', () => {
      const costs = { data: 50, compute: 100 };
      const result = resourceManager.spendResources(costs);
      
      expect(result).toBe(false);
      expect(gameState.resources.data.amount).toBe(100);
      expect(gameState.resources.compute.amount).toBe(50);
    });

    it('should handle empty costs', () => {
      const result = resourceManager.spendResources({});
      expect(result).toBe(true);
    });

    it('should handle spending exact amounts', () => {
      const costs = { data: 100, compute: 50 };
      const result = resourceManager.spendResources(costs);
      
      expect(result).toBe(true);
      expect(gameState.resources.data.amount).toBe(0);
      expect(gameState.resources.compute.amount).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      resourceManager.addResource('data', 1e15);
      expect(gameState.resources.data.amount).toBeGreaterThan(1e15);
    });

    it('should handle floating point amounts', () => {
      resourceManager.addResource('data', 10.5);
      expect(gameState.resources.data.amount).toBe(110.5);
    });

    it('should handle zero amounts', () => {
      const initialAmount = gameState.resources.data.amount;
      resourceManager.addResource('data', 0);
      expect(gameState.resources.data.amount).toBe(initialAmount);
    });
  });
});
