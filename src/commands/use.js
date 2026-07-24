import path from 'node:path';
import * as output from '../utils/output.js';
import { getConfig } from '../config.js';
import { findSkillInStores } from '../lib/store-repo.js';
import { resolveProjectSkillDir, copySkillToProject, pathExists } from '../lib/project-skills.js';
import { promptConfirm } from '../utils/prompt.js';
import { DEFAULT_PROJECT_SKILLS_DIR } from '../constants.js';

export async function use(skillName, options) {
  const config = await getConfig();

  if (config.stores.length === 0) {
    output.error('No stores registered. Run: skill-npm store add <url>');
    process.exit(1);
  }

  output.info(`Searching for "${skillName}" in ${config.stores.length} store(s)...`);
  const found = await findSkillInStores(config.stores, skillName);

  if (!found) {
    output.error(`Skill not found in any store: ${skillName}`);
    process.exit(1);
  }

  const targetDir = options.targetDir || DEFAULT_PROJECT_SKILLS_DIR;
  const projectRoot = process.cwd();
  const target = resolveProjectSkillDir(projectRoot, skillName, targetDir);

  if (await pathExists(target)) {
    const overwrite = await promptConfirm(`Target already exists: ${target}. Overwrite?`, options.yes);
    if (!overwrite) {
      output.info('Skipped.');
      return;
    }
  }

  await copySkillToProject(found.path, target);
  output.success(`Using "${skillName}" in ${target}`);
}
