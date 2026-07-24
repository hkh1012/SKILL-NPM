import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { MAX_RETRIES, RETRY_DELAY_MS } from '../constants.js';

function runGit(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        const err = new Error(`git ${args.join(' ')} failed: ${stderr || stdout}`);
        err.code = code;
        reject(err);
      }
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry(fn, maxRetries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) {
        throw lastError;
      }
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
}

export async function cloneRepo(url, dest) {
  return withRetry(async () => {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await runGit(['clone', '--depth', '1', '--', url, dest]);
    return dest;
  });
}

export async function pullRepo(dest) {
  return withRetry(async () => {
    await runGit(['-C', dest, 'pull']);
    return dest;
  });
}
