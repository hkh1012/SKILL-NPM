import * as output from '../utils/output.js';
import { resolveProjectSkillDir, removeSkillFromProject, pathExists } from '../lib/project-skills.js';
import { DEFAULT_PROJECT_SKILLS_DIR } from '../constants.js';

export async function unuse(skillName, options) {
  const targetDir = options.targetDir || DEFAULT_PROJECT_SKILLS_DIR;
  const projectRoot = process.cwd();
  const target = resolveProjectSkillDir(projectRoot, skillName, targetDir);

  if (!(await pathExists(target))) {
    output.error(`Skill not used in project: ${skillName}`);
    process.exit(1);
  }

  await removeSkillFromProject(target);
  output.success(`Removed "${skillName}" from project`);
}
