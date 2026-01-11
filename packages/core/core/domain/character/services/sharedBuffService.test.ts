import { SharedBuffService } from './sharedBuffService';
import { Buff } from '../baseData/buffs';

describe('SharedBuffService', () => {
  let service: SharedBuffService;
  let characterSharedBuffs: Buff[];
  let sharedBuffs: Buff[];

  beforeEach(() => {
    service = new SharedBuffService();
    sharedBuffs = [
      {
        originName: 'Shared Buff 1',
        originType: 'other',
        originUniqueId: '1',
        uniqueId: '1',
        name: 'Shared Buff 1',
        description: 'Description 1',
        active: false
      },
      {
        originName: 'Shared Buff 2',
        originType: 'other',
        originUniqueId: '2',
        uniqueId: '2',
        name: 'Shared Buff 2',
        description: 'Description 2',
        active: false
      }
    ];
    characterSharedBuffs = [
      {
        originName: 'Shared Buff 1',
        originType: 'other',
        originUniqueId: '1',
        uniqueId: '1',
        name: 'Shared Buff 1',
        description: 'Description 1',
        active: true
      }
    ];
  });

  describe('toggleSharedBuff', () => {
    it('should add inactive shared buff to character', () => {
      const result = service.toggleSharedBuff(characterSharedBuffs, sharedBuffs, '2');
      
      expect(result.success).toBe(true);
      if(!result.success) {
        return;
      }
      expect(result.value).toHaveLength(2);
      expect(result.value).toContainEqual({
        ...sharedBuffs[1],
        active: true
      });
    });

    it('should remove active shared buff from character', () => {
      const result = service.toggleSharedBuff(characterSharedBuffs, sharedBuffs, '1');
      
      expect(result.success).toBe(true);
      if(!result.success) {
        return;
      }
      expect(result.value).toHaveLength(0);
    });

    it('should return error for non-existent buff', () => {
      const result = service.toggleSharedBuff(characterSharedBuffs, sharedBuffs, 'nonexistent');
      
      expect(result.success).toBe(false);
      if(result.success) {
        return;
      }
      expect(result.error).toBe('Shared buff not found');
    });

    it('should maintain active state for remaining buffs', () => {
      const withTwoBuffs = service.toggleSharedBuff(characterSharedBuffs, sharedBuffs, '2');
      if(!withTwoBuffs.success) {
        throw new Error('Failed to add two buffs');
      }
      const result = service.toggleSharedBuff(withTwoBuffs.value, sharedBuffs, '1');
        
      expect(result.success).toBe(true);
      if(!result.success) {
        return;
      }
      expect(result.value).toHaveLength(1);
      expect(result.value[0].active).toBe(true);
    });
  });
}); 