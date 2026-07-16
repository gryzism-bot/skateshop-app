import { expect } from '@playwright/test';
import { ProductAPI } from '../../api/product.api';
import { ProductBuilder } from '../../builders/product.builder';
import { test } from '../../fixtures/ui.fixture';

test.describe('cart UI', { tag: ['@suite-all', '@suite-ui'] }, () => {
  test('client can add guest cart items to account cart after login', async ({ productPage }) => {
    await productPage.open();
    await productPage.addFirstAvailableProductToGuestCart();
    await productPage.loginAndMergeGuestCartToAccount('user@test.com', '1234');

    const checkoutModal = await productPage.startCheckout();
    const order = await checkoutModal.placeOrder({
      contactEmail: 'user@test.com',
      deliveryAddress: 'Skate Street 10, Warsaw',
      paymentMethod: 'Card'
    });
    const paidOrder = await checkoutModal.payOrder(order.id);

    expect(paidOrder.status).toBe('PAID');
  });

  test('fresh client can order product added to guest cart before login', async ({
    apiRequestContext,
    freshClient,
    getTokenWorkerFixture,
    productPage
  }) => {
    const adminToken = await getTokenWorkerFixture('admin');
    const productApi = new ProductAPI(apiRequestContext, adminToken);
    const productResponse = await productApi.createProduct(new ProductBuilder()
      .withName(`Guest Before Login Skate ${Date.now()}`)
      .withSku(`GUEST-BEFORE-LOGIN-${Date.now()}`)
      .withPrice(280)
      .withStock(3)
      .build());
    expect(productResponse.ok()).toBeTruthy();
    const product = await productResponse.json();

    await productPage.open();
    await productPage.addProductToCart(product.name);
    await productPage.loginAndMergeGuestCartToAccount(freshClient.email, freshClient.password);
    await productPage.expectCartItemVisible(product.name);

    const checkoutModal = await productPage.startCheckout();
    const order = await checkoutModal.placeOrder({
      contactEmail: freshClient.email,
      deliveryAddress: 'Fresh Cart Street 11, Warsaw',
      paymentMethod: 'Card'
    });
    const paidOrder = await checkoutModal.payOrder(order.id);

    expect(paidOrder.status).toBe('PAID');
  });
});
