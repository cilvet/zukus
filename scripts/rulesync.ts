import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type RuleEntry = {
  description: string;
  body: string;
  relativePath: string;
  alwaysApply: boolean;
};

const RULES_DIR = path.join(process.cwd(), ".cursor", "rules");
const OUTPUT_PATH = path.join(process.cwd(), "AGENTS.md");

async function listRuleFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listRuleFiles(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

function parseFrontMatter(content: string): {
  description: string;
  alwaysApply: boolean;
  body: string;
} {
  const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!frontMatterMatch) {
    return { description: "", alwaysApply: false, body: content.trim() };
  }

  const frontMatter = frontMatterMatch[1];
  let description = "";
  let alwaysApply = false;

  for (const rawLine of frontMatter.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key === "description") {
      description = value;
    } else if (key === "alwaysApply") {
      alwaysApply = value.toLowerCase() === "true";
    }
  }

  const body = content.slice(frontMatterMatch[0].length).trim();
  return { description, alwaysApply, body };
}

function buildAgentsMarkdown(alwaysApply: RuleEntry[], optional: RuleEntry[]): string {
  const lines: string[] = [];
  lines.push("# AGENTS");
  lines.push("");
  lines.push("## Always-apply rules");
  lines.push("");

  if (alwaysApply.length === 0) {
    lines.push("- (none)");
    lines.push("");
  } else {
    for (const rule of alwaysApply) {
      lines.push(`### \`${rule.relativePath}\``);
      lines.push("");
      lines.push(rule.body || "_(sin contenido)_");
      lines.push("");
    }
  }

  lines.push("## Optional rules (referencias)");
  lines.push("");

  if (optional.length === 0) {
    lines.push("- (none)");
  } else {
    for (const rule of optional) {
      const description = rule.description || "Sin descripcion";
      lines.push(`- ${description} ([${rule.relativePath}](${rule.relativePath}))`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

async function main() {
  const files = await listRuleFiles(RULES_DIR);
  const rules: RuleEntry[] = [];

  for (const filePath of files.sort()) {
    const content = await readFile(filePath, "utf8");
    const parsed = parseFrontMatter(content);
    const relativePath = path.relative(process.cwd(), filePath);

    rules.push({
      description: parsed.description,
      body: parsed.body,
      relativePath,
      alwaysApply: parsed.alwaysApply,
    });
  }

  const alwaysApplyRules = rules.filter((rule) => rule.alwaysApply);
  const optionalRules = rules.filter((rule) => !rule.alwaysApply);

  const markdown = buildAgentsMarkdown(alwaysApplyRules, optionalRules);
  await writeFile(OUTPUT_PATH, markdown, "utf8");
}

await main();
