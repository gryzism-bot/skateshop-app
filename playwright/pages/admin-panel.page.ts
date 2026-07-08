import { Page } from '@playwright/test';
import { AdminPanelComponent } from '../components/admin-panel.component';

export class AdminPanelPage {
  private adminPanel = new AdminPanelComponent(this.page);

  constructor(private page: Page) {}

  async markOrderAsSent(orderId: number) {
    await this.adminPanel.markOrderAsSent(orderId);
  }

  async expectOrderSent(orderId: number) {
    await this.adminPanel.expectOrderSent(orderId);
  }
}
