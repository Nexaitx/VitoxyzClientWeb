
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable, finalize, map, of } from 'rxjs';
import { ProductService } from '../../../core/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { API_URL } from '@src/app/core/const';
import { Router } from '@angular/router';
import { CartService } from '@src/app/core/cart.service'; // ✅ Make sure this path is correct

@Component({
  selector: 'app-common-filter-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
  ],
  templateUrl: './common-filter-component.html',
  styleUrls: ['./common-filter-component.scss'],
})
export class CommonFilterComponent implements OnInit {
  @Input() title: string = '';
  @Input() endpoint: string = '';
  @Input() productForm: string = '';
  @Input() page: number = 0;
  @Input() size: number = 10;

  isLoadingData: boolean = true;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  products$: Observable<any[]> = of([]);
  API_BASE_URL: string = '';

  // Track quantities for each product
  quantities: { [key: string]: number } = {};

  // Track loading states for each product (if needed)
  loadingStates: { [key: string]: boolean } = {};

  // Track UI states for add-to-cart buttons
  addingProducts: Set<string> = new Set();
  addedProducts: Set<string> = new Set();

  @ViewChild('productCarouselWrapper', { static: false })
  carouselWrapper!: ElementRef<HTMLDivElement>;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService // ✅ Added missing service
  ) {}

  ngOnInit(): void {
    this.API_BASE_URL = `${API_URL}/${this.endpoint}`;
    this.products$ = this.productService
      .getFilteredProducts(this.API_BASE_URL, this.productForm, this.page, this.size)
      .pipe(
        finalize(() => {
          this.isLoadingData = false;
        }),
        map((response) => {
          if (response && response.data && Array.isArray(response.data.content)) {
            const products = response.data.content.map((product: any) => ({
              ...product,
            }));
            products.forEach((product: any) => {
              const productId = (product.id ?? product.productId).toString();
              if (!(productId in this.quantities)) {
                this.quantities[productId] = 0;
              }
            });
            return products;
          }
          return [];
        })
      );
  }

  getFirstImageUrl(imageUrls: string): string {
    if (!imageUrls) return 'assets/placeholder.png';
    return imageUrls.split('|')[0].trim();
  }

  scrollCarousel(direction: 'left' | 'right'): void {
    if (this.carouselWrapper) {
      const element = this.carouselWrapper.nativeElement;
      const cardWidth = 250;
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * 4;

      if (direction === 'left') {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }

  goToProduct(product: any) {
    const productId = product.id ?? product.productId;
    if (!productId) {
      console.error('Product ID missing', product);
      return;
    }
    const routeType = this.endpoint.includes('otc') ? 'otc' : 'otc';
    this.router.navigate(['/medicine', productId], {
      queryParams: { type: routeType },
    });
  }

  seeAllProducts() {
    this.router.navigate(['/products', this.productForm], {
      queryParams: {
        endpoint: this.endpoint,
      },
    });
  }

  // ✅ Fixed addToCart
  addToCart(product: any, event: Event) {
    event.stopPropagation();

    const productId = product.id ?? product.productId;
    if (!productId) {
      console.error('Cannot add to cart: Product ID missing', product);
      this.showCustomToast('Failed to add product to cart', 'error');
      return;
    }

    this.addingProducts.add(productId);
    this.quantities[productId] = 1;

    const cartItem = {
      id: productId.toString(),
      name: product.name,
      price: product.mrp,
      mrp: product.mrpOld || product.mrp,
      image: this.getFirstImageUrl(product.imageUrl),
      qty: product.packaging || '1',
      count: 1,
      productType: this.endpoint.includes('otc') ? 'otc' : 'otc',
    };

    // ✅ Add to local cart
    this.cartService.addToLocalCart(cartItem);

    this.showCustomToast(`${product.name} added to cart successfully!`);

    // Update UI states
    this.addingProducts.delete(productId);
    this.addedProducts.add(productId);

    // ✅ Optional: Sync to backend if logged in
    if (this.cartService.isLoggedIn()) {
      this.cartService
        .addItem({
          medicineId: productId.toString(),
          quantity: 1,
          productType: this.endpoint.includes('otc') ? 'otc' : 'otc',
        })
        .subscribe({
          next: () => console.log('Item synced with backend'),
          error: (err) => console.error('Failed to sync with backend:', err),
        });
    }

    // Reset "added" visual state
    setTimeout(() => {
      this.addedProducts.delete(productId);
    }, 2000);
  }

  increment(product: any) {
    const productId = (product.id ?? product.productId).toString();
    this.quantities[productId] = (this.quantities[productId] || 0) + 1;
    console.log(
      `Incremented quantity for product ${productId}: ${this.quantities[productId]}`
    );
  }

  decrement(product: any) {
    const productId = (product.id ?? product.productId).toString();
    const current = this.quantities[productId] || 0;
    if (current > 1) {
      this.quantities[productId] = current - 1;
      console.log(
        `Decremented quantity for product ${productId}: ${this.quantities[productId]}`
      );
    } else {
      this.quantities[productId] = 0;
      console.log(`Removed product ${productId} from cart`);
    }
  }

  private showCustomToast(
    message: string,
    type: 'success' | 'error' = 'success'
  ) {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  isLoading(productId: string): boolean {
    return this.loadingStates[productId] || false;
  }
}
