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
        }
      },
      models: {},
      training: null,
      currentTraining: null,
      achievementBonuses: {
        dataGeneration: 1.5,
        allProduction: 1.2,
        computePower: 1.0,
        allResources: 1.0,
        researchPoints: 1.0
      }
    };
  });

  it('should calculate building production correctly', () => {
    recalculateProduction(gameState);
    
    // Should have some production
    expect(gameState.resources.data.perSecond).toBeGreaterThan(0);
  });

  it('should reset production to zero before calculation', () => {
    gameState.resources.data.perSecond = 999;
    recalculateProduction(gameState);
    
    // Should be recalculated, not 999
    expect(gameState.resources.data.perSecond).not.toBe(999);
  });

  it('should handle zero buildings', () => {
    gameState.buildings.dataCenter.count = 0;
    recalculateProduction(gameState);
    
    expect(gameState.resources.data.perSecond).toBe(0);
  });
});
