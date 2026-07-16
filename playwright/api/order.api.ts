import { APIRequestContext } from '@playwright/test';

type CheckoutRequest = {
  promoCode?: string;
  contactEmail: string;
  deliveryMethod: 'ADDRESS' | 'PACZKOMAT';
  deliveryAddress?: string;
  paczkomatCode?: string;
  paymentMethod: 'BLIK' | 'CARD' | 'ON_DELIVERY';
};

export class OrderAPI {
  constructor(
    private request: APIRequestContext,
    private token: string
  ) { }

  async checkout(body: CheckoutRequest = {
    contactEmail: 'client@test.com',
    deliveryMethod: 'ADDRESS',
    deliveryAddress: 'Longboard Street 7, Warsaw',
    paymentMethod: 'CARD'
  }) {
    return this.request.post('/api/orders', {
      headers: this.authHeaders(),
      data: body
    });
  }

  async pay(orderId: number) {
    return this.request.post(`/api/orders/${orderId}/pay`, {
      headers: this.authHeaders()
    });
  }

  async getAdminOrders() {
    return this.request.get('/api/orders/admin', {
      headers: this.authHeaders()
    });
  }

  async markAsSent(orderId: number) {
    return this.request.post(`/api/orders/${orderId}/sent`, {
      headers: this.authHeaders()
    });
  }

  private authHeaders() {
    return {
      Authorization: `Bearer ${this.token}`
    };
  }
}
