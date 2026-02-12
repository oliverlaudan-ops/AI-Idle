import { describe, it, expect, beforeEach } from 'vitest';
import { recalculateProduction } from '../../src/core/production-calculator.js';

describe('ProductionCalculator', () => {
  let gameState;

  beforeEach(() => {
    // Create a minimal game state for testing
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
          production: { compute: 2 }
        }
      },
      models: {},
      training: null,
      currentTraining: null,
      achievementBonuses: {
        dataGeneration: 1.5,
        allProduction: 1.2,
        computePower: 1.1,
        allResources: 1.0,
        researchPoints: 1.0
      }
    };
  });

  describe('basic production calculation', () => {
    it('should calculate building production correctly', () => {
      recalculateProduction(gameState);
      
      // 2 buildings * 5 data/s * 1.5 (dataGeneration) * 1.2 (allProduction) = 18
      expect(gameState.resources.data.perSecond).toBe(18);
      
      // 1 building * 2 compute/s * 1.1 (computePower) * 1.2 (allProduction) = 2.64
      expect(gameState.resources.compute.perSecond).toBe(2.64);
    });

    it('should reset production to zero before calculation', () => {
      gameState.resources.data.perSecond = 999;
      recalculateProduction(gameState);
      expect(gameState.resources.data.perSecond).not.toBe(999);
    });

    it('should handle zero buildings', () => {
      gameState.buildings.dataCenter.count = 0;
      gameState.buildings.computeCluster.count = 0;
      recalculateProduction(gameState);
      
      expect(gameState.resources.data.perSecond).toBe(0);
      expect(gameState.resources.compute.perSecond).toBe(0);
    });
  });

  describe('achievement bonuses', () => {
    it('should apply dataGeneration bonus only to data', () => {
      gameState.achievementBonuses.dataGeneration = 2.0;
      recalculateProduction(gameState);
      
      // 2 * 5 * 2.0 * 1.2 = 24
      expect(gameState.resources.data.perSecond).toBe(24);
    });

    it('should apply allProduction bonus to all resources', () => {
      gameState.achievementBonuses.allProduction = 2.0;
      recalculateProduction(gameState);
      
      // Data: 2 * 5 * 1.5 * 2.0 = 30
      expect(gameState.resources.data.perSecond).toBe(30);
      
      // Compute: 1 * 2 * 1.1 * 2.0 = 4.4
      expect(gameState.resources.compute.perSecond).toBe(4.4);
    });

    it('should apply computePower bonus only to compute', () => {
      gameState.achievementBonuses.computePower = 2.0;
      recalculateProduction(gameState);
      
      // 1 * 2 * 2.0 * 1.2 = 4.8
      expect(gameState.resources.compute.perSecond).toBe(4.8);
    });

    it('should combine multiple bonuses multiplicatively', () => {
      gameState.achievementBonuses.dataGeneration = 2.0;
      gameState.achievementBonuses.allProduction = 1.5;
      recalculateProduction(gameState);
      
      // 2 * 5 * 2.0 * 1.5 = 30
      expect(gameState.resources.data.perSecond).toBe(30);
    });
  });

  describe('training production', () => {
    it('should add training production when model is training', () => {
      gameState.currentTraining = 'testModel';
      gameState.training = {
        modelId: 'testModel',
        accuracyPerSecond: 5
      };
      gameState.models.testModel = {
        id: 'testModel',
        production: { accuracy: 5 }
      };
      
      recalculateProduction(gameState);
      
      // Training production is added to accuracy
      expect(gameState.resources.accuracy.perSecond).toBeGreaterThan(0);
    });

    it('should not add training production when not training', () => {
      gameState.currentTraining = null;
      gameState.training = null;
      
      recalculateProduction(gameState);
      
      expect(gameState.resources.accuracy.perSecond).toBe(0);
    });
  });

  describe('research production', () => {
    it('should calculate research points from accuracy', () => {
      gameState.resources.accuracy.amount = 100;
      gameState.achievementBonuses.researchPoints = 1.5;
      
      recalculateProduction(gameState);
      
      // Research = accuracy * 0.01 * researchBonus * allResourcesBonus
      // 100 * 0.01 * 1.5 * 1.0 = 1.5
      expect(gameState.resources.research.perSecond).toBe(1.5);
    });

    it('should be zero when accuracy is zero', () => {
      gameState.resources.accuracy.amount = 0;
      recalculateProduction(gameState);
      
      expect(gameState.resources.research.perSecond).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle buildings with no production', () => {
      gameState.buildings.emptyBuilding = {
        id: 'emptyBuilding',
        count: 5,
        production: {}
      };
      
      expect(() => recalculateProduction(gameState)).not.toThrow();
    });

    it('should handle missing achievement bonuses', () => {
      gameState.achievementBonuses = {};
      
      expect(() => recalculateProduction(gameState)).not.toThrow();
    });

    it('should produce consistent results on multiple calls', () => {
      recalculateProduction(gameState);
      const firstResult = gameState.resources.data.perSecond;
      
      recalculateProduction(gameState);
      const secondResult = gameState.resources.data.perSecond;
      
      expect(firstResult).toBe(secondResult);
    });
  });
});
