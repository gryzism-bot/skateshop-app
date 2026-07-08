import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { CartResponseDTO, CartService } from './services/cart.service';
import { AdminOrder, CheckoutRequest, Order, OrderService } from './services/order.service';
import { ProductService } from './services/product.service';
import { UserService } from './services/user.service';

import { Product } from './models/product.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  products = signal<Product[]>([]);
  showSkates = signal(true);
  showAccessories = signal(true);
  filteredProducts = computed(() => this.products().filter(product =>
    (product.category === 'SKATES' && this.showSkates())
      || (product.category === 'ACCESSORIES' && this.showAccessories())
  ));
  cart = signal<CartResponseDTO | null>(null);
  isLoggedIn = signal(false);
  hasGuestCartItems = signal(false);
  accountMessage = signal('');
  accountError = signal('');
  checkoutMessage = signal('');
  checkoutError = signal('');
  checkoutOpen = signal(false);
  checkoutStep = signal(1);
  currentOrder = signal<Order | null>(null);
  userRole = signal<'ADMIN' | 'CLIENT' | null>(null);
  adminPanelOpen = signal(false);
  adminOrders = signal<AdminOrder[]>([]);
  adminMessage = signal('');
  adminError = signal('');
  checkoutContactEmail = '';
  checkoutPromoCode = '';
  checkoutDeliveryMethod: 'ADDRESS' | 'PACZKOMAT' = 'ADDRESS';
  checkoutDeliveryAddress = '';
  checkoutPaczkomatCode = '';
  checkoutPaymentMethod: 'BLIK' | 'CARD' | 'ON_DELIVERY' = 'BLIK';
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private userService: UserService
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
      this.loadUserProfile();
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

  toggleSkatesFilter(checked: boolean): void {
    this.showSkates.set(checked);
  }

  toggleAccessoriesFilter(checked: boolean): void {
    this.showAccessories.set(checked);
  }

  login(email: string, password: string): void {
    this.accountMessage.set('');
    this.accountError.set('');

    this.authService.login(email, password).subscribe({
      next: (token: string) => {
        this.authService.saveToken(token);
        this.isLoggedIn.set(true);
        this.accountMessage.set('You are logged in.');
        this.checkoutContactEmail = email;
        this.refreshGuestCartState();
        this.loadUserProfile();
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
    this.userRole.set(null);
    this.closeAdminPanel();
    this.closeCheckout();
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

  openCheckout(): void {
    this.checkoutMessage.set('');
    this.checkoutError.set('');
    this.currentOrder.set(null);

    if (!this.isLoggedIn()) {
      this.checkoutError.set('Log in to checkout.');
      return;
    }

    if (this.hasGuestCartItems()) {
      this.checkoutError.set('Add guest items to account cart before checkout.');
      return;
    }

    if (!this.cart()?.items?.length) {
      this.checkoutError.set('Your cart is empty.');
      return;
    }

    this.checkoutOpen.set(true);
    this.checkoutStep.set(1);
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.checkoutContactEmail = profile.email;
        this.checkoutDeliveryAddress = profile.address || '';
      },
      error: (err) => {
        console.error('Profile error:', err);
      }
    });
  }

  closeCheckout(): void {
    this.checkoutOpen.set(false);
    this.checkoutStep.set(1);
    this.currentOrder.set(null);
  }

  nextCheckoutStep(): void {
    if (this.checkoutStep() === 2 && !this.checkoutContactEmail.trim()) {
      this.checkoutError.set('Contact email is required.');
      return;
    }

    if (this.checkoutStep() === 3 && !this.canSubmitCheckout()) {
      this.checkoutError.set('Choose delivery and payment details.');
      return;
    }

    this.checkoutError.set('');
    this.checkoutStep.set(Math.min(this.checkoutStep() + 1, 4));
  }

  previousCheckoutStep(): void {
    this.checkoutError.set('');
    this.checkoutStep.set(Math.max(this.checkoutStep() - 1, 1));
  }

  submitCheckout(): void {
    this.checkoutMessage.set('');
    this.checkoutError.set('');

    if (!this.canSubmitCheckout()) {
      this.checkoutError.set('Complete checkout details first.');
      return;
    }

    const request: CheckoutRequest = {
      promoCode: this.checkoutPromoCode || undefined,
      contactEmail: this.checkoutContactEmail,
      deliveryMethod: this.checkoutDeliveryMethod,
      deliveryAddress: this.checkoutDeliveryMethod === 'ADDRESS' ? this.checkoutDeliveryAddress : undefined,
      paczkomatCode: this.checkoutDeliveryMethod === 'PACZKOMAT' ? this.checkoutPaczkomatCode : undefined,
      paymentMethod: this.checkoutPaymentMethod
    };

    const checkoutRequest = this.checkoutDeliveryMethod === 'ADDRESS'
      ? this.userService.updateAddress(this.checkoutDeliveryAddress).pipe(
          switchMap(() => this.orderService.checkout(request))
        )
      : this.orderService.checkout(request);

    checkoutRequest.subscribe({
      next: (order: Order) => {
        this.currentOrder.set(order);
        this.checkoutStep.set(4);
        this.checkoutMessage.set(`Order ${order.id ?? ''} placed. Status: ${order.status}.`);
        this.loadCart();
      },
      error: (err) => {
        this.checkoutError.set('Checkout failed. Review your cart and try again.');
        console.error('Checkout error:', err);
      }
    });
  }

  payCurrentOrder(): void {
    const order = this.currentOrder();
    if (!order?.id) {
      return;
    }

    this.orderService.pay(order.id).subscribe({
      next: (paidOrder) => {
        this.currentOrder.set(paidOrder);
        this.checkoutMessage.set(`Order ${paidOrder.id ?? ''} paid. Status: ${paidOrder.status}.`);
      },
      error: (err) => {
        this.checkoutError.set('Payment failed. Try the mock payment again.');
        console.error('Payment error:', err);
      }
    });
  }

  checkoutSubtotal(): number {
    return this.cart()?.totalPrice || 0;
  }

  checkoutDiscount(): number {
    return this.checkoutPromoCode.trim().toUpperCase() === 'ROLL10'
      ? Math.round(this.checkoutSubtotal() * 0.10 * 100) / 100
      : 0;
  }

  checkoutTotalAfterDiscount(): number {
    return Math.max(this.checkoutSubtotal() - this.checkoutDiscount(), 0);
  }

  canSubmitCheckout(): boolean {
    const hasDelivery = this.checkoutDeliveryMethod === 'ADDRESS'
      ? this.checkoutDeliveryAddress.trim().length > 0
      : this.checkoutPaczkomatCode.trim().length > 0;

    return this.checkoutContactEmail.trim().length > 0
      && hasDelivery
      && this.checkoutPaymentMethod.length > 0;
  }

  openAdminPanel(): void {
    this.adminMessage.set('');
    this.adminError.set('');
    this.adminPanelOpen.set(true);
    this.loadAdminOrders();
  }

  closeAdminPanel(): void {
    this.adminPanelOpen.set(false);
    this.adminOrders.set([]);
  }

  markOrderAsSent(orderId: number): void {
    this.adminMessage.set('');
    this.adminError.set('');

    this.orderService.markAsSent(orderId).subscribe({
      next: (updatedOrder) => {
        this.adminOrders.update(orders => orders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        ));
        this.adminMessage.set(`Order ${updatedOrder.id} marked as ${updatedOrder.status}.`);
      },
      error: (err) => {
        this.adminError.set('Could not mark order as sent.');
        console.error('Admin order update error:', err);
      }
    });
  }

  private loadAdminOrders(): void {
    this.orderService.getAdminOrders().subscribe({
      next: (orders) => {
        this.adminOrders.set(orders);
      },
      error: (err) => {
        this.adminError.set('Could not load admin orders.');
        console.error('Admin orders error:', err);
      }
    });
  }

  private loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.userRole.set(profile.role);
      },
      error: (err) => {
        console.error('Profile error:', err);
      }
    });
  }

  private refreshGuestCartState(): void {
    this.hasGuestCartItems.set(this.cartService.hasGuestCartItems());
  }
}
