import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Test 1: 1440px Reference
  console.log('Testing reference at 1440px...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173/reference.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot_ref_1440.png', fullPage: true });

  // Test 2: 1440px React App
  console.log('Testing React App at 1440px...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot_app_1440.png', fullPage: true });

  // Test 3: 390px Reference
  console.log('Testing reference at 390px (mobile)...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/reference.html', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot_ref_390.png', fullPage: true });

  // Test 4: 390px React App
  console.log('Testing React App at 390px (mobile)...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot_app_390.png', fullPage: true });

  // Test 5: Interactions in React App at 1440px
  console.log('Testing interactions at 1440px...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // 5a: Search input and clear button
  const searchInput = await page.$('#searchInput');
  await searchInput.type('framework');
  await page.waitForTimeout ? page.waitForTimeout(500) : new Promise((r) => setTimeout(r, 500));
  const clearBtn = await page.$('#clearSearchBtn');
  console.log('Clear button visible when typing:', !!clearBtn);
  await clearBtn.click();
  const searchValAfterClear = await page.$eval('#searchInput', (el) => el.value);
  console.log('Search value after clear:', searchValAfterClear === '');

  // 5b: New collection popup
  const openModalBtn = await page.$('#openCollectionModalBtn');
  await openModalBtn.click();
  const popupVisible = await page.$eval('#newCollectionPopup', (el) => !el.classList.contains('hidden'));
  console.log('New Collection popup visible:', popupVisible);
  await page.screenshot({ path: 'screenshot_app_popup.png' });

  // Create new collection
  const colInput = await page.$('#collectionNameInput');
  await colInput.type('AI & Machine Learning');
  const createBtn = await page.$('#newCollectionForm button[type="submit"]');
  await createBtn.click();
  await new Promise((r) => setTimeout(r, 300));
  const activeColText = await page.$eval('.collection-pill.active', (el) => el.textContent.trim());
  console.log('Active collection after create:', activeColText);

  // 5c: Collection filtering
  const codingBtn = await page.$('button[data-collection="coding"]');
  if (codingBtn) {
    await codingBtn.click();
    await new Promise((r) => setTimeout(r, 200));
    const activeCol = await page.$eval('.collection-pill.active', (el) => el.textContent.trim());
    console.log('Active collection clicked Coding:', activeCol);
  }

  // 5d: Verify header styles and classes
  const refHeaderClasses = await page.evaluate(async () => {
    const res = await fetch('/reference.html');
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return {
      header: doc.querySelector('header').className,
      main: doc.querySelector('main').className,
      footer: doc.querySelector('footer').className,
      addReelForm: doc.querySelector('#addReelForm').className,
      saveReelBtn: doc.querySelector('#saveReelBtn').className,
      collectionsBar: doc.querySelector('#collectionsBar').className,
    };
  });

  const appClasses = await page.evaluate(() => {
    return {
      header: document.querySelector('header').className,
      main: document.querySelector('main').className,
      footer: document.querySelector('footer').className,
      addReelForm: document.querySelector('#addReelForm').className,
      saveReelBtn: document.querySelector('#saveReelBtn').className,
      collectionsBar: document.querySelector('#collectionsBar').className,
    };
  });

  console.log('\n--- Class comparison ---');
  for (const key of Object.keys(refHeaderClasses)) {
    const match = refHeaderClasses[key].trim() === appClasses[key].trim();
    console.log(`${key}: ${match ? 'EXACT MATCH' : 'DIFF'}`);
    if (!match) {
      console.log('  Ref: ', refHeaderClasses[key]);
      console.log('  App: ', appClasses[key]);
    }
  }

  await browser.close();
  console.log('Comparison completed successfully!');
}

main().catch((err) => {
  console.error('Error in compare:', err);
  process.exit(1);
});
