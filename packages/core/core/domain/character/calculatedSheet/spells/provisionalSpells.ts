export type Spell = {
  name: string;
  id: string;
  originalName: string;
  level: string[];
  school: string;
  time: string;
  components: string[];
  range: string;
  target: string;
  duration: string;
  effect: string;
  area: string;
  save: string;
  sr: string;
  text: string[];
  highlightedText?: string[];
  descriptor: string[];
  subSchool: string;
};

export type ProvisionalSpells = {
  spells: Spell[];
  preparedSpells: Spell[];
  spellSlots: {
    [key: number]: {
      total: number;
      used: number;
    };
  };
};
