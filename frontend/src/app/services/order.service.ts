import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  id?: number;
  quantity: number;
  price: number;
}

export interface Order {
  id?: number;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdOn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  checkout(): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, {});
  }
}
