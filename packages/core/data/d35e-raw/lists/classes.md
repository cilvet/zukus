# Classes

**Total:** 33 items

## Legend

| Icon | Name | Count | Description |
|------|------|-------|-------------|
| [Changes] | Changes | 2 | Stat modifiers (ability, AC, attack, damage, saves, skills, speed) |

---

## Items

- **Adept (NPC)**
- **Arcane Archer**
- **Arcane Trickster**
- **Archmage**
- **Aristocrat (NPC)**
- **Assassin**
- **Barbarian**
- **Bard**
- **Blackguard**
- **Cleric**
- **Commoner (NPC)**
- **Druid**
- **Dwarven Defender** [Changes]
  - Changes: ceil(@classes.dwarvenDefender.level / 3) ac.ac (dodge)
- **Eldritch Knight**
- **Expert (NPC)**
- **Fighter**
- **Monk** [Changes]
  - Changes: floor(@classes.monk.level/5)+max(0,@abilities.wis.mod) ac.ac (inherent); ${this.attributes.encumbrance.level > 0 ? 0 : Math.floor(this.classes.monk.level/3)*10} speed.landSpeed (enh)
- **Mystic Theurge**
- **Paladin**
- **Psion (Egoist)**
- **Psion (Kineticist)**
- **Psion (Nomad)**
- **Psion (Seer)**
- **Psion (Shaper)**
- **Psion (Telepath)**
- **Psychic Warrior**
- **Ranger**
- **Rogue**
- **Sorcerer**
- **Soulknife**
- **Warrior (NPC)**
- **Wilder**
- **Wizard**
