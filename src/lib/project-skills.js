import fs from 'node:fs/promises';
import path from 'node:path';
import { cp, rm } from 'node:fs/promises';
import { pathExists, ensureInside } from '../utils/fs.js';

export function resolveProjectSkillDir(projectRoot, skillName, targetDir) {
  const base = path.isAbsolute(targetDir) ? targetDir : path.join(projectRoot, targetDir);
  const skillPath = path.join(base, skillName);
  ensureInside(skillPath, projectRoot, 'project skill path');
  return skillPath;
}

export async function copySkillToProject(sourceDir, targetDir) {
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  await rm(targetDir, { recursive: true, force: true });
  await cp(sourceDir, targetDir, { recursive: true, preserveTimestamps: true });
}

export async function removeSkillFromProject(targetDir) {
  await rm(targetDir, { recursive: true, force: true });
}

export { pathExists };
