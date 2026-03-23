/**
 * Q101 PPTX Generation Template
 *
 * Generated scripts for PPTX creation should follow this pattern
 * for reliable module resolution from any working directory.
 *
 * Usage:
 *   1. Copy this template to your workspace
 *   2. Customize the createPresentation() function
 *   3. Run: node create-pptx.js
 */
const path = require('path');
const fs = require('fs');

// ============================================================================
// SKILL DIRECTORY CONFIGURATION
// Modules are installed in the skill's node_modules directory
// ============================================================================
const SKILL_DIR = 'c:/Users/Public/Claude/Q101/Agents/.claude/skills/pptx';
const SKILL_MODULES = path.join(SKILL_DIR, 'node_modules');

// Load dependencies from skill directory (works from any working directory)
const pptxgen = require(path.join(SKILL_MODULES, 'pptxgenjs'));
const html2pptx = require(path.join(SKILL_DIR, 'scripts', 'html2pptx.js'));

// ============================================================================
// PRESENTATION CREATION
// Customize this section for your specific presentation
// ============================================================================
async function createPresentation() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Q101 Framework';
    pptx.title = 'Presentation Title';

    // Example: Add slides from HTML files with auto-fix enabled
    // const slideFiles = ['slide01.html', 'slide02.html', 'slide03.html'];
    // for (const file of slideFiles) {
    //     console.log(`Processing: ${file}`);
    //     const { slide, fixReport } = await html2pptx(file, pptx, { autofix: true });
    //     if (fixReport && fixReport.fixes.length > 0) {
    //         console.log(`  [AUTOFIX] Fixed ${fixReport.fixes.length} issues`);
    //         fixReport.fixes.forEach(f => console.log(`    - ${f.type}: ${f.fix}`));
    //     }
    // }

    // Example: Add a simple text slide
    const slide = pptx.addSlide();
    slide.addText('Hello from Q101 Framework', {
        x: 1, y: 1, w: 8, h: 1,
        fontSize: 24,
        color: '1C2833',
        bold: true
    });

    // Save the presentation
    const outputPath = 'output.pptx';
    await pptx.writeFile(outputPath);
    console.log(`PPTX saved to: ${outputPath}`);
}

// Run the presentation creation
createPresentation().catch(err => {
    console.error('Error creating presentation:', err);
    process.exit(1);
});
