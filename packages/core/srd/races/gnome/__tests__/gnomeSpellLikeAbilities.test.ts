import { describe, it, expect } from 'bun:test';
import { validateCGEConfig } from '../../../../core/domain/cge/types';
import {
  gnomeSLACGEConfig,
  gnomeSpellLikeAbilities,
  gnomeSpellLikeAbilitiesTrait,
  gnomeDancingLights,
  gnomeGhostSound,
  gnomePrestidigitation,
  gnomeSpeakWithAnimals,
} from '../gnomeSpellLikeAbilities';

describe('Gnome Spell-Like Abilities', () => {
  describe('CGE Config', () => {
    it('should pass validation', () => {
      const errors = validateCGEConfig(gnomeSLACGEConfig);
      expect(errors).toEqual([]);
    });

    it('should use spellLikeAbility entity type', () => {
      expect(gnomeSLACGEConfig.entityType).toBe('spellLikeAbility');
    });

    it('should use NONE resource (per-entity tracking)', () => {
      expect(gnomeSLACGEConfig.tracks[0].resource.type).toBe('NONE');
    });

    it('should use NONE preparation (always available)', () => {
      expect(gnomeSLACGEConfig.tracks[0].preparation.type).toBe('NONE');
    });

    it('should use gnome as classId', () => {
      expect(gnomeSLACGEConfig.classId).toBe('gnome');
    });

    it('should not have known config (fixed entities from providers)', () => {
      expect(gnomeSLACGEConfig.known).toBeUndefined();
    });
  });

  describe('SLA Entities', () => {
    it('should have 4 gnome SLAs', () => {
      expect(gnomeSpellLikeAbilities).toHaveLength(4);
    });

    it('all SLAs should be spellLikeAbility type', () => {
      for (const sla of gnomeSpellLikeAbilities) {
        expect(sla.entityType).toBe('spellLikeAbility');
      }
    });

    it('all SLAs should have 1 use per day', () => {
      for (const sla of gnomeSpellLikeAbilities) {
        expect((sla as any).usesPerDay).toBe(1);
      }
    });

    it('all SLAs should have caster level 1', () => {
      for (const sla of gnomeSpellLikeAbilities) {
        expect((sla as any).casterLevel).toBe('1');
      }
    });

    it('dancing lights should reference a spell', () => {
      expect((gnomeDancingLights as any).spellReference).toEqual(['dancing-lights']);
    });

    it('ghost sound should reference a spell', () => {
      expect((gnomeGhostSound as any).spellReference).toEqual(['ghost-sound']);
    });

    it('prestidigitation should reference a spell', () => {
      expect((gnomePrestidigitation as any).spellReference).toEqual(['prestidigitation']);
    });

    it('speak with animals should reference a spell', () => {
      expect((gnomeSpeakWithAnimals as any).spellReference).toEqual(['speak-with-animals']);
    });

    it('SLAs with save DCs should use Charisma', () => {
      expect((gnomeDancingLights as any).saveDCAbility).toBe('charisma');
      expect((gnomeGhostSound as any).saveDCAbility).toBe('charisma');
    });

    it('all SLAs should have gnome and racial tags', () => {
      for (const sla of gnomeSpellLikeAbilities) {
        expect(sla.tags).toContain('gnome');
        expect(sla.tags).toContain('racial');
        expect(sla.tags).toContain('sla');
      }
    });
  });

  describe('Racial Trait', () => {
    it('should be a classFeature entity', () => {
      expect(gnomeSpellLikeAbilitiesTrait.entityType).toBe('classFeature');
    });

    it('should have CGE_DEFINITION in legacy_specialChanges', () => {
      const specialChanges = (gnomeSpellLikeAbilitiesTrait as any).legacy_specialChanges;
      expect(specialChanges).toHaveLength(1);
      expect(specialChanges[0].type).toBe('CGE_DEFINITION');
      expect(specialChanges[0].config).toBe(gnomeSLACGEConfig);
    });

    it('should have racial and gnome tags', () => {
      expect(gnomeSpellLikeAbilitiesTrait.tags).toContain('racial');
      expect(gnomeSpellLikeAbilitiesTrait.tags).toContain('gnome');
    });
  });

  describe('CGE Pattern Documentation', () => {
    /**
     * This test documents how a race entity would configure its SLAs:
     *
     * 1. The race entity (e.g., "gnome") has a levels/providers section that:
     *    a) Grants the racial trait classFeature "gnome-spell-like-abilities"
     *       (which defines the CGE via legacy_specialChanges)
     *    b) Grants individual SLA entities via specificIds
     *
     * 2. The classFeature "gnome-spell-like-abilities" contains:
     *    - CGE_DEFINITION special change with a minimal CGE config
     *    - NONE resource + NONE preparation (simplest pattern)
     *
     * 3. Each SLA entity (spellLikeAbility type) has:
     *    - usesPerDay: tracks at entity level (0 = at-will)
     *    - spellReference: links to the spell it mimics
     *    - casterLevel: formula for CL (can be "@totalHD", "@ecl", or fixed)
     *    - saveDCAbility: which ability score for save DC
     *
     * Example race provider configuration:
     * ```
     * gnomeRace.levels = {
     *   '0': {
     *     providers: [
     *       { granted: { specificIds: ['gnome-spell-like-abilities'] } },
     *       { granted: { specificIds: [
     *         'gnome-sla-dancing-lights',
     *         'gnome-sla-ghost-sound',
     *         'gnome-sla-prestidigitation',
     *         'gnome-sla-speak-with-animals',
     *       ] } },
     *     ],
     *   },
     * }
     * ```
     */
    it('should demonstrate valid CGE pattern for racial SLAs', () => {
      // The pattern: race grants trait (with CGE) + individual SLA entities
      // CGE groups them in the UI, each SLA tracks its own uses/day
      expect(gnomeSLACGEConfig.id).toBe('gnome-sla');
      expect(gnomeSLACGEConfig.tracks).toHaveLength(1);
      expect(gnomeSLACGEConfig.tracks[0].resource.type).toBe('NONE');
      expect(gnomeSLACGEConfig.tracks[0].preparation.type).toBe('NONE');

      // SLA entities are separate from the trait
      expect(gnomeSpellLikeAbilities.every(e => e.id !== gnomeSpellLikeAbilitiesTrait.id)).toBe(true);
    });
  });
});
