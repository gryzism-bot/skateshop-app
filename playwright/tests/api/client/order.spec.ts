import { expect } from '@playwright/test';
import { expectOrderToMatchCart } from '../../../assertions/order.assertions';
import { test } from '../../../fixtures/app.fixture';

test.describe('order API', { tag: ['@suite-all', '@suite-api'] }, () => {
  test('user can checkout account cart', async ({ testContext }) => {
    //given
    const createProductResponse = await testContext.api.admin.product.createRandom({
      name: 'Checkout Skate',
      price: 250,
      stock: 5
    });

    expect(createProductResponse.status()).toBe(200);
    const createdProduct = await createProductResponse.json();

    const addToCartResponse = await testContext.api.client.cart.addToCart(createdProduct.id, 2);

    expect(addToCartResponse.status()).toBe(200);
    const cartBeforeCheckout = await addToCartResponse.json();

    const checkoutResponse = await testContext.api.client.order.checkout({
      promoCode: 'ROLL10',
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Longboard Street 7, Warsaw',
      paymentMethod: 'CARD'
    });

    expect(checkoutResponse.status()).toBe(200);
    const order = await checkoutResponse.json();

    expect(order.status).toBe('NEW');
    expect(order.discountAmount).toBe(50);
    expect(order.totalPrice).toBe(450);
    expect(order.deliveryMethod).toBe('ADDRESS');
    expect(order.paymentMethod).toBe('CARD');
    expectOrderToMatchCart(cartBeforeCheckout, order);

    //when
    const payResponse = await testContext.api.client.order.pay(order.id);

    expect(payResponse.status()).toBe(200);
    const paidOrder = await payResponse.json();

    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);

    const cartResponse = await testContext.api.client.cart.getCart();

    expect(cartResponse.status()).toBe(200);
    const cart = await cartResponse.json();

    //then
    expect(cart.items).toEqual([]);
  });

  test('fresh user can place two orders from the same account cart', async ({ testContext }) => {
    //given
    const firstProduct = await createRandomProduct(testContext, {
      name: `First Cart Bound Skate ${Date.now()}`,
      price: 240,
      stock: 4
    });
    const secondProduct = await createRandomProduct(testContext, {
      name: `Second Cart Bound Skate ${Date.now()}`,
      price: 180,
      stock: 4
    });

    const firstAddToCartResponse = await testContext.api.client.cart.addToCart(firstProduct.id, 1);

    expect(firstAddToCartResponse.status()).toBe(200);
    const cartBeforeFirstOrder = await firstAddToCartResponse.json();

    const firstCheckoutResponse = await testContext.api.client.order.checkout({
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 1, Warsaw',
      paymentMethod: 'CARD'
    });

    expect(firstCheckoutResponse.status()).toBe(200);
    const firstOrder = await firstCheckoutResponse.json();

    expect(firstOrder.status).toBe('NEW');
    expectOrderToMatchCart(cartBeforeFirstOrder, firstOrder);

    const firstPayResponse = await testContext.api.client.order.pay(firstOrder.id);

    expect(firstPayResponse.status()).toBe(200);
    const firstPaidOrder = await firstPayResponse.json();

    expect(firstPaidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeFirstOrder, firstOrder, firstPaidOrder);

    //when
    const emptyCartAfterFirstOrderResponse = await testContext.api.client.cart.getCart();

    expect(emptyCartAfterFirstOrderResponse.status()).toBe(200);
    const emptyCartAfterFirstOrder = await emptyCartAfterFirstOrderResponse.json();

    expect(emptyCartAfterFirstOrder.items).toEqual([]);

    const secondAddToCartResponse = await testContext.api.client.cart.addToCart(secondProduct.id, 2);

    expect(secondAddToCartResponse.status()).toBe(200);
    const cartAfterSecondAdd = await secondAddToCartResponse.json();

    const cartBeforeSecondOrderResponse = await testContext.api.client.cart.getCart();

    expect(cartBeforeSecondOrderResponse.status()).toBe(200);
    const cartBeforeSecondOrder = await cartBeforeSecondOrderResponse.json();

    expect(cartBeforeSecondOrder.items).toHaveLength(1);
    expect(cartBeforeSecondOrder.items[0].productId).toBe(secondProduct.id);
    expect(cartBeforeSecondOrder.items[0].quantity).toBe(2);
    expect(cartBeforeSecondOrder).toEqual(cartAfterSecondAdd);

    const secondCheckoutResponse = await testContext.api.client.order.checkout({
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 2, Warsaw',
      paymentMethod: 'BLIK'
    });

    expect(secondCheckoutResponse.status()).toBe(200);
    const secondOrder = await secondCheckoutResponse.json();

    expect(secondOrder.id).not.toBe(firstOrder.id);
    expect(secondOrder.status).toBe('NEW');
    expectOrderToMatchCart(cartBeforeSecondOrder, secondOrder);

    const secondPayResponse = await testContext.api.client.order.pay(secondOrder.id);

    expect(secondPayResponse.status()).toBe(200);
    const secondPaidOrder = await secondPayResponse.json();

    expect(secondPaidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeSecondOrder, secondOrder, secondPaidOrder);

    const emptyCartAfterSecondOrderResponse = await testContext.api.client.cart.getCart();

    expect(emptyCartAfterSecondOrderResponse.status()).toBe(200);
    const emptyCartAfterSecondOrder = await emptyCartAfterSecondOrderResponse.json();

    //then
    expect(emptyCartAfterSecondOrder.items).toEqual([]);
  });

  test('checkout decreases product stock by ordered quantity', async ({ testContext }) => {
    //given
    const initialStock = 5;
    const orderedQuantity = 2;
    const product = await createRandomProduct(testContext, {
      name: `Stock Lowering Skate ${Date.now()}`,
      price: 260,
      stock: initialStock
    });

    const addToCartResponse = await testContext.api.client.cart.addToCart(product.id, orderedQuantity);

    //then
    expect(addToCartResponse.status()).toBe(200);

    //when
    const checkoutResponse = await testContext.api.client.order.checkout({
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Stock Street 3, Warsaw',
      paymentMethod: 'CARD'
    });

    //then
    expect(checkoutResponse.status()).toBe(200);

    //when
    const productAfterCheckoutResponse = await testContext.api.admin.product.getById(product.id);

    //then
    expect(productAfterCheckoutResponse.status()).toBe(200);
    const productAfterCheckout = await productAfterCheckoutResponse.json();

    expect(productAfterCheckout.id).toBe(product.id);
    expect(productAfterCheckout.stock).toBe(initialStock - orderedQuantity);
    expect(productAfterCheckout.active).toBe(true);
  });

  test('checkout deactivates product when ordered quantity consumes whole stock', async ({ testContext }) => {
    //given
    const initialStock = 2;
    const orderedQuantity = 2;
    const product = await createRandomProduct(testContext, {
      name: `Stock Depleted Skate ${Date.now()}`,
      price: 260,
      stock: initialStock
    });

    const addToCartResponse = await testContext.api.client.cart.addToCart(product.id, orderedQuantity);

    //then
    expect(addToCartResponse.status()).toBe(200);

    //when
    const checkoutResponse = await testContext.api.client.order.checkout({
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Stock Street 4, Warsaw',
      paymentMethod: 'CARD'
    });

    //then
    expect(checkoutResponse.status()).toBe(200);

    //when
    const productAfterCheckoutResponse = await testContext.api.admin.product.getById(product.id);

    //then
    expect(productAfterCheckoutResponse.status()).toBe(200);
    const productAfterCheckout = await productAfterCheckoutResponse.json();

    expect(productAfterCheckout.id).toBe(product.id);
    expect(productAfterCheckout.stock).toBe(0);
    expect(productAfterCheckout.active).toBe(false);
  });
});

async function createRandomProduct(testContext: any, overrides: any) {
  const response = await testContext.api.admin.product.createRandom(overrides);

  //then
  expect(response.status()).toBe(200);
  return response.json();
}
