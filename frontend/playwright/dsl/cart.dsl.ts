import { CartAPI } from '../api/cart.api';

export class CartDsl {
  constructor(private cartApi: CartAPI) {}

  async addProduct(productId: number) {
    return this.cartApi.addToCart(productId, 1);
  }

  async expectCartNotEmpty() {
    const response = await this.cartApi.getCart();
    const body = await response.json();

    if (body.items.length === 0) {
      throw new Error('Cart should not be empty');
    }
  }
}