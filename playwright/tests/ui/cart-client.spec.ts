import { test, expect } from '@playwright/test';

test('client can login and add product to cart', async ({ page }) => {

  await page.goto('/');
  await page.click('text=Login');

  await page.getByRole('textbox', { name: 'email' }).fill('user@test.com');
  await page.getByRole('textbox', { name: 'password' }).fill('1234');

  await page.getByRole('button', { name: 'Login' }).click();

  await page.locator('div').filter({ hasText: 'Freeskate 1500 PLN Add to' }).getByRole('button').click();

  await expect(page.locator('div.cart')).toBeVisible(); // Wait for the cart to update

  // await expect(page.locator('.cart-item')).toHaveCount(1);
});