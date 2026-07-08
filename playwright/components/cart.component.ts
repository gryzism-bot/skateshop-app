import { expect, Page } from '@playwright/test';

export class CartComponent {
  constructor(private page: Page) {}

  async expectGuestCart() {
    await expect(this.cartMode).toContainText('Guest cart');
  }

  async expectAccountCart() {
    await expect(this.cartMode).toContainText('Account cart');
  }

  async expectItemCount(quantity: number) {
    await expect(this.cartItems).toHaveCount(quantity);
  }

  async expectAnyItemVisible() {
    await expect(this.cartItems.first()).toBeVisible();
  }

  async expectItemVisible(productName: string) {
    await expect(this.cartItem(productName)).toBeVisible();
  }

  async expectTotalVisible() {
    await expect(this.cartTotal).toContainText('Total:');
  }

  async expectGuestMergeAvailable() {
    await expect(this.mergeGuestCartButton).toBeVisible();
  }

  async expectGuestMergeHidden() {
    await expect(this.mergeGuestCartButton).toBeHidden();
  }

  async mergeGuestItemsToAccountCart() {
    await this.mergeGuestCartButton.click();
  }

  private get cartMode() {
    return this.page.locator('[data-testid="cart-mode"]');
  }

  private get cartItems() {
    return this.page.locator('[data-testid="cart-item"]');
  }

  private cartItem(productName: string) {
    return this.cartItems.filter({ hasText: productName });
  }

  private get cartTotal() {
    return this.page.locator('[data-testid="cart-total"]');
  }

  private get mergeGuestCartButton() {
    return this.page.locator('[data-testid="merge-guest-cart-button"]');
  }
}
