import { describe, it, expect, beforeEach } from 'vitest';
import { initializeAchievements, checkAndUnlockAchievements } from '../../src/systems/achievements/index.js';

describe('Achievement System', () => {
  let gameState;

  beforeEach(() => {
    gameState = {
      achievements: initializeAchievements(),
      resources: {
        data: { amount: 0 },
        compute: { amount: 0 },
        accuracy: { amount: 0 },
        research: { amount: 0 }
      },
      buildings: {
        dataCenter: { count: 0 },
        computeCluster: { count: 0 }
      },
      stats: {
        manualClicks: 0,
        totalDataGenerated: 0,
        modelsTrained: 0,
        totalBuildings: 0,
        completedResearch: []
      },
      achievementBonuses: {
        dataGeneration: 1,
        allProduction: 1,
        trainingSpeed: 1,
        modelPerformance: 1,
        computePower: 1,
        allResources: 1,
        buildingCostReduction: 0,
        globalMultiplier: 1,
        deploymentTokens: 1,
        permanentAccuracy: 1,
        researchPoints: 1,
        manualCollection: 1
      },
      deployment: {
        lifetimeStats: {
          achievements: []
        }
      }
    };
  });

  describe('initializeAchievements', () => {
    it('should initialize all achievements as locked', () => {
      const achievements = initializeAchievements();
      
      for (const achievement of Object.values(achievements)) {
        expect(achievement.unlocked).toBe(false);
      }
    });

    it('should include all required achievement properties', () => {
      const achievements = initializeAchievements();
      const firstAchievement = Object.values(achievements)[0];
      
      expect(firstAchievement).toHaveProperty('id');
      expect(firstAchievement).toHaveProperty('name');
      expect(firstAchievement).toHaveProperty('description');
      expect(firstAchievement).toHaveProperty('icon');
      expect(firstAchievement).toHaveProperty('category');
    });

    it('should have training, research and infrastructure categories', () => {
      const achievements = initializeAchievements();
      const categories = new Set();
      
      for (const achievement of Object.values(achievements)) {
        categories.add(achievement.category);
      }
      
      expect(categories.has('training')).toBe(true);
      expect(categories.has('research')).toBe(true);
      expect(categories.has('infrastructure')).toBe(true);
    });
  });

  describe('checkAndUnlockAchievements', () => {
    it('should unlock first click achievement', () => {
      gameState.stats.manualClicks = 1;
      
      const unlocked = checkAndUnlockAchievements(gameState);
      
      expect(unlocked.length).toBeGreaterThan(0);
      expect(gameState.achievements.firstClick.unlocked).toBe(true);
    });

    it('should not unlock achievements when conditions are not met', () => {
      gameState.stats.manualClicks = 0;
      
      const unlocked = checkAndUnlockAchievements(gameState);
      
      expect(gameState.achievements.firstClick.unlocked).toBe(false);
    });

    it('should apply achievement bonuses when unlocked', () => {
      gameState.stats.manualClicks = 1;
      const initialBonus = gameState.achievementBonuses.manualCollection;
      
      checkAndUnlockAchievements(gameState);
      
      // First click achievement should increase manual collection bonus
      expect(gameState.achievementBonuses.manualCollection).toBeGreaterThan(initialBonus);
    });

    it('should not unlock same achievement twice', () => {
      gameState.stats.manualClicks = 1;
      
      const firstUnlock = checkAndUnlockAchievements(gameState);
      const secondUnlock = checkAndUnlockAchievements(gameState);
      
      expect(firstUnlock.length).toBeGreaterThan(0);
      expect(secondUnlock.length).toBe(0);
    });

    it('should return array of newly unlocked achievements', () => {
      gameState.stats.manualClicks = 1;
      
      const unlocked = checkAndUnlockAchievements(gameState);
      
      expect(Array.isArray(unlocked)).toBe(true);
      expect(unlocked.length).toBeGreaterThan(0);
      expect(unlocked[0]).toHaveProperty('id');
      expect(unlocked[0]).toHaveProperty('name');
    });
  });
});
