import { APIResponse, expect } from '@playwright/test';

type ProductExpectation = Partial<{
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  type: string;
  imageUrl: string | null;
  active: boolean;
}>;

type CartItemExpectation = {
  product: ProductExpectation & {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
};

type OrderExpectation = Partial<{
  id: number;
  totalPrice: number;
  discountAmount: number;
  promoCode: string | null;
  contactEmail: string;
  deliveryMethod: 'ADDRESS' | 'PACZKOMAT';
  deliveryAddress: string | null;
  paczkomatCode: string | null;
  paymentMethod: 'BLIK' | 'CARD' | 'ON_DELIVERY';
  status: 'NEW' | 'PAID' | 'SENT';
}>;

export async function expectOkProductResponse(response: APIResponse, expected: ProductExpectation = {}) {
  expect(response.status()).toBe(200);
  const product = await response.json();

  expectProductResponse(product);
  expect(product).toMatchObject(expected);

  return product;
}

export async function expectOkProductListResponse(response: APIResponse) {
  expect(response.status()).toBe(200);
  const products = await response.json();

  expect(Array.isArray(products)).toBe(true);
  for (const product of products) {
    expectProductResponse(product);
  }

  return products;
}

export async function expectOkCartResponse(response: APIResponse, expectedItems?: CartItemExpectation[]) {
  expect(response.status()).toBe(200);
  const cart = await response.json();

  expect(typeof cart.id).toBe('number');
  expect(Array.isArray(cart.items)).toBe(true);
  expect(typeof cart.totalPrice).toBe('number');

  for (const item of cart.items) {
    expectCartItemResponse(item);
  }

  if (expectedItems === undefined) {
    return cart;
  }

  expect(cart.items).toHaveLength(expectedItems.length);

  for (const expectedItem of expectedItems) {
    const cartItem = cart.items.find((item: any) => item.productId === expectedItem.product.id);

    expect(cartItem).toBeDefined();
    expect(cartItem.productName).toBe(expectedItem.product.name);
    expect(cartItem.productPrice).toBe(expectedItem.product.price);
    expect(cartItem.quantity).toBe(expectedItem.quantity);
    expect(cartItem.totalPrice).toBe(expectedItem.product.price * expectedItem.quantity);
  }

  return cart;
}

export async function expectOkOrderResponse(response: APIResponse, expected: OrderExpectation = {}) {
  expect(response.status()).toBe(200);
  const order = await response.json();

  expectOrderResponse(order);
  expect(order).toMatchObject(expected);

  return order;
}

export async function expectOkAdminOrdersResponse(response: APIResponse) {
  expect(response.status()).toBe(200);
  const orders = await response.json();

  expect(Array.isArray(orders)).toBe(true);
  for (const order of orders) {
    expect(typeof order.id).toBe('number');
    expect(typeof order.userEmail).toBe('string');
    expect(typeof order.contactEmail).toBe('string');
    expect(typeof order.deliveryAddress === 'string' || order.deliveryAddress === null).toBe(true);
    expect(typeof order.paczkomatCode === 'string' || order.paczkomatCode === null).toBe(true);
    expect(typeof order.totalPrice).toBe('number');
    expect(['NEW', 'PAID', 'SENT']).toContain(order.status);
    expect(typeof order.createdOn).toBe('string');
  }

  return orders;
}

function expectProductResponse(product: any) {
  expect(typeof product.id).toBe('number');
  expect(typeof product.name).toBe('string');
  expect(typeof product.sku).toBe('string');
  expect(typeof product.price).toBe('number');
  expect(typeof product.stock).toBe('number');
  expect(['SKATES', 'ACCESSORIES']).toContain(product.category);
  expect(['FREESKATE', 'SPEEDSKATE', 'LINERS', 'WHEELS', 'CRASHPADS']).toContain(product.type);
  expect(typeof product.imageUrl === 'string' || product.imageUrl === null).toBe(true);
  expect(typeof product.active).toBe('boolean');
  expect(typeof product.createdOn).toBe('string');
}

function expectCartItemResponse(item: any) {
  expect(typeof item.productId).toBe('number');
  expect(typeof item.productName).toBe('string');
  expect(typeof item.productPrice).toBe('number');
  expect(typeof item.imageUrl === 'string' || item.imageUrl === null).toBe(true);
  expect(typeof item.quantity).toBe('number');
  expect(typeof item.totalPrice).toBe('number');
}

function expectOrderResponse(order: any) {
  expect(typeof order.id).toBe('number');
  expect(Array.isArray(order.items)).toBe(true);
  expect(typeof order.totalPrice).toBe('number');
  expect(typeof order.discountAmount).toBe('number');
  expect(typeof order.promoCode === 'string' || order.promoCode === null).toBe(true);
  expect(typeof order.contactEmail).toBe('string');
  expect(['ADDRESS', 'PACZKOMAT']).toContain(order.deliveryMethod);
  expect(typeof order.deliveryAddress === 'string' || order.deliveryAddress === null).toBe(true);
  expect(typeof order.paczkomatCode === 'string' || order.paczkomatCode === null).toBe(true);
  expect(['BLIK', 'CARD', 'ON_DELIVERY']).toContain(order.paymentMethod);
  expect(['NEW', 'PAID', 'SENT']).toContain(order.status);
  expect(typeof order.createdOn).toBe('string');

  for (const item of order.items) {
    expect(typeof item.id).toBe('number');
    expect(typeof item.quantity).toBe('number');
    expect(typeof item.price).toBe('number');
    expectProductResponse(item.product);
  }
}
