import { expect } from '@playwright/test';
import { ProductAPI } from '../../api/product.api';
import { ProductBuilder } from '../../builders/product.builder';
import { test } from '../../fixtures/ui.fixture';

test.describe('cart UI', { tag: ['@suite-all', '@suite-ui'] }, () => {
  test('client can add guest cart items to account cart after login', async ({ freshClient, productPage }) => {
    await productPage.open();
    await productPage.addFirstAvailableProductToGuestCart();
    await productPage.loginAndMergeGuestCartToAccount(freshClient.email, freshClient.password);

    const checkoutModal = await productPage.startCheckout();
    const order = await checkoutModal.placeOrder({
      contactEmail: freshClient.email,
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

  test('fresh client can order guest cart product with extra product added after login', async ({
    apiRequestContext,
    freshClient,
    getTokenWorkerFixture,
    productPage
  }) => {
    const adminToken = await getTokenWorkerFixture('admin');
    const productApi = new ProductAPI(apiRequestContext, adminToken);
    const productSuffix = Date.now();

    const guestProductResponse = await productApi.createProduct(new ProductBuilder()
      .withName(`Guest Cart Skate ${productSuffix}`)
      .withSku(`GUEST-CART-SKATE-${productSuffix}`)
      .withPrice(280)
      .withStock(3)
      .build());
    expect(guestProductResponse.ok()).toBeTruthy();
    const guestProduct = await guestProductResponse.json();

    const extraProductResponse = await productApi.createProduct(new ProductBuilder()
      .withName(`Extra Cart Wheels ${productSuffix}`)
      .withSku(`EXTRA-CART-WHEELS-${productSuffix}`)
      .withCategory('ACCESSORIES')
      .withType('WHEELS')
      .withPrice(120)
      .withStock(5)
      .build());
    expect(extraProductResponse.ok()).toBeTruthy();
    const extraProduct = await extraProductResponse.json();

    await productPage.open();
    await productPage.addProductToCart(guestProduct.name);
    await productPage.loginAndMergeGuestCartToAccount(freshClient.email, freshClient.password);
    await productPage.expectCartItemVisible(guestProduct.name);

    await productPage.addProductToCart(extraProduct.name);
    await productPage.expectCartItemVisible(extraProduct.name);

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
