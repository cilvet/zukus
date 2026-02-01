import { describe, it, expect } from 'bun:test';
import { calculatePoolCost } from '../poolOperations';

describe('calculatePoolCost', () => {
  describe('with @entity.level costPath', () => {
    it('should return entity level as cost', () => {
      const entity = { level: 3, name: 'Mind Thrust' };
      const cost = calculatePoolCost('@entity.level', entity);
      expect(cost).toBe(3);
    });

    it('should use level 1 as minimum', () => {
      const entity = { level: 0, name: 'Cantrip' };
      const cost = calculatePoolCost('@entity.level', entity);
      expect(cost).toBe(1);
    });
  });

  describe('with @entity.powerPoints costPath', () => {
    it('should return powerPoints as cost', () => {
      const entity = { level: 2, powerPoints: 5, name: 'Energy Ray' };
      const cost = calculatePoolCost('@entity.powerPoints', entity);
      expect(cost).toBe(5);
    });
  });

  describe('with undefined costPath', () => {
    it('should default to @entity.level', () => {
      const entity = { level: 4, name: 'Ego Whip' };
      const cost = calculatePoolCost(undefined, entity);
      expect(cost).toBe(4);
    });
  });

  describe('with missing entity property', () => {
    it('should return 1 when property does not exist', () => {
      const entity = { name: 'Unknown Power' };
      const cost = calculatePoolCost('@entity.level', entity);
      expect(cost).toBe(1); // 0 from missing prop -> minimum 1
    });
  });

  describe('with complex formula', () => {
    it('should handle multiplication', () => {
      const entity = { level: 3 };
      const cost = calculatePoolCost('@entity.level * 2', entity);
      expect(cost).toBe(6);
    });

    it('should handle addition', () => {
      const entity = { level: 2, bonus: 1 };
      const cost = calculatePoolCost('@entity.level + @entity.bonus', entity);
      expect(cost).toBe(3);
    });
  });
});
