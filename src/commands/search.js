import * as output from '../utils/output.js';
import { getConfig } from '../config.js';
import { listStoreSkills } from '../lib/store-repo.js';

export async function search(keyword, options) {
  const config = await getConfig();
  if (config.stores.length === 0) {
    output.error('No stores registered. Run: skill-npm store add <url>');
    process.exit(1);
  }

  const results = [];
  for (const store of config.stores) {
    try {
      const skills = await listStoreSkills(store);
      const matched = skills.filter((s) =>
        s.name.toLowerCase().includes(keyword.toLowerCase())
      );
      if (matched.length > 0) {
        results.push({ store: store.name, skills: matched });
      }
    } catch (err) {
      output.warn(`Could not search store "${store.name}": ${err.message}`);
    }
  }

  if (results.length === 0) {
    output.warn(`No skills found matching "${keyword}"`);
    return;
  }

  output.info(`Search results for "${keyword}":`);
  for (const { store, skills } of results) {
    output.log(`  ${store}:`);
    for (const skill of skills) {
      output.log(`    - ${skill.name}`);
    }
  }
}
