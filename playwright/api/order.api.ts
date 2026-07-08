import { APIRequestContext } from '@playwright/test';

export class OrderAPI {
  constructor(
    private request: APIRequestContext,
    private token: string
  ) {}

  async checkout() {
    return this.request.post('/api/orders', {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
  }
}
