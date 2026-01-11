import { DamageResult } from "../../domain/character/calculatedSheet/attacks/damage/damageResult";
import { DamageType, BasicDamageType } from "../../domain/damage/damageTypes";

const emojiMap: Record<BasicDamageType, string> = {
  piercing: "🏹",
  precision: "🎯",
  bludgeoning: "🔨",
  slashing: "⚔️",
  acid: "🧪",
  cold: "❄️",
  fire: "🔥",
  force: "💥",
  lightning: "⚡",
  necrotic: "💀",
  poison: "☠️",
  psychic: "🧠",
  sacred: "☀️",
  electric: "⚡",
  sonic: "🔊",
  positive: "➕",
  negative: "➖",
  untyped: "❓",
  vile: "😈",
};

function damageTypeToString(damageType: DamageType, emojis: boolean = false): string {
  switch (damageType.type) {
    case "basic":
      return emojis ? `${emojiMap[damageType.damageType] || ''}` : damageType.damageType;
    case "multiple":
      return emojis ? damageType.damageTypes.map(type => `${emojiMap[type] || ''}`).join("") : damageType.damageTypes.join("");
    case "halfAndHalf":
      return emojis ? `${emojiMap[damageType.firstDamageType] || ''}${emojiMap[damageType.secondDamageType] || ''}` : `${damageType.firstDamageType}${damageType.secondDamageType}`;
  }
}

export function getDamageResultText(result: DamageResult, emojis: boolean = false): string {
  let damageTypes = result.damageTypeResults
    .map((damageTypeResult) => {
      return `${damageTypeResult.totalDamage} ${damageTypeToString(
        damageTypeResult.damageType, emojis
      )}`;
    })
    .join(", ");

  return result.damageTypeResults.length > 1 
    ? `${result.totalDamage} (${damageTypes})`
    : `${damageTypes}`;
}