import { expect, test } from '@playwright/test';

test('client can add guest cart items to account cart after login', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('cart-mode')).toContainText('Guest cart');

  await page.getByTestId('add-to-cart-button').first().click();

  await expect(page.getByTestId('cart-item')).toHaveCount(1);
  await expect(page.getByTestId('cart-total')).toContainText('Total:');

  await expect(page.getByTestId('cart-mode')).toContainText('Guest cart');
  await expect(page.getByTestId('cart-item')).toHaveCount(1);

  await page.getByTestId('login-email').fill('user@test.com');
  await page.getByTestId('login-password').fill('1234');
  await page.getByTestId('login-button').click();

  await expect(page.getByTestId('account-status')).toContainText('You are logged in.');
  await expect(page.getByTestId('cart-mode')).toContainText('Account cart');
  await expect(page.getByTestId('merge-guest-cart-button')).toBeVisible();

  await page.getByTestId('merge-guest-cart-button').click();

  await expect(page.getByTestId('merge-guest-cart-button')).toBeHidden();
  await expect(page.getByTestId('cart-item').first()).toBeVisible();
  await expect(page.getByTestId('cart-total')).toContainText('Total:');
});
