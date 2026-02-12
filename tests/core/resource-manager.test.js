import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceManager } from '../../src/core/resource-manager.js';

describe('ResourceManager', () => {
  let gameState;
  let resourceManager;

  beforeEach(() => {
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
          totalAccuracy: 0,
          totalData: 0,
          totalCompute: 0
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

    it('should update stats when adding data', () => {
      resourceManager.addResource('data', 50);
      expect(gameState.stats.totalDataGenerated).toBe(50);
      expect(gameState.deployment.lifetimeStats.totalData).toBe(50);
    });

    it('should handle negative amounts', () => {
      resourceManager.addResource('data', -30);
      expect(gameState.resources.data.amount).toBe(70);
    });

    it('should update maxAccuracy when adding accuracy', () => {
      resourceManager.addResource('accuracy', 100);
      expect(gameState.stats.maxAccuracy).toBe(100);
      
      resourceManager.addResource('accuracy', -50);
      expect(gameState.stats.maxAccuracy).toBe(100); // Should stay at max
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

    it('should return false if any resource is insufficient', () => {
      const costs = { data: 50, compute: 100 }; // compute too high
      expect(resourceManager.canAfford(costs)).toBe(false);
    });

    it('should return true for empty costs', () => {
      expect(resourceManager.canAfford({})).toBe(true);
    });

    it('should return false for non-existent resource', () => {
      const costs = { nonExistent: 10 };
      expect(resourceManager.canAfford(costs)).toBe(false);
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
      expect(gameState.resources.data.amount).toBe(100); // Unchanged
      expect(gameState.resources.compute.amount).toBe(50); // Unchanged
    });

    it('should be atomic - all or nothing', () => {
      const costs = { data: 50, compute: 100 }; // compute too high
      const result = resourceManager.spendResources(costs);
      
      expect(result).toBe(false);
      expect(gameState.resources.data.amount).toBe(100); // Nothing spent
      expect(gameState.resources.compute.amount).toBe(50);
    });
  });
});
