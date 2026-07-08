import { expect } from '@playwright/test';
import { CartAPI } from '../../api/cart.api';
import { OrderAPI } from '../../api/order.api';
import { ProductAPI } from '../../api/product.api';
import { ProductBuilder } from '../../builders/product.builder';
import { test } from '../../fixtures/ui.fixture';

test('admin can mark paid order as sent from admin panel', async ({
  apiRequestContext,
  freshClient,
  getTokenWorkerFixture,
  productPage
}) => {
  const adminToken = await getTokenWorkerFixture('admin');

  const productApi = new ProductAPI(apiRequestContext, adminToken);
  const createProductResponse = await productApi.createProduct(new ProductBuilder()
    .withName(`Admin Panel Checkout Skate ${Date.now()}`)
    .withSku(`ADMIN-PANEL-SKATE-${Date.now()}`)
    .withPrice(300)
    .withStock(4)
    .build());
  expect(createProductResponse.ok()).toBeTruthy();
  const product = await createProductResponse.json();

  const cartApi = new CartAPI(apiRequestContext, freshClient.token);
  const addToCartResponse = await cartApi.addToCart(product.id, 1);
  expect(addToCartResponse.ok()).toBeTruthy();

  const clientOrderApi = new OrderAPI(apiRequestContext, freshClient.token);
  const checkoutResponse = await clientOrderApi.checkout({
    contactEmail: freshClient.email,
    deliveryMethod: 'ADDRESS',
    deliveryAddress: 'Skate Street 10, Warsaw',
    paymentMethod: 'CARD'
  });
  expect(checkoutResponse.ok()).toBeTruthy();
  const order = await checkoutResponse.json();

  const payResponse = await clientOrderApi.pay(order.id);
  expect(payResponse.ok()).toBeTruthy();

  await productPage.open();
  await productPage.loginAsAdmin('admin@test.com', 'admin123');
  const adminPanel = await productPage.startAdminPanel();

  await adminPanel.markOrderAsSent(order.id);
  await adminPanel.expectOrderSent(order.id);

  const adminOrderApi = new OrderAPI(apiRequestContext, adminToken);
  const adminOrdersResponse = await adminOrderApi.getAdminOrders();
  expect(adminOrdersResponse.ok()).toBeTruthy();
  const adminOrders = await adminOrdersResponse.json();

  expect(adminOrders.find((adminOrder: any) => adminOrder.id === order.id)?.status).toBe('SENT');
});
