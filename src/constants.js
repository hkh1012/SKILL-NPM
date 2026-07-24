import path from 'node:path';
import os from 'node:os';

export const APP_NAME = 'skill-npm';
export const HOME_DIR = path.join(os.homedir(), `.${APP_NAME}`);
export const CONFIG_PATH = path.join(HOME_DIR, 'config.json');
export const STORES_DIR = path.join(HOME_DIR, 'stores');
export const DEFAULT_WAREHOUSE_DIR = path.join(HOME_DIR, 'skills');
export const DEFAULT_PROJECT_SKILLS_DIR = path.join('.claude', 'skills');
export const MAX_RETRIES = 5;
export const RETRY_DELAY_MS = 1000;
export const CONFIG_VERSION = 1;
