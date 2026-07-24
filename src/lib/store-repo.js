import fs from 'node:fs/promises';
import path from 'node:path';
import * as git from '../utils/git.js';
import { STORES_DIR } from '../constants.js';
import { hasSkillMd } from './skill-meta.js';

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 64);
}

export function getStoreDir(name) {
  return path.join(STORES_DIR, sanitizeName(name));
}

function getCloneUrl(store) {
  return store.repoUrl || store.url;
}

export async function syncStore(store) {
  const dir = getStoreDir(store.name);
  let isGitRepo = false;
  try {
    await fs.access(path.join(dir, '.git'));
    isGitRepo = true;
  } catch {
    isGitRepo = false;
  }

  if (isGitRepo) {
    await git.pullRepo(dir);
  } else {
    // Directory doesn't exist or isn't a git repo; remove and clone fresh
    await fs.rm(dir, { recursive: true, force: true });
    await git.cloneRepo(getCloneUrl(store), dir);
  }
  return dir;
}

async function findSkillDirs(rootDir, maxDepth = 10) {
  const results = [];
  async function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const childPath = path.join(dir, entry.name);
      if (await hasSkillMd(childPath)) {
        results.push({
          name: entry.name,
          path: childPath,
        });
      }
      await walk(childPath, depth + 1);
    }
  }
  await walk(rootDir, 0);
  return results;
}

export async function listStoreSkills(store) {
  const dir = await syncStore(store);
  const skillsRoot = store.subDir ? path.join(dir, store.subDir) : dir;
  const found = await findSkillDirs(skillsRoot);
  return found.map((skill) => ({
    ...skill,
    source: store,
  }));
}

export async function findSkillInStores(stores, skillName) {
  for (const store of stores) {
    try {
      const skills = await listStoreSkills(store);
      const found = skills.find((s) => s.name === skillName);
      if (found) return found;
    } catch (err) {
      // Continue searching other stores; caller may warn if desired
      continue;
    }
  }
  return null;
}

export async function detectSkillsSubdir(dir) {
  const commonNames = ['skills', 'skill'];
  for (const subDirName of commonNames) {
    const subDir = path.join(dir, subDirName);
    const found = await findSkillDirs(subDir);
    if (found.length > 0) {
      return subDirName;
    }
  }
  return '';
}
