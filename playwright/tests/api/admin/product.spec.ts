import { expect } from '@playwright/test';
import { ProductBuilder, ProductCategory, ProductType } from '../../../builders/product.builder';
import { test } from '../../../fixtures/app.fixture';

const randomSuffixPattern = /\s\[pw-[a-z0-9-]+\]$/;

test.describe('product API', { tag: ['@suite-all', '@suite-api'] }, () => {
  test('admin can create product', async ({ testContext }) => {
    //given
    const product = new ProductBuilder()
      .withName('Admin Skate Playwright')
      .withPrice(299)
      .withStock(5)
      .withImage('https://cdn.bladeville.pl/media/catalog/product/i/m/img_4447.jpg')
      .build();

    //when
    const response = await testContext.api.admin.product.createProduct(product);

    //then
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    //then
    expect(body.name).toBe(product.name);
    expect(body.price).toBe(product.price);
    expect(body.active).toBe(true);
  });

  test('client cannot create product', async ({ testContext }) => {
    //when
    const response = await testContext.api.client.product.createProduct(new ProductBuilder().build());

    //then
    expect(response.status()).toBe(403);
  });

  test('client cannot update product', async ({ testContext }) => {
    //given
    const createdProduct = await createProduct(testContext, new ProductBuilder().build());
    const update = new ProductBuilder()
      .withSku(createdProduct.sku)
      .withName('Client Update Attempt')
      .build();

    //when
    const response = await testContext.api.client.product.updateProduct(createdProduct.id, update);

    //then
    expect(response.status()).toBe(403);
  });

  test('admin can update added product', async ({ testContext }) => {
    //given
    const createdProduct = await createProduct(testContext, new ProductBuilder().build());
    const update = new ProductBuilder()
      .withName('Updated Freeskate')
      .withSku(createdProduct.sku)
      .withPrice(349)
      .withStock(7)
      .build();

    //when
    const response = await testContext.api.admin.product.updateProduct(createdProduct.id, update);

    //then
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    //then
    expect(body.id).toBe(createdProduct.id);
    expect(body.name).toBe(update.name);
    expect(body.price).toBe(update.price);
    expect(body.stock).toBe(update.stock);
  });

  test('admin can rename first skate from product list', async ({ testContext }) => {
    //given
    const listResponse = await testContext.api.admin.product.getAll();
    const products = await listResponse.json();
    const firstSkate = products.find((product: any) => product.category === 'SKATES');
    const suffix = ` [pw-${Date.now().toString(36)}]`;

    //then
    expect(firstSkate).toBeTruthy();

    //given
    const update = {
      ...firstSkate,
      name: firstSkate.name.replace(randomSuffixPattern, '') + suffix
    };

    //when
    const response = await testContext.api.admin.product.updateProduct(firstSkate.id, update);

    //then
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    //then
    expect(body.name).toContain(suffix);
    expect(body.name.match(randomSuffixPattern)?.[0]).toBe(suffix);
  });

  const invalidCreateProductCases = [
    {
      caseName: 'missing name',
      product: () => new ProductBuilder().withName('').build()
    },
    {
      caseName: 'skates category with wheels type',
      product: () => productWithCategoryAndType('SKATES', 'WHEELS')
    },
    {
      caseName: 'accessories category with freeskate type',
      product: () => productWithCategoryAndType('ACCESSORIES', 'FREESKATE')
    }
  ];

  for (const invalidProductCase of invalidCreateProductCases) {
    test(`admin cannot create product with ${invalidProductCase.caseName}`, async ({ testContext }) => {
      //when
      await expectProductRejected(testContext, invalidProductCase.product(), 400);
    });
  }

  test('admin cannot create product with unknown category', async ({ testContext }) => {
    //when
    const response = await testContext.api.admin.product.createProduct({
      ...new ProductBuilder().build(),
      category: 'SKKATES'
    });

    //then
    expect(response.status()).toBe(400);
  });

  test('admin cannot create product with duplicated sku', async ({ testContext }) => {
    //given
    const product = new ProductBuilder().build();
    await createProduct(testContext, product);

    //when
    const response = await testContext.api.admin.product.createProduct(
      new ProductBuilder()
        .withName('Duplicate SKU Product')
        .withSku(product.sku)
        .build()
    );

    //then
    expect(response.status()).toBe(400);
  });

  test('admin can update whole product from skate to accessory', async ({ testContext }) => {
    //given
    const createdProduct = await createProduct(testContext, new ProductBuilder().build());
    const update = new ProductBuilder()
      .withName('Updated Wheels')
      .withSku(createdProduct.sku)
      .withCategory('ACCESSORIES')
      .withType('WHEELS')
      .withPrice(189)
      .withStock(12)
      .build();

    //when
    const response = await testContext.api.admin.product.updateProduct(createdProduct.id, update);

    //then
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    //then
    expect(body.category).toBe('ACCESSORIES');
    expect(body.type).toBe('WHEELS');
  });

  test('admin cannot update product into category and type conflict', async ({ testContext }) => {
    //given
    const productForSkateWheelConflict = await createProduct(testContext, new ProductBuilder().build());

    //when
    const skateWheelResponse = await testContext.api.admin.product.updateProduct(
      productForSkateWheelConflict.id,
      productWithCategoryAndType('SKATES', 'WHEELS', productForSkateWheelConflict.sku)
    );

    //given
    const productForAccessoryFreeskateConflict = await createProduct(testContext, new ProductBuilder().build());

    //when
    const accessoryFreeskateResponse = await testContext.api.admin.product.updateProduct(
      productForAccessoryFreeskateConflict.id,
      productWithCategoryAndType('ACCESSORIES', 'FREESKATE', productForAccessoryFreeskateConflict.sku)
    );

    //then
    expect(skateWheelResponse.status()).toBe(400);
    expect(accessoryFreeskateResponse.status()).toBe(400);
  });

  test('admin gets not found when updating missing product', async ({ testContext }) => {
    //when
    const response = await testContext.api.admin.product.updateProduct(999999, new ProductBuilder().build());

    //then
    expect(response.status()).toBe(404);
  });

  test('admin gets not found when requesting missing product', async ({ testContext }) => {
    //when
    const response = await testContext.api.admin.product.getById(999999);

    //then
    expect(response.status()).toBe(404);
  });

  test('admin cannot keep product active with zero stock', async ({ testContext }) => {
    //given
    const product = new ProductBuilder()
      .withStock(0)
      .withActive(true)
      .build();

    //when
    const response = await testContext.api.admin.product.createProduct(product);

    //then
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    //then
    expect(body.stock).toBe(0);
    expect(body.active).toBe(false);
  });
});

async function createProduct(testContext: any, product: any) {
  const response = await testContext.api.admin.product.createProduct(product);

  //then
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function expectProductRejected(testContext: any, product: any, status = 400) {
  const response = await testContext.api.admin.product.createProduct(product);

  //then
  expect(response.status()).toBe(status);
}

function productWithCategoryAndType(category: ProductCategory, type: ProductType, sku?: string) {
  const builder = new ProductBuilder()
    .withCategory(category)
    .withType(type);

  if (sku) {
    builder.withSku(sku);
  }

  return builder.build();
}
