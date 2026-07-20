import { expect } from '@playwright/test';
import { test } from '../../fixtures/ui.fixture';

const wheelsImageUrl = 'https://cdn.bladeville.pl/media/catalog/product/i/m/img_2147.jpg';

test.describe('checkout UI', { tag: ['@suite-all', '@suite-ui'] }, () => {
  test('logged client can filter products, checkout skate, and pay order', async ({
    api,
    freshClient,
    productPage
  }) => {
    //given
    const skateResponse = await api.product.admin.createRandom({
      name: `UI Checkout Skate ${Date.now()}`,
      category: 'SKATES',
      type: 'FREESKATE',
      price: 300,
      stock: 4
    });

    expect(skateResponse.ok()).toBeTruthy();
    const skate = await skateResponse.json();

    const accessoryResponse = await api.product.admin.createRandom({
      name: `UI Checkout Wheels ${Date.now()}`,
      category: 'ACCESSORIES',
      type: 'WHEELS',
      imageUrl: wheelsImageUrl,
      price: 120,
      stock: 6
    });

    expect(accessoryResponse.ok()).toBeTruthy();
    const accessory = await accessoryResponse.json();

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

    //then
    expect(paidOrder.status).toBe('PAID');
  });
});
