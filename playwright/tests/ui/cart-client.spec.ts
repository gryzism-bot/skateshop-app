import { expect } from '@playwright/test';
import { expectOkCartResponse, expectOkProductResponse } from '../../assertions/api-response.assertions';
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

    const cartBeforeCheckout = await expectOkCartResponse(cartBeforeCheckoutResponse);

    //then
    expect(cartBeforeCheckout.items).toHaveLength(1);

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

    const product = await expectOkProductResponse(productResponse, {
      price: 280,
      stock: 3
    });

    const addToCartResponse = await api.cart.client.addToCart(product.id, 1);

    await expectOkCartResponse(addToCartResponse, [
      { product, quantity: 1 }
    ]);

    //when
    await productPage.open();
    await productPage.loginAsClient(freshClient.email, freshClient.password);

    await productPage.expectCartItemCount(1);
    await productPage.expectCartItemVisible(product.name);

    const cartBeforeCheckoutResponse = await api.cart.client.getCart();

    const cartBeforeCheckout = await expectOkCartResponse(cartBeforeCheckoutResponse, [
      { product, quantity: 1 }
    ]);

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

    const guestProduct = await expectOkProductResponse(guestProductResponse, {
      price: 280,
      stock: 3
    });

    const extraProductResponse = await api.product.admin.createRandom({
      name: `Extra Cart Wheels ${productSuffix}`,
      category: 'ACCESSORIES',
      type: 'WHEELS',
      price: 120,
      stock: 5
    });

    const extraProduct = await expectOkProductResponse(extraProductResponse, {
      category: 'ACCESSORIES',
      type: 'WHEELS',
      price: 120,
      stock: 5
    });

    const addToCartResponse = await api.cart.client.addToCart(guestProduct.id, 1);

    await expectOkCartResponse(addToCartResponse, [
      { product: guestProduct, quantity: 1 }
    ]);

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

    const cartBeforeCheckout = await expectOkCartResponse(cartBeforeCheckoutResponse, [
      { product: guestProduct, quantity: 1 },
      { product: extraProduct, quantity: 1 }
    ]);

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
