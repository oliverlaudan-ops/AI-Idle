import { describe, it, expect } from 'vitest';

// Ultra-simple test to verify Vitest works
describe('Basic Tests', () => {
  it('should pass basic math test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should pass string test', () => {
    expect('hello').toBe('hello');
  });

  it('should pass array test', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
  });

  it('should pass object test', () => {
    const obj = { name: 'test' };
    expect(obj.name).toBe('test');
  });
});
