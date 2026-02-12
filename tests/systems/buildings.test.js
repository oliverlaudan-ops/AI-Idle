import { describe, it, expect, beforeEach } from 'vitest';
import { initializeBuildings, getBuildingCost } from '../../src/systems/buildings/index.js';

describe('Building System', () => {
  let buildings;

  beforeEach(() => {
    buildings = initializeBuildings();
  });

  describe('initializeBuildings', () => {
    it('should initialize all buildings with count 0', () => {
      for (const building of Object.values(buildings)) {
        expect(building.count).toBe(0);
      }
    });

    it('should have tier 1 buildings unlocked', () => {
      const tier1Buildings = Object.values(buildings).filter(b => b.tier === 1);
      
      for (const building of tier1Buildings) {
        expect(building.unlocked).toBe(true);
      }
    });

    it('should have tier 2 and 3 buildings locked initially', () => {
      const higherTierBuildings = Object.values(buildings).filter(b => b.tier > 1);
      
      for (const building of higherTierBuildings) {
        expect(building.unlocked).toBe(false);
      }
    });

    it('should include all required building properties', () => {
      const firstBuilding = Object.values(buildings)[0];
      
      expect(firstBuilding).toHaveProperty('id');
      expect(firstBuilding).toHaveProperty('name');
      expect(firstBuilding).toHaveProperty('description');
      expect(firstBuilding).toHaveProperty('icon');
      expect(firstBuilding).toHaveProperty('tier');
      expect(firstBuilding).toHaveProperty('baseCost');
      expect(firstBuilding).toHaveProperty('costMultiplier');
      expect(firstBuilding).toHaveProperty('production');
      expect(firstBuilding).toHaveProperty('count');
      expect(firstBuilding).toHaveProperty('unlocked');
    });

    it('should have buildings in all 3 tiers', () => {
      const tiers = new Set();
      
      for (const building of Object.values(buildings)) {
        tiers.add(building.tier);
      }
      
      expect(tiers.has(1)).toBe(true);
      expect(tiers.has(2)).toBe(true);
      expect(tiers.has(3)).toBe(true);
    });

    it('should have buildings that produce different resources', () => {
      const producedResources = new Set();
      
      for (const building of Object.values(buildings)) {
        for (const resourceId of Object.keys(building.production)) {
          producedResources.add(resourceId);
        }
      }
      
      expect(producedResources.size).toBeGreaterThan(1);
    });
  });

  describe('getBuildingCost', () => {
    it('should return base cost for first building', () => {
      const building = buildings.dataCenter;
      building.count = 0;
      
      const cost = getBuildingCost(building);
      
      expect(cost).toEqual(building.baseCost);
    });

    it('should scale cost with count', () => {
      const building = buildings.dataCenter;
      building.count = 0;
      
      const baseCost = getBuildingCost(building);
      
      building.count = 5;
      const scaledCost = getBuildingCost(building);
      
      // Cost should increase
      for (const [resourceId, amount] of Object.entries(scaledCost)) {
        expect(amount).toBeGreaterThan(baseCost[resourceId]);
      }
    });

    it('should use cost multiplier for scaling', () => {
      const building = buildings.dataCenter;
      const multiplier = building.costMultiplier;
      
      building.count = 1;
      const cost1 = getBuildingCost(building);
      
      building.count = 2;
      const cost2 = getBuildingCost(building);
      
      // Check that costs scale by multiplier
      for (const [resourceId, amount2] of Object.entries(cost2)) {
        const amount1 = cost1[resourceId];
        const expectedRatio = Math.pow(multiplier, 1); // One count difference
        const actualRatio = amount2 / amount1;
        
        expect(actualRatio).toBeCloseTo(multiplier, 2);
      }
    });

    it('should handle buildings with multiple cost resources', () => {
      // Find a building with multiple costs
      const building = Object.values(buildings).find(
        b => Object.keys(b.baseCost).length > 1
      );
      
      if (building) {
        const cost = getBuildingCost(building);
        expect(Object.keys(cost).length).toBeGreaterThan(1);
      }
    });

    it('should return increasing costs for multiple purchases', () => {
      const building = buildings.dataCenter;
      const costs = [];
      
      for (let i = 0; i < 5; i++) {
        building.count = i;
        costs.push(getBuildingCost(building));
      }
      
      // Each cost should be higher than the previous
      for (let i = 1; i < costs.length; i++) {
        const prevCost = costs[i - 1];
        const currentCost = costs[i];
        
        for (const [resourceId, amount] of Object.entries(currentCost)) {
          expect(amount).toBeGreaterThan(prevCost[resourceId]);
        }
      }
    });

    it('should handle very high building counts', () => {
      const building = buildings.dataCenter;
      building.count = 1000;
      
      const cost = getBuildingCost(building);
      
      // Cost should be extremely high but not infinite
      for (const amount of Object.values(cost)) {
        expect(amount).toBeGreaterThan(0);
        expect(amount).toBeLessThan(Infinity);
        expect(isFinite(amount)).toBe(true);
      }
    });
  });

  describe('building production', () => {
    it('should have positive production values', () => {
      for (const building of Object.values(buildings)) {
        for (const amount of Object.values(building.production)) {
          expect(amount).toBeGreaterThan(0);
        }
      }
    });

    it('should have different production rates per tier', () => {
      const tier1Avg = Object.values(buildings)
        .filter(b => b.tier === 1)
        .flatMap(b => Object.values(b.production))
        .reduce((a, b) => a + b, 0);
      
      const tier3Avg = Object.values(buildings)
        .filter(b => b.tier === 3)
        .flatMap(b => Object.values(b.production))
        .reduce((a, b) => a + b, 0);
      
      // Higher tier buildings should generally produce more
      expect(tier3Avg).toBeGreaterThan(tier1Avg);
    });
  });

  describe('unlock requirements', () => {
    it('should have unlock requirements for higher tier buildings', () => {
      const tier2Buildings = Object.values(buildings).filter(b => b.tier === 2);
      
      for (const building of tier2Buildings) {
        expect(building.unlockRequirement).toBeDefined();
        expect(Object.keys(building.unlockRequirement).length).toBeGreaterThan(0);
      }
    });
  });
});
