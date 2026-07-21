import { expect } from '@playwright/test';
import { expectOrderToMatchCart, expectOrderToMatchCheckoutDetails } from '../../../assertions/order.assertions';
import { test } from '../../../fixtures/app.fixture';

test.describe('cart API', { tag: ['@suite-all', '@suite-api'] }, () => {
  test('client can add account cart items and pay order', async ({ testContext, freshApiClient }) => {
    //given
    const product = await createRandomProduct(testContext, {
      name: `API Account Cart Skate ${Date.now()}`,
      price: 280,
      stock: 3
    });

    const addToCartResponse = await testContext.api.client.cart.addToCart(product.id, 1);

    //then
    expect(addToCartResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await addToCartResponse.json();

    //then
    expectCartToContainProducts(cartBeforeCheckout, [
      { product, quantity: 1 }
    ]);

    //when
    const checkoutDetails = {
      contactEmail: freshApiClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Skate Street 10, Warsaw',
      paymentMethod: 'CARD'
    } as const;
    const checkoutResponse = await testContext.api.client.order.checkout(checkoutDetails);

    //then
    expect(checkoutResponse.ok()).toBeTruthy();
    const order = await checkoutResponse.json();

    //when
    const payResponse = await testContext.api.client.order.pay(order.id);

    //then
    expect(payResponse.ok()).toBeTruthy();
    const paidOrder = await payResponse.json();

    //then
    expect(order.status).toBe('NEW');
    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);
    expectOrderToMatchCheckoutDetails(order, checkoutDetails);
    expectOrderToMatchCheckoutDetails(paidOrder, checkoutDetails);
  });

  test('fresh client can order product added to account cart before checkout', async ({ testContext, freshApiClient }) => {
    //given
    const product = await createRandomProduct(testContext, {
      name: `API Account Cart Before Checkout Skate ${Date.now()}`,
      price: 280,
      stock: 3
    });

    const addToCartResponse = await freshApiClient.cart.addToCart(product.id, 1);

    //then
    expect(addToCartResponse.ok()).toBeTruthy();

    //when
    const cartBeforeCheckoutResponse = await freshApiClient.cart.getCart();

    //then
    expect(cartBeforeCheckoutResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await cartBeforeCheckoutResponse.json();

    //then
    expectCartToContainProducts(cartBeforeCheckout, [
      { product, quantity: 1 }
    ]);

    //when
    const checkoutDetails = {
      contactEmail: freshApiClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Fresh Cart Street 11, Warsaw',
      paymentMethod: 'CARD'
    } as const;
    const checkoutResponse = await freshApiClient.order.checkout(checkoutDetails);

    //then
    expect(checkoutResponse.ok()).toBeTruthy();
    const order = await checkoutResponse.json();

    //when
    const payResponse = await freshApiClient.order.pay(order.id);

    //then
    expect(payResponse.ok()).toBeTruthy();
    const paidOrder = await payResponse.json();

    //then
    expect(order.status).toBe('NEW');
    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);
    expectOrderToMatchCheckoutDetails(order, checkoutDetails);
    expectOrderToMatchCheckoutDetails(paidOrder, checkoutDetails);
  });

  test('fresh client can order account cart product with extra product added before checkout', async ({
    testContext,
    freshApiClient
  }) => {
    //given
    const productSuffix = Date.now();
    const accountProduct = await createRandomProduct(testContext, {
      name: `API Account Cart Skate ${productSuffix}`,
      price: 280,
      stock: 3
    });
    const extraProduct = await createRandomProduct(testContext, {
      name: `API Extra Cart Wheels ${productSuffix}`,
      category: 'ACCESSORIES',
      type: 'WHEELS',
      price: 120,
      stock: 5
    });

    const addAccountProductResponse = await freshApiClient.cart.addToCart(accountProduct.id, 1);

    //then
    expect(addAccountProductResponse.ok()).toBeTruthy();

    //when
    const oneItemCartResponse = await freshApiClient.cart.getCart();

    //then
    expect(oneItemCartResponse.ok()).toBeTruthy();
    const oneItemCart = await oneItemCartResponse.json();

    //then
    expectCartToContainProducts(oneItemCart, [
      { product: accountProduct, quantity: 1 }
    ]);

    //when
    const addExtraProductResponse = await freshApiClient.cart.addToCart(extraProduct.id, 1);

    //then
    expect(addExtraProductResponse.ok()).toBeTruthy();

    //when
    const cartBeforeCheckoutResponse = await freshApiClient.cart.getCart();

    //then
    expect(cartBeforeCheckoutResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await cartBeforeCheckoutResponse.json();

    //then
    expectCartToContainProducts(cartBeforeCheckout, [
      { product: accountProduct, quantity: 1 },
      { product: extraProduct, quantity: 1 }
    ]);

    //when
    const checkoutDetails = {
      contactEmail: freshApiClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Fresh Cart Street 11, Warsaw',
      paymentMethod: 'CARD'
    } as const;
    const checkoutResponse = await freshApiClient.order.checkout(checkoutDetails);

    //then
    expect(checkoutResponse.ok()).toBeTruthy();
    const order = await checkoutResponse.json();

    //when
    const payResponse = await freshApiClient.order.pay(order.id);

    //then
    expect(payResponse.ok()).toBeTruthy();
    const paidOrder = await payResponse.json();

    //then
    expect(order.status).toBe('NEW');
    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);
    expectOrderToMatchCheckoutDetails(order, checkoutDetails);
    expectOrderToMatchCheckoutDetails(paidOrder, checkoutDetails);
  });
});

async function createRandomProduct(testContext: any, overrides: any) {
  const response = await testContext.api.admin.product.createRandom(overrides);

  //then
  expect(response.ok()).toBeTruthy();
  return response.json();
}

function expectCartToContainProducts(cart: any, expectedItems: Array<{ product: any; quantity: number }>) {
  //then
  expect(cart.items).toHaveLength(expectedItems.length);

  for (const expectedItem of expectedItems) {
    const cartItem = cart.items.find((item: any) => item.productId === expectedItem.product.id);

    expect(cartItem).toBeTruthy();
    expect(cartItem.productName).toBe(expectedItem.product.name);
    expect(cartItem.productPrice).toBe(expectedItem.product.price);
    expect(cartItem.quantity).toBe(expectedItem.quantity);
    expect(cartItem.totalPrice).toBe(expectedItem.product.price * expectedItem.quantity);
  }
}
