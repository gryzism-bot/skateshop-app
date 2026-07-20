import { expect } from '@playwright/test';
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

    expect(createProductResponse.ok()).toBeTruthy();
    const product = await createProductResponse.json();

    const addToCartResponse = await api.cart.client.addToCart(product.id, 1);

    expect(addToCartResponse.ok()).toBeTruthy();
    const cartBeforeCheckout = await addToCartResponse.json();

    const checkoutRequest = {
      contactEmail: freshClient.email,
      deliveryMethod: 'ADDRESS',
      deliveryAddress: 'Skate Street 10, Warsaw',
      paymentMethod: 'CARD'
    } as const;
    const checkoutResponse = await api.order.client.checkout(checkoutRequest);

    expect(checkoutResponse.ok()).toBeTruthy();
    const order = await checkoutResponse.json();

    expect(order.status).toBe('NEW');
    expectOrderToMatchCart(cartBeforeCheckout, order);

    const payResponse = await api.order.client.pay(order.id);

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

    const adminOrdersResponse = await api.order.admin.getAdminOrders();

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
