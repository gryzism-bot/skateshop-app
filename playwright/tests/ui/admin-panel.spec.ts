import { expect } from '@playwright/test';
import { expectOkAdminOrdersResponse, expectOkCartResponse, expectOkOrderResponse, expectOkProductResponse } from '../../assertions/api-response.assertions';
import { expectOrderToMatchCart } from '../../assertions/order.assertions';
import { test } from '../../fixtures/ui.fixture';

test.describe('admin panel UI', { tag: ['@suite-all', '@suite-ui'] }, () => {
  test('admin can mark paid order as sent from admin panel', async ({
    api,
    freshClient,
    productPage
  }) => {
    //given
    const createProductResponse = await api.product.admin.createRandom({
      name: `Admin Panel Checkout Skate ${Date.now()}`,
      price: 300,
      stock: 4
    });

    const product = await expectOkProductResponse(createProductResponse, {
      price: 300,
      stock: 4
    });

    const addToCartResponse = await api.cart.client.addToCart(product.id, 1);

    const cartBeforeCheckout = await expectOkCartResponse(addToCartResponse, [
      { product, quantity: 1 }
    ]);

    const checkoutRequest = {
      contactEmail: freshClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Skate Street 10, Warsaw',
      paymentMethod: 'CARD'
    } as const;
    const checkoutResponse = await api.order.client.checkout(checkoutRequest);

    const order = await expectOkOrderResponse(checkoutResponse, {
      status: 'NEW',
      ...checkoutRequest
    });

    expect(order.status).toBe('NEW');
    expectOrderToMatchCart(cartBeforeCheckout, order);

    const payResponse = await api.order.client.pay(order.id);

    const paidOrder = await expectOkOrderResponse(payResponse, {
      id: order.id,
      status: 'PAID',
      ...checkoutRequest
    });

    //when
    expect(paidOrder.status).toBe('PAID');
    expectOrderToMatchCart(cartBeforeCheckout, order, paidOrder);

    await productPage.open();
    await productPage.loginAsAdmin('admin@test.com', 'admin123');
    const adminPanel = await productPage.startAdminPanel();

    await adminPanel.markOrderAsSent(order.id);

    await adminPanel.expectOrderSent(order.id);

    const adminOrdersResponse = await api.order.admin.getAdminOrders();

    const adminOrders = await expectOkAdminOrdersResponse(adminOrdersResponse);
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
