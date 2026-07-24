import * as output from '../utils/output.js';
import { getConfig, saveConfig, generateStoreName, parseGitHubTreeUrl } from '../config.js';
import { syncStore, detectSkillsSubdir, getStoreDir } from '../lib/store-repo.js';

export async function addStore(url, options) {
  const config = await getConfig();
  const exists = config.stores.some((s) => s.url === url);
  if (exists) {
    output.warn(`Store already registered: ${url}`);
    return;
  }

  const name = generateStoreName(url, config.stores);
  const { repoUrl, subDir: explicitSubDir } = parseGitHubTreeUrl(url);
  const storeRecord = { name, url, repoUrl, subDir: explicitSubDir };

  output.info(`Adding store ${name}...`);

  let storeDir;
  try {
    storeDir = await syncStore(storeRecord);
  } catch (err) {
    output.error(`Failed to access store: ${err.message}`);
    process.exit(1);
  }

  // Auto-detect skills subdirectory if not explicitly provided
  if (!storeRecord.subDir) {
    storeRecord.subDir = await detectSkillsSubdir(storeDir);
  }

  config.stores.push(storeRecord);
  await saveConfig(config);
  output.success(`Added store "${name}" ${url}`);
}

export async function listStores(options) {
  const config = await getConfig();
  if (config.stores.length === 0) {
    output.warn('No stores registered.');
    return;
  }
  output.info('Registered stores:');
  config.stores.forEach((store, index) => {
    const marker = index === 0 ? '(default)' : '';
    const subDir = store.subDir ? ` [subdir: ${store.subDir}]` : '';
    output.log(`  ${index + 1}. ${store.name} ${store.url}${subDir} ${marker}`);
  });
}

export async function removeStore(nameOrUrl, options) {
  const config = await getConfig();
  const index = config.stores.findIndex((s) => s.name === nameOrUrl || s.url === nameOrUrl);
  if (index === -1) {
    output.error(`Store not found: ${nameOrUrl}`);
    process.exit(1);
  }
  const removed = config.stores.splice(index, 1)[0];
  await saveConfig(config);
  output.success(`Removed store "${removed.name}"`);
}

export async function updateStore(name, options) {
  const config = await getConfig();
  if (config.stores.length === 0) {
    output.warn('No stores registered.');
    return;
  }

  let storesToUpdate;
  if (name) {
    const store = config.stores.find((s) => s.name === name);
    if (!store) {
      output.error(`Store not found: ${name}`);
      process.exit(1);
    }
    storesToUpdate = [store];
  } else {
    storesToUpdate = config.stores;
  }

  for (const store of storesToUpdate) {
    try {
      output.info(`Updating store ${store.name}...`);
      await syncStore(store);
      output.success(`Updated store "${store.name}"`);
    } catch (err) {
      output.warn(`Failed to update store "${store.name}": ${err.message}`);
    }
  }
}
