import { APIRequestContext, expect } from '@playwright/test';
import { ProductBuilder } from '../../builders/product.builder';
import { test } from '../../fixtures/ui.fixture';

const wheelsImageUrl = 'https://cdn.bladeville.pl/media/catalog/product/i/m/img_2147.jpg';

test('logged client can filter products, checkout skate, and pay order', async ({
  apiRequestContext,
  freshClient,
  getTokenWorkerFixture,
  productPage
}) => {
  const adminToken = await getTokenWorkerFixture('admin');

  const skate = await createProduct(apiRequestContext, adminToken, new ProductBuilder()
    .withName(`UI Checkout Skate ${Date.now()}`)
    .withSku(`UI-SKATE-${Date.now()}`)
    .withCategory('SKATES')
    .withType('FREESKATE')
    .withPrice(300)
    .withStock(4)
    .build());

  const accessory = await createProduct(apiRequestContext, adminToken, new ProductBuilder()
    .withName(`UI Checkout Wheels ${Date.now()}`)
    .withSku(`UI-WHEELS-${Date.now()}`)
    .withCategory('ACCESSORIES')
    .withType('WHEELS')
    .withImage(wheelsImageUrl)
    .withPrice(120)
    .withStock(6)
    .build());

  await productPage.openAsLoggedClient(freshClient.token);
  await productPage.expectProductsVisible([skate.name, accessory.name]);

  await productPage.hideSkates();
  await productPage.expectSkatesHidden(skate.name);
  await productPage.expectProductVisible(accessory.name);

  await productPage.hideAccessories();
  await productPage.expectCatalogEmpty();

  await productPage.showSkates();
  await productPage.addProductToCart(skate.name);

  const checkoutModal = await productPage.startCheckout();
  const order = await checkoutModal.placeOrder({
    contactEmail: freshClient.email,
    deliveryAddress: 'Skate Street 10, Warsaw',
    paymentMethod: 'Card'
  });
  const paidOrder = await checkoutModal.payOrder(order.id);

  expect(paidOrder.status).toBe('PAID');
});

async function createProduct(api: APIRequestContext, token: string, product: any) {
  const response = await api.post('/api/products', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: product
  });

  expect(response.ok()).toBeTruthy();
  return response.json();
}
