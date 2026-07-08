import { APIRequestContext } from '@playwright/test';

export class ProductAPI {
  constructor(
    private request: APIRequestContext,
    private token: string
  ) {}

  async createProduct(data: any) {
    return this.request.post('/api/products', {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      data
    });
  }

  async updateProduct(productId: number, data: any) {
    return this.request.put(`/api/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      data
    });
  }

  async getAll() {
    return this.request.get('/api/products');
  }

  async getById(productId: number) {
    return this.request.get(`/api/products/${productId}`);
  }
}
