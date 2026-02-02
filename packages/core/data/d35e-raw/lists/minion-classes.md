# Minion Classes

**Total:** 4 items

## Legend

| Icon | Name | Count | Description |
|------|------|-------|-------------|
| [Changes] | Changes | 4 | Stat modifiers (ability, AC, attack, damage, saves, skills, speed) |

---

## Items

- **Animal Companion** [Changes]
  - Changes: floor(@item.levels/3)*2 ac.nac (untyped); floor(@item.levels/3) ability.str (untyped); floor(@item.levels/3) ability.dex (untyped)
- **Paladin Mount** [Changes]
  - Changes: (@classes.paladinMount.level > 14 ? 7 : (@classes.paladinMount.level > 10 ? 6 : (@classes.paladinMount.level > 7 ? 5 : 4))) ability.int (untyped); (@classes.paladinMount.level > 14 ? 10 : (@classes.paladinMount.level > 10 ? 8 : (@classes.paladinMount.level > 7 ? 6 : 4))) ac.nac (untyped); (@master.data.attributes.savingThrows.fort.base - 2) > 2 ? (@master.data.attributes.savingThrows.fort.base - 2) : 0 savingThrows.fort (base); (@master.data.attributes.savingThrows.will.base) > 2 ? (@master.data.attributes.savingThrows.will.base) : 0 savingThrows.will (base); (@master.data.attributes.savingThrows.ref.base - 2) > 2 ? (@master.data.attributes.savingThrows.ref.base - 2) : 0 savingThrows.ref (base); (@classes.paladinMount.level > 14 ? 4 : (@classes.paladinMount.level > 10 ? 3 : (@classes.paladinMount.level > 7 ? 2 : 1))) ability.str (untyped); @classes.paladinMount.level > 7 ? 10 : 0 speed.allSpeeds (untyped)
- **Psicrystal** [Changes]
  - Changes: ceil(@classes.psicrystal.level / 2) - 1 ability.int (untyped); ceil(@classes.psicrystal.level / 2) - 1 ac.nac (untyped); (@master.data.attributes.savingThrows.fort.base - 2) > 2 ? (@master.data.attributes.savingThrows.fort.base - 2) : 0 savingThrows.fort (base); (@master.data.attributes.savingThrows.will.base) > 2 ? (@master.data.attributes.savingThrows.will.base) : 0 savingThrows.will (base); (@master.data.attributes.savingThrows.ref.base - 2) > 2 ? (@master.data.attributes.savingThrows.ref.base - 2) : 0 savingThrows.ref (base); @master.data.attributes.bab.base attack.babattack (base); floor(@master.data.attributes.hp.max / 2) misc.mhp (replace)
- **Wizard Familiar** [Changes]
  - Changes: ceil(@classes.wizardFamiliar.level / 2)+3 ability.int (untyped); ceil(@classes.wizardFamiliar.level / 2) ac.nac (untyped); (@master.data.attributes.savingThrows.fort.base - 2) > 2 ? (@master.data.attributes.savingThrows.fort.base - 2) : 0 savingThrows.fort (base); (@master.data.attributes.savingThrows.will.base) > 2 ? (@master.data.attributes.savingThrows.will.base) : 0 savingThrows.will (base); (@master.data.attributes.savingThrows.ref.base - 2) > 2 ? (@master.data.attributes.savingThrows.ref.base - 2) : 0 savingThrows.ref (base); @master.data.attributes.bab.base attack.babattack (base); floor(@master.data.attributes.hp.max / 2) misc.mhp (base)
