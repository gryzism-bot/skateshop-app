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
  client: {
    email: string;
    password: string;
    token: string;
  };
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
    const freshClient = await createFreshApiClient(request);

    await use({
      client: {
        email: freshClient.email,
        password: freshClient.password,
        token: freshClient.token
      },
      api: {
        admin: {
          product: new ProductAPI(request, adminToken)
        },
        client: {
          product: freshClient.product,
          cart: freshClient.cart,
          order: freshClient.order
        }
      }
    });
  },

  // Test-scoped: direct cart API client for specs/dsl that only need cart behavior.
  cartApi: async ({ testContext }, use) => {
    await use(testContext.api.client.cart);
  },

  // Test-scoped: cart workflow DSL built on the cart API client.
  cartDsl: async ({ cartApi }, use) => {
    await use(new CartDsl(cartApi));
  },

  // Test-scoped: factory for product API clients with a chosen seeded role.
  getProductApi: async ({ request, getTokenWorkerFixture, testContext }, use) => {
    await use(async (role) => {
      if (role === 'client') {
        return testContext.api.client.product;
      }

      const token = await getTokenWorkerFixture(role);
      return new ProductAPI(request, token);
    });
  }
});

async function createFreshApiClient(request: any): Promise<FreshApiClient> {
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

  return {
    email,
    password,
    token,
    product: new ProductAPI(request, token),
    cart: new CartAPI(request, token),
    order: new OrderAPI(request, token)
  };
}
