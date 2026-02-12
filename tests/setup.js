// Test setup file
// This runs before all tests

// Mock localStorage for tests
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Reset localStorage before each test
import { beforeEach } from 'vitest';

beforeEach(() => {
  global.localStorage.clear();
});
