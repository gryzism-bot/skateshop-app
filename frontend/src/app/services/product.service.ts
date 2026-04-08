import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private api = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get<any[]>(this.api);
  }
}