import chalk from 'chalk';

const isCI = process.env.CI === 'true';

export function success(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

export function error(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

export function warn(message) {
  console.warn(chalk.yellow('⚠') + ' ' + message);
}

export function info(message) {
  console.log(chalk.blue('ℹ') + ' ' + message);
}

export function log(message) {
  console.log(message);
}

export function spinner(text) {
  let interval;
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', ''];
  let i = 0;
  if (isCI) {
    console.log(text);
    return {
      stop: () => {},
    };
  }
  process.stdout.write(`${frames[0]} ${text}`);
  interval = setInterval(() => {
    i = (i + 1) % frames.length;
    process.stdout.write(`\r${frames[i]} ${text}`);
  }, 80);
  return {
    stop: (finalText) => {
      clearInterval(interval);
      process.stdout.write(`\r${finalText ? finalText : '  ' + text}\n`);
    },
  };
}
