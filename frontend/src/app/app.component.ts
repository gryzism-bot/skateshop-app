import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';

import { AuthService } from './services/auth.service';
import { CartResponseDTO, CartService } from './services/cart.service';
import { ProductService } from './services/product.service';

import { Product } from './models/product.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  products = signal<Product[]>([]);
  cart = signal<CartResponseDTO | null>(null);
  isLoggedIn = signal(false);
  hasGuestCartItems = signal(false);
  accountMessage = signal('');
  accountError = signal('');
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.isLoggedIn.set(this.authService.getToken() !== null);
    this.accountMessage.set(this.isLoggedIn() ? 'You are logged in.' : 'You are browsing as a guest.');
    this.loadProducts();
    this.refreshGuestCartState();

    if (this.isLoggedIn()) {
      this.loadCart();
    } else {
      this.cart.set(this.cartService.getGuestCart());
    }
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        console.log('PRODUCTS:', products);
        this.products.set(products);
      },
      error: (err) => {
        console.error('Products error:', err);
      }
    });
  }

  private loadCart(): void {
    if (!this.isLoggedIn()) {
      this.cart.set(this.cartService.getGuestCart());
      return;
    }

    this.cartService.getCart().subscribe({
      next: (cart: CartResponseDTO) => {
        console.log('CART:', cart);
        this.cart.set(cart);
      },
      error: (err) => {
        console.error('Cart error:', err);
      }
    });
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn()) {
      const cart = this.cartService.addToGuestCart(product, 1);
      this.cart.set(cart);
      this.refreshGuestCartState();
      console.log('Added to guest cart:', product.id);
      return;
    }

    this.cartService.addToCart(product.id, 1).subscribe({
      next: (cart: CartResponseDTO) => {
        console.log('Added to account cart:', product.id);
        this.cart.set(cart);
      },
      error: (err) => {
        console.error('Add to cart error:', err);
      }
    });
  }

  login(email: string, password: string): void {
    this.accountMessage.set('');
    this.accountError.set('');

    this.authService.login(email, password).subscribe({
      next: (token: string) => {
        this.authService.saveToken(token);
        this.isLoggedIn.set(true);
        this.accountMessage.set('You are logged in.');
        this.refreshGuestCartState();
        this.loadCart();
        console.log('Logged in!');
      },
      error: (err) => {
        this.isLoggedIn.set(false);
        this.accountError.set('Login failed. Check your email and password.');
        this.accountMessage.set('You are browsing as a guest.');
        console.error('Login failed', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.cart.set(this.cartService.getGuestCart());
    this.accountMessage.set('You are browsing as a guest.');
    this.accountError.set('');
    this.refreshGuestCartState();
    console.log('Logged out');
  }

  mergeGuestCartToAccountCart(): void {
    if (!this.isLoggedIn()) {
      return;
    }

    this.cartService.mergeGuestCartToAccountCart().subscribe({
      next: (cart: CartResponseDTO) => {
        this.cartService.clearGuestCart();
        this.cart.set(cart);
        this.refreshGuestCartState();
        console.log('Guest cart added to account cart');
      },
      error: (err) => {
        console.error('Merge guest cart error:', err);
      }
    });
  }

  private refreshGuestCartState(): void {
    this.hasGuestCartItems.set(this.cartService.hasGuestCartItems());
  }
}
