import { test, expect } from '@playwright/test';

test.describe('架子鼓应用', () => {
  test('首页加载正常', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('body')).toBeVisible();
  });
});
