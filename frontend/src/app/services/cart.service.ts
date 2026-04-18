import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 📦 DTOs (adjust paths if needed)
export interface CartItemDTO {
  productId: number;
  productName: string;
  imageUrl: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CartResponseDTO {
  items: CartItemDTO[];
  totalPrice: number;
}

export interface CartRequestDTO {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})

export class CartService {

  private apiUrl = 'http://localhost:8080/api/cart';

  constructor(private http: HttpClient) {}

  // 🛒 Get current cart
  getCart(): Observable<CartResponseDTO> {
    return this.http.get<CartResponseDTO>(this.apiUrl);
  }

  // ➕ Add product to cart
  addToCart(productId: number, quantity: number): Observable<CartResponseDTO> {
    const body: CartRequestDTO = {
      productId,
      quantity
    };

    return this.http.post<CartResponseDTO>(`${this.apiUrl}/add`, body);
  }

  // ➖ Remove product from cart
  removeFromCart(productId: number): Observable<CartResponseDTO> {
    return this.http.delete<CartResponseDTO>(`${this.apiUrl}/remove/${productId}`);
  }

  // 🧹 Clear cart (optional, if you implement it)
  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`);
  }
}