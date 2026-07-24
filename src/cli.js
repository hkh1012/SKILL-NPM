import { Command } from 'commander';
import { addStore, listStores, removeStore, updateStore } from './commands/store.js';
import { use } from './commands/use.js';
import { unuse } from './commands/unuse.js';
import { search } from './commands/search.js';
import { list } from './commands/list.js';

export function createCli() {
  const program = new Command();

  program
    .name('skill-npm')
    .description('Local skill warehouse manager for Claude Code skills')
    .version('1.0.0')
    .option('--target-dir <dir>', 'Override project skills directory')
    .option('--yes', 'Automatically answer yes to prompts', false);

  program
    .command('store')
    .description('Manage skill stores')
    .addCommand(
      new Command('add')
        .argument('<url>', 'Store URL (Git repository)')
        .description('Add a skill store')
        .action(async (url) => {
          await addStore(url, program.opts());
        })
    )
    .addCommand(
      new Command('list')
        .description('List registered stores')
        .action(async () => {
          await listStores(program.opts());
        })
    )
    .addCommand(
      new Command('remove')
        .argument('<name-or-url>', 'Store name or URL')
        .description('Remove a skill store')
        .action(async (nameOrUrl) => {
          await removeStore(nameOrUrl, program.opts());
        })
    )
    .addCommand(
      new Command('update')
        .argument('[name]', 'Store name (updates all if omitted)')
        .description('Update store(s) from remote')
        .action(async (name) => {
          await updateStore(name, program.opts());
        })
    );

  program
    .command('use <skill>')
    .description('Copy a skill from a store into the current project')
    .option('--target-dir <dir>', 'Override project skills directory')
    .action(async (skill) => {
      await use(skill, program.opts());
    });

  program
    .command('unuse <skill>')
    .description('Remove a skill from the current project')
    .option('--target-dir <dir>', 'Override project skills directory')
    .action(async (skill) => {
      await unuse(skill, program.opts());
    });

  program
    .command('search <keyword>')
    .description('Search for skills across all stores')
    .action(async (keyword) => {
      await search(keyword, program.opts());
    });

  program
    .command('list')
    .description('List skills in stores and current project')
    .action(async () => {
      await list(program.opts());
    });

  return program;
}

export async function run(argv) {
  const cli = createCli();
  await cli.parseAsync(argv);
}
