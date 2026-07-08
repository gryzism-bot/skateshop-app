import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  id?: number;
  quantity: number;
  price: number;
}

export interface CheckoutRequest {
  promoCode?: string;
  contactEmail: string;
  deliveryMethod: 'ADDRESS' | 'PACZKOMAT';
  deliveryAddress?: string;
  paczkomatCode?: string;
  paymentMethod: 'BLIK' | 'CARD' | 'ON_DELIVERY';
}

export interface Order {
  id?: number;
  items: OrderItem[];
  totalPrice: number;
  discountAmount?: number;
  promoCode?: string;
  contactEmail?: string;
  deliveryMethod?: string;
  deliveryAddress?: string;
  paczkomatCode?: string;
  paymentMethod?: string;
  status: string;
  createdOn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  pay(orderId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${orderId}/pay`, {});
  }
}
