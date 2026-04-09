import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from './services/product.service';
import { AuthService } from './services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  products: any[] = [];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  this.productService.getProducts().subscribe(data => {
    console.log("DATA RECEIVED:", data);

    this.products = data;

    this.cdr.detectChanges(); 

    console.log("ASSIGNED:", this.products);
  });

  console.log("INITIAL:", this.products);
}

  login(email: string, password: string) {
    this.authService.login(email, password).subscribe({
      next: (token: any) => {
        this.authService.saveToken(token);
        console.log("Logged in!");
    },
    error: err => console.error("Login failed", err)
  });
}

  addToCart(productId: number) {
    this.productService.addToCart(productId).subscribe({
      next: () => console.log("Added to cart:", productId),
      error: err => console.error("Error adding to cart", err)
  });
}
}