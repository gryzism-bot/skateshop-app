import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { switchMap } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { CartResponseDTO, CartService } from './services/cart.service';
import { Order, OrderService } from './services/order.service';
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
  checkoutMessage = signal('');
  checkoutError = signal('');
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private orderService: OrderService,
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
    this.checkoutMessage.set('');
    this.checkoutError.set('');

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

  checkout(): void {
    this.checkoutMessage.set('');
    this.checkoutError.set('');

    if (!this.isLoggedIn()) {
      this.checkoutError.set('Log in to checkout.');
      return;
    }

    if (!this.cart()?.items?.length && !this.hasGuestCartItems()) {
      this.checkoutError.set('Your cart is empty.');
      return;
    }

    const checkoutRequest = this.hasGuestCartItems()
      ? this.cartService.mergeGuestCartToAccountCart().pipe(
          switchMap(() => {
            this.cartService.clearGuestCart();
            this.refreshGuestCartState();
            return this.orderService.checkout();
          })
        )
      : this.orderService.checkout();

    checkoutRequest.subscribe({
      next: (order: Order) => {
        this.checkoutMessage.set(`Order ${order.id ?? ''} placed. Status: ${order.status}.`);
        this.loadCart();
      },
      error: (err) => {
        this.checkoutError.set('Checkout failed. Review your cart and try again.');
        console.error('Checkout error:', err);
      }
    });
  }

  private refreshGuestCartState(): void {
    this.hasGuestCartItems.set(this.cartService.hasGuestCartItems());
  }
}
