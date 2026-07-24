import { confirm } from '@inquirer/prompts';

export async function promptConfirm(message, yes) {
  if (yes) return true;
  const answer = await confirm({
    message,
    default: false,
  });
  return answer;
}
