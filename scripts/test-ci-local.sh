#!/bin/bash

# Local CI/CD Test Script - Mirrors GitHub Actions exactly
# This script runs the same commands as GitHub Actions CI/CD pipeline

set -e  # Exit on first error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Local CI/CD Test (GitHub Actions Mirror)${NC}"
echo -e "${BLUE}=================================================${NC}"

# Set CI environment variable like GitHub Actions
export CI=true
export NODE_ENV=test

# Function to run a step and check result
run_step() {
    local step_name=$1
    local command=$2
    
    echo -e "\n${YELLOW}📋 Running: ${step_name}${NC}"
    echo -e "${YELLOW}Command: ${command}${NC}"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ ${step_name} - PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ ${step_name} - FAILED${NC}"
        return 1
    fi
}

# Check Node.js version
echo -e "\n${BLUE}Environment Info:${NC}"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"

# Clean install dependencies (like npm ci in GitHub Actions)
echo -e "\n${YELLOW}📦 Installing dependencies with npm ci...${NC}"
if [ -f "package-lock.json" ]; then
    run_step "Install Dependencies" "npm ci"
else
    echo -e "${RED}Warning: package-lock.json not found. Using npm install instead.${NC}"
    run_step "Install Dependencies" "npm install"
fi

# Run all CI steps in the same order as GitHub Actions
echo -e "\n${BLUE}Running CI/CD Pipeline Steps:${NC}"
echo -e "${BLUE}=============================${NC}"

# 1. TypeScript type check
run_step "TypeScript Check" "npm run typecheck"

# 2. ESLint
run_step "ESLint" "npx eslint src --ext .ts,.tsx --max-warnings 0"

# 3. Run tests with coverage
run_step "Tests with Coverage" "npm test -- --coverage --watchAll=false --testTimeout=10000"

# 4. Build production bundle
run_step "Build Production" "npm run build"

# Summary
echo -e "\n${BLUE}=================================================${NC}"
echo -e "${GREEN}🎉 All CI/CD checks passed successfully!${NC}"
echo -e "${GREEN}Your code is ready to be pushed to GitHub.${NC}"
echo -e "${BLUE}=================================================${NC}"