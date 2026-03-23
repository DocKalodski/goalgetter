#!/usr/bin/env node
/**
 * PPTX Skill Setup - Run once after cloning repository
 * Usage: node .claude/skills/pptx/scripts/setup.js
 *
 * This script installs all npm dependencies required for PPTX generation
 * into the skill's local node_modules directory.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const skillDir = path.resolve(__dirname, '..');
const nodeModulesPath = path.join(skillDir, 'node_modules');

console.log('=== Q101 PPTX Skill Setup ===\n');
console.log(`Skill directory: ${skillDir}`);

// Check if already installed
if (fs.existsSync(nodeModulesPath) && !process.argv.includes('--force')) {
    console.log('\nDependencies already installed.');
    console.log('Use --force to reinstall: node setup.js --force\n');

    // Still verify the installation
    console.log('Verifying existing installation...');
    verifyInstallation();
    process.exit(0);
}

// Run npm install
console.log('\nInstalling npm dependencies...');
try {
    execSync('npm install', { cwd: skillDir, stdio: 'inherit' });
} catch (err) {
    console.error('\nFailed to install dependencies:', err.message);
    console.error('Try running manually: cd ' + skillDir + ' && npm install');
    process.exit(1);
}

// Verify installation
console.log('\n=== Verifying installation ===');
verifyInstallation();

function verifyInstallation() {
    const deps = ['playwright', 'pptxgenjs', 'sharp'];
    let allOk = true;

    for (const dep of deps) {
        try {
            require(path.join(nodeModulesPath, dep));
            console.log(`  [OK] ${dep}`);
        } catch (e) {
            console.log(`  [FAIL] ${dep}: ${e.message}`);
            allOk = false;
        }
    }

    if (allOk) {
        console.log('\n=== Setup complete ===');
        console.log('PPTX skill is ready to use.\n');
    } else {
        console.error('\nSome dependencies failed to install.');
        console.error('Check the errors above and try running npm install manually.\n');
        process.exit(1);
    }
}
