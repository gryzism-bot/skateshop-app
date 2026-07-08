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

  const checkoutResponse = await testContext.api.client.order.checkout();
  expect(checkoutResponse.ok()).toBeTruthy();
  const order = await checkoutResponse.json();

  expect(order.status).toBe('NEW');
  expect(order.totalPrice).toBeGreaterThanOrEqual(500);
  expect(order.items.some((item: any) => item.product.id === createdProduct.id && item.quantity === 2)).toBeTruthy();

  const cartResponse = await testContext.api.client.cart.getCart();
  expect(cartResponse.ok()).toBeTruthy();
  const cart = await cartResponse.json();

  expect(cart.items).toEqual([]);
});
