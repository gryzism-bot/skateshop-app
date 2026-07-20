import { expect } from '@playwright/test';
import { CartAPI } from '../../api/cart.api';
import { OrderAPI } from '../../api/order.api';
import { ProductAPI } from '../../api/product.api';
import { expectOrderToMatchCart } from '../../assertions/order.assertions';
import { ProductBuilder } from '../../builders/product.builder';
import { test } from '../../fixtures/ui.fixture';

test.describe('admin panel UI', { tag: ['@suite-all', '@suite-ui'] }, () => {
  test('admin can mark paid order as sent from admin panel', async ({
    apiRequestContext,
    freshClient,
    getTokenWorkerFixture,
    productPage
  }) => {
    //given
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

    const userCartApi = new CartAPI(apiRequestContext, freshClient.token);
    const addToCartResponse = await userCartApi.addToCart(product.id, 1);

    expect(addToCartResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await addToCartResponse.json();

    const clientOrderApi = new OrderAPI(apiRequestContext, freshClient.token);
    const checkoutRequest = {
      contactEmail: freshClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Skate Street 10, Warsaw',
      paymentMethod: 'CARD'
    } as const;
    const checkoutResponse = await clientOrderApi.checkout(checkoutRequest);

    expect(checkoutResponse.ok()).toBeTruthy();
    const order = await checkoutResponse.json();

    expect(order.status).toBe('NEW');
    expectOrderToMatchCart(cartBeforeCheckout, order);

    const payResponse = await clientOrderApi.pay(order.id);

    expect(payResponse.ok()).toBeTruthy();
    const paidOrder = await payResponse.json();

    //when
    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);

    await productPage.open();
    await productPage.loginAsAdmin('admin@test.com', 'admin123');
    const adminPanel = await productPage.startAdminPanel();

    await adminPanel.markOrderAsSent(order.id);

    await adminPanel.expectOrderSent(order.id);

    const adminOrderApi = new OrderAPI(apiRequestContext, adminToken);
    const adminOrdersResponse = await adminOrderApi.getAdminOrders();

    expect(adminOrdersResponse.ok()).toBeTruthy();
    const adminOrders = await adminOrdersResponse.json();
    const sentAdminOrder = adminOrders.find((adminOrder: any) => adminOrder.id === order.id);

    //then
    expect(sentAdminOrder).toEqual({
      id: order.id,
      userEmail: freshClient.email,
      contactEmail: checkoutRequest.contactEmail,
      deliveryAddress: checkoutRequest.deliveryAddress,
      paczkomatCode: null,
      totalPrice: paidOrder.totalPrice,
      status: 'SENT',
      createdOn: paidOrder.createdOn
    });
  });
});
