import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.resolve(__dirname, '../../docs/screenshots');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Launching browser to capture ReelVault screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

    // 1. Dashboard
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await sleep(2500); // Wait for reels to load from backend API

    const dashboardPath = path.join(OUT_DIR, 'dashboard.png');
    await page.screenshot({ path: dashboardPath });
    console.log('Saved:', dashboardPath);

    // 2. Click on the first reel card to open the Modal
    console.log('Clicking on first reel card...');
    const reelCards = await page.$$('article');
    if (reelCards.length > 0) {
      await reelCards[0].click();
      await sleep(1500); // Wait for modal animation and video render

      const modalPath = path.join(OUT_DIR, 'reel_detail_modal.png');
      await page.screenshot({ path: modalPath });
      console.log('Saved:', modalPath);

      // 3. Switch to Visual Frames tab
      console.log('Switching to Visual Frames tab...');
      const tabButtons = await page.$$('button');
      for (const btn of tabButtons) {
        const text = await page.evaluate((el) => el.textContent, btn);
        if (text && text.includes('Visual Frames')) {
          await btn.click();
          await sleep(1000);
          const framesPath = path.join(OUT_DIR, 'visual_frames.png');
          await page.screenshot({ path: framesPath });
          console.log('Saved:', framesPath);
          break;
        }
      }

      // Close modal
      const closeBtn = await page.$('button[aria-label="Close modal"], button svg.lucide-x');
      const allButtons = await page.$$('button');
      for (const btn of allButtons) {
        const hasSvg = await page.evaluate((el) => el.querySelector('svg') !== null && el.closest('.fixed'), btn);
        if (hasSvg) {
          // might be close button
        }
      }
      await page.keyboard.press('Escape');
      await sleep(500);
    }

    // 4. Search Showcase
    console.log('Showcasing search filter...');
    const searchInput = await page.$('#searchInput');
    if (searchInput) {
      await searchInput.type('video');
      await sleep(1000);
      const searchPath = path.join(OUT_DIR, 'search_filter.png');
      await page.screenshot({ path: searchPath });
      console.log('Saved:', searchPath);
    }

    console.log('Screenshots capture complete!');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
