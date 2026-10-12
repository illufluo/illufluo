import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('正式构建支持空状态，示例与草稿不公开', async ({ page, request }) => {
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.getByRole('heading', { name: '一些想法与记录。' })).toBeVisible();
  if (await page.locator('article').count() === 0) {
    await expect(page.getByText('暂时还没有公开的记录。')).toBeVisible();
  }
  await expect(page.locator('.sample-label, .preview-notice')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  expect((await request.get('http://127.0.0.1:4322/examples/2026-10-08-fragment/')).status()).toBe(404);
  expect((await request.get('/examples/2026-10-10-draft/')).status()).toBe(404);
  expect((await request.get('http://127.0.0.1:4322/notes/writing-template/')).status()).toBe(404);
});

test('无标题随笔全文与永久链接，长文摘要及 MDX 完整页面', async ({ page }) => {
  await page.goto('/');
  const fragment = page.locator('article[data-note-id="2026-10-08-fragment"]');
  await expect(fragment.locator('h1,h2')).toHaveCount(0);
  await expect(fragment).toContainText('再添上一个开头与结尾。');
  await fragment.locator('a').click();
  await expect(page).toHaveURL(/\/examples\/2026-10-08-fragment\/$/);
  await expect(page.locator('article .note-title')).toHaveCount(0);
  await expect(page.locator('article h1')).toHaveText('2026 年 10 月 8 日');
  await page.goto('/');
  const long = page.locator('article[data-note-id="2026-10-03-reading"]');
  await expect(long.getByRole('heading')).toHaveText('为阅读留一点空间');
  await expect(long.getByText('让文字保持自己的长度')).toHaveCount(0);
  await long.getByRole('link', { name: '阅读全文：为阅读留一点空间' }).click();
  await expect(page.getByRole('heading', { name: '让文字保持自己的长度' })).toBeVisible();
  await expect(page.locator('blockquote')).toBeVisible();
  await expect(page.getByText('更新于')).toBeVisible();
});

test('图片正确加载，归档用正文展示无标题记录', async ({ page }) => {
  await page.goto('/');
  const image = page.locator('article img');
  await expect(image).toHaveAttribute('alt', /弧线/);
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.getByRole('navigation').getByRole('link', { name: '归档' }).click();
  await expect(page.locator('#year-2026')).toHaveText('2026');
  const rows = page.locator('.archive-row[href^="/examples/"]');
  await expect(rows).toHaveCount(3);
  await expect(rows.first()).toContainText('有些想法只有一两句话');
  await expect(rows.first().locator('time')).toHaveAttribute('datetime', '2026-10-08');
  expect(await page.locator('main').innerText()).not.toContain('无题');
});

test('主题跟随系统，可手动覆盖、持久保存并恢复系统', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('radio', { name: '浅色', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('radio', { name: '深色', exact: true }).check();
  await page.goto('/about/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('radio', { name: '跟随系统' }).check();
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('存储受限时仍能切换主题', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked storage'); } });
  });
  await page.goto('/');
  await page.getByRole('radio', { name: '深色', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('各页无横向溢出，内部链接可访问', async ({ page, request }) => {
  for (const path of ['/', '/archive/', '/about/', '/examples/2026-10-03-reading/', '/examples/2026-09-26-image/']) {
    await page.goto(path);
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflows, path).toBe(false);
    const links = await page.locator('a[href^="/"]').evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('href')!))]);
    for (const href of links) expect((await request.get(href)).status(), href).toBe(200);
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test('浅深主题主要页面通过 WCAG AA 自动检查', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const path of ['/', '/archive/', '/about/', '/examples/2026-10-08-fragment/', '/examples/2026-10-03-reading/', '/404.html']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(results.violations, `${path} ${colorScheme}`).toEqual([]);
    }
  }
});

test('无需 JavaScript 即可阅读与导航，系统深色仍生效', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4323/');
  expect(await page.locator('article').count()).toBeGreaterThanOrEqual(3);
  expect(await page.locator('html').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(25, 29, 32)');
  await page.getByRole('navigation').getByRole('link', { name: '关于' }).click();
  await expect(page.getByRole('heading', { name: '关于', exact: true })).toBeVisible();
  await context.close();
});
