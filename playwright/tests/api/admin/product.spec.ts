import { test } from '../../../fixtures/app.fixture';
import { expect } from '@playwright/test';
import { ProductBuilder } from '../../../builders/product.builder';

test('admin can create product', async ({ getProductApi }) => {

  const api = await getProductApi('admin');

  const product = new ProductBuilder()
    .withName('Admin Skate Playwright')
    .withPrice(299)
    .withStock(5)
    .withImage('https://cdn.bladeville.pl/media/catalog/product/i/m/img_4447.jpg')
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