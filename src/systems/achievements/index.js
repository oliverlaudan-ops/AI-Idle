/**
 * Achievement System - Public API
 * Exports all achievement functionality
 */

export {
    achievements,
    initializeAchievements,
    getAchievementStats,
    initializeSmartPredictor,
    getSmartPredictor
} from './definitions.js';

export {
    checkAchievement,
    checkAndUnlockAchievements,
    getAchievementProgress
} from './checker.js';

export {
    applyAchievementReward,
    getAchievementBonus
} from './rewards.js';
