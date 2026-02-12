import { describe, it, expect, beforeEach } from 'vitest';
import { buildings } from '../../src/modules/buildings.js';
import { getBuildingCost } from '../../src/modules/buildings.js';

describe('Building System', () => {
  describe('buildings definitions', () => {
    it('should have building definitions', () => {
      expect(buildings).toBeDefined();
      expect(Object.keys(buildings).length).toBeGreaterThan(0);
    });

    it('should include all required building properties', () => {
      const firstBuilding = Object.values(buildings)[0];
      
      expect(firstBuilding).toHaveProperty('id');
      expect(firstBuilding).toHaveProperty('name');
      expect(firstBuilding).toHaveProperty('description');
      expect(firstBuilding).toHaveProperty('tier');
      expect(firstBuilding).toHaveProperty('baseCost');
      expect(firstBuilding).toHaveProperty('production');
    });

    it('should have buildings in multiple tiers', () => {
      const tiers = new Set();
      
      for (const building of Object.values(buildings)) {
        tiers.add(building.tier);
      }
      
      expect(tiers.size).toBeGreaterThan(1);
    });

    it('should have buildings that produce resources', () => {
      const producedResources = new Set();
      
      for (const building of Object.values(buildings)) {
        for (const resourceId of Object.keys(building.production)) {
          producedResources.add(resourceId);
        }
      }
      
      expect(producedResources.size).toBeGreaterThan(0);
    });
  });

  describe('getBuildingCost', () => {
    it('should return cost object', () => {
      const building = {
        ...buildings.dataCenter,
        count: 0
      };
      
      const cost = getBuildingCost(building);
      
      expect(cost).toBeDefined();
      expect(typeof cost).toBe('object');
    });

    it('should scale cost with count', () => {
      const building = {
        ...buildings.dataCenter,
        count: 0
      };
      
      const baseCost = getBuildingCost(building);
      
      building.count = 5;
      const scaledCost = getBuildingCost(building);
      
      // Cost should increase
      for (const [resourceId, amount] of Object.entries(scaledCost)) {
        if (baseCost[resourceId]) {
          expect(amount).toBeGreaterThan(baseCost[resourceId]);
        }
      }
    });

    it('should handle very high building counts', () => {
      const building = {
        ...buildings.dataCenter,
        count: 100
      };
      
      const cost = getBuildingCost(building);
      
      // Cost should be high but not infinite
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
  });
});
