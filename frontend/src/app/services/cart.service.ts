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

  getCart(cartId: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.api}/${cartId}`);
  }

  addToCart(cartId: number, productId: number, quantity: number): Observable<void> {
    return this.http.post<void>(
      `${this.api}/${cartId}/add/${productId}?quantity=${quantity}`,
      {}
    );
  }
}