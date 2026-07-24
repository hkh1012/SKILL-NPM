import fs from 'node:fs/promises';
import path from 'node:path';
import * as constants from './constants.js';

const defaultConfig = {
  version: constants.CONFIG_VERSION,
  stores: [],
  defaults: {
    warehouseDir: constants.DEFAULT_WAREHOUSE_DIR,
  },
};

function expandPath(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/^~(?=\/|$)/, process.env.HOME || process.env.USERPROFILE);
}

export async function getConfig() {
  try {
    const raw = await fs.readFile(constants.CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...defaultConfig,
      ...parsed,
      defaults: {
        ...defaultConfig.defaults,
        ...(parsed.defaults || {}),
      },
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return structuredClone(defaultConfig);
    }
    throw new Error(`Failed to read config: ${err.message}`);
  }
}

export async function saveConfig(config) {
  await fs.mkdir(path.dirname(constants.CONFIG_PATH), { recursive: true });
  await fs.writeFile(constants.CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

export function resolveWarehouseDir(config) {
  return path.resolve(expandPath(config.defaults?.warehouseDir || constants.DEFAULT_WAREHOUSE_DIR));
}

export function resolveStoresDir() {
  return constants.STORES_DIR;
}

export function getStoreNameFromUrl(url) {
  try {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname, path.extname(parsed.pathname));
    return base || 'unknown';
  } catch {
    // Local path fallback
    const base = path.basename(url, path.extname(url));
    return base || 'unknown';
  }
}

export function generateStoreName(url, existingStores) {
  const baseName = 'store';
  const names = new Set(existingStores.map((s) => s.name));
  if (!names.has(baseName)) {
    return baseName;
  }
  let counter = 2;
  while (names.has(`${baseName}-${counter}`)) {
    counter++;
  }
  return `${baseName}-${counter}`;
}

export function parseGitHubTreeUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('github.com')) {
      return { repoUrl: url, subDir: '', isTreeUrl: false };
    }
    // Match /:owner/:repo/tree/:branch/:path
    const match = parsed.pathname.match(/^\/([^/]+)\/([^/]+)\/tree\/([^/]+)(?:\/(.*))?$/);
    if (!match) {
      return { repoUrl: url, subDir: '', isTreeUrl: false };
    }
    const [, owner, repo, branch, subPath] = match;
    const repoUrl = `https://github.com/${owner}/${repo}`;
    return {
      repoUrl,
      branch,
      subDir: subPath || '',
      isTreeUrl: true,
    };
  } catch {
    return { repoUrl: url, subDir: '', isTreeUrl: false };
  }
}
