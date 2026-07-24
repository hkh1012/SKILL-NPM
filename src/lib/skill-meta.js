import fs from 'node:fs/promises';
import path from 'node:path';

const SKILL_MD_RE = /^skill\.md$/i;

export async function findSkillMd(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const found = entries.find((entry) => entry.isFile() && SKILL_MD_RE.test(entry.name));
    return found ? path.join(dir, found.name) : null;
  } catch {
    return null;
  }
}

export async function hasSkillMd(dir) {
  return (await findSkillMd(dir)) !== null;
}

export async function readSkillMeta(dir) {
  try {
    const skillMdPath = await findSkillMd(dir);
    if (!skillMdPath) {
      return { name: path.basename(dir), description: '', path: dir, hasSkillMd: false };
    }
    const content = await fs.readFile(skillMdPath, 'utf-8');
    const lines = content.split('\n');
    const firstLine = lines[0]?.trim();
    let name = path.basename(dir);
    let description = '';

    if (firstLine && !firstLine.startsWith('---')) {
      description = firstLine.replace(/^#+\s*/, '').trim();
    }

    // Simple frontmatter support: if starts with ---, look for name/description
    if (firstLine === '---') {
      const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
      if (end !== -1) {
        for (const line of lines.slice(1, end)) {
          const match = line.match(/^(name|description):\s*(.*)$/);
          if (match) {
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            if (match[1] === 'name') name = value;
            if (match[1] === 'description') description = value;
          }
        }
      }
    }

    return { name, description, path: dir, hasSkillMd: true };
  } catch {
    return { name: path.basename(dir), description: '', path: dir, hasSkillMd: false };
  }
}
