import { expect } from '@playwright/test';
import { CartAPI } from '../../api/cart.api';
import { ProductAPI } from '../../api/product.api';
import { expectOrderToMatchCart, expectOrderToMatchCheckoutDetails } from '../../assertions/order.assertions';
import { ProductBuilder } from '../../builders/product.builder';
import { test } from '../../fixtures/ui.fixture';

test.describe('cart UI', { tag: ['@suite-all', '@suite-ui'] }, () => {
  test('client can add guest cart items to account cart after login', async ({
    apiRequestContext,
    freshClient,
    productPage
  }) => {
    //given
    await productPage.open();
    await productPage.addFirstAvailableProductToGuestCart();

    //when
    await productPage.loginAndMergeGuestCartToAccount(freshClient.email, freshClient.password);

    //then
    await productPage.expectCartItemCount(1);

    //when
    const userCartApi = new CartAPI(apiRequestContext, freshClient.token);
    const cartBeforeCheckoutResponse = await userCartApi.getCart();

    //then
    expect(cartBeforeCheckoutResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await cartBeforeCheckoutResponse.json();

    //when
    const checkoutModal = await productPage.startCheckout();
    const checkoutDetails = {
      contactEmail: freshClient.email,
      deliveryAddress: 'Skate Street 10, Warsaw',
      paymentMethod: 'Card'
    } as const;
    const order = await checkoutModal.placeOrder(checkoutDetails);
    const paidOrder = await checkoutModal.payOrder(order.id);

    //then
    expect(order.status).toBe('NEW');
    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);
    expectOrderToMatchCheckoutDetails(order, {
      contactEmail: checkoutDetails.contactEmail,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: checkoutDetails.deliveryAddress,
      paymentMethod: 'CARD'
    });
    expectOrderToMatchCheckoutDetails(paidOrder, {
      contactEmail: checkoutDetails.contactEmail,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: checkoutDetails.deliveryAddress,
      paymentMethod: 'CARD'
    });
  });

  test('fresh client can order product added to account cart before login', async ({
    apiRequestContext,
    freshClient,
    getTokenWorkerFixture,
    productPage
  }) => {
    //given
    const adminToken = await getTokenWorkerFixture('admin');
    const productApi = new ProductAPI(apiRequestContext, adminToken);
    const productResponse = await productApi.createProduct(new ProductBuilder()
      .withName(`Guest Before Login Skate ${Date.now()}`)
      .withSku(`GUEST-BEFORE-LOGIN-${Date.now()}`)
      .withPrice(280)
      .withStock(3)
      .build());

    //then
    expect(productResponse.ok()).toBeTruthy();
    const product = await productResponse.json();

    //when
    const userCartApi = new CartAPI(apiRequestContext, freshClient.token);
    const addToCartResponse = await userCartApi.addToCart(product.id, 1);

    //then
    expect(addToCartResponse.ok()).toBeTruthy();

    //when
    await productPage.open();
    await productPage.loginAsClient(freshClient.email, freshClient.password);

    //then
    await productPage.expectCartItemCount(1);
    await productPage.expectCartItemVisible(product.name);

    //when
    const cartBeforeCheckoutResponse = await userCartApi.getCart();

    //then
    expect(cartBeforeCheckoutResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await cartBeforeCheckoutResponse.json();

    //when
    const checkoutModal = await productPage.startCheckout();
    const checkoutDetails = {
      contactEmail: freshClient.email,
      deliveryAddress: 'Fresh Cart Street 11, Warsaw',
      paymentMethod: 'Card'
    } as const;
    const order = await checkoutModal.placeOrder(checkoutDetails);
    const paidOrder = await checkoutModal.payOrder(order.id);

    //then
    expect(order.status).toBe('NEW');
    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);
    expectOrderToMatchCheckoutDetails(order, {
      contactEmail: checkoutDetails.contactEmail,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: checkoutDetails.deliveryAddress,
      paymentMethod: 'CARD'
    });
    expectOrderToMatchCheckoutDetails(paidOrder, {
      contactEmail: checkoutDetails.contactEmail,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: checkoutDetails.deliveryAddress,
      paymentMethod: 'CARD'
    });
  });

  test('fresh client can order account cart product with extra product added after login', async ({
    apiRequestContext,
    freshClient,
    getTokenWorkerFixture,
    productPage
  }) => {
    //given
    const adminToken = await getTokenWorkerFixture('admin');
    const productApi = new ProductAPI(apiRequestContext, adminToken);
    const productSuffix = Date.now();

    const guestProductResponse = await productApi.createProduct(new ProductBuilder()
      .withName(`Guest Cart Skate ${productSuffix}`)
      .withSku(`GUEST-CART-SKATE-${productSuffix}`)
      .withPrice(280)
      .withStock(3)
      .build());

    //then
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

    //then
    expect(extraProductResponse.ok()).toBeTruthy();
    const extraProduct = await extraProductResponse.json();

    //when
    const userCartApi = new CartAPI(apiRequestContext, freshClient.token);
    const addToCartResponse = await userCartApi.addToCart(guestProduct.id, 1);

    //then
    expect(addToCartResponse.ok()).toBeTruthy();

    //when
    await productPage.open();
    await productPage.loginAsClient(freshClient.email, freshClient.password);

    //then
    await productPage.expectCartItemCount(1);
    await productPage.expectCartItemVisible(guestProduct.name);

    //when
    await productPage.addProductToCart(extraProduct.name);

    //then
    await productPage.expectCartItemCount(2);
    await productPage.expectCartItemVisible(guestProduct.name);
    await productPage.expectCartItemVisible(extraProduct.name);

    //when
    const cartBeforeCheckoutResponse = await userCartApi.getCart();

    //then
    expect(cartBeforeCheckoutResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await cartBeforeCheckoutResponse.json();

    //when
    const checkoutModal = await productPage.startCheckout();
    const checkoutDetails = {
      contactEmail: freshClient.email,
      deliveryAddress: 'Fresh Cart Street 11, Warsaw',
      paymentMethod: 'Card'
    } as const;
    const order = await checkoutModal.placeOrder(checkoutDetails);
    const paidOrder = await checkoutModal.payOrder(order.id);

    //then
    expect(order.status).toBe('NEW');
    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);
    expectOrderToMatchCheckoutDetails(order, {
      contactEmail: checkoutDetails.contactEmail,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: checkoutDetails.deliveryAddress,
      paymentMethod: 'CARD'
    });
    expectOrderToMatchCheckoutDetails(paidOrder, {
      contactEmail: checkoutDetails.contactEmail,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: checkoutDetails.deliveryAddress,
      paymentMethod: 'CARD'
    });
  });
});
