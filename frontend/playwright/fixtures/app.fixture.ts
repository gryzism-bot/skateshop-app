import { test as base } from './auth.fixture';
import { CartAPI } from '../api/cart.api';
import { CartDsl } from '../dsl/cart.dsl';
import { ProductAPI } from '../api/product.api';

type AppFixtures = {
  cartApi: CartAPI;
  cartDsl: CartDsl;
  getProductApi: (role: 'admin' | 'client') => Promise<ProductAPI>;
};

export const test = base.extend<AppFixtures>({
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