export class CartItemBuilder {
  private productId = 1;
  private quantity = 1;

  withProductId(id: number) {
    this.productId = id;
    return this;
  }

  withQuantity(qty: number) {
    this.quantity = qty;
    return this;
  }

  build() {
    return {
      productId: this.productId,
      quantity: this.quantity
    };
  }
}