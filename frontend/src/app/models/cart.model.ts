export interface CartItem {
  productId: number;
  sku?: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  productPrice: number;
  totalPrice: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalPrice: number;
}
