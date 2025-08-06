#!/bin/bash

# Quick validation script for developers
# Run this before pushing to ensure code quality

echo "🔍 Running quick validation checks..."
echo "===================================="

# Run the validation checks in order of speed
echo "1️⃣ TypeScript checks..."
npm run typecheck || exit 1

echo -e "\n2️⃣ Linting..."
npm run lint || exit 1

echo -e "\n3️⃣ Running tests..."
npm test -- --watchAll=false --passWithNoTests || exit 1

echo -e "\n✅ All checks passed! Your code is ready to push."
echo "===================================="
echo "💡 Tip: For comprehensive validation, run: npm run scripts/pre-push-validation.sh"