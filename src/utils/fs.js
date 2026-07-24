import fs from 'node:fs/promises';
import path from 'node:path';

export async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

const SAFE_NAME_RE = /^[a-zA-Z0-9._-]+$/;

export function validateSafeName(name, label = 'name') {
  if (!name || typeof name !== 'string') {
    throw new Error(`Invalid ${label}: must be a non-empty string`);
  }
  if (!SAFE_NAME_RE.test(name)) {
    throw new Error(`Invalid ${label} "${name}": only letters, numbers, dots, hyphens, and underscores are allowed`);
  }
  return name;
}

export function ensureInside(child, parent, label = 'path') {
  const resolvedChild = path.resolve(child);
  const resolvedParent = path.resolve(parent);
  const relative = path.relative(resolvedParent, resolvedChild);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Invalid ${label}: ${resolvedChild} is outside of ${resolvedParent}`);
  }
  return resolvedChild;
}
