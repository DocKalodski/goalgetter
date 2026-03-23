const pptxgen = require('pptxgenjs');
const path = require('path');
const html2pptx = require('../../scripts/html2pptx');

async function createPresentation() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Q101 Framework';
    pptx.title = 'BayanAIhan Content Generation System - Ideation';
    pptx.subject = 'AI para sa Bayan';

    const slides = [
        'slide0.html', 'slide1.html', 'slide2.html', 'slide3.html',
        'slide4.html', 'slide5.html', 'slide6.html', 'slide7.html'
    ];

    for (const slideFile of slides) {
        const htmlPath = path.join(__dirname, slideFile);
        console.log(`Processing ${slideFile}...`);
        await html2pptx(htmlPath, pptx, { autofix: true });
    }

    const outputPath = 'c:\\Users\\Public\\Claude\\Q101\\Agents\\.claude\\context\\ideas\\idea-bayanaihan-ai-para-sa-bayan-e757430e.pptx';
    await pptx.writeFile({ fileName: outputPath });
    console.log(`Presentation saved to: ${outputPath}`);
}

createPresentation().catch(console.error);
