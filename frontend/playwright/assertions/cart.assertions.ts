import { expect } from '@playwright/test';

export function expectCartTotal(cart: any, expected: number) {
  expect(cart.totalPrice).toBe(expected);
}