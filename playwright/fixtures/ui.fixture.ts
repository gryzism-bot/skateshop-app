import { APIRequestContext, expect, request as playwrightRequest } from '@playwright/test';
import { CartAPI } from '../api/cart.api';
import { OrderAPI } from '../api/order.api';
import { ProductAPI } from '../api/product.api';
import { test as base } from './app.fixture';
import { ProductPage } from '../pages/product.page';

type FreshClient = {
  email: string;
  password: string;
  token: string;
};

type UiFixtures = {
  api: {
    product: {
      admin: ProductAPI;
      client: ProductAPI;
    };
    cart: {
      client: CartAPI;
    };
    order: {
      admin: OrderAPI;
      client: OrderAPI;
    };
  };
  apiRequestContext: APIRequestContext;
  freshClient: FreshClient;
  productPage: ProductPage;
};

export const test = base.extend<UiFixtures>({
  // Test-scoped: page object bound to Playwright's isolated page fixture.
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  // Test-scoped: raw Playwright APIRequestContext, disposed after each test.
  apiRequestContext: async ({}, use) => {
    const requestContext = await playwrightRequest.newContext({
      baseURL: (process.env.API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '')
    });

    await use(requestContext);
    await requestContext.dispose();
  },

  // Test-scoped: unique client account and token for isolated UI scenarios.
  freshClient: async ({ apiRequestContext }, use) => {
    const password = '1234';
    const email = `checkout-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`;

    const registerResponse = await apiRequestContext.post('/api/auth/register', {
      data: { email, password }
    });
    expect(registerResponse.status()).toBe(200);

    const loginResponse = await apiRequestContext.post('/api/auth/login', {
      data: { email, password }
    });
    expect(loginResponse.status()).toBe(200);

    await use({
      email,
      password,
      token: await loginResponse.text()
    });
  },

  // Test-scoped: role-bound API clients for UI setup and backend assertions.
  api: async ({ apiRequestContext, freshClient, getTokenWorkerFixture }, use) => {
    const adminToken = await getTokenWorkerFixture('admin');

    await use({
      product: {
        admin: new ProductAPI(apiRequestContext, adminToken),
        client: new ProductAPI(apiRequestContext, freshClient.token)
      },
      cart: {
        client: new CartAPI(apiRequestContext, freshClient.token)
      },
      order: {
        admin: new OrderAPI(apiRequestContext, adminToken),
        client: new OrderAPI(apiRequestContext, freshClient.token)
      }
    });
  }
});
