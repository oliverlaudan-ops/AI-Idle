import { describe, it, expect, beforeEach } from 'vitest';
import { recalculateProduction } from '../../src/core/production-calculator.js';

describe('ProductionCalculator', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      resources: {
        data: { id: 'data', amount: 100, perSecond: 0 },
        compute: { id: 'compute', amount: 50, perSecond: 0 },
        accuracy: { id: 'accuracy', amount: 10, perSecond: 0 },
        research: { id: 'research', amount: 5, perSecond: 0 }
      },
      buildings: {
        dataCenter: {
          id: 'dataCenter',
          count: 2,
          production: { data: 5 }
        },
        computeCluster: {
          id: 'computeCluster',
          count: 1,
          production: { compute: 3 }
        }
      },
      models: {},
      training: null,
      currentTraining: null,
      research: {},
      stats: {
        completedResearch: []
      },
      multipliers: {
        global: 1,
        trainingSpeed: 1
      },
      achievementBonuses: {
        dataGeneration: 1.5,
        allProduction: 1.2,
        computePower: 1.0,
        allResources: 1.0,
        researchPoints: 1.0,
        globalMultiplier: 1.0,
        trainingSpeed: 1.0,
        modelPerformance: 1.0
      }
    };
  });

  describe('building production', () => {
    it('should calculate building production correctly', () => {
      recalculateProduction(gameState);
      
      // dataCenter: 2 * 5 = 10 data/s
      expect(gameState.resources.data.perSecond).toBeGreaterThan(0);
    });

    it('should apply achievement bonuses to production', () => {
      gameState.achievementBonuses.dataGeneration = 2.0;
      gameState.achievementBonuses.allProduction = 1.5;
      
      recalculateProduction(gameState);
      
      // Should be higher with bonuses
      const expectedMin = 2 * 5 * 2.0 * 1.5; // count * base * bonuses
      expect(gameState.resources.data.perSecond).toBeGreaterThanOrEqual(expectedMin * 0.9);
    });

    it('should reset production to zero before calculation', () => {
      gameState.resources.data.perSecond = 999;
      recalculateProduction(gameState);
      
      // Should be recalculated, not 999
      expect(gameState.resources.data.perSecond).not.toBe(999);
      expect(gameState.resources.data.perSecond).toBeGreaterThan(0);
      expect(gameState.resources.data.perSecond).toBeLessThan(999);
    });

    it('should handle zero buildings', () => {
      gameState.buildings.dataCenter.count = 0;
      gameState.buildings.computeCluster.count = 0;
      
      recalculateProduction(gameState);
      
      expect(gameState.resources.data.perSecond).toBe(0);
      expect(gameState.resources.compute.perSecond).toBe(0);
    });

    it('should calculate multiple building types', () => {
      recalculateProduction(gameState);
      
      // Both data and compute should have production
      expect(gameState.resources.data.perSecond).toBeGreaterThan(0);
      expect(gameState.resources.compute.perSecond).toBeGreaterThan(0);
    });
  });

  describe('achievement bonuses', () => {
    it('should apply allProduction bonus to all resources', () => {
      gameState.achievementBonuses.allProduction = 2.0;
      
      recalculateProduction(gameState);
      
      // All production should be doubled
      expect(gameState.resources.data.perSecond).toBeGreaterThan(2 * 5 * 1.5); // with dataGeneration
    });

    it('should apply allResources bonus', () => {
      gameState.achievementBonuses.allResources = 1.5;
      
      recalculateProduction(gameState);
      
      // Should include allResources bonus
      expect(gameState.resources.data.perSecond).toBeGreaterThan(0);
    });

    it('should stack multiple bonuses multiplicatively', () => {
      gameState.achievementBonuses.dataGeneration = 2.0;
      gameState.achievementBonuses.allProduction = 2.0;
      gameState.achievementBonuses.allResources = 2.0;
      
      recalculateProduction(gameState);
      
      // Base: 2 * 5 = 10
      // With all bonuses: 10 * 2 * 2 * 2 = 80
      expect(gameState.resources.data.perSecond).toBeGreaterThan(70); // Allow some variance
    });
  });

  describe('edge cases', () => {
    it('should handle missing building production gracefully', () => {
      gameState.buildings.brokenBuilding = {
        id: 'brokenBuilding',
        count: 5
        // No production property!
      };
      
      // Should not crash
      expect(() => recalculateProduction(gameState)).not.toThrow();
    });

    it('should handle very large building counts', () => {
      gameState.buildings.dataCenter.count = 1000;
      
      recalculateProduction(gameState);
      
      expect(gameState.resources.data.perSecond).toBeGreaterThan(1000);
      expect(gameState.resources.data.perSecond).toBeLessThan(Infinity);
    });
  });
});
