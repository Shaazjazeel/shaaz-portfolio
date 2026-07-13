const sharp = require('sharp');
const fs = require('fs');

const crosshairSvg = Buffer.from(`
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <g stroke="rgba(255, 255, 255, 0.2)" stroke-width="3" fill="none" transform="translate(400, 300)">
    <path d="M-40 -120v-40h40M-40 -40l-50 -50M70 -10v-40h-40m40 0l-50 50M-40 120v40h40m-40 0l-50 -50M70 10v40h-40m40 0l-50 -50" />
    <circle cx="0" cy="0" r="20" stroke="rgba(255, 255, 255, 0.15)"/>
  </g>
</svg>
`);

const nodesSvg = Buffer.from(`
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <g stroke="rgba(255, 255, 255, 0.2)" stroke-width="4" fill="none" transform="translate(400, 300) scale(4)">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </g>
</svg>
`);

async function processImages() {
  try {
    await sharp('./assets/linnkiq_abstract.webp')
      .composite([{ input: crosshairSvg, gravity: 'center' }])
      .toFile('ppe_watermarked.png');
      
    await sharp('./assets/hrms_abstract.webp')
      .composite([{ input: nodesSvg, gravity: 'center' }])
      .toFile('college_watermarked.png');
      
    console.log("Compositing complete!");
  } catch (err) {
    console.error(err);
  }
}

processImages();
