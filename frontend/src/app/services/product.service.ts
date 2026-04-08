import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private api = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get<any[]>(this.api);
  }

  addToCart(productId: number) {
  return this.http.post(
    `http://localhost:8080/api/cart/1/add/${productId}?quantity=1`,
    {}
    );
  }
}