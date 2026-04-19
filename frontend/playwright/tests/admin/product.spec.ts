import { test} from '../../fixtures/app.fixture';
import { expect } from '@playwright/test';
import { ProductBuilder } from '../../builders/product.builder';

test('admin can create product', async ({ getProductApi }) => {

  const api = await getProductApi('admin');

  const product = new ProductBuilder()
    .withName('Admin Skate')
    .withPrice(299)
    .withStock(5)
    .build();

  const response = await api.createProduct(product);

  expect(response.ok()).toBeTruthy();

  const body = await response.json();

  expect(body.name).toBe(product.name);
  expect(body.price).toBe(product.price);
});