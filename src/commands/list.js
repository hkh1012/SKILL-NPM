import fs from 'node:fs/promises';
import path from 'node:path';
import * as output from '../utils/output.js';
import { getConfig } from '../config.js';
import { listStoreSkills } from '../lib/store-repo.js';
import { hasSkillMd } from '../lib/skill-meta.js';
import { DEFAULT_PROJECT_SKILLS_DIR } from '../constants.js';

async function listProjectSkills(projectRoot, targetDir) {
  const skillsRoot = path.isAbsolute(targetDir) ? targetDir : path.join(projectRoot, targetDir);
  try {
    const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
    const skills = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(skillsRoot, entry.name);
      if (await hasSkillMd(skillPath)) {
        skills.push({ name: entry.name, path: skillPath });
      }
    }
    return skills;
  } catch {
    return [];
  }
}

export async function list(options) {
  const config = await getConfig();
  const targetDir = options.targetDir || DEFAULT_PROJECT_SKILLS_DIR;
  const projectRoot = process.cwd();

  // Store skills
  const storeSkills = [];
  for (const store of config.stores) {
    try {
      const skills = await listStoreSkills(store);
      storeSkills.push({ store: store.name, skills });
    } catch (err) {
      output.warn(`Could not list store "${store.name}": ${err.message}`);
    }
  }

  // Project skills
  const projectSkills = await listProjectSkills(projectRoot, targetDir);

  // Output
  if (storeSkills.length === 0 && projectSkills.length === 0) {
    output.warn('No skills found in stores or project.');
    return;
  }

  if (storeSkills.length > 0) {
    output.info('Skills in stores:');
    for (const { store, skills } of storeSkills) {
      output.log(`  ${store}:`);
      if (skills.length === 0) {
        output.log('    (none)');
      } else {
        for (const skill of skills) {
          const inProject = projectSkills.some((p) => p.name === skill.name);
          const marker = inProject ? ' [in project]' : '';
          output.log(`    - ${skill.name}${marker}`);
        }
      }
    }
  }

  if (projectSkills.length > 0) {
    output.info('Skills in current project:');
    for (const skill of projectSkills) {
      output.log(`  - ${skill.name}`);
    }
  }
}
