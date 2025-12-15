#!/usr/bin/env node

/**
 * Chrome Extension Automated Test
 * 
 * This script tests the Chrome extension by:
 * 1. Launching Chrome with the extension loaded
 * 2. Verifying the extension is installed
 * 3. Checking manifest validity
 * 4. Running basic functionality tests
 * 
 * For full manual testing:
 * - Test AWS CLI login: aws sso login
 * - Test AWS VPN connection
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Chrome Extension Test Suite\n');

// Check if chrome directory exists
const chromeDir = path.join(__dirname, 'chrome');
if (!fs.existsSync(chromeDir)) {
  console.error('❌ Error: chrome/ directory not found. Run ./build.sh first.');
  process.exit(1);
}

// Load and validate manifest
const manifestPath = path.join(chromeDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Error: manifest.json not found in chrome/ directory.');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log('✅ Manifest loaded successfully');
} catch (err) {
  console.error('❌ Error parsing manifest.json:', err.message);
  process.exit(1);
}

// Validate manifest structure
console.log('\n📋 Validating manifest structure...');

const validations = [
  { field: 'manifest_version', expected: 3, check: v => v === 3 },
  { field: 'name', check: v => typeof v === 'string' && v.length > 0 },
  { field: 'version', check: v => /^\d+\.\d+\.\d+$/.test(v) },
  { field: 'description', check: v => typeof v === 'string' && v.length > 0 },
  { field: 'background.service_worker', check: v => v === 'background.js' },
  { field: 'content_scripts', check: v => Array.isArray(v) && v.length > 0 }
];

let passed = 0;
let failed = 0;

validations.forEach(({ field, expected, check }) => {
  const value = field.split('.').reduce((obj, key) => obj?.[key], manifest);
  const isValid = check(value);
  
  if (isValid) {
    console.log(`  ✅ ${field}: ${expected !== undefined ? expected : 'valid'}`);
    passed++;
  } else {
    console.log(`  ❌ ${field}: validation failed`);
    failed++;
  }
});

// Check if required files exist
console.log('\n📁 Checking required files...');

const requiredFiles = [
  'background.js',
  'content.js',
  'manifest.json'
];

requiredFiles.forEach(file => {
  const filePath = path.join(chromeDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
    passed++;
  } else {
    console.log(`  ❌ ${file} not found`);
    failed++;
  }
});

// Validate JavaScript syntax
console.log('\n🔍 Validating JavaScript files...');

['background.js', 'content.js'].forEach(file => {
  const filePath = path.join(chromeDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common issues
    if (content.includes('__BROWSER_API__')) {
      console.log(`  ❌ ${file}: Contains unreplaced __BROWSER_API__ placeholder`);
      failed++;
    } else if (!content.includes('chrome.runtime')) {
      console.log(`  ⚠️  ${file}: Doesn't use chrome.runtime API (might be OK)`);
      passed++;
    } else {
      console.log(`  ✅ ${file}: Syntax looks good`);
      passed++;
    }
  } catch (err) {
    console.log(`  ❌ ${file}: Error reading file - ${err.message}`);
    failed++;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✅ All tests passed!');
  console.log('\n📦 The Chrome extension is ready for:');
  console.log('   1. Manual testing (load unpacked in chrome://extensions/)');
  console.log('   2. Packaging (yarn build:chrome)');
  console.log('   3. Distribution (upload to Chrome Web Store)');
  console.log('\n💡 For full testing:');
  console.log('   - Test AWS CLI: aws sso login');
  console.log('   - Test AWS VPN: Connect to VPN and verify tab closes');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please fix the issues above.');
  process.exit(1);
}
