import { Component, OnInit, Input, ViewChild, ElementRef, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs'; 
import { ProductService } from '../../../core/product.service'; 
import { CartService, CartItem } from '../../../core/cart.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { API_URL } from '@src/app/core/const';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-common-filter-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, 
    MatButtonModule,
    MatProgressSpinnerModule,
    CurrencyPipe
  ],
  templateUrl: './common-filter-component.html',
  styleUrls: ['./common-filter-component.scss']
})
export class CommonFilterComponent implements OnInit {
  @Input() title: string = '';   
  @Input() endpoint: string = '';    
  @Input() productForm: string = ''; 
  @Input() page: number = 0;         
  @Input() size: number = 10;        
showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  products$: Observable<any[]> = of([]); 
  API_BASE_URL: string = '';
  
  //  Track loading states for each product
  loadingStates: {[key: string]: boolean} = {};

  private cartService = inject(CartService);

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.API_BASE_URL = `${API_URL}/${this.endpoint}`;

    this.products$ = this.productService
      .getFilteredProducts(this.API_BASE_URL, this.productForm, this.page, this.size)
      .pipe(
        map(response => {
          if (response && response.data && Array.isArray(response.data.content)) {
            return response.data.content.map((product: any) => ({
              ...product,
              price: product.price ?? 378,
              mrp: product.mrp ?? 429,
              form: product.form ?? '30 ml Shampoo'
            }));
          }
          return [];
        })
      );
  }

  @ViewChild("productCarouselWrapper", { static: false }) 
  carouselWrapper!: ElementRef<HTMLDivElement>;

  getFirstImageUrl(imageUrls: string): string {
    if (!imageUrls) return 'assets/placeholder.png'; 
    return imageUrls.split('|')[0].trim();
  }

  getDiscountPercent(price: number, mrp: number): number {
    if (!mrp || !price || mrp <= price) return 0;
    return Math.floor(((mrp - price) / mrp) * 100);
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
      console.error("Product ID missing", product);
      return;
    }
    const routeType = this.endpoint.includes('otc') ? 'otc' : 'otc';
    this.router.navigate(['/medicine', productId], { queryParams: { type: routeType } });
  }

  seeAllProducts() {
    this.router.navigate(['/products', this.productForm], { 
      queryParams: { 
        endpoint: this.endpoint 
      }
    });
  }

  // //  Add to Cart with loading and alerts
  // addToCart(product: any, event: Event) {
  //   event.stopPropagation(); 
    
  //   const productId = product.id ?? product.productId;
  //   if (!productId) {
  //     console.error("Cannot add to cart: Product ID missing", product);
  //     alert('❌ Product ID missing. Cannot add to cart.');
  //     return;
  //   }
    
  //   console.log('🛒 Adding product to cart, ID:', productId);
    
  //   // Set loading state for this product
  //   this.loadingStates[productId] = true;
    
  //   // Create complete product object for cart service
  //   const productForCart = {
  //     id: productId.toString(),
  //     productId: productId.toString(),
  //     name: product.name,
  //     price: product.price,
  //     mrp: product.mrp,
  //     image: this.getFirstImageUrl(product.imageUrl),
  //     imageUrl: product.imageUrl,
  //     form: product.form,
  //     packaging: product.packaging,
  //     productType: this.endpoint.includes('otc') ? 'otc' : 'otc'
  //   };

  //   console.log('📦 Product object for cart:', productForCart);

  //   // Use cartService.addItem
  //   this.cartService.addItem(productForCart, 1).subscribe({
  //     next: (response) => {
  //       console.log('✅ Item added successfully:', response);
  //       this.loadingStates[productId] = false;
  //       // Alert will be shown by cart service success notification
  //     },
  //     error: (err) => {
  //       console.error('❌ Failed to add item:', err);
  //       this.loadingStates[productId] = false;
  //       alert('❌ Failed to add item to cart. Please try again.');
  //     }
  //   });
  // }

 addToCart(product: any, event: Event) {
    event.stopPropagation(); 
    
    const productId = product.id ?? product.productId;
    if (!productId) {
      console.error("Cannot add to cart: Product ID missing", product);
      this.showCustomToast('❌ Product ID missing. Cannot add to cart.', 'error');
      return;
    }
    
    console.log('🛒 Adding product to cart, ID:', productId);
    
    // Create complete product object for cart service
    const productForCart = {
      id: productId.toString(),
      productId: productId.toString(),
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: this.getFirstImageUrl(product.imageUrl),
      imageUrl: product.imageUrl,
      form: product.form,
      packaging: product.packaging,
      productType: this.endpoint.includes('otc') ? 'otc' : 'otc'
    };

    // Use cartService.addItem
    this.cartService.addItem(productForCart, 1);
    
    // ✅ Show success toast
    this.showCustomToast(`${product.name} added to cart successfully!`, 'success');
  }


  //  Custom toast function
  private showCustomToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  //  Check if product is currently loading
  isLoading(productId: string): boolean {
    return this.loadingStates[productId] || false;
  }
}
