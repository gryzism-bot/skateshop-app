import { expect, Page } from '@playwright/test';

export class AccountComponent {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoggedIn() {
    await expect(this.accountStatus).toContainText('You are logged in.');
  }

  private get emailInput() {
    return this.page.locator('[data-testid="login-email"]');
  }

  private get passwordInput() {
    return this.page.locator('[data-testid="login-password"]');
  }

  private get loginButton() {
    return this.page.locator('[data-testid="login-button"]');
  }

  private get accountStatus() {
    return this.page.locator('[data-testid="account-status"]');
  }
}
