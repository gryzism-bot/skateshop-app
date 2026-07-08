import { expect, Page } from '@playwright/test';

export class CatalogComponent {
  constructor(private page: Page) {}

  async addFirstProductToCart() {
    await this.addToCartButtons.first().click();
  }

  async addProductToCart(productName: string) {
    await this.productAddToCartButton(productName).click();
  }

  async hideSkates() {
    await this.skatesFilter.uncheck();
  }

  async showSkates() {
    await this.skatesFilter.check();
  }

  async hideAccessories() {
    await this.accessoriesFilter.uncheck();
  }

  async expectProductVisible(productName: string) {
    await expect(this.productName(productName)).toBeVisible();
  }

  async expectProductHidden(productName: string) {
    await expect(this.productName(productName)).toBeHidden();
  }

  async expectNoSkatesVisible() {
    await expect(this.productCategories.filter({ hasText: 'SKATES' })).toHaveCount(0);
  }

  async expectEmptyCatalog() {
    await expect(this.productCards).toHaveCount(0);
    await expect(this.emptyProductsMessage).toBeVisible();
  }

  async expectProductCardVisible(productName: string) {
    await expect(this.productCard(productName)).toBeVisible();
  }

  private productCard(productName: string) {
    return this.productCards.filter({ hasText: productName });
  }

  private productAddToCartButton(productName: string) {
    return this.productCard(productName).locator('[data-testid="add-to-cart-button"]');
  }

  private productName(productName: string) {
    return this.productCards.filter({ hasText: productName });
  }

  private get addToCartButtons() {
    return this.page.locator('[data-testid="add-to-cart-button"]');
  }

  private get skatesFilter() {
    return this.page.locator('[data-testid="filter-skates"]');
  }

  private get accessoriesFilter() {
    return this.page.locator('[data-testid="filter-accessories"]');
  }

  private get productCategories() {
    return this.page.locator('[data-testid="product-category"]');
  }

  private get productCards() {
    return this.page.locator('[data-testid="product-card"]');
  }

  private get emptyProductsMessage() {
    return this.page.locator('[data-testid="empty-products"]');
  }
}
