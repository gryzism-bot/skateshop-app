import { expect } from '@playwright/test';
import { expectOkCartResponse, expectOkOrderResponse, expectOkProductResponse } from '../../../assertions/api-response.assertions';
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

    const createdProduct = await expectOkProductResponse(createProductResponse, {
      name: 'Checkout Skate',
      price: 250,
      stock: 5
    });

    const addToCartResponse = await testContext.api.client.cart.addToCart(createdProduct.id, 2);

    const cartBeforeCheckout = await expectOkCartResponse(addToCartResponse, [
      { product: createdProduct, quantity: 2 }
    ]);

    const checkoutResponse = await testContext.api.client.order.checkout({
      promoCode: 'ROLL10',
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Longboard Street 7, Warsaw',
      paymentMethod: 'CARD'
    });

    const order = await expectOkOrderResponse(checkoutResponse, {
      status: 'NEW',
      discountAmount: 50,
      totalPrice: 450,
      deliveryMethod: 'ADDRESS',
      paymentMethod: 'CARD'
    });

    expect(order.status).toBe('NEW');
    expect(order.discountAmount).toBe(50);
    expect(order.totalPrice).toBe(450);
    expect(order.deliveryMethod).toBe('ADDRESS');
    expect(order.paymentMethod).toBe('CARD');
    expectOrderToMatchCart(cartBeforeCheckout, order);

    //when
    const payResponse = await testContext.api.client.order.pay(order.id);

    const paidOrder = await expectOkOrderResponse(payResponse, {
      id: order.id,
      status: 'PAID',
      discountAmount: 50,
      totalPrice: 450,
      deliveryMethod: 'ADDRESS',
      paymentMethod: 'CARD'
    });

    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);

    const cartResponse = await testContext.api.client.cart.getCart();

    const cart = await expectOkCartResponse(cartResponse, []);

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

    const cartBeforeFirstOrder = await expectOkCartResponse(firstAddToCartResponse, [
      { product: firstProduct, quantity: 1 }
    ]);

    const firstCheckoutResponse = await testContext.api.client.order.checkout({
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 1, Warsaw',
      paymentMethod: 'CARD'
    });

    const firstOrder = await expectOkOrderResponse(firstCheckoutResponse, {
      status: 'NEW',
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 1, Warsaw',
      paymentMethod: 'CARD'
    });

    expect(firstOrder.status).toBe('NEW');
    expectOrderToMatchCart(cartBeforeFirstOrder, firstOrder);

    const firstPayResponse = await testContext.api.client.order.pay(firstOrder.id);

    const firstPaidOrder = await expectOkOrderResponse(firstPayResponse, {
      id: firstOrder.id,
      status: 'PAID',
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 1, Warsaw',
      paymentMethod: 'CARD'
    });

    expect(firstPaidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeFirstOrder, firstOrder, firstPaidOrder);

    //when
    const emptyCartAfterFirstOrderResponse = await testContext.api.client.cart.getCart();

    const emptyCartAfterFirstOrder = await expectOkCartResponse(emptyCartAfterFirstOrderResponse, []);

    expect(emptyCartAfterFirstOrder.items).toEqual([]);

    const secondAddToCartResponse = await testContext.api.client.cart.addToCart(secondProduct.id, 2);

    const cartAfterSecondAdd = await expectOkCartResponse(secondAddToCartResponse, [
      { product: secondProduct, quantity: 2 }
    ]);

    const cartBeforeSecondOrderResponse = await testContext.api.client.cart.getCart();

    const cartBeforeSecondOrder = await expectOkCartResponse(cartBeforeSecondOrderResponse, [
      { product: secondProduct, quantity: 2 }
    ]);

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

    const secondOrder = await expectOkOrderResponse(secondCheckoutResponse, {
      status: 'NEW',
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 2, Warsaw',
      paymentMethod: 'BLIK'
    });

    expect(secondOrder.id).not.toBe(firstOrder.id);
    expect(secondOrder.status).toBe('NEW');
    expectOrderToMatchCart(cartBeforeSecondOrder, secondOrder);

    const secondPayResponse = await testContext.api.client.order.pay(secondOrder.id);

    const secondPaidOrder = await expectOkOrderResponse(secondPayResponse, {
      id: secondOrder.id,
      status: 'PAID',
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 2, Warsaw',
      paymentMethod: 'BLIK'
    });

    expect(secondPaidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeSecondOrder, secondOrder, secondPaidOrder);

    const emptyCartAfterSecondOrderResponse = await testContext.api.client.cart.getCart();

    const emptyCartAfterSecondOrder = await expectOkCartResponse(emptyCartAfterSecondOrderResponse, []);

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
    await expectOkCartResponse(addToCartResponse, [
      { product, quantity: orderedQuantity }
    ]);

    //when
    const checkoutResponse = await testContext.api.client.order.checkout({
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Stock Street 3, Warsaw',
      paymentMethod: 'CARD'
    });

    //then
    await expectOkOrderResponse(checkoutResponse, {
      status: 'NEW',
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Stock Street 3, Warsaw',
      paymentMethod: 'CARD'
    });

    //when
    const productAfterCheckoutResponse = await testContext.api.admin.product.getById(product.id);

    //then
    await expectOkProductResponse(productAfterCheckoutResponse, {
      id: product.id,
      stock: initialStock - orderedQuantity,
      active: true
    });
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
    await expectOkCartResponse(addToCartResponse, [
      { product, quantity: orderedQuantity }
    ]);

    //when
    const checkoutResponse = await testContext.api.client.order.checkout({
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Stock Street 4, Warsaw',
      paymentMethod: 'CARD'
    });

    //then
    await expectOkOrderResponse(checkoutResponse, {
      status: 'NEW',
      contactEmail: testContext.client.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Stock Street 4, Warsaw',
      paymentMethod: 'CARD'
    });

    //when
    const productAfterCheckoutResponse = await testContext.api.admin.product.getById(product.id);

    //then
    await expectOkProductResponse(productAfterCheckoutResponse, {
      id: product.id,
      stock: 0,
      active: false
    });
  });
});

async function createRandomProduct(testContext: any, overrides: any) {
  const response = await testContext.api.admin.product.createRandom(overrides);

  //then
  return expectOkProductResponse(response, overrides);
}
