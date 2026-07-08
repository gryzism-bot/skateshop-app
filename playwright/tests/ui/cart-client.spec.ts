import { expect } from '@playwright/test';
import { test } from '../../fixtures/ui.fixture';

test('client can add guest cart items to account cart after login', async ({ productPage }) => {
  await productPage.open();
  await productPage.addFirstAvailableProductToGuestCart();
  await productPage.loginAndMergeGuestCartToAccount('user@test.com', '1234');

  const checkoutModal = await productPage.startCheckout();
  const order = await checkoutModal.placeOrder({
    contactEmail: 'user@test.com',
    deliveryAddress: 'Skate Street 10, Warsaw',
    paymentMethod: 'Card'
  });
  const paidOrder = await checkoutModal.payOrder(order.id);

  expect(paidOrder.status).toBe('PAID');
});
