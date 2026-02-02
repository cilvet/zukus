# Templates

**Total:** 11 items

## Legend

| Icon | Name | Count | Description |
|------|------|-------|-------------|
| [Changes] | Changes | 11 | Stat modifiers (ability, AC, attack, damage, saves, skills, speed) |
| [Resistances] | Resistances | 7 | Energy resistances (fire, cold, acid, electric) |
| [Damage Reduction] | Damage Reduction | 8 | DR X/type |

---

## Items

- **Celestial Creature** [Changes] [Resistances] [Damage Reduction]
  - Changes: 5+@attributes.hd.total misc.spellResistance (untyped); (@attributes.hd.total < 4 ? 0 : (@attributes.hd.total < 8 ? 1 : 2)) misc.cr (untyped)
  - Resistances: acid (@levels > 7 ? 10 : 5); cold (@levels > 7 ? 10 : 5); electric (@levels > 7 ? 10 : 5)
  - Damage Reduction: (@levels < 4 ? 0 : (@levels < 12 ? 5 : 10))/magic
- **Fiendish Creature** [Changes] [Resistances] [Damage Reduction]
  - Changes: 5+@attributes.hd.total misc.spellResistance (untyped)
  - Resistances: acid (@levels > 7 ? 10 : 5); cold (@levels > 7 ? 10 : 5); electric (@levels > 7 ? 10 : 5)
  - Damage Reduction: (@levels < 4 ? 0 : (@levels < 12 ? 5 : 10))/magic
- **Ghost** [Changes]
  - Changes: 2 misc.cr (untyped); @abilities.cha.mod ac.ac (deflection); (@attributes.speed.fly.base < 30 ? (30 - @attributes.speed.fly.base) : 0) speed.flySpeed (untyped); 8 skill.skill.src (racial); 8 skill.skill.spt (racial); 8 skill.skill.hid (racial); 8 skill.skill.lis (racial); 4 ability.cha (untyped); 100 misc.fortification (untyped)
- **Half-Celestial** [Changes] [Resistances] [Damage Reduction]
  - Changes: 10+@item.levels misc.spellResistance (untyped); 4 ability.str (untyped); 2 ability.dex (untyped); 4 ability.con (untyped); 2 ability.int (untyped); 4 ability.wis (untyped); 4 ability.cha (untyped); 1 ac.nac (untyped); (@attributes.speed.fly.base ? 0 : @attributes.speed.land.total * 2) speed.flySpeed (untyped); (@attributes.hd.total < 6 ? 1 : (@attributes.hd.total < 11 ? 2 : 3)) misc.cr (untyped)
  - Resistances: acid 10; electric 10; cold 10
  - Damage Reduction: (@levels < 11 ? 5 : 10)/magic
- **Half-Dragon** [Changes]
  - Changes: 8 ability.str (untyped); 2 ability.con (untyped); 2 ability.int (untyped); 2 ability.cha (untyped); 5 ac.nac (untyped); 2 misc.cr (untyped)
- **Half-Fiend** [Changes] [Resistances] [Damage Reduction]
  - Changes: 10+@item.levels misc.spellResistance (untyped); 4 ability.str (untyped); 4 ability.dex (untyped); 2 ability.con (untyped); 4 ability.int (untyped); 2 ability.cha (untyped); 1 ac.nac (untyped); (@attributes.speed.fly.base ? 0 : @attributes.speed.land.total) speed.flySpeed (untyped); (@attributes.hd.total < 6 ? 1 : (@attributes.hd.total < 11 ? 2 : 3)) misc.cr (untyped)
  - Resistances: acid 10; electric 10; cold 10
  - Damage Reduction: (@levels < 11 ? 5 : 10)/magic
- **Lich** [Changes] [Resistances] [Damage Reduction]
  - Changes: 2 ability.int (untyped); 2 ability.wis (untyped); 2 ability.cha (untyped); 2 misc.cr (untyped); 8 skill.skill.hid (untyped); 8 skill.skill.lis (untyped); 8 skill.skill.mos (untyped); 8 skill.skill.sen (untyped); 8 skill.skill.spt (untyped); max((5 - ${this.attributes.naturalAC || 0}), 0 ) ac.nac (untyped); 100 misc.fortification (untyped)
  - Resistances: cold ; electric 
  - Damage Reduction: 15/bludgeoning; 15/magic
- **Phrenic** [Changes]
  - Changes: 1 psionic.powerPoints (untyped); 10+@item.levels misc.spellResistance (untyped); 2 ability.int (untyped); 2 ability.wis (untyped); 4 ability.cha (untyped); (@attributes.hd.total < 6 ? 1 : (@attributes.hd.total < 11 ? 2 : 3)) misc.cr (untyped)
- **Skeleton** [Changes] [Resistances] [Damage Reduction]
  - Changes: 2 ability.dex (untyped); -1 ability.con (replace); 10 ability.wis (replace); 1 ability.cha (replace); -1 ability.int (replace); 100 misc.fortification (untyped)
  - Resistances: cold 
  - Damage Reduction: 5/bludgeoning
- **Vampire** [Changes] [Resistances] [Damage Reduction]
  - Changes: 2 misc.cr (untyped); 6 ac.nac (untyped); 6 ability.str (untyped); 4 ability.dex (untyped); 2 ability.int (untyped); 2 ability.wis (untyped); 4 ability.cha (untyped); 8 skill.skill.blf (untyped); 8 skill.skill.hid (untyped); 8 skill.skill.lis (untyped); 8 skill.skill.mos (untyped); 8 skill.skill.src (untyped); 8 skill.skill.sen (untyped); 8 skill.skill.spt (untyped); -1 ability.con (replace); 100 misc.fortification (untyped)
  - Resistances: cold 10; electric 10
  - Damage Reduction: 10/magic; 10/silver
- **Zombie** [Changes] [Damage Reduction]
  - Changes: 2 ability.str (untyped); -2 ability.dex (untyped); -1 ability.int (replace); -1 ability.con (replace); 10 ability.wis (replace); 1 ability.cha (replace); 100 misc.fortification (untyped)
  - Damage Reduction: 5/slashing
