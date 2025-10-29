import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonFilterConfig, Product, ApiResponse } from './product-slider.interface';
import { API_URL } from '@src/app/core/const';

@Component({
  selector: 'app-common-multifilter-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="common-filter-slider">
      <!-- Header Section -->
      <div class="slider-header mb-4">
        @if (config.image) {
          <div class="header-with-image">
            <img [src]="config.image" [alt]="config.title" class="header-image">
            <h2 class="slider-title">{{ config.title }}</h2>
          </div>
        } @else {
          <h2 class="slider-title text-center">{{ config.title }}</h2>
        }
      </div>

      <!-- Slider Container -->
      <div class="slider-container position-relative">
        
        <!-- Loading State -->
        @if (isLoading) {
          <div class="loading-state text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading products...</p>
          </div>
        }

        <!-- Error State -->
        @if (!isLoading && error) {
          <div class="error-state text-center py-5">
            <div class="error-icon mb-3">
              <mat-icon class="text-danger" style="font-size: 48px; width: 48px; height: 48px;">
                error_outline
              </mat-icon>
            </div>
            <p class="text-danger mb-3">{{ error }}</p>
            <button class="btn btn-primary retry-btn" (click)="fetchProducts()">
              Try Again
            </button>
          </div>
        }

        <!-- Products Slider -->
        @if (!isLoading && !error && products.length > 0) {
          <div class="row">
            <!-- Navigation Buttons -->
            @if (config.showNavigation !== false) {
              <button class="carousel-control-prev" type="button" (click)="scrollLeft()" [disabled]="isLoading">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>

              <button class="carousel-control-next" type="button" (click)="scrollRight()" [disabled]="isLoading">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
            }

            <!-- Slider Wrapper -->
            <div #sliderWrapper class="slider-wrapper">
              <div class="row flex-nowrap slider-track">
                @for (product of products; track product.id) {
                  <div class="col-6 col-md-4 col-lg-3 mb-4">
                    <div class="card product-card h-100 shadow-sm" (click)="viewProduct(product)">
                      <!-- Product Image -->
                      <div class="product-image-container position-relative">
                        <img 
                          [src]="getProductImage(product.imageUrl)" 
                          [alt]="product.name"
                          class="card-img-top product-image"
                        />
                        @if (hasDiscount(product)) {
                          <span class="badge bg-danger discount-badge">
                            {{ product.discountPercentage }}% OFF
                          </span>
                        }
                        @if (!product.isAvailable) {
                          <div class="out-of-stock-overlay">
                            <span class="out-of-stock-text">Out of Stock</span>
                          </div>
                        }
                      </div>

                      <!-- Product Content -->
                      <div class="card-body d-flex flex-column">
                        <!-- Rating -->
                        <div class="rating-badge mb-2">
                          <span class="badge bg-warning text-dark">
                            <i class="fas fa-star"></i> 4.4
                          </span>
                        </div>

                        <!-- Product Name -->
                        <h5 class="card-title product-name" [title]="product.name">
                          {{ product.name }}
                        </h5>

                        <!-- Manufacturer -->
                        @if (product.manufacturers) {
                          <p class="card-text text-muted small manufacturer">
                            {{ product.manufacturers }}
                          </p>
                        }

                        <!-- Packaging -->
                        @if (product.packaging) {
                          <p class="card-text text-success small packaging">
                            {{ product.packaging }}
                          </p>
                        }

                        <!-- Pricing -->
                        
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Dots Indicator -->
            @if (config.showDots !== false && products.length > 4) {
              <div class="carousel-indicators mt-4">
                @for (dot of getDotsArray(); track dot) {
                  <button 
                    type="button" 
                    [class.active]="dot === currentSlide"
                    (click)="goToSlide(dot)"
                    class="carousel-dot"
                  ></button>
                }
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading && !error && products.length === 0) {
          <div class="empty-state text-center py-5">
            <div class="empty-icon mb-3">
              <mat-icon style="font-size: 48px; width: 48px; height: 48px; color: #6c757d;">
                inventory_2
              </mat-icon>
            </div>
            <p class="text-muted">No products found</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./product-slider.scss']
})
export class CommonFilterComponentComponent implements OnInit, OnDestroy {
  @Input() config!: CommonFilterConfig;
  @ViewChild('sliderWrapper') sliderWrapper!: ElementRef<HTMLDivElement>;

  products: Product[] = [];
  isLoading: boolean = false;
  error: string = '';
  currentSlide: number = 0;
  private autoSlideInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
    
    // Auto slide functionality
    if (this.config.autoSlide) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  fetchProducts(): void {
    this.isLoading = true;
    this.error = '';

    const queryParams = this.config.productForms
      .map(form => `productForms=${encodeURIComponent(form.trim())}`)
      .join('&');

    const size = this.config.slideCount || 12;
    const apiUrl = `${API_URL}/${this.config.endpoint}/multiple-forms?${queryParams}&page=0&size=${size}`;

    this.http.get<ApiResponse>(apiUrl).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.products = response.data.content || [];
        } else {
          this.error = response.message || 'Failed to load products';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.error = 'Failed to load products. Please try again.';
        this.isLoading = false;
      }
    });
  }

  scrollLeft(): void {
    if (this.sliderWrapper) {
      const element = this.sliderWrapper.nativeElement;
      const scrollAmount = 300;
      element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      this.updateCurrentSlide();
    }
  }

  scrollRight(): void {
    if (this.sliderWrapper) {
      const element = this.sliderWrapper.nativeElement;
      const scrollAmount = 300;
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      this.updateCurrentSlide();
    }
  }

  goToSlide(slideIndex: number): void {
    if (this.sliderWrapper) {
      const element = this.sliderWrapper.nativeElement;
      const cardWidth = 280; // Adjust based on your card width
      const scrollAmount = slideIndex * cardWidth * 4; // 4 cards per slide
      element.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      this.currentSlide = slideIndex;
    }
  }

  updateCurrentSlide(): void {
    if (this.sliderWrapper) {
      const element = this.sliderWrapper.nativeElement;
      const cardWidth = 280;
      this.currentSlide = Math.round(element.scrollLeft / (cardWidth * 4));
    }
  }

  getDotsArray(): number[] {
    const slides = Math.ceil(this.products.length / 4); // 4 cards per slide
    return Array.from({ length: slides }, (_, i) => i);
  }

  startAutoSlide(): void {
    const interval = this.config.slideInterval || 5000;
    this.autoSlideInterval = setInterval(() => {
      this.scrollRight();
    }, interval);
  }

  getProductImage(imageUrl?: string): string {
    if (!imageUrl) return 'assets/default.avif';
    const firstImage = imageUrl.split('|')[0].trim();
    return firstImage || 'assets/default.avif';
  }

  getDisplayPrice(product: Product): number {
    return (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.mrp;
  }

  hasDiscount(product: Product): boolean {
    return !!product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.mrp;
  }

  viewProduct(product: Product): void {
    const productId = (product.id ?? product.productId)?.toString();
    if (productId) {
      this.router.navigate(['/medicine', productId], { 
        queryParams: { type: 'otc' } 
      });
    }
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    // Add your cart logic here
    console.log('Add to cart:', product);
    // You can emit an event or call a service here
  }

  
}