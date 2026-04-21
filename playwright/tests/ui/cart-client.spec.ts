import { test, expect } from '@playwright/test';

test('client can login and add product to cart', async ({ page }) => {
  await page.goto('/');

  await page.click('text=Login');

  await page.fill('input[name="email"]', 'user@test.com');
  await page.fill('input[name="password"]', '1234');

  await page.click('button[type="submit"]');

  await page.click('text=Add to cart');

  await page.click('text=Cart');

  await expect(page.locator('.cart-item')).toHaveCount(1);
});