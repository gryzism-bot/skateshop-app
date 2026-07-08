import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { concatMap, defaultIfEmpty, last } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

export interface CartItemDTO {
  productId: number;
  sku?: string;
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

  private apiUrl = `${environment.apiUrl}/cart`;
  private guestCartKey = 'skateshop.guestCart';

  constructor(private http: HttpClient) {}

  getCart(): Observable<CartResponseDTO> {
    return this.http.get<CartResponseDTO>(this.apiUrl);
  }

  addToCart(productId: number, quantity: number): Observable<CartResponseDTO> {
    const body: CartRequestDTO = {
      productId,
      quantity
    };

    return this.http.post<CartResponseDTO>(`${this.apiUrl}/add`, body);
  }

  removeFromCart(productId: number): Observable<CartResponseDTO> {
    return this.http.delete<CartResponseDTO>(`${this.apiUrl}/remove/${productId}`);
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`);
  }

  getGuestCart(): CartResponseDTO {
    if (!this.hasLocalStorage()) {
      return this.emptyCart();
    }

    const rawCart = globalThis.localStorage.getItem(this.guestCartKey);

    if (!rawCart) {
      return this.emptyCart();
    }

    try {
      return this.normalizeCart(JSON.parse(rawCart));
    } catch {
      this.clearGuestCart();
      return this.emptyCart();
    }
  }

  addToGuestCart(product: Product, quantity: number): CartResponseDTO {
    const cart = this.getGuestCart();
    const existingItem = cart.items.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.productPrice;
    } else {
      cart.items.push({
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        imageUrl: product.imageUrl,
        productPrice: product.price,
        quantity,
        totalPrice: product.price * quantity
      });
    }

    const updatedCart = this.normalizeCart(cart);
    this.saveGuestCart(updatedCart);
    return updatedCart;
  }

  clearGuestCart(): void {
    if (this.hasLocalStorage()) {
      globalThis.localStorage.removeItem(this.guestCartKey);
    }
  }

  hasGuestCartItems(): boolean {
    return this.getGuestCart().items.length > 0;
  }

  mergeGuestCartToAccountCart(): Observable<CartResponseDTO> {
    const guestItems = this.getGuestCart().items;

    return from(guestItems).pipe(
      concatMap(item => this.addToCart(item.productId, item.quantity)),
      defaultIfEmpty(null),
      last(),
      concatMap(cart => cart === null ? this.getCart() : of(cart))
    );
  }

  private saveGuestCart(cart: CartResponseDTO): void {
    if (this.hasLocalStorage()) {
      globalThis.localStorage.setItem(this.guestCartKey, JSON.stringify(cart));
    }
  }

  private normalizeCart(cart: CartResponseDTO): CartResponseDTO {
    const items = Array.isArray(cart?.items) ? cart.items : [];

    const normalizedItems = items
      .filter(item => item.productId && item.quantity > 0)
      .map(item => ({
        ...item,
        totalPrice: item.productPrice * item.quantity
      }));

    return {
      items: normalizedItems,
      totalPrice: normalizedItems.reduce((total, item) => total + item.totalPrice, 0)
    };
  }

  private emptyCart(): CartResponseDTO {
    return {
      items: [],
      totalPrice: 0
    };
  }

  private hasLocalStorage(): boolean {
    return typeof globalThis.localStorage !== 'undefined';
  }
}
