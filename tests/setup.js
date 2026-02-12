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

// Add btoa/atob for Node.js (needed for save-system tests)
if (typeof btoa === 'undefined') {
  global.btoa = (str) => Buffer.from(str, 'utf-8').toString('base64');
}

if (typeof atob === 'undefined') {
  global.atob = (str) => Buffer.from(str, 'base64').toString('utf-8');
}

// Reset localStorage before each test
import { beforeEach } from 'vitest';

beforeEach(() => {
  global.localStorage.clear();
});
