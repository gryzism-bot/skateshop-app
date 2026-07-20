import { expect } from '@playwright/test';
import { expectOrderToMatchCart, expectOrderToMatchCheckoutDetails } from '../../assertions/order.assertions';
import { test } from '../../fixtures/ui.fixture';

test.describe('cart UI', { tag: ['@suite-all', '@suite-ui'] }, () => {
  test('client can add guest cart items to account cart after login', async ({
    api,
    freshClient,
    productPage
  }) => {
    //given
    await productPage.open();
    await productPage.addFirstAvailableProductToGuestCart();

    await productPage.loginAndMergeGuestCartToAccount(freshClient.email, freshClient.password);

    await productPage.expectCartItemCount(1);

    const cartBeforeCheckoutResponse = await api.cart.client.getCart();

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
    api,
    freshClient,
    productPage
  }) => {
    //given
    const productResponse = await api.product.admin.createRandom({
      name: `Account Cart Before Login Skate ${Date.now()}`,
      price: 280,
      stock: 3
    });

    expect(productResponse.ok()).toBeTruthy();
    const product = await productResponse.json();

    const addToCartResponse = await api.cart.client.addToCart(product.id, 1);

    expect(addToCartResponse.ok()).toBeTruthy();

    //when
    await productPage.open();
    await productPage.loginAsClient(freshClient.email, freshClient.password);

    await productPage.expectCartItemCount(1);
    await productPage.expectCartItemVisible(product.name);

    const cartBeforeCheckoutResponse = await api.cart.client.getCart();

    expect(cartBeforeCheckoutResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await cartBeforeCheckoutResponse.json();

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
    api,
    freshClient,
    productPage
  }) => {
    //given
    const productSuffix = Date.now();

    const guestProductResponse = await api.product.admin.createRandom({
      name: `Account Cart Skate ${productSuffix}`,
      price: 280,
      stock: 3
    });

    expect(guestProductResponse.ok()).toBeTruthy();
    const guestProduct = await guestProductResponse.json();

    const extraProductResponse = await api.product.admin.createRandom({
      name: `Extra Cart Wheels ${productSuffix}`,
      category: 'ACCESSORIES',
      type: 'WHEELS',
      price: 120,
      stock: 5
    });

    expect(extraProductResponse.ok()).toBeTruthy();
    const extraProduct = await extraProductResponse.json();

    const addToCartResponse = await api.cart.client.addToCart(guestProduct.id, 1);

    expect(addToCartResponse.ok()).toBeTruthy();

    //when
    await productPage.open();
    await productPage.loginAsClient(freshClient.email, freshClient.password);

    await productPage.expectCartItemCount(1);
    await productPage.expectCartItemVisible(guestProduct.name);

    await productPage.addProductToCart(extraProduct.name);

    await productPage.expectCartItemCount(2);
    await productPage.expectCartItemVisible(guestProduct.name);
    await productPage.expectCartItemVisible(extraProduct.name);

    const cartBeforeCheckoutResponse = await api.cart.client.getCart();

    expect(cartBeforeCheckoutResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await cartBeforeCheckoutResponse.json();

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
