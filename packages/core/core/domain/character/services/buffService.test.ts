import { BuffService } from './buffService';
import { Buff } from '../baseData/buffs';

describe('BuffService', () => {
  let service: BuffService;
  let mockBuff: Buff;
  let mockBuffs: Buff[];

  beforeEach(() => {
    service = new BuffService();
    mockBuff = {
      originName: 'Test Buff',
      originType: 'other',
      originUniqueId: '1',
      uniqueId: '1',
      name: 'Test Buff',
      description: 'Test Description',
      active: false
    };
    mockBuffs = [
      mockBuff,
      {
        originName: 'Another Buff',
        originType: 'other',
        originUniqueId: '2',
        uniqueId: '2',
        name: 'Another Buff',
        description: 'Another Description',
        active: true
      }
    ];
  });

  describe('isValidBuff', () => {
    it('should return true for valid buff', () => {
      const result = service.isValidBuff(mockBuff);
      expect(result).toBe(true);
    });

    it('should return false for buff with empty name', () => {
      const invalidBuff = { ...mockBuff, name: '' };
      const result = service.isValidBuff(invalidBuff);
      expect(result).toBe(false);
    });

    it('should return false for buff with empty description', () => {
      const invalidBuff = { ...mockBuff, description: '' };
      const result = service.isValidBuff(invalidBuff);
      expect(result).toBe(false);
    });
  });

  describe('toggleBuff', () => {
    it('should toggle buff active state', () => {
      const result = service.toggleBuff(mockBuffs, '1');
      
      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.value[0].active).toBe(true);
    });

    it('should return error for non-existent buff', () => {
      const result = service.toggleBuff(mockBuffs, 'nonexistent');
      
      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }
      expect(result.error).toBe('Buff not found');
    });
  });

  describe('addBuff', () => {
    it('should add new buff successfully', () => {
      const newBuff: Buff = {
        originName: 'New Buff',
        originType: 'other',
        originUniqueId: '3',
        uniqueId: '3',
        name: 'New Buff',
        description: 'New Description',
        active: false
      };
      const result = service.addBuff(mockBuffs, newBuff);
      
      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.value).toHaveLength(3);
      expect(result.value).toContainEqual(newBuff);
    });

    it('should handle adding to empty/null buffs array', () => {
      const result = service.addBuff(null as any, mockBuff);
      
      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.value).toHaveLength(1);
    });

    it('should reject invalid buff', () => {
      const invalidBuff = { ...mockBuff, name: '' };
      const result = service.addBuff(mockBuffs, invalidBuff);
      
      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }
      expect(result.error).toBe('Invalid buff');
    });

    it('should reject duplicate buff', () => {
      const result = service.addBuff(mockBuffs, mockBuff);
      
      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }
      expect(result.error).toBe('Buff already exists');
    });
  });

  describe('editBuff', () => {
    it('should edit existing buff', () => {
      const updatedBuff = { ...mockBuff, name: 'Updated Name' };
      const result = service.editBuff(mockBuffs, updatedBuff);
      
      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.value[0].name).toBe('Updated Name');
    });

    it('should reject invalid buff', () => {
      const invalidBuff = { ...mockBuff, name: '' };
      const result = service.editBuff(mockBuffs, invalidBuff);
      
      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }
      expect(result.error).toBe('Invalid buff');
    });
  });

  describe('deleteBuff', () => {
    it('should delete existing buff', () => {
      const result = service.deleteBuff(mockBuffs, '1');
      
      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.value).toHaveLength(1);
      expect(result.value[0].uniqueId).toBe('2');
    });

    it('should handle deleting non-existent buff', () => {
      const result = service.deleteBuff(mockBuffs, 'nonexistent');
      
      expect(result.success).toBe(false);
    });
  });
}); 