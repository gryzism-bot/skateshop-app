export interface CartItem {
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalPrice: number;
}