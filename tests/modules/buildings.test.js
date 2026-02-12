import { describe, it, expect } from 'vitest';
import { buildings, getBuildingCost } from '../../src/modules/buildings.js';

describe('Buildings Module', () => {
  it('should export buildings object', () => {
    expect(buildings).toBeDefined();
    expect(typeof buildings).toBe('object');
  });

  it('should have building definitions', () => {
    expect(Object.keys(buildings).length).toBeGreaterThan(0);
  });

  it('should export getBuildingCost function', () => {
    expect(typeof getBuildingCost).toBe('function');
  });

  it('buildings should have required properties', () => {
    const firstBuilding = Object.values(buildings)[0];
    
    expect(firstBuilding).toHaveProperty('id');
    expect(firstBuilding).toHaveProperty('name');
    expect(firstBuilding).toHaveProperty('baseCost');
  });

  it('getBuildingCost should return cost object', () => {
    const building = { ...buildings.dataCenter, count: 0 };
    const cost = getBuildingCost(building);
    
    expect(cost).toBeDefined();
    expect(typeof cost).toBe('object');
  });
});
