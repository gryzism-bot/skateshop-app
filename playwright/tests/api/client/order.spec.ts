import { expect } from '@playwright/test';
import { ProductBuilder } from '../../../builders/product.builder';
import { test } from '../../../fixtures/app.fixture';

test.describe('order API', { tag: ['@suite-all', '@suite-api'] }, () => {
  test('user can checkout account cart', async ({ testContext }) => {
    const product = new ProductBuilder()
      .withName('Checkout Skate')
      .withPrice(250)
      .withStock(5)
      .build();

    const createProductResponse = await testContext.api.admin.product.createProduct(product);
    expect(createProductResponse.ok()).toBeTruthy();
    const createdProduct = await createProductResponse.json();

    const addToCartResponse = await testContext.api.client.cart.addToCart(createdProduct.id, 2);
    expect(addToCartResponse.ok()).toBeTruthy();

    const checkoutResponse = await testContext.api.client.order.checkout({
      promoCode: 'ROLL10',
      contactEmail: 'user@test.com',
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Longboard Street 7, Warsaw',
      paymentMethod: 'CARD'
    });
    expect(checkoutResponse.ok()).toBeTruthy();
    const order = await checkoutResponse.json();

    expect(order.status).toBe('NEW');
    expect(order.discountAmount).toBe(50);
    expect(order.totalPrice).toBe(450);
    expect(order.deliveryMethod).toBe('ADDRESS');
    expect(order.paymentMethod).toBe('CARD');
    expect(order.items.some((item: any) => item.product.id === createdProduct.id && item.quantity === 2)).toBeTruthy();

    const payResponse = await testContext.api.client.order.pay(order.id);
    expect(payResponse.ok()).toBeTruthy();
    const paidOrder = await payResponse.json();
    expect(paidOrder.status).toBe('PAID');

    const cartResponse = await testContext.api.client.cart.getCart();
    expect(cartResponse.ok()).toBeTruthy();
    const cart = await cartResponse.json();

    expect(cart.items).toEqual([]);
  });

  test('fresh user can place two orders from the same account cart', async ({ testContext, freshApiClient }) => {
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

    const firstAddToCartResponse = await freshApiClient.cart.addToCart(firstProduct.id, 1);
    expect(firstAddToCartResponse.ok()).toBeTruthy();

    const firstCheckoutResponse = await freshApiClient.order.checkout({
      contactEmail: freshApiClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 1, Warsaw',
      paymentMethod: 'CARD'
    });
    expect(firstCheckoutResponse.ok()).toBeTruthy();
    const firstOrder = await firstCheckoutResponse.json();

    expect(firstOrder.status).toBe('NEW');
    expect(firstOrder.items).toHaveLength(1);
    expect(firstOrder.items[0].product.id).toBe(firstProduct.id);

    const firstPayResponse = await freshApiClient.order.pay(firstOrder.id);
    expect(firstPayResponse.ok()).toBeTruthy();

    const emptyCartAfterFirstOrderResponse = await freshApiClient.cart.getCart();
    expect(emptyCartAfterFirstOrderResponse.ok()).toBeTruthy();
    const emptyCartAfterFirstOrder = await emptyCartAfterFirstOrderResponse.json();
    expect(emptyCartAfterFirstOrder.items).toEqual([]);

    const secondAddToCartResponse = await freshApiClient.cart.addToCart(secondProduct.id, 2);
    expect(secondAddToCartResponse.ok()).toBeTruthy();

    const cartBeforeSecondOrderResponse = await freshApiClient.cart.getCart();
    expect(cartBeforeSecondOrderResponse.ok()).toBeTruthy();
    const cartBeforeSecondOrder = await cartBeforeSecondOrderResponse.json();

    expect(cartBeforeSecondOrder.items).toHaveLength(1);
    expect(cartBeforeSecondOrder.items[0].productId).toBe(secondProduct.id);
    expect(cartBeforeSecondOrder.items[0].quantity).toBe(2);

    const secondCheckoutResponse = await freshApiClient.order.checkout({
      contactEmail: freshApiClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Cart Bound Street 2, Warsaw',
      paymentMethod: 'BLIK'
    });
    expect(secondCheckoutResponse.ok()).toBeTruthy();
    const secondOrder = await secondCheckoutResponse.json();

    expect(secondOrder.id).not.toBe(firstOrder.id);
    expect(secondOrder.status).toBe('NEW');
    expect(secondOrder.items).toHaveLength(1);
    expect(secondOrder.items[0].product.id).toBe(secondProduct.id);
    expect(secondOrder.items[0].quantity).toBe(2);

    const secondPayResponse = await freshApiClient.order.pay(secondOrder.id);
    expect(secondPayResponse.ok()).toBeTruthy();
    const secondPaidOrder = await secondPayResponse.json();
    expect(secondPaidOrder.status).toBe('PAID');

    const emptyCartAfterSecondOrderResponse = await freshApiClient.cart.getCart();
    expect(emptyCartAfterSecondOrderResponse.ok()).toBeTruthy();
    const emptyCartAfterSecondOrder = await emptyCartAfterSecondOrderResponse.json();
    expect(emptyCartAfterSecondOrder.items).toEqual([]);
  });
});

async function createProduct(testContext: any, product: any) {
  const response = await testContext.api.admin.product.createProduct(product);
  expect(response.ok()).toBeTruthy();
  return response.json();
}
