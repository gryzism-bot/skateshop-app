import { ChangeDetectorRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductService } from './services/product.service';
import { CartRequestDTO, CartResponseDTO, CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';

import { Product } from './models/product.model';
import { Cart } from './models/cart.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  products: Product[] = [];
  cart: CartResponseDTO | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  // 🔁 Lifecycle
  ngOnInit(): void {
    this.loadProducts();
    this.loadCart();
  }

  // 🛍️ Products
  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        console.log("PRODUCTS:", products); 
        this.products = products;
        this.changeDetectorRef.detectChanges(); // todo: workaround
      },
      error: (err) => {
        console.error("Products error:", err); 
      }
    });
  }

  // 🛒 Cart
  private loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cart: CartResponseDTO) => {
        console.log("CART:", cart); 
        this.cart = cart;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error("Cart error:", err); 
      }
    });
  }

  addToCart(productId: number): void {
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        console.log("Added to cart:", productId); 
        this.loadCart(); // refresh cart
      },
      error: (err) => {
        console.error("Add to cart error:", err);
      }
    });
  }

  // 🔐 Auth
  login(email: string, password: string): void {
    this.authService.login(email, password).subscribe({
      next: (token: string) => {
        this.authService.saveToken(token);
        console.log("Logged in!");
      },
      error: (err) => {
        console.error("Login failed", err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    console.log("Logged out");
  }
}