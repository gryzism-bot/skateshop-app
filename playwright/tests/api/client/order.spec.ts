import { expect } from '@playwright/test';
import { expectOrderToMatchCart } from '../../../assertions/order.assertions';
import { ProductBuilder } from '../../../builders/product.builder';
import { test } from '../../../fixtures/app.fixture';

test.describe('order API', { tag: ['@suite-all', '@suite-api'] }, () => {
  test('user can checkout account cart', async ({ testContext, freshApiClient }) => {
    //given
    const product = new ProductBuilder()
      .withName('Checkout Skate')
      .withPrice(250)
      .withStock(5)
      .build();

    const createProductResponse = await testContext.api.admin.product.createProduct(product);

    //then
    expect(createProductResponse.ok()).toBeTruthy();
    const createdProduct = await createProductResponse.json();

    //when
    const addToCartResponse = await testContext.api.client.cart.addToCart(createdProduct.id, 2);

    //then
    expect(addToCartResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await addToCartResponse.json();

    //when
    const checkoutResponse = await testContext.api.client.order.checkout({
      promoCode: 'ROLL10',
      contactEmail: freshApiClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Longboard Street 7, Warsaw',
      paymentMethod: 'CARD'
    });

    //then
    expect(checkoutResponse.ok()).toBeTruthy();
    const order = await checkoutResponse.json();

    //then
    expect(order.status).toBe('NEW');
    expect(order.discountAmount).toBe(50);
    expect(order.totalPrice).toBe(450);
    expect(order.deliveryMethod).toBe('ADDRESS');
    expect(order.paymentMethod).toBe('CARD');
    expectOrderToMatchCart(cartBeforeCheckout, order);

    //when
    const payResponse = await testContext.api.client.order.pay(order.id);

    //then
    expect(payResponse.ok()).toBeTruthy();
    const paidOrder = await payResponse.json();

    //then
    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);

    //when
    const cartResponse = await testContext.api.client.cart.getCart();

    //then
    expect(cartResponse.ok()).toBeTruthy();
    const cart = await cartResponse.json();

    //then
    expect(cart.items).toEqual([]);
  });

  test('fresh user can place two orders from the same account cart', async ({ testContext, freshApiClient }) => {
    //given
    const firstProduct = await createProduct(testContext, new ProductBuilder()
      .withName(`First Cart Bound Skate ${Date.now()}`)
      .withPrice(240)
      .withStock(4)
      .build());
    const secondProduct = await createProduct(testContext, new ProductBuilder()
      .withName(`Second Cart Bound Skate ${Date.now()}`)
      .withPrice(180)
      .withStock(4)
      .build());

    //when
    const firstAddToCartResponse = await freshApiClient.cart.addToCart(firstProduct.id, 1);

    //then
    expect(firstAddToCartResponse.ok()).toBeTruthy();
    const cartBeforeFirstOrder = await firstAddToCartResponse.json();

    //when
    const firstCheckoutResponse = await freshApiClient.order.checkout({
      contactEmail: freshApiClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 1, Warsaw',
      paymentMethod: 'CARD'
    });

    //then
    expect(firstCheckoutResponse.ok()).toBeTruthy();
    const firstOrder = await firstCheckoutResponse.json();

    //then
    expect(firstOrder.status).toBe('NEW');
    expectOrderToMatchCart(cartBeforeFirstOrder, firstOrder);

    //when
    const firstPayResponse = await freshApiClient.order.pay(firstOrder.id);

    //then
    expect(firstPayResponse.ok()).toBeTruthy();
    const firstPaidOrder = await firstPayResponse.json();

    //then
    expect(firstPaidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeFirstOrder, firstOrder, firstPaidOrder);

    //when
    const emptyCartAfterFirstOrderResponse = await freshApiClient.cart.getCart();

    //then
    expect(emptyCartAfterFirstOrderResponse.ok()).toBeTruthy();
    const emptyCartAfterFirstOrder = await emptyCartAfterFirstOrderResponse.json();

    //then
    expect(emptyCartAfterFirstOrder.items).toEqual([]);

    //when
    const secondAddToCartResponse = await freshApiClient.cart.addToCart(secondProduct.id, 2);

    //then
    expect(secondAddToCartResponse.ok()).toBeTruthy();
    const cartAfterSecondAdd = await secondAddToCartResponse.json();

    //when
    const cartBeforeSecondOrderResponse = await freshApiClient.cart.getCart();

    //then
    expect(cartBeforeSecondOrderResponse.ok()).toBeTruthy();
    const cartBeforeSecondOrder = await cartBeforeSecondOrderResponse.json();

    //then
    expect(cartBeforeSecondOrder.items).toHaveLength(1);
    expect(cartBeforeSecondOrder.items[0].productId).toBe(secondProduct.id);
    expect(cartBeforeSecondOrder.items[0].quantity).toBe(2);
    expect(cartBeforeSecondOrder).toEqual(cartAfterSecondAdd);

    //when
    const secondCheckoutResponse = await freshApiClient.order.checkout({
      contactEmail: freshApiClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 2, Warsaw',
      paymentMethod: 'BLIK'
    });

    //then
    expect(secondCheckoutResponse.ok()).toBeTruthy();
    const secondOrder = await secondCheckoutResponse.json();

    //then
    expect(secondOrder.id).not.toBe(firstOrder.id);
    expect(secondOrder.status).toBe('NEW');
    expectOrderToMatchCart(cartBeforeSecondOrder, secondOrder);

    //when
    const secondPayResponse = await freshApiClient.order.pay(secondOrder.id);

    //then
    expect(secondPayResponse.ok()).toBeTruthy();
    const secondPaidOrder = await secondPayResponse.json();

    //then
    expect(secondPaidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeSecondOrder, secondOrder, secondPaidOrder);

    //when
    const emptyCartAfterSecondOrderResponse = await freshApiClient.cart.getCart();

    //then
    expect(emptyCartAfterSecondOrderResponse.ok()).toBeTruthy();
    const emptyCartAfterSecondOrder = await emptyCartAfterSecondOrderResponse.json();

    //then
    expect(emptyCartAfterSecondOrder.items).toEqual([]);
  });
});

async function createProduct(testContext: any, product: any) {
  const response = await testContext.api.admin.product.createProduct(product);

  //then
  expect(response.ok()).toBeTruthy();
  return response.json();
}
