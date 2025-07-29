# Local CI/CD Testing Guide

This guide helps you run the exact same tests locally that GitHub Actions runs in CI/CD, preventing failed builds after pushing.

## Quick Start

Run the full CI pipeline locally before pushing:
```bash
npm run ci:full
```

## Available CI Commands

### Full Pipeline (Recommended before push)
```bash
npm run ci:full        # Runs complete CI pipeline with npm ci
npm run ci-local       # Runs all checks (typecheck, lint, test, build)
```

### Individual Checks
```bash
npm run ci:typecheck   # TypeScript type checking (fast)
npm run ci:lint        # ESLint with CI settings
npm run ci:test        # Tests with coverage like CI
npm run ci:quick       # Quick checks (typecheck + lint only)
```

## Pre-Push Git Hook

A Git hook automatically runs quick checks before pushing:
- TypeScript type checking
- ESLint validation

To skip the hook in emergencies:
```bash
git push --no-verify
```

## Manual Testing Script

For detailed output matching GitHub Actions:
```bash
./scripts/test-ci-local.sh
```

This script:
- Sets CI=true environment variable
- Runs npm ci for clean install
- Shows colored pass/fail status
- Stops on first failure
- Mirrors GitHub Actions exactly

## Common Issues

### Tests Pass Locally but Fail in CI
1. Ensure CI=true is set: `CI=true npm test`
2. Use npm ci instead of npm install
3. Clear node_modules and reinstall: `rm -rf node_modules && npm ci`

### ESLint Errors
- Always use Testing Library queries (getByRole, getByText)
- Avoid container.querySelector or direct DOM access
- Run `npm run ci:lint` to catch issues early

### TypeScript Errors
- Run `npm run ci:typecheck` before committing
- Check @types packages match library versions

## GitHub Actions Workflow

Our CI runs these commands:
1. `npm ci` - Clean install
2. `npm run typecheck` - TypeScript check
3. `npx eslint src --ext .ts,.tsx --max-warnings 0` - Linting
4. `npm test -- --coverage --watchAll=false --testTimeout=10000` - Tests
5. `npm run build` - Production build

Always verify with `npm run ci:full` before pushing!