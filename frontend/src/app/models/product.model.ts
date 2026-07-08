export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  type: string;
  price: number;
  stock: number;
  imageUrl: string;
  active: boolean;
  createdOn: string;
}
