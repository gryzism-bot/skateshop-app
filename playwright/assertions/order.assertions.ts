import { expect } from '@playwright/test';

type CartResponse = {
  items: CartItem[];
  totalPrice: number;
};

type CartItem = {
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
};

type OrderResponse = {
  items: OrderItem[];
  totalPrice: number;
  discountAmount?: number;
  status?: string;
  contactEmail?: string;
  deliveryMethod?: 'ADDRESS' | 'PACZKOMAT';
  deliveryAddress?: string | null;
  paczkomatCode?: string | null;
  paymentMethod?: 'BLIK' | 'CARD' | 'ON_DELIVERY';
};

type CheckoutDetails = {
  contactEmail: string;
  deliveryMethod: 'ADDRESS' | 'PACZKOMAT';
  deliveryAddress?: string | null;
  paczkomatCode?: string | null;
  paymentMethod: 'BLIK' | 'CARD' | 'ON_DELIVERY';
};

type OrderItem = {
  product: {
    id: number;
    name: string;
    price: number;
  };
  price: number;
  quantity: number;
};

export function expectOrderToMatchCart(cart: CartResponse, checkoutOrder: OrderResponse, finalOrder?: OrderResponse) {
  const order = finalOrder ?? checkoutOrder;
  const cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);
  const orderTotalBeforeDiscount = order.totalPrice + (order.discountAmount ?? 0);

  //then
  if (finalOrder) {
    expect(withoutStatus(finalOrder)).toEqual(withoutStatus(checkoutOrder));
  }

  expect(order.items).toHaveLength(cart.items.length);
  expect(orderTotalBeforeDiscount).toBe(cartTotal);

  for (const cartItem of cart.items) {
    const orderItem = order.items.find(item => item.product.id === cartItem.productId);

    //then
    expect(orderItem).toBeTruthy();
    expect(orderItem?.product.id).toBe(cartItem.productId);
    expect(orderItem?.product.name).toBe(cartItem.productName);
    expect(orderItem?.product.price).toBe(cartItem.productPrice);
    expect(orderItem?.price).toBe(cartItem.productPrice);
    expect(orderItem?.quantity).toBe(cartItem.quantity);
  }
}

function withoutStatus(order: OrderResponse) {
  const { status, ...orderWithoutStatus } = order;
  return orderWithoutStatus;
}

export function expectOrderToMatchCheckoutDetails(order: OrderResponse, checkoutDetails: CheckoutDetails) {
  //then
  expect(order.contactEmail).toBe(checkoutDetails.contactEmail);
  expect(order.deliveryMethod).toBe(checkoutDetails.deliveryMethod);
  expect(order.deliveryAddress ?? null).toBe(checkoutDetails.deliveryAddress ?? null);
  expect(order.paczkomatCode ?? null).toBe(checkoutDetails.paczkomatCode ?? null);
  expect(order.paymentMethod).toBe(checkoutDetails.paymentMethod);
}
