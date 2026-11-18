/* Optional real-browser checks. Requires Playwright and two local HTTP servers.
 * No live WordPress connection. Screenshots are review artifacts, not approval.
 */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const base = 'http://127.0.0.1:8001';
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  await fs.mkdir('test-results', { recursive: true });
  try {
    for (const width of [320, 390, 768, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width < 768 });
      await context.addInitScript(() => { Date.now = () => Date.UTC(2026, 10, 17, 12); });
      const page = await context.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(base + '/interactief/voyager-1-v2/#licht');
      await page.waitForFunction(() => document.querySelector('#dKm').textContent !== '…');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal page overflow at ' + width);
      assert.equal(await page.locator('#msList li').count(), 18);
      await page.locator('#map').focus(); await page.keyboard.press('Space');
      assert.equal(await page.locator('#play').textContent(), 'Afspelen');
      await page.keyboard.press('ArrowRight'); await page.keyboard.press('Equal');
      await page.locator('#msNext').click();
      await page.locator('#sigMsg').fill('<b>Geen HTML</b>'); await page.locator('#sigForm button').click();
      assert.equal(await page.locator('#sigList b').count(), 0);
      await page.locator('#themeBtn').click();
      assert.equal(await page.locator('#themeBtn').getAttribute('aria-pressed'), 'true');
      await page.screenshot({ path: 'test-results/v2-' + width + '.png', fullPage: true });
      await context.close();
    }
    // Generic checks for every published element: loads all files, no errors, no overflow.
    const elements = (await fs.readdir(__dirname + '/../interactief', { withFileTypes: true }))
      .filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name);
    for (const name of elements) {
      for (const width of [320, 1280]) {
        const generic = await browser.newPage({ viewport: { width, height: 900 } });
        const problems = [];
        generic.on('pageerror', (e) => problems.push(e.message));
        generic.on('requestfailed', (r) => problems.push('failed ' + r.url()));
        generic.on('response', (r) => { if (r.status() >= 400) problems.push(r.status() + ' ' + r.url()); });
        await generic.goto(base + '/interactief/' + name + '/', { waitUntil: 'networkidle' });
        assert(await generic.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name + ': horizontal overflow at ' + width);
        assert.deepEqual(problems, [], name + ' at ' + width);
        await generic.screenshot({ path: 'test-results/element-' + name + '-' + width + '.png', fullPage: true });
        await generic.close();
      }
    }
    // Compare the actual initial canvas with the original at a frozen clock.
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    await context.addInitScript(() => { Date.now = () => Date.UTC(2026, 10, 17, 12); });
    // The original is no longer published; serve the test fixture as HTML.
    const fixture = await fs.readFile(__dirname + '/fixtures/voyager-1-origineel.html.txt');
    await context.route(base + '/interactief/voyager-1-origineel/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: fixture }));
    const original = await context.newPage(), updated = await context.newPage();
    for (const [page, path] of [[original, 'voyager-1-origineel'], [updated, 'voyager-1-v2']]) {
      await page.goto(base + '/interactief/' + path + '/#licht');
      await page.waitForFunction(() => document.querySelector('#dKm').textContent !== '…');
    }
    assert.equal(await original.locator('#dKm').textContent(), await updated.locator('#dKm').textContent());
    for (const page of [original, updated]) await page.addStyleTag({ content: '.hud,.zhint{visibility:hidden!important}' });
    const a = await original.locator('#map').screenshot({ path: 'test-results/original-canvas.png' });
    const b = await updated.locator('#map').screenshot({ path: 'test-results/v2-canvas.png' });
    assert(a.equals(b), 'Initial canvas pixels must match the original');
    await context.close();
    const reduced = await browser.newContext({ reducedMotion: 'reduce' });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(base + '/interactief/voyager-1-v2/');
    await reducedPage.waitForFunction(() => document.querySelector('#play').textContent === 'Afspelen');
    assert.equal(await reducedPage.locator('#live').getAttribute('aria-pressed'), 'false');
    await reduced.close();
    const embeds = await browser.newPage({ viewport: { width: 390, height: 844 } });
    embeds.on('pageerror', (e) => errors.push(e.message));
    await embeds.goto('http://127.0.0.1:8000/integratie/voorbeeld.html');
    const frame = embeds.locator('iframe').first();
    await frame.scrollIntoViewIfNeeded();
    const inner = embeds.frameLocator('iframe').first();
    await inner.locator('#dKm').waitFor();
    const height = () => frame.evaluate((el) => parseFloat(el.style.height));
    await embeds.waitForFunction(() => parseFloat(document.querySelector('iframe').style.height) !== 2200);
    const initialHeight = await height();
    await inner.locator('#msAll').click();
    await embeds.waitForFunction((h) => parseFloat(document.querySelector('iframe').style.height) > h, initialHeight);
    await inner.locator('#msAll').click();
    await embeds.waitForFunction((h) => parseFloat(document.querySelector('iframe').style.height) <= h + 1, initialHeight);
    await embeds.locator('iframe').nth(1).scrollIntoViewIfNeeded();
    await embeds.waitForFunction(() => parseFloat(document.querySelectorAll('iframe')[1].style.height) !== 600);
    assert.equal(await embeds.locator('iframe').count(), 2);
    await embeds.screenshot({ path: 'test-results/iframe-mobile.png', fullPage: true });
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    console.log('Browser checks passed: ' + elements.length + ' elements generically, desktop/tablet/mobile, initial canvas, reduced motion, keyboard, signals and two iframes.');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
