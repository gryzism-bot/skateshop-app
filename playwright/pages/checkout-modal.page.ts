import { CheckoutModalComponent } from '../components/checkout-modal.component';
import { Page } from '@playwright/test';

type CheckoutDetails = {
  contactEmail: string;
  deliveryAddress: string;
  paymentMethod: 'Card';
};

export class CheckoutModalPage {
  private checkoutModal = new CheckoutModalComponent(this.page);

  constructor(private page: Page) {}

  async placeOrder(details: CheckoutDetails) {
    return this.checkoutModal.completeCheckout(details);
  }

  async payOrder(orderId: number) {
    return this.checkoutModal.payOrder(orderId);
  }
}
