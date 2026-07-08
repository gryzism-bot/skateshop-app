import { expect, request as playwrightRequest, test } from '@playwright/test';
import { ProductBuilder } from '../../builders/product.builder';

test('logged client can filter products, checkout skate, and pay order', async ({ page }) => {
  const api = await playwrightRequest.newContext({
    baseURL: (process.env.API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '')
  });

  const password = '1234';
  const email = `checkout-${Date.now()}@test.com`;

  try {
    const adminToken = await login(api, 'admin@test.com', 'admin123');

    const skate = await createProduct(api, adminToken, new ProductBuilder()
      .withName(`UI Checkout Skate ${Date.now()}`)
      .withSku(`UI-SKATE-${Date.now()}`)
      .withCategory('SKATES')
      .withType('FREESKATE')
      .withPrice(300)
      .withStock(4)
      .build());

    const accessory = await createProduct(api, adminToken, new ProductBuilder()
      .withName(`UI Checkout Wheels ${Date.now()}`)
      .withSku(`UI-WHEELS-${Date.now()}`)
      .withCategory('ACCESSORIES')
      .withType('WHEELS')
      .withPrice(120)
      .withStock(6)
      .build());

    const registerResponse = await api.post('/api/auth/register', {
      data: { email, password }
    });
    expect(registerResponse.ok()).toBeTruthy();

    const clientToken = await login(api, email, password);

    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
    }, clientToken);

    await page.goto('/');

    await expect(page.getByTestId('account-status')).toContainText('You are logged in.');
    await expect(page.getByText(skate.name)).toBeVisible();
    await expect(page.getByText(accessory.name)).toBeVisible();

    await page.getByTestId('filter-skates').uncheck();

    await expect(page.getByText(skate.name)).toBeHidden();
    await expect(page.getByText(accessory.name)).toBeVisible();
    await expect(page.getByTestId('product-category').filter({ hasText: 'SKATES' })).toHaveCount(0);

    await page.getByTestId('filter-accessories').uncheck();

    await expect(page.getByTestId('product-card')).toHaveCount(0);
    await expect(page.getByTestId('empty-products')).toBeVisible();

    await page.getByTestId('filter-skates').check();

    const skateCard = page.getByTestId('product-card').filter({ hasText: skate.name });
    await expect(skateCard).toBeVisible();
    await skateCard.getByTestId('add-to-cart-button').click();

    await expect(page.getByTestId('cart-item').filter({ hasText: skate.name })).toBeVisible();

    await page.getByTestId('checkout-button').click();
    await expect(page.getByTestId('checkout-modal')).toBeVisible();
    await expect(page.getByTestId('checkout-step-cart')).toBeVisible();

    await page.getByTestId('checkout-next-button').click();
    await expect(page.getByTestId('checkout-step-contact')).toBeVisible();
    await page.getByTestId('checkout-contact-email').fill(email);

    await page.getByTestId('checkout-next-button').click();
    await expect(page.getByTestId('checkout-step-delivery')).toBeVisible();
    await page.getByTestId('checkout-delivery-address').fill('Skate Street 10, Warsaw');
    await page.getByLabel('Card').check();

    const checkoutResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/orders') && response.request().method() === 'POST'
    );
    await page.getByTestId('checkout-place-order-button').click();
    const checkoutResponse = await checkoutResponsePromise;
    expect(checkoutResponse.ok()).toBeTruthy();
    const order = await checkoutResponse.json();
    expect(order.status).toBe('NEW');

    await expect(page.getByTestId('checkout-order-status')).toContainText('NEW');

    const payResponsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/orders/${order.id}/pay`) && response.request().method() === 'POST'
    );
    await page.getByTestId('mock-pay-button').click();
    const payResponse = await payResponsePromise;
    expect(payResponse.ok()).toBeTruthy();
    const paidOrder = await payResponse.json();

    expect(paidOrder.id).toBe(order.id);
    expect(paidOrder.status).toBe('PAID');
    await expect(page.getByTestId('checkout-order-status')).toContainText('PAID');
  } finally {
    await api.dispose();
  }
});

async function login(api: any, email: string, password: string) {
  const response = await api.post('/api/auth/login', {
    data: { email, password }
  });

  expect(response.ok()).toBeTruthy();
  return response.text();
}

async function createProduct(api: any, token: string, product: any) {
  const response = await api.post('/api/products', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: product
  });

  expect(response.ok()).toBeTruthy();
  return response.json();
}
