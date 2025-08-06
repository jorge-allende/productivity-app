#!/bin/bash

# Comprehensive pre-push validation script for productivity-app
# This script runs all quality checks before code is pushed to remote repository

set -e  # Exit on first error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COVERAGE_THRESHOLD=80
MAX_BUNDLE_SIZE_KB=500

echo -e "${BLUE}🚀 Productivity App - Pre-Push Validation${NC}"
echo "=============================================="
echo "Running comprehensive quality checks..."
echo ""

# Store start time
START_TIME=$(date +%s)

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to calculate elapsed time
elapsed_time() {
    local END_TIME=$(date +%s)
    local ELAPSED=$((END_TIME - START_TIME))
    echo "${ELAPSED}s"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found. Run this script from the project root."
    exit 1
fi

# 1. Check for uncommitted changes
echo -e "\n${BLUE}1. Checking Git Status${NC}"
echo "------------------------"
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Validation cancelled."
        exit 1
    fi
else
    print_success "Working directory is clean"
fi

# 2. TypeScript Type Checking
echo -e "\n${BLUE}2. TypeScript Type Checking${NC}"
echo "----------------------------"
if npm run typecheck > /tmp/typecheck.log 2>&1; then
    print_success "No TypeScript errors found"
else
    print_error "TypeScript errors detected!"
    cat /tmp/typecheck.log
    exit 1
fi

# 3. ESLint
echo -e "\n${BLUE}3. ESLint Code Quality${NC}"
echo "-----------------------"
if npm run lint > /tmp/lint.log 2>&1; then
    print_success "No linting errors found"
else
    print_error "Linting errors detected!"
    cat /tmp/lint.log
    exit 1
fi

# 4. Run Tests with Coverage
echo -e "\n${BLUE}4. Running Test Suite${NC}"
echo "---------------------"
if npm test -- --coverage --watchAll=false --passWithNoTests > /tmp/test.log 2>&1; then
    print_success "All tests passed"
    
    # Extract coverage percentage
    COVERAGE=$(grep "All files" /tmp/test.log | awk '{print $10}' | sed 's/%//')
    if [ ! -z "$COVERAGE" ]; then
        if (( $(echo "$COVERAGE >= $COVERAGE_THRESHOLD" | bc -l) )); then
            print_success "Code coverage: ${COVERAGE}% (threshold: ${COVERAGE_THRESHOLD}%)"
        else
            print_warning "Code coverage: ${COVERAGE}% is below threshold of ${COVERAGE_THRESHOLD}%"
        fi
    fi
else
    print_error "Tests failed!"
    cat /tmp/test.log
    exit 1
fi

# 5. Security Audit
echo -e "\n${BLUE}5. Security Vulnerability Check${NC}"
echo "--------------------------------"
if npm audit --audit-level=high > /tmp/audit.log 2>&1; then
    print_success "No high or critical vulnerabilities found"
else
    print_warning "Security vulnerabilities detected:"
    npm audit --audit-level=high
    echo ""
    read -p "Continue with vulnerabilities? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 6. Build Verification
echo -e "\n${BLUE}6. Production Build Verification${NC}"
echo "---------------------------------"
print_info "Building production bundle..."
if npm run build > /tmp/build.log 2>&1; then
    print_success "Build completed successfully"
    
    # Check bundle size
    if [ -d "build/static/js" ]; then
        MAIN_BUNDLE=$(find build/static/js -name "main.*.js" -type f | head -1)
        if [ -f "$MAIN_BUNDLE" ]; then
            BUNDLE_SIZE_KB=$(($(stat -f%z "$MAIN_BUNDLE" 2>/dev/null || stat -c%s "$MAIN_BUNDLE") / 1024))
            if [ $BUNDLE_SIZE_KB -lt $MAX_BUNDLE_SIZE_KB ]; then
                print_success "Main bundle size: ${BUNDLE_SIZE_KB}KB (limit: ${MAX_BUNDLE_SIZE_KB}KB)"
            else
                print_warning "Main bundle size: ${BUNDLE_SIZE_KB}KB exceeds limit of ${MAX_BUNDLE_SIZE_KB}KB"
            fi
        fi
    fi
else
    print_error "Build failed!"
    tail -50 /tmp/build.log
    exit 1
fi

# 7. Code Quality Checks
echo -e "\n${BLUE}7. Code Quality Checks${NC}"
echo "----------------------"

# Check for console.log statements
CONSOLE_LOGS=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.log" 2>/dev/null | grep -v ".test." || true)
if [ ! -z "$CONSOLE_LOGS" ]; then
    print_warning "console.log statements found in:"
    echo "$CONSOLE_LOGS" | sed 's/^/  - /'
fi

# Check for TODO comments
TODOS=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -n "TODO\|FIXME\|HACK" 2>/dev/null || true)
if [ ! -z "$TODOS" ]; then
    print_warning "TODO/FIXME/HACK comments found:"
    echo "$TODOS" | head -10
    TODO_COUNT=$(echo "$TODOS" | wc -l)
    if [ $TODO_COUNT -gt 10 ]; then
        echo "  ... and $((TODO_COUNT - 10)) more"
    fi
fi

# Check for any TypeScript any types
ANY_TYPES=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -n ": any\|<any>" 2>/dev/null | grep -v ".test." || true)
if [ ! -z "$ANY_TYPES" ]; then
    print_warning "TypeScript 'any' types found:"
    echo "$ANY_TYPES" | head -5
    ANY_COUNT=$(echo "$ANY_TYPES" | wc -l)
    if [ $ANY_COUNT -gt 5 ]; then
        echo "  ... and $((ANY_COUNT - 5)) more"
    fi
fi

# 8. Convex Schema Validation
echo -e "\n${BLUE}8. Convex Backend Validation${NC}"
echo "-----------------------------"
if [ -f "convex/schema.ts" ]; then
    if npx convex codegen > /tmp/convex.log 2>&1; then
        print_success "Convex schema is valid"
    else
        print_warning "Convex schema validation failed (non-blocking):"
        tail -10 /tmp/convex.log
    fi
else
    print_info "No Convex schema found"
fi

# Summary
echo -e "\n${BLUE}=============================================="
echo -e "Pre-Push Validation Summary${NC}"
echo "=============================================="
echo -e "Total time: $(elapsed_time)"
echo ""
echo -e "${GREEN}✅ All critical checks passed!${NC}"
echo ""
echo "Quality Metrics:"
[ ! -z "$COVERAGE" ] && echo "  - Test Coverage: ${COVERAGE}%"
[ ! -z "$BUNDLE_SIZE_KB" ] && echo "  - Bundle Size: ${BUNDLE_SIZE_KB}KB"
[ ! -z "$TODO_COUNT" ] && echo "  - TODOs: $TODO_COUNT"
[ ! -z "$ANY_COUNT" ] && echo "  - Any Types: $ANY_COUNT"
echo ""
echo -e "${GREEN}🚀 Your code is ready to push!${NC}"

# Clean up temp files
rm -f /tmp/typecheck.log /tmp/lint.log /tmp/test.log /tmp/audit.log /tmp/build.log /tmp/convex.log

exit 0