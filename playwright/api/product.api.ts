import { APIRequestContext } from '@playwright/test';
import { ProductBuilder, ProductCategory, ProductType } from '../builders/product.builder';

type RandomProductOverrides = {
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
  type?: ProductType;
  imageUrl?: string;
  active?: boolean;
};

export class ProductAPI {
  constructor(
    private request: APIRequestContext,
    private token: string
  ) {}

  async createProduct(data: any) {
    return this.request.post('/api/products', {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      data
    });
  }

  async createRandom(overrides: RandomProductOverrides = {}) {
    const random = Date.now();
    const builder = new ProductBuilder()
      .withName(overrides.name ?? `Random Product ${random}`)
      .withSku(overrides.sku ?? `RANDOM-SKU-${random}-${Math.floor(Math.random() * 10000)}`);

    if (overrides.price !== undefined) {
      builder.withPrice(overrides.price);
    }

    if (overrides.stock !== undefined) {
      builder.withStock(overrides.stock);
    }

    if (overrides.category !== undefined) {
      builder.withCategory(overrides.category);
    }

    if (overrides.type !== undefined) {
      builder.withType(overrides.type);
    }

    if (overrides.imageUrl !== undefined) {
      builder.withImage(overrides.imageUrl);
    }

    if (overrides.active !== undefined) {
      builder.withActive(overrides.active);
    }

    return this.createProduct(builder.build());
  }

  async updateProduct(productId: number, data: any) {
    return this.request.put(`/api/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      data
    });
  }

  async getAll() {
    return this.request.get('/api/products');
  }

  async getById(productId: number) {
    return this.request.get(`/api/products/${productId}`);
  }
}
