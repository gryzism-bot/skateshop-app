export type ProductType = 'FREESKATE' | 'SPEEDSKATE' | 'LINERS' | 'WHEELS' | 'CRASHPADS';
export type ProductCategory = 'SKATES' | 'ACCESSORIES';

export class ProductBuilder {
  private name = 'Test Product';
  private sku = `TEST-SKU-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  private price = 100;
  private stock = 10;
  private category: ProductCategory = 'SKATES';
  private type: ProductType = 'FREESKATE';
  private imageUrl = 'https://cdn.bladeville.pl/media/catalog/product/i/m/img_4447.jpg';
  private active = true;

  withName(name: string) {
    this.name = name;
    return this;
  }

  withSku(sku: string) {
    this.sku = sku;
    return this;
  }

  withPrice(price: number) {
    this.price = price;
    return this;
  }

  withStock(stock: number) {
    this.stock = stock;
    return this;
  }

  withCategory(category: ProductCategory) {
    this.category = category;
    return this;
  }

  withType(type: ProductType) {
    this.type = type;
    return this;
  }

  withImage(url: string) {
    this.imageUrl = url;
    return this;
  }

  inactive() {
    this.active = false;
    return this;
  }

  withActive(active: boolean) {
    this.active = active;
    return this;
  }

  build() {
    return {
      name: this.name,
      sku: this.sku,
      price: this.price,
      stock: this.stock,
      category: this.category,
      type: this.type,
      imageUrl: this.imageUrl,
      active: this.active
    };
  }
}
