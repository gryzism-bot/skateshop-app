import { APIRequestContext } from "@playwright/test";

export class CartAPI {
  constructor(
    private request: APIRequestContext,
    private token: string
  ) {}

  async addToCart(productId: number, quantity: number) {
    return this.request.post('/api/cart/add', {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      data: {
        productId,
        quantity
      }
    });
  }

  async getCart() {
    return this.request.get('/api/cart', {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
  }
}