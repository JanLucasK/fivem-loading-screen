// Run against the local preview server; see README.md.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173/html/';
(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let fullHdMetrics;
    for (const [width, height] of [[1920,1080],[2560,1440],[3840,2160],[3440,1440],[5120,1440],[1440,900],[1366,768],[1280,720],[2560,1080],[390,844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(base + '?preview=1');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1600);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        vertical: document.documentElement.scrollHeight > innerHeight,
        broken: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src),
        logo: document.querySelector('.brand-logo').naturalWidth > 0,
        footerClear: document.querySelector('.social-footer').getBoundingClientRect().bottom <= innerHeight - 70,
        composition: Object.fromEntries(['.layout', '.brand-logo', '.portal', '.social-link', '.carousel-controls button'].map(selector => {
          const { width, height } = document.querySelector(selector).getBoundingClientRect();
          return [selector, { width, height }];
        })),
        fontSizes: Object.fromEntries(['.loading-top h1', '.percentage', '#loading-detail', '.story h3', '.story-description', '.story-tab .tab-title', '.social-name'].map(selector =>
          [selector, parseFloat(getComputedStyle(document.querySelector(selector)).fontSize)])),
        mask: getComputedStyle(document.querySelector('.portal-media')).webkitMaskImage
      }));
      assert.equal(metrics.overflow, false, `${width}: horizontal overflow`);
      if (width > 900) assert.equal(metrics.vertical, false, `${width}: vertical overflow`);
      assert.deepEqual(metrics.broken, []);
      assert.ok(metrics.logo, 'original logo loads');
      if (width > 900) assert.ok(metrics.footerClear, 'native loading overlay space remains clear');
      assert.match(metrics.mask, /data:image\/svg/);
      if (width === 1920 && height === 1080) fullHdMetrics = metrics;
      if (width >= 1920 && height >= 1080) {
        const scale = Math.min(width / 1920, height / 1080);
        for (const [selector, dimensions] of Object.entries(metrics.composition)) {
          for (const axis of ['width', 'height']) {
            assert.ok(dimensions[axis] >= fullHdMetrics.composition[selector][axis] * scale - 1,
              `${width}x${height}: ${selector} ${axis} remains too small`);
          }
        }
        for (const [selector, fontSize] of Object.entries(metrics.fontSizes)) {
          assert.ok(fontSize >= fullHdMetrics.fontSizes[selector] * scale - .1,
            `${width}x${height}: ${selector} text remains too small`);
        }
        assert.ok(metrics.composition['.layout'].height <= height * .6,
          `${width}x${height}: compact composition grows beyond its intended height`);
      }
      await page.screenshot({ path: `/tmp/neov-${width}x${height}.png`, fullPage: true });
      for (let index = 0; index < 4; index++) {
        await page.locator('.story-tab').nth(index).click();
        await page.waitForTimeout(900);
        const layout = await page.locator('.story.is-active').evaluate(slide => {
          const title = slide.querySelector('h3').getBoundingClientRect();
          const category = slide.querySelector('.story-category').getBoundingClientRect();
          const bounds = slide.getBoundingClientRect();
          return { fits: category.top >= bounds.top && title.right <= bounds.right,
            copyFits: slide.querySelector('.story-copy').scrollWidth <= bounds.width + 1 };
        });
        assert.ok(layout.fits && layout.copyFits, `${width}: slide ${index} clipped`);
      }
      console.log(`PASS layout and all slides ${width}×${height}`);
    }
    await page.goto(base);
    assert.equal(await page.locator('.social-link').count(), 5);
    assert.equal(await page.locator('.social-link').first().getAttribute('href'), 'https://neov.makeitclever.de/');
    assert.equal(await page.locator('.social-link').last().textContent(), 'Instagram↗');
    assert.equal(await page.locator('.social-link').nth(1).getAttribute('aria-disabled'), 'true');
    await page.locator('.social-link').nth(1).dispatchEvent('click');
    assert.equal(page.url(), base, 'placeholder does not navigate or change hash');
    assert.equal(await page.locator('.social-link').nth(1).getAttribute('href'), '#');
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#progress-label').textContent(), '00');
    assert.equal(await page.locator('#preview-label').isVisible(), false);
    await page.evaluate(() => {
      for (const data of [null, {}, { eventName: 'loadProgress', loadFraction: 'bad' }, { eventName: 'loadProgress', loadFraction: NaN }]) window.postMessage(data, '*');
    });
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#progress-label').textContent(), '00');
    await page.evaluate(() => window.postMessage({ eventName: 'loadProgress', loadFraction: .65 }, '*'));
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.loading').getAttribute('aria-valuenow'), '65');
    await page.evaluate(() => window.postMessage({ eventName: 'loadProgress', loadFraction: .2 }, '*'));
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#progress-label').textContent(), '65');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.story.is-active').getAttribute('id'), 'story-1');
    await page.locator('#toggle-rotation').click();
    assert.equal(await page.locator('#toggle-rotation').getAttribute('aria-pressed'), 'true');
    const fontRoles = await page.evaluate(() => Object.fromEntries(
      ['.brand','.story-category','.story-description','#progress-label','.story h3'].map(selector =>
        [selector, getComputedStyle(document.querySelector(selector)).fontFamily])));
    assert.match(fontRoles['.brand'], /Ignazio/);
    assert.match(fontRoles['.story-category'], /Corvent/);
    assert.match(fontRoles['.story-description'], /Helvena/);
    assert.match(fontRoles['#progress-label'], /Codent/);
    assert.match(fontRoles['.story h3'], /Corvent/);
    assert.equal(await page.locator('.brand').evaluate(node => getComputedStyle(node).fontWeight), '400');
    console.log('PASS font roles, real progress, malformed events, monotonic loading, keyboard, pause');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base);
    assert.equal(await page.locator('#toggle-rotation').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#portal-image').evaluate(img => getComputedStyle(img).animationName), 'none');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('.story.is-active').getAttribute('id'), 'story-3');
    console.log('PASS reduced motion and manual carousel');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // Override configuration through the response to exercise real render paths.
    await page.route('**/js/config.js', route => route.fulfill({ contentType: 'application/javascript', body: `window.NEOV_CONFIG={slideDuration:4000,stories:[]}` }));
    await page.goto(base);
    assert.equal(await page.locator('.story').count(), 1);
    assert.equal(await page.locator('#next').isDisabled(), true);
    assert.equal(await page.locator('.footer').count(), 0);
    await page.unroute('**/js/config.js');
    await page.route('**/js/config.js', route => route.fulfill({ contentType: 'application/javascript', body: `window.NEOV_CONFIG={slideDuration:4000,portal:{image:'missing.jpg',video:'missing.webm'},stories:[{title:['Test','Meldung'],image:'missing.jpg',icon:'missing.svg',logo:'missing-logo.svg'},{title:['Zweite','Meldung']}]}` }));
    await page.goto(base);
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('.story-image').first().getAttribute('data-fallback'), 'true');
    assert.equal(await page.locator('.story-icon').isVisible(), false);
    assert.equal(await page.locator('#portal-video').isVisible(), false);
    await page.mouse.move(0,0);
    await page.waitForTimeout(4200);
    assert.equal(await page.locator('.story.is-active').getAttribute('id'), 'story-1');
    await page.locator('#toggle-rotation').click();
    await page.mouse.move(0,0);
    await page.locator('#toggle-rotation').evaluate(button => button.blur());
    await page.waitForTimeout(4200);
    assert.equal(await page.locator('.story.is-active').getAttribute('id'), 'story-1');
    // Resume while the pointer and focus remain on the button: the old freeze.
    await page.locator('#toggle-rotation').click();
    assert.equal(await page.locator('#cycle-status').textContent(), 'Automatisch');
    const cycle = () => page.locator('.story-tabs').evaluate(node => Number(node.style.getPropertyValue('--cycle')));
    const before = await cycle();
    await page.waitForTimeout(500);
    assert.ok(await cycle() > before, 'resume advances with button still focused and hovered');
    // Mouse navigation resets the timer, then advances even with pointer over a tab.
    await page.locator('.story-tab').first().click();
    await page.waitForTimeout(500);
    assert.ok(await cycle() > .05 && await cycle() < .4);
    await page.waitForTimeout(3800);
    assert.equal(await page.locator('.story.is-active').getAttribute('id'), 'story-1');
    assert.equal(await page.locator('.story-tab').first().getAttribute('class'), 'story-tab is-complete');
    await page.waitForTimeout(4100);
    assert.equal(await page.locator('.story.is-active').getAttribute('id'), 'story-0');
    assert.equal(await page.locator('.is-complete').count(), 0);
    // Keyboard focus pauses visibly; activating play can override that pause.
    await page.locator('.story-tab').first().focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#cycle-status').textContent(), 'Pausiert');
    await page.locator('#toggle-rotation').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#cycle-status').textContent(), 'Automatisch');
    await page.waitForTimeout(500);
    assert.ok(await cycle() > .05);
    // Interrupt transitions repeatedly; only the final slide may remain active.
    await page.evaluate(() => {
      for (let i=0;i<9;i++) document.querySelector('#next').click();
    });
    await page.waitForTimeout(1400);
    assert.equal(await page.locator('.story.is-active').count(), 1);
    assert.equal(await page.locator('.is-outgoing').count(), 0);
    console.log('PASS empty config, missing media, pointer/focus timer regression, wrap, keyboard resume, interrupted transitions');
    await page.unroute('**/js/config.js');

    let shutdownCalls = 0;
    await page.route('https://fivem-loading-screen/shutdownLoadingScreenNui', route => {
      shutdownCalls++; return route.fulfill({ body: '{}', contentType: 'application/json' });
    });
    await page.goto(base);
    await page.evaluate(() => {
      window.postMessage({ eventName: 'shutdownLoadingScreen' }, '*');
      window.postMessage({ eventName: 'shutdownLoadingScreen' }, '*');
    });
    await page.waitForTimeout(800);
    assert.equal(shutdownCalls, 1);
    assert.equal(await page.locator('#progress-label').textContent(), '100');
    assert.equal(await page.locator('body').getAttribute('class'), 'fade-out');
    assert.deepEqual(errors, []);
    console.log('PASS idempotent shutdown and no JavaScript errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
