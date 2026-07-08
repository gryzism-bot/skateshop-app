import { test as base } from './auth.fixture';
import { CartAPI } from '../api/cart.api';
import { CartDsl } from '../dsl/cart.dsl';
import { OrderAPI } from '../api/order.api';
import { ProductAPI } from '../api/product.api';

type RoleApiContext = {
  product: ProductAPI;
  cart?: CartAPI;
  order?: OrderAPI;
};

export type TestContext = {
  api: {
    admin: RoleApiContext;
    client: RoleApiContext & {
      cart: CartAPI;
      order: OrderAPI;
    };
  };
};

type AppFixtures = {
  testContext: TestContext;
  cartApi: CartAPI;
  cartDsl: CartDsl;
  getProductApi: (role: 'admin' | 'client') => Promise<ProductAPI>;
};

export const test = base.extend<AppFixtures>({
  // Test-scoped: business API clients composed around Playwright's request fixture.
  testContext: async ({ request, getTokenWorkerFixture }, use) => {
    const adminToken = await getTokenWorkerFixture('admin');
    const clientToken = await getTokenWorkerFixture('client');

    const adminProductApi = new ProductAPI(request, adminToken);
    const clientProductApi = new ProductAPI(request, clientToken);
    const clientCartApi = new CartAPI(request, clientToken);
    const clientOrderApi = new OrderAPI(request, clientToken);

    await use({
      api: {
        admin: {
          product: adminProductApi
        },
        client: {
          product: clientProductApi,
          cart: clientCartApi,
          order: clientOrderApi
        }
      }
    });
  },

  // Test-scoped: direct cart API client for specs/dsl that only need cart behavior.
  cartApi: async ({ request, getTokenWorkerFixture }, use) => {
    const token = await getTokenWorkerFixture('client');
    await use(new CartAPI(request, token));
  },

  // Test-scoped: cart workflow DSL built on the cart API client.
  cartDsl: async ({ cartApi }, use) => {
    await use(new CartDsl(cartApi));
  },

  // Test-scoped: factory for product API clients with a chosen seeded role.
  getProductApi: async ({ request, getTokenWorkerFixture }, use) => {
    await use(async (role) => {
      const token = await getTokenWorkerFixture(role);
      return new ProductAPI(request, token);
    });
  }
});
