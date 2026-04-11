import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Cart } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private api = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  getCart() {
    return this.http.get<Cart>(`${this.api}`);
  }

  addToCart(productId: number, quantity: number) {
    return this.http.post(`${this.api}/add/${productId}?quantity=${quantity}`, {});
  }
}