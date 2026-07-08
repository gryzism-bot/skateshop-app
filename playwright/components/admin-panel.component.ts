import { expect, Page } from '@playwright/test';

export class AdminPanelComponent {
  constructor(private page: Page) {}

  async open() {
    await this.adminPanelButton.click();
    await expect(this.adminPanelModal).toBeVisible();
  }

  async markOrderAsSent(orderId: number) {
    const order = this.orderRow(orderId);
    await expect(order).toBeVisible();
    await order.locator('[data-testid="mark-order-sent-button"]').click();
    await expect(order.locator('[data-testid="admin-order-status"]')).toContainText('SENT');
  }

  async expectOrderSent(orderId: number) {
    await expect(this.orderRow(orderId).locator('[data-testid="admin-order-status"]')).toContainText('SENT');
  }

  private orderRow(orderId: number) {
    return this.adminOrders.filter({ hasText: `Order ${orderId}` });
  }

  private get adminPanelButton() {
    return this.page.locator('[data-testid="admin-panel-button"]');
  }

  private get adminPanelModal() {
    return this.page.locator('[data-testid="admin-panel-modal"]');
  }

  private get adminOrders() {
    return this.page.locator('[data-testid="admin-order"]');
  }
}
