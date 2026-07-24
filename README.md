# skill-npm

Local skill store manager for Claude Code skills.

## Features

- Add skill stores (Git repositories containing skills).
- Search skills across all stores.
- Copy skills directly into your project.
- Update stores from remote.

## Installation

```bash
npm install -g .
```

Or run locally:

```bash
node ./bin/skill-npm.js --help
```

## Usage

```bash
# Manage stores
skill-npm store add <url>
skill-npm store list
skill-npm store remove <name-or-url>
skill-npm store update [name]

# Copy / remove skill in current project
skill-npm use <skill>
skill-npm unuse <skill>

# Search
skill-npm search <keyword>
```

## Options

- `--target-dir <dir>`: Override project skills directory (default: `.claude/skills`).
- `--yes`: Automatically answer yes to prompts.

## Configuration

Registered stores and their caches are stored in `~/.skill-npm/`.
