import { test } from '../../../fixtures/app.fixture';
import { expect } from '@playwright/test';
import { ProductBuilder } from '../../../builders/product.builder';

test.describe('cart API', { tag: ['@suite-all', '@suite-api'] }, () => {
  test('user can add product to cart', async ({ testContext }) => {
    //given
    const product = new ProductBuilder().build();

    //when
    const createRes = await testContext.api.admin.product.createProduct(product);
    const created = await createRes.json();

    const productId = created.id;

    await testContext.api.client.cart.addToCart(productId, 2);

    const cartRes = await testContext.api.client.cart.getCart();
    const cart = await cartRes.json();
    console.log(await cartRes.text());

    //then
    expect(cart.items.length).toBeGreaterThan(0);

    const item = cart.items.find((i: any) => i.productId === productId);

    //then
    expect(item).toBeTruthy();
    expect(item.quantity).toBe(2);
  });
});
