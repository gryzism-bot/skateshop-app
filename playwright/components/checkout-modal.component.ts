import { expect, Page } from '@playwright/test';
import { waitForOrderPresent, waitForPayOrderResponse } from '../api/order.api';

type CheckoutDetails = {
  contactEmail: string;
  deliveryAddress: string;
  paymentMethod: 'Card';
};

export class CheckoutModalComponent {
  constructor(private page: Page) {}

  async open() {
    await this.checkoutButton.click();
    await expect(this.checkoutModal).toBeVisible();
    await expect(this.cartStep).toBeVisible();
  }

  async completeCheckout(details: CheckoutDetails) {
    await this.nextButton.click();
    await expect(this.contactStep).toBeVisible();
    await this.contactEmailInput.fill(details.contactEmail);

    await this.nextButton.click();
    await expect(this.deliveryStep).toBeVisible();
    await this.deliveryAddressInput.fill(details.deliveryAddress);
    await this.paymentOption(details.paymentMethod).check();

    const checkoutResponsePromise = waitForOrderPresent(this.page);
    await this.placeOrderButton.click();
    const checkoutResponse = await checkoutResponsePromise;
    expect(checkoutResponse.status()).toBe(200);
    const order = await checkoutResponse.json();
    expect(order.status).toBe('NEW');

    await expect(this.orderStatus).toContainText('NEW');
    return order;
  }

  async payOrder(orderId: number) {
    const payResponsePromise = waitForPayOrderResponse(this.page, orderId);
    await this.mockPayButton.click();
    const payResponse = await payResponsePromise;
    expect(payResponse.status()).toBe(200);
    const paidOrder = await payResponse.json();

    expect(paidOrder.id).toBe(orderId);
    expect(paidOrder.status).toBe('PAID');
    await expect(this.orderStatus).toContainText('PAID');

    return paidOrder;
  }

  private get checkoutButton() {
    return this.page.locator('[data-testid="checkout-button"]');
  }

  private get checkoutModal() {
    return this.page.locator('[data-testid="checkout-modal"]');
  }

  private get cartStep() {
    return this.page.locator('[data-testid="checkout-step-cart"]');
  }

  private get contactStep() {
    return this.page.locator('[data-testid="checkout-step-contact"]');
  }

  private get deliveryStep() {
    return this.page.locator('[data-testid="checkout-step-delivery"]');
  }

  private get nextButton() {
    return this.page.locator('[data-testid="checkout-next-button"]');
  }

  private get contactEmailInput() {
    return this.page.locator('[data-testid="checkout-contact-email"]');
  }

  private get deliveryAddressInput() {
    return this.page.locator('[data-testid="checkout-delivery-address"]');
  }

  private paymentOption(paymentMethod: CheckoutDetails['paymentMethod']) {
    return this.page.getByLabel(paymentMethod);
  }

  private get placeOrderButton() {
    return this.page.locator('[data-testid="checkout-place-order-button"]');
  }

  private get orderStatus() {
    return this.page.locator('[data-testid="checkout-order-status"]');
  }

  private get mockPayButton() {
    return this.page.locator('[data-testid="mock-pay-button"]');
  }
}
