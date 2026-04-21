import { test} from '../../fixtures/app.fixture';
import { expect } from '@playwright/test';
import { ProductBuilder } from '../../builders/product.builder';

test('admin can create product', async ({ getProductApi }) => {

  const api = await getProductApi('admin');

  const product = new ProductBuilder()
    .withName('Admin Skate Playwright')
    .withPrice(299)
    .withStock(5)
    .withImage('https://cdn.bladeville.pl/media/catalog/product/9/0/908435-40847_ps_next_core_black_90_2023_view01.jpg')
    .build();

  const response = await api.createProduct(product);

  const status = response.status();
  const text = await response.text();

  console.log('STATUS:', status);
  console.log('BODY:', text);

  expect(response.ok()).toBeTruthy();

  const body = await response.json();

  expect(body.name).toBe(product.name);
  expect(body.price).toBe(product.price);
});