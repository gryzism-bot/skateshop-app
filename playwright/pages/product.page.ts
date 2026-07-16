import { Page } from '@playwright/test';
import { AccountComponent } from '../components/account.component';
import { CartComponent } from '../components/cart.component';
import { CatalogComponent } from '../components/catalog.component';
import { CheckoutModalComponent } from '../components/checkout-modal.component';
import { AdminPanelComponent } from '../components/admin-panel.component';
import { AdminPanelPage } from './admin-panel.page';
import { CheckoutModalPage } from './checkout-modal.page';

export class ProductPage {
  private account = new AccountComponent(this.page);
  private cart = new CartComponent(this.page);
  private catalog = new CatalogComponent(this.page);
  private checkoutModal = new CheckoutModalComponent(this.page);
  private adminPanel = new AdminPanelComponent(this.page);

  constructor(private page: Page) {}

  async open() {
    await this.page.goto('/');
  }

  async openAsLoggedClient(token: string) {
    await this.openAsLoggedUser(token);
  }

  async openAsLoggedUser(token: string) {
    await this.page.addInitScript((clientToken) => {
      localStorage.setItem('token', clientToken);
    }, token);

    await this.open();
    await this.account.expectLoggedIn();
  }

  async loginAsAdmin(email: string, password: string) {
    await this.account.login(email, password);
    await this.account.expectLoggedIn();
  }

  async addFirstAvailableProductToGuestCart() {
    await this.cart.expectGuestCart();
    await this.catalog.addFirstProductToCart();
    await this.cart.expectItemCount(1);
    await this.cart.expectTotalVisible();
    await this.cart.expectGuestCart();
  }

  async loginAndMergeGuestCartToAccount(email: string, password: string) {
    await this.account.login(email, password);
    await this.account.expectLoggedIn();
    await this.cart.expectAccountCart();
    await this.cart.expectGuestMergeAvailable();

    await this.cart.mergeGuestItemsToAccountCart();

    await this.cart.expectGuestMergeHidden();
    await this.cart.expectAnyItemVisible();
    await this.cart.expectTotalVisible();
  }

  async expectProductsVisible(productNames: string[]) {
    for (const productName of productNames) {
      await this.catalog.expectProductVisible(productName);
    }
  }

  async hideSkates() {
    await this.catalog.hideSkates();
  }

  async hideAccessories() {
    await this.catalog.hideAccessories();
  }

  async showSkates() {
    await this.catalog.showSkates();
  }

  async expectSkatesHidden(skateProductName: string) {
    await this.catalog.expectProductHidden(skateProductName);
    await this.catalog.expectNoSkatesVisible();
  }

  async expectProductVisible(productName: string) {
    await this.catalog.expectProductVisible(productName);
  }

  async expectCatalogEmpty() {
    await this.catalog.expectEmptyCatalog();
  }

  async addProductToCart(productName: string) {
    await this.catalog.expectProductCardVisible(productName);
    await this.catalog.addProductToCart(productName);
    await this.cart.expectItemVisible(productName);
  }

  async expectCartItemVisible(productName: string) {
    await this.cart.expectItemVisible(productName);
  }

  async startCheckout() {
    await this.checkoutModal.open();
    return new CheckoutModalPage(this.page);
  }

  async startAdminPanel() {
    await this.adminPanel.open();
    return new AdminPanelPage(this.page);
  }
}
