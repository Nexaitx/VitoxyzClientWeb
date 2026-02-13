import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SingleProductFormConfig, Product, ApiResponse } from './single-product-form-component.interface';
import { API_URL } from '@src/app/core/const';

@Component({
  selector: 'app-single-product-form-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="single-product-form-card" [class]="config.cssClass">
      <div class="card-inner" (click)="handleCategoryClick()">
        
        <!-- Category Image -->
        <div class="image-container">
          <img 
            [src]="config.imageUrl" 
            [alt]="config.altText || config.label"
            class="category-image"
            (error)="onImageError($event)"
          />
          <!-- <div class="image-overlay"></div> -->
        </div>

        <!-- Category Content -->
        <div class="content">
          <h3 class="category-label">{{ config.label }}</h3>
          
          <!-- @if (config.description) {
            <p class="category-description">{{ config.description }}</p>
          } -->

          <!-- <div class="category-info">
            <span class="product-form">
              <mat-icon>category</mat-icon>
              {{ config.productForm }}
            </span>
          </div> -->

          <!-- Loading State -->
          @if (isLoading) {
            <div class="loading-state">
              <mat-spinner diameter="20" color="primary"></mat-spinner>
              <span>Loading...</span>
            </div>
          } @else {
            <!-- <button class="view-products-btn" [disabled]="isLoading">
              View Products
              <mat-icon>arrow_forward</mat-icon>
            </button> -->
          }
        </div>

      </div>
    </div>
  `,
  styleUrls: ['./single-product-form.scss']
})
export class SingleProductFormComponentComponent implements OnInit {
  @Input() config!: SingleProductFormConfig;

  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  handleCategoryClick(): void {
    this.isLoading = true;

    console.log('🔄 Navigating to products with category:', this.config.productForm);

    // ✅ FIXED: Navigate to products/:category route with proper parameters
    this.router.navigate(['/products', this.config.productForm], {
      queryParams: {
        category: this.config.label,
        form: this.config.productForm,
        forms: this.config.productForm,
        // endpoint: 'otc-products/form'/
         endpoint: 'products/filter'
      }
    }).then((success) => {
      console.log('✅ Navigation successful to:', `/products/${this.config.productForm}`);
      this.isLoading = false;
    }).catch((error) => {
      console.error('❌ Navigation failed:', error);
      this.isLoading = false;
    });
  }

  onImageError(event: any): void {
    console.warn('Image failed to load, using fallback:', this.config.imageUrl);
    
    // Use existing default image
    event.target.src = 'assets/default.avif';
  }
}