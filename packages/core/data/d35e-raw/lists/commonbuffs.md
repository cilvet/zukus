# Commonbuffs

**Total:** 37 items

## Legend

| Icon | Name | Count | Description |
|------|------|-------|-------------|
| [Changes] | Changes | 37 | Stat modifiers (ability, AC, attack, damage, saves, skills, speed) |
| [Context Notes] | Context Notes | 5 | Situational bonuses or conditional notes |

---

## Items

- **Aid** [Changes] [Context Notes]
  - Changes: 1 attack.attack (morale); @item.level misc.mhp (untyped)
  - Context Notes: +[[1]] Morale vs Fear effects
- **Augmented Summon** [Changes]
  - Changes: 4 ability.con (enh); 4 ability.str (enh)
- **Bane** [Changes] [Context Notes]
  - Changes: -1 attack.attack (untyped)
  - Context Notes: -[[1]] vs Fear effects
- **Barkskin** [Changes]
  - Changes: min(5, 2 + max(0, floor((@item.level - 3) / 3))) ac.nac (enh)
- **Bear's Endurance** [Changes]
  - Changes: 4 ability.con (enh)
- **Bless** [Changes] [Context Notes]
  - Changes: 1 attack.attack (morale)
  - Context Notes: +[[1]] Morale vs Fear effects
- **Bull's Strength** [Changes]
  - Changes: 4 ability.str (enh)
- **Burst** [Changes]
  - Changes: (@item.level*10) speed.allSpeeds (competence)
- **Cat's Grace** [Changes]
  - Changes: 4 ability.dex (enh)
- **Defensive Stance** [Changes]
  - Changes: 2 ability.str (untyped); 4 ability.con (untyped); 2 savingThrows.allSavingThrows (untyped); 4 ac.ac (dodge)
- **Defensive Stance Winded** [Changes]
  - Changes: -2 ability.str (penalty)
- **Divine Favor** [Changes]
  - Changes: min(3, 1 + floor(@item.level / 3)) attack.attack (luck); min(3, 1 + floor(@item.level / 3)) damage.wdamage (luck)
- **Eagle's Splendor** [Changes]
  - Changes: 4 ability.cha (enh)
- **Enraged** [Changes]
  - Changes: -2 ac.ac (untyped); 2+@item.level*2 ability.str (untyped); 2+@item.level*2 ability.con (untyped); 1+@item.level savingThrows.will (untyped)
- **Fatigue** [Changes]
  - Changes: -2 ability.str (circumstance); -2 ability.dex (circumstance)
- **Fox's Cunning** [Changes]
  - Changes: 4 ability.int (enh)
- **Guidance - Attack Bonus** [Changes]
  - Changes: 1 attack.attack (competence)
- **Guidance - Save Bonus** [Changes]
  - Changes: 1 savingThrows.allSavingThrows (competence)
- **Guidance - Skill Bonus** [Changes]
  - Changes: 1 savingThrows.allSavingThrows (competence)
- **Haste** [Changes]
  - Changes: 1 attack.attack (untyped); 1 ac.ac (dodge); 1 savingThrows.ref (untyped)
- **Heroism** [Changes]
  - Changes: 2 attack.attack (morale); 2 savingThrows.allSavingThrows (morale); 2 skills.skills (morale)
- **Inertial Armor** [Changes]
  - Changes: 4 ac.aac (base)
- **Inspire Courage** [Changes] [Context Notes]
  - Changes: 1 + max(0, ceil((@item.level - 7) / 6)) attack.attack (competence); 1 + max(0, ceil((@item.level - 7) / 6)) damage.wdamage (competence)
  - Context Notes: +[[1 + max(0, ceil((@item.level - 7) / 6))]] Morale vs Fear and Charm effects
- **Inspire Greatness** [Changes]
  - Changes: 1 savingThrows.fort (untyped); 2 attack.attack (untyped)
- **Inspire Heroics** [Changes]
  - Changes: 4 ac.ac (dodge); 4 savingThrows.allSavingThrows (morale)
- **Lullaby** [Changes] [Context Notes]
  - Changes: -5 skill.skill.lis (penalty); -5 skill.skill.spt (penalty)
  - Context Notes: -2 on Will saves vs. Sleep
- **Mage Armor** [Changes]
  - Changes: 4 ac.aac (base)
- **Outburst** [Changes]
  - Changes: 2 ability.str (untyped); -2 ability.wis (untyped); -2 ability.int (untyped)
- **Owl's Wisdom** [Changes]
  - Changes: 4 ability.wis (enh)
- **Prayer (Negative)** [Changes]
  - Changes: -1 attack.attack (untyped); -1 damage.wdamage (untyped); -1 savingThrows.allSavingThrows (untyped); -1 skills.skills (untyped)
- **Prayer (Positive)** [Changes]
  - Changes: 1 attack.attack (luck); 1 damage.wdamage (luck); 1 savingThrows.allSavingThrows (luck); 1 skills.skills (luck)
- **Resistance** [Changes]
  - Changes: 1 savingThrows.allSavingThrows (resist)
- **Shield** [Changes]
  - Changes: 4 ac.sac (base)
- **Shield of Faith** [Changes]
  - Changes: 2 + min(3, floor(@item.level / 6)) ac.ac (deflection)
- **Slow** [Changes]
  - Changes: -1 ac.ac (untyped); -1 attack.attack (untyped); -1 savingThrows.ref (untyped)
- **Surging Euhporia** [Changes]
  - Changes: 1 + (@classes.wilder.level > 11) ? 1 : 0 + (@classes.wilder.level > 19) ? 1 : 0 attack.attack (morale); 1 + (@classes.wilder.level > 11) ? 1 : 0 + (@classes.wilder.level > 19) ? 1 : 0 damage.damage (morale); 1 + (@classes.wilder.level > 11) ? 1 : 0 + (@classes.wilder.level > 19) ? 1 : 0 savingThrows.allSavingThrows (untyped)
- **Virtue** [Changes]
  - Changes: 1 misc.mhp (untyped)
