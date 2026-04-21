export type ProductType = 'FREESKATE' | 'CRASHPADS';
export type Category = 'SKATES' | 'ACCESSORIES';

export class ProductBuilder {
  private name = 'Test Product';
  private price = 100;
  private stock = 10;
  private category: Category = 'SKATES';
  private type: ProductType = 'FREESKATE';
  private imageUrl = 'https://cdn.bladeville.pl/media/catalog/product/i/m/img_4447.jpg';

  withName(name: string) {
    this.name = name;
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

  withCategory(category: Category) {
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

  build() {
    return {
      name: this.name,
      price: this.price,
      stock: this.stock,
      category: this.category,
      type: this.type,
      imageUrl: this.imageUrl
    };
  }
}