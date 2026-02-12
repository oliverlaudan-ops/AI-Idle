import { describe, it, expect } from 'vitest';
import { models } from '../../src/modules/models.js';

describe('Models Module', () => {
  it('should export models object', () => {
    expect(models).toBeDefined();
    expect(typeof models).toBe('object');
  });

  it('should have model definitions', () => {
    expect(Object.keys(models).length).toBeGreaterThan(0);
  });

  it('models should have required properties', () => {
    const firstModel = Object.values(models)[0];
    
    expect(firstModel).toHaveProperty('id');
    expect(firstModel).toHaveProperty('name');
    expect(firstModel).toHaveProperty('trainingTime');
    expect(firstModel).toHaveProperty('requirements');
  });

  it('models should have positive training times', () => {
    for (const model of Object.values(models)) {
      expect(model.trainingTime).toBeGreaterThan(0);
    }
  });
});
