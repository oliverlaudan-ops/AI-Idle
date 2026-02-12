import { describe, it, expect, beforeEach } from 'vitest';
import { initializeModels, TrainingQueue } from '../../src/systems/training/index.js';

describe('Training System', () => {
  let models;
  let gameState;
  let trainingQueue;

  beforeEach(() => {
    models = initializeModels();
    gameState = {
      models: initializeModels(),
      resources: {
        data: { amount: 1000 },
        compute: { amount: 100 },
        accuracy: { amount: 0 }
      },
      currentTraining: null,
      trainingProgress: 0,
      training: null,
      startTraining: function(modelId) {
        const model = this.models[modelId];
        if (!model || !model.unlocked) return false;
        
        this.currentTraining = modelId;
        this.trainingProgress = 0;
        this.training = {
          modelId: modelId,
          elapsedTime: 0,
          duration: model.trainingTime
        };
        return true;
      },
      stopTraining: function() {
        this.currentTraining = null;
        this.trainingProgress = 0;
        this.training = null;
      }
    };
    trainingQueue = new TrainingQueue(gameState);
  });

  describe('initializeModels', () => {
    it('should initialize all models as locked except starter models', () => {
      const lockedModels = Object.values(models).filter(m => !m.unlocked);
      expect(lockedModels.length).toBeGreaterThan(0);
    });

    it('should have at least one unlocked model', () => {
      const unlockedModels = Object.values(models).filter(m => m.unlocked);
      expect(unlockedModels.length).toBeGreaterThan(0);
    });

    it('should include all required model properties', () => {
      const firstModel = Object.values(models)[0];
      
      expect(firstModel).toHaveProperty('id');
      expect(firstModel).toHaveProperty('name');
      expect(firstModel).toHaveProperty('description');
      expect(firstModel).toHaveProperty('icon');
      expect(firstModel).toHaveProperty('category');
      expect(firstModel).toHaveProperty('trainingTime');
      expect(firstModel).toHaveProperty('requirements');
      expect(firstModel).toHaveProperty('production');
      expect(firstModel).toHaveProperty('unlocked');
    });

    it('should have models in different categories', () => {
      const categories = new Set();
      
      for (const model of Object.values(models)) {
        categories.add(model.category);
      }
      
      expect(categories.size).toBeGreaterThan(1);
      expect(categories.has('classification')).toBe(true);
    });

    it('should have increasing training times for advanced models', () => {
      const simpleModel = models.linearRegression;
      const advancedModels = Object.values(models).filter(
        m => m.category === 'advanced'
      );
      
      if (advancedModels.length > 0) {
        const advancedModel = advancedModels[0];
        expect(advancedModel.trainingTime).toBeGreaterThan(simpleModel.trainingTime);
      }
    });
  });

  describe('TrainingQueue', () => {
    it('should initialize with empty queue', () => {
      expect(trainingQueue.queue).toEqual([]);
      expect(trainingQueue.isEnabled()).toBe(false);
    });

    it('should enable queue', () => {
      trainingQueue.enable();
      expect(trainingQueue.isEnabled()).toBe(true);
    });

    it('should add models to queue', () => {
      trainingQueue.enable();
      trainingQueue.addToQueue('linearRegression');
      
      expect(trainingQueue.queue.length).toBe(1);
      expect(trainingQueue.queue[0]).toBe('linearRegression');
    });

    it('should not add to queue when disabled', () => {
      trainingQueue.addToQueue('linearRegression');
      expect(trainingQueue.queue.length).toBe(0);
    });

    it('should remove models from queue', () => {
      trainingQueue.enable();
      trainingQueue.addToQueue('linearRegression');
      trainingQueue.addToQueue('logisticRegression');
      
      trainingQueue.removeFromQueue(0);
      
      expect(trainingQueue.queue.length).toBe(1);
      expect(trainingQueue.queue[0]).toBe('logisticRegression');
    });

    it('should clear entire queue', () => {
      trainingQueue.enable();
      trainingQueue.addToQueue('linearRegression');
      trainingQueue.addToQueue('logisticRegression');
      
      trainingQueue.clearQueue();
      
      expect(trainingQueue.queue.length).toBe(0);
    });

    it('should process queue on training completion', () => {
      trainingQueue.enable();
      trainingQueue.addToQueue('linearRegression');
      
      // Start training manually
      gameState.startTraining('logisticRegression');
      expect(gameState.currentTraining).toBe('logisticRegression');
      
      // Complete training (simulated by onTrainingComplete)
      gameState.stopTraining();
      trainingQueue.onTrainingComplete();
      
      // Queue should process next model
      expect(gameState.currentTraining).toBe('linearRegression');
    });

    it('should handle empty queue gracefully', () => {
      trainingQueue.enable();
      expect(() => trainingQueue.onTrainingComplete()).not.toThrow();
    });

    it('should maintain queue order', () => {
      trainingQueue.enable();
      trainingQueue.addToQueue('linearRegression');
      trainingQueue.addToQueue('logisticRegression');
      trainingQueue.addToQueue('decisionTree');
      
      expect(trainingQueue.queue[0]).toBe('linearRegression');
      expect(trainingQueue.queue[1]).toBe('logisticRegression');
      expect(trainingQueue.queue[2]).toBe('decisionTree');
    });

    it('should remove from queue when training starts', () => {
      trainingQueue.enable();
      trainingQueue.addToQueue('linearRegression');
      trainingQueue.addToQueue('logisticRegression');
      
      gameState.stopTraining();
      trainingQueue.onTrainingComplete();
      
      // First model should be removed from queue
      expect(trainingQueue.queue.length).toBe(1);
      expect(trainingQueue.queue[0]).toBe('logisticRegression');
    });
  });

  describe('model requirements', () => {
    it('should have requirements for all models', () => {
      for (const model of Object.values(models)) {
        expect(model.requirements).toBeDefined();
        expect(typeof model.requirements).toBe('object');
      }
    });

    it('should have increasing requirements for advanced models', () => {
      const simpleModel = models.linearRegression;
      const advancedModels = Object.values(models).filter(
        m => m.category === 'advanced'
      );
      
      if (advancedModels.length > 0) {
        const advancedModel = advancedModels[0];
        const simpleReqSum = Object.values(simpleModel.requirements).reduce((a, b) => a + b, 0);
        const advancedReqSum = Object.values(advancedModel.requirements).reduce((a, b) => a + b, 0);
        
        expect(advancedReqSum).toBeGreaterThan(simpleReqSum);
      }
    });
  });

  describe('model production', () => {
    it('should produce accuracy for all models', () => {
      for (const model of Object.values(models)) {
        expect(model.production.accuracy).toBeDefined();
        expect(model.production.accuracy).toBeGreaterThan(0);
      }
    });

    it('should have higher production for advanced models', () => {
      const simpleModel = models.linearRegression;
      const advancedModels = Object.values(models).filter(
        m => m.category === 'advanced'
      );
      
      if (advancedModels.length > 0) {
        const advancedModel = advancedModels[0];
        expect(advancedModel.production.accuracy).toBeGreaterThan(
          simpleModel.production.accuracy
        );
      }
    });
  });
});
