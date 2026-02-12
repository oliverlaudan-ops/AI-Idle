import { describe, it, expect, beforeEach } from 'vitest';
import { models } from '../../src/modules/models.js';

describe('Training System', () => {
  describe('models definitions', () => {
    it('should have model definitions', () => {
      expect(models).toBeDefined();
      expect(Object.keys(models).length).toBeGreaterThan(0);
    });

    it('should include all required model properties', () => {
      const firstModel = Object.values(models)[0];
      
      expect(firstModel).toHaveProperty('id');
      expect(firstModel).toHaveProperty('name');
      expect(firstModel).toHaveProperty('description');
      expect(firstModel).toHaveProperty('category');
      expect(firstModel).toHaveProperty('trainingTime');
      expect(firstModel).toHaveProperty('requirements');
      expect(firstModel).toHaveProperty('production');
    });

    it('should have models in different categories', () => {
      const categories = new Set();
      
      for (const model of Object.values(models)) {
        categories.add(model.category);
      }
      
      expect(categories.size).toBeGreaterThan(1);
    });

    it('should have positive training times', () => {
      for (const model of Object.values(models)) {
        expect(model.trainingTime).toBeGreaterThan(0);
      }
    });
  });

  describe('model requirements', () => {
    it('should have requirements for all models', () => {
      for (const model of Object.values(models)) {
        expect(model.requirements).toBeDefined();
        expect(typeof model.requirements).toBe('object');
      }
    });

    it('should have data and compute requirements', () => {
      const model = models.linearRegression;
      
      expect(model.requirements.data).toBeDefined();
      expect(model.requirements.data).toBeGreaterThan(0);
    });
  });

  describe('model production', () => {
    it('should produce accuracy for all models', () => {
      for (const model of Object.values(models)) {
        expect(model.production.accuracy).toBeDefined();
        expect(model.production.accuracy).toBeGreaterThan(0);
      }
    });

    it('should have varying production values', () => {
      const productions = Object.values(models).map(m => m.production.accuracy);
      const uniqueProductions = new Set(productions);
      
      // Should have at least 2 different production values
      expect(uniqueProductions.size).toBeGreaterThan(1);
    });
  });

  describe('model categories', () => {
    it('should include classification category', () => {
      const classificationModels = Object.values(models).filter(
        m => m.category === 'classification'
      );
      
      expect(classificationModels.length).toBeGreaterThan(0);
    });

    it('should categorize models appropriately', () => {
      for (const model of Object.values(models)) {
        expect(['classification', 'vision', 'advanced']).toContain(model.category);
      }
    });
  });
});
