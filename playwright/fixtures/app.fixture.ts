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
  testContext: async ({ request, getToken }, use) => {
    const adminToken = await getToken('admin');
    const clientToken = await getToken('client');

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

  cartApi: async ({ request, getToken }, use) => {
    const token = await getToken('client');
    await use(new CartAPI(request, token));
  },

  cartDsl: async ({ cartApi }, use) => {
    await use(new CartDsl(cartApi));
  },

  getProductApi: async ({ request, getToken }, use) => {
    await use(async (role) => {
      const token = await getToken(role);
      return new ProductAPI(request, token);
    });
  }
});
