import { expect } from '@playwright/test';
import { ProductBuilder } from '../../../builders/product.builder';
import { test } from '../../../fixtures/app.fixture';

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
