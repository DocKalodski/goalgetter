/**
 * html-autofix - Automatically fix HTML slide issues before PPTX conversion
 *
 * USAGE:
 *   const htmlAutofix = require('./html-autofix');
 *   const { fixedPath, report } = await htmlAutofix('slide.html', options);
 *
 * OPTIONS:
 *   - maxIterations: Max overflow fix iterations (default: 5)
 *   - dryRun: Report issues without fixing (default: false)
 *
 * RETURNS:
 *   {
 *     fixedPath: string | null,  // Path to fixed HTML (null if no fixes needed)
 *     report: {
 *       inputFile: string,
 *       outputFile: string | null,
 *       success: boolean,
 *       fixes: Array<{ type, element?, fix, iterations? }>,
 *       warnings: string[]
 *     }
 *   }
 */

const path = require('path');
const fs = require('fs');

// Resolve playwright from skill's node_modules
const skillDir = path.resolve(__dirname, '..');
const skillModules = path.join(skillDir, 'node_modules');
const { chromium } = require(path.join(skillModules, 'playwright'));

const PT_PER_PX = 0.75;

/**
 * Detect overflow in the page
 */
async function detectOverflow(page) {
    return await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        const width = parseFloat(style.width);
        const height = parseFloat(style.height);
        const scrollWidth = body.scrollWidth;
        const scrollHeight = body.scrollHeight;

        return {
            hasOverflow: scrollWidth > width + 1 || scrollHeight > height + 1,
            widthOverflow: Math.max(0, scrollWidth - width - 1),
            heightOverflow: Math.max(0, scrollHeight - height - 1),
            width,
            height,
            scrollWidth,
            scrollHeight
        };
    });
}

/**
 * Detect styled text elements (p, h1-h6 with background/border/shadow)
 */
async function detectStyledTextElements(page) {
    return await page.evaluate(() => {
        const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
        const issues = [];

        document.querySelectorAll(textTags.join(',')).forEach((el, index) => {
            const computed = window.getComputedStyle(el);
            const hasBg = computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)';
            const hasBorder = (computed.borderWidth && parseFloat(computed.borderWidth) > 0) ||
                (computed.borderTopWidth && parseFloat(computed.borderTopWidth) > 0) ||
                (computed.borderRightWidth && parseFloat(computed.borderRightWidth) > 0) ||
                (computed.borderBottomWidth && parseFloat(computed.borderBottomWidth) > 0) ||
                (computed.borderLeftWidth && parseFloat(computed.borderLeftWidth) > 0);
            const hasShadow = computed.boxShadow && computed.boxShadow !== 'none';

            if (hasBg || hasBorder || hasShadow) {
                issues.push({
                    index,
                    tagName: el.tagName,
                    className: el.className,
                    hasBg,
                    hasBorder,
                    hasShadow,
                    text: el.textContent.substring(0, 30) + (el.textContent.length > 30 ? '...' : '')
                });
            }
        });

        return issues;
    });
}

/**
 * Fix styled text elements by wrapping in divs
 */
async function fixStyledTextElements(page) {
    const fixes = [];

    const issues = await detectStyledTextElements(page);
    if (issues.length === 0) return fixes;

    // Fix each issue (process in reverse to maintain indices)
    for (const issue of issues.reverse()) {
        await page.evaluate((issueData) => {
            const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
            const elements = document.querySelectorAll(textTags.join(','));
            const el = elements[issueData.index];
            if (!el) return;

            const computed = window.getComputedStyle(el);

            // Create wrapper div
            const wrapper = document.createElement('div');
            wrapper.className = 'autofix-wrapper';

            // Move visual styles to wrapper
            if (issueData.hasBg) {
                wrapper.style.backgroundColor = computed.backgroundColor;
                el.style.backgroundColor = 'transparent';
            }
            if (issueData.hasBorder) {
                wrapper.style.borderTop = computed.borderTop;
                wrapper.style.borderRight = computed.borderRight;
                wrapper.style.borderBottom = computed.borderBottom;
                wrapper.style.borderLeft = computed.borderLeft;
                el.style.border = 'none';
            }
            if (issueData.hasShadow) {
                wrapper.style.boxShadow = computed.boxShadow;
                el.style.boxShadow = 'none';
            }

            // Transfer padding and border-radius to wrapper
            wrapper.style.padding = computed.padding;
            wrapper.style.borderRadius = computed.borderRadius;
            wrapper.style.margin = computed.margin;

            // Reset element padding/margin
            el.style.padding = '0';
            el.style.margin = '0';

            // Preserve display mode
            const display = computed.display;
            if (display === 'inline' || display === 'inline-block') {
                wrapper.style.display = 'inline-block';
            }

            // Wrap element
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);

        }, issue);

        const styleTypes = [];
        if (issue.hasBg) styleTypes.push('background');
        if (issue.hasBorder) styleTypes.push('border');
        if (issue.hasShadow) styleTypes.push('shadow');

        fixes.push({
            type: 'styling',
            element: `<${issue.tagName.toLowerCase()}${issue.className ? '.' + issue.className.split(' ')[0] : ''}>`,
            fix: `wrapped in div, moved ${styleTypes.join('/')} to wrapper`,
            text: issue.text
        });
    }

    return fixes;
}

/**
 * Fix overflow by reducing padding/margins and font sizes
 */
async function fixOverflow(page, maxIterations = 5) {
    const REDUCTION_FACTORS = [0.95, 0.90, 0.85, 0.80, 0.75];
    const fixes = [];

    for (let i = 0; i < maxIterations; i++) {
        const overflow = await detectOverflow(page);
        if (!overflow.hasOverflow) break;

        const factor = REDUCTION_FACTORS[Math.min(i, REDUCTION_FACTORS.length - 1)];

        // Strategy 1: Reduce padding/margins on content containers
        await page.evaluate((f) => {
            document.querySelectorAll('.content, .header, .features-grid, .entity-box, .entity-content, .problem-box, .audience-box, .revenue-item, .feature-card, .step-item, .detail-col, .metrics-section, [class*="box"], [class*="card"], [class*="item"]').forEach(el => {
                const s = window.getComputedStyle(el);
                ['padding', 'margin'].forEach(prop => {
                    ['Top', 'Right', 'Bottom', 'Left'].forEach(side => {
                        const val = parseFloat(s[prop + side]);
                        if (val > 3) {
                            el.style[prop + side] = Math.max(val * f, 2) + 'px';
                        }
                    });
                });
            });

            // Reduce gaps
            document.querySelectorAll('*').forEach(el => {
                const s = window.getComputedStyle(el);
                if (s.gap && s.gap !== 'normal') {
                    const gapVal = parseFloat(s.gap);
                    if (gapVal > 5) {
                        el.style.gap = (gapVal * f) + 'px';
                    }
                }
            });
        }, factor);

        // Check if fixed
        if (!(await detectOverflow(page)).hasOverflow) {
            fixes.push({
                type: 'overflow',
                fix: `reduced padding/margins by ${Math.round((1 - factor) * 100)}%`,
                iterations: i + 1
            });
            break;
        }

        // Strategy 2: Reduce font sizes
        await page.evaluate((f) => {
            document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span').forEach(el => {
                const size = parseFloat(window.getComputedStyle(el).fontSize);
                const newSize = Math.max(size * f, 10.67); // Min 8pt
                el.style.fontSize = newSize + 'px';
            });
        }, factor);

        // Check if fixed
        if (!(await detectOverflow(page)).hasOverflow) {
            fixes.push({
                type: 'overflow',
                fix: `reduced padding/margins and fonts by ${Math.round((1 - factor) * 100)}%`,
                iterations: i + 1
            });
            break;
        }

        // Strategy 3: Reduce line heights
        await page.evaluate((f) => {
            document.querySelectorAll('p, li').forEach(el => {
                const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight);
                if (!isNaN(lineHeight) && lineHeight > 12) {
                    el.style.lineHeight = (lineHeight * f) + 'px';
                }
            });
        }, factor);

        // Record final attempt
        if (i === maxIterations - 1) {
            const remaining = await detectOverflow(page);
            fixes.push({
                type: 'overflow',
                fix: `reduced sizes (max iterations)`,
                iterations: maxIterations,
                remaining: remaining.hasOverflow ? Math.max(remaining.widthOverflow, remaining.heightOverflow) * PT_PER_PX : 0
            });
        }
    }

    return fixes;
}

/**
 * Get the modified HTML content from the page
 */
async function getFixedHtml(page) {
    return await page.evaluate(() => {
        return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    });
}

/**
 * Main entry point - auto-fix HTML slide issues
 */
async function htmlAutofix(htmlFile, options = {}) {
    const { maxIterations = 5, dryRun = false } = options;

    const report = {
        inputFile: htmlFile,
        outputFile: null,
        success: true,
        fixes: [],
        warnings: []
    };

    // Resolve absolute path
    const absolutePath = path.isAbsolute(htmlFile) ? htmlFile : path.resolve(htmlFile);
    if (!fs.existsSync(absolutePath)) {
        report.success = false;
        report.warnings.push(`File not found: ${absolutePath}`);
        return { fixedPath: null, report };
    }

    const fileUrl = 'file:///' + absolutePath.replace(/\\/g, '/');

    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
        await page.goto(fileUrl, { waitUntil: 'networkidle' });

        // Phase 1: Detect issues
        const initialOverflow = await detectOverflow(page);
        const initialStyling = await detectStyledTextElements(page);

        const hasOverflow = initialOverflow.hasOverflow;
        const hasStyling = initialStyling.length > 0;

        if (!hasOverflow && !hasStyling) {
            await browser.close();
            return { fixedPath: null, report };
        }

        if (dryRun) {
            if (hasStyling) {
                initialStyling.forEach(issue => {
                    report.fixes.push({
                        type: 'styling',
                        element: `<${issue.tagName.toLowerCase()}>`,
                        fix: '(would wrap in div)',
                        text: issue.text
                    });
                });
            }
            if (hasOverflow) {
                report.fixes.push({
                    type: 'overflow',
                    fix: `(would reduce sizes - ${(initialOverflow.heightOverflow * PT_PER_PX).toFixed(1)}pt overflow)`,
                    iterations: 0
                });
            }
            await browser.close();
            return { fixedPath: null, report };
        }

        // Phase 2: Fix styling issues first
        if (hasStyling) {
            const stylingFixes = await fixStyledTextElements(page);
            report.fixes.push(...stylingFixes);
        }

        // Phase 3: Fix overflow issues
        const overflowAfterStyling = await detectOverflow(page);
        if (overflowAfterStyling.hasOverflow) {
            const overflowFixes = await fixOverflow(page, maxIterations);
            report.fixes.push(...overflowFixes);
        }

        // Phase 4: Write fixed HTML
        const fixedHtml = await getFixedHtml(page);
        const parsedPath = path.parse(absolutePath);
        const fixedPath = path.join(parsedPath.dir, parsedPath.name + '-fixed' + parsedPath.ext);

        fs.writeFileSync(fixedPath, fixedHtml, 'utf-8');
        report.outputFile = fixedPath;

        // Check final state
        const finalOverflow = await detectOverflow(page);
        if (finalOverflow.hasOverflow) {
            report.warnings.push(
                `Could not fully fix overflow. Remaining: ${(finalOverflow.heightOverflow * PT_PER_PX).toFixed(1)}pt`
            );
        }

        await browser.close();
        return { fixedPath, report };

    } catch (err) {
        await browser.close();
        report.success = false;
        report.warnings.push(`Error: ${err.message}`);
        return { fixedPath: null, report };
    }
}

module.exports = htmlAutofix;
