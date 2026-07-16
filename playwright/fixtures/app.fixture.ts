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

type FreshApiClient = {
  email: string;
  password: string;
  token: string;
  product: ProductAPI;
  cart: CartAPI;
  order: OrderAPI;
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
  freshApiClient: FreshApiClient;
  getProductApi: (role: 'admin' | 'client') => Promise<ProductAPI>;
};

export const test = base.extend<AppFixtures>({
  // Test-scoped: business API clients composed around Playwright's request fixture.
  testContext: async ({ request, getTokenWorkerFixture, freshApiClient }, use) => {
    const adminToken = await getTokenWorkerFixture('admin');

    const adminProductApi = new ProductAPI(request, adminToken);

    await use({
      api: {
        admin: {
          product: adminProductApi
        },
        client: {
          product: freshApiClient.product,
          cart: freshApiClient.cart,
          order: freshApiClient.order
        }
      }
    });
  },

  // Test-scoped: direct cart API client for specs/dsl that only need cart behavior.
  cartApi: async ({ freshApiClient }, use) => {
    await use(freshApiClient.cart);
  },

  // Test-scoped: cart workflow DSL built on the cart API client.
  cartDsl: async ({ cartApi }, use) => {
    await use(new CartDsl(cartApi));
  },

  // Test-scoped: unique user and API clients for scenarios that must not share account cart state.
  freshApiClient: async ({ request }, use) => {
    const password = '1234';
    const email = `api-client-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`;

    const registerResponse = await request.post('/api/auth/register', {
      data: { email, password }
    });

    if (!registerResponse.ok()) {
      throw new Error(`Fresh API client registration failed with status ${registerResponse.status()}`);
    }

    const loginResponse = await request.post('/api/auth/login', {
      data: { email, password }
    });

    if (!loginResponse.ok()) {
      throw new Error(`Fresh API client login failed with status ${loginResponse.status()}`);
    }

    const token = await loginResponse.text();

    await use({
      email,
      password,
      token,
      product: new ProductAPI(request, token),
      cart: new CartAPI(request, token),
      order: new OrderAPI(request, token)
    });
  },

  // Test-scoped: factory for product API clients with a chosen seeded role.
  getProductApi: async ({ request, getTokenWorkerFixture, freshApiClient }, use) => {
    await use(async (role) => {
      if (role === 'client') {
        return freshApiClient.product;
      }

      const token = await getTokenWorkerFixture(role);
      return new ProductAPI(request, token);
    });
  }
});
