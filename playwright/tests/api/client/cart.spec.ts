import { test} from '../../../fixtures/app.fixture';
import { expect } from '@playwright/test';
import { ProductBuilder } from '../../../builders/product.builder';

test('user can add product to cart', async ({
  getProductApi,
  cartApi
}) => {

  const adminApi = await getProductApi('client');

  const product = new ProductBuilder().build();

  const createRes = await adminApi.createProduct(product);
  const created = await createRes.json();

  const productId = created.id;

  await cartApi.addToCart(productId, 2);

  const cartRes = await cartApi.getCart();
  const cart = await cartRes.json();
  console.log(await cartRes.text());

  expect(cart.items.length).toBeGreaterThan(0);

  const item = cart.items.find((i: any) => i.productId === productId);

  expect(item).toBeTruthy();
  expect(item.quantity).toBe(2);
});