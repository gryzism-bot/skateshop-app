import { APIRequestContext } from '@playwright/test';

export class ProductAPI {
  constructor(
    private request: APIRequestContext,
    private token: string
  ) {}

  async createProduct(data: any) {
    return this.request.post('/api/products', {
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      data
    });
  }

  async getAll() {
    return this.request.get('/api/products');
  }
}