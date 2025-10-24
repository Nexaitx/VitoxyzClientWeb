import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SidebarFilterComponent } from "../../shared/sidebar-filter/sidebar-filter";
import { API_URL } from '@src/app/core/const';
import { BehaviorSubject } from 'rxjs';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

// Product interface based on your API response
interface Product {
  id: string | null;
  productId: string;
  name: string;
  productForm: string;
  mrp: number;
  imageUrl: string;
  packaging: string;
  manufacturers: string;
  discountPrice: number;
  originalPrice: number;
  discountPercentage: number;
  isAvailable: boolean;
  type?: string;
  information?: string;
}

// API Response interface
interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    content: Product[];
    page: {
      size: number;
      number: number;
      totalElements: number;
      totalPages: number;
    }
  }
}

@Component({
  selector: 'app-multiproductsform',
  standalone: true,
  imports: [CommonModule, HttpClientModule,
    SidebarFilterComponent, RouterModule, MatProgressSpinner],
  templateUrl: './multiproductsform.html',
  styleUrls: ['./multiproductsform.scss']
})
export class MultiproductsformComponent implements OnInit {
  products: Product[] = [];
  categoryName: string = '';
  isLoading: boolean = false;
  isLoadMoreLoading: boolean = false;
  error: string = '';
  productForms: string[] = [];
  totalProducts: number = 0;
   showQuantityPanel: boolean = false;
  // Pagination variables
  currentPage: number = 0;
  pageSize: number = 12;
  hasMoreProducts: boolean = true;
currentPage$ = new BehaviorSubject<number>(0);
selectedCategory$ = new BehaviorSubject<string | null>(null);
  selectedBrands$ = new BehaviorSubject<string[]>([]);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log('Component initialized');
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      this.categoryName = params['category'] || 'Products';
      this.productForms = params['forms'] ? params['forms'].split(',') : [];
      
      console.log('Product forms:', this.productForms);
      
      // Reset pagination when category changes
      this.resetPagination();
      
      if (this.productForms.length > 0) {
        this.fetchProducts(this.productForms, 0, true);
      } else {
        this.error = 'No product forms specified';
        console.error('No product forms found in query params');
      }
    });
  }

  // Reset pagination when category changes
  resetPagination(): void {
    this.currentPage = 0;
    this.products = [];
    this.hasMoreProducts = true;
    this.totalProducts = 0;
  }

  // Fetch products from API
  fetchProducts(productForms: string[], page: number = 0, isInitialLoad: boolean = false): void {
    if (isInitialLoad) {
      this.isLoading = true;
    } else {
      this.isLoadMoreLoading = true;
    }
    
    this.error = '';

    const queryParams = productForms.map(form => 
      `productForms=${encodeURIComponent(form.trim())}`
    ).join('&');
    
    const apiUrl = `${API_URL}/products/filter/multiple-forms?${queryParams}&page=${page}&size=${this.pageSize}`;

    console.log('API URL:', apiUrl);

    this.http.get<ApiResponse>(apiUrl).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        
        if (response.status && response.data) {
          const newProducts = response.data.content || [];
          
          if (isInitialLoad) {
            this.products = newProducts;
          } else {
            this.products = [...this.products, ...newProducts];
          }
          
          this.totalProducts = response.data.page?.totalElements || 0;
          this.currentPage = page;
          
          // Check if there are more products to load
          this.hasMoreProducts = this.products.length < this.totalProducts;
          
          console.log('Products loaded:', this.products.length);
          console.log('Total products:', this.totalProducts);
          console.log('Has more products:', this.hasMoreProducts);
        } else {
          this.error = response.message || 'Failed to load products';
          console.error('API returned false status:', response);
        }
        
        this.isLoading = false;
        this.isLoadMoreLoading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.error = 'Failed to load products. Please try again later.';
        this.isLoading = false;
        this.isLoadMoreLoading = false;
        if (isInitialLoad) {
          this.products = [];
        }
      }
    });
  }

  // Load more products
  loadMore(): void {
    if (this.isLoadMoreLoading || !this.hasMoreProducts) return;
    
    const nextPage = this.currentPage + 1;
    console.log('Loading more products, page:', nextPage);
    
    this.fetchProducts(this.productForms, nextPage, false);
  }

  // Get first image from imageUrl string
  getFirstImage(imageUrl: string): string {
    if (!imageUrl) return 'assets/medicines/placeholder.png';
    
    // Split by | and take first image
    const firstImage = imageUrl.split('|')[0].trim();
    return firstImage || 'assets/medicines/placeholder.png';
  }

  // Navigate back to home
  goBack(): void {
    this.router.navigate(['/']);
  }

  // View product details
  viewProductDetails(product: Product): void {
    console.log('View product details:', product);
    // Navigate to product detail page
    // this.router.navigate(['/product', product.productId]);
  }

  // Add product to cart
  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    console.log('Add to cart:', product);
    // Implement cart functionality here
  }

  // Get display price
  getDisplayPrice(product: Product): number {
    return product.discountPrice || product.mrp;
  }

  // Check if product has discount
  hasDiscount(product: Product): boolean {
    return product.discountPrice > 0 && product.discountPrice < product.mrp;
  }

  // Get packaging info
  getPackagingInfo(product: Product): string {
    return product.packaging || `${product.productForm} Product`;
  }

  // Get remaining products count
  getRemainingProductsCount(): number {
    return Math.min(this.pageSize, this.totalProducts - this.products.length);
  }

  // Add this method to your component class
trackByProductId(index: number, product: Product): string {
  return product.productId || index.toString();
}
  categoryList = [
    { label: 'Syrups & Tonics', value: 'syrup' },
    { label: 'Chest Rubs & Balms', value: 'chest_rubs' },
    { label: 'Cough Syrups', value: 'cough_syrup' },
    { label: 'Herbal Juices & Teas', value: 'herbal_juices' },
    { label: 'Candy & Lozenges', value: 'lozenges' }
  ];

  brandList = [
    { name: 'Volini', count: 21 },
    { name: 'Cofsils', count: 9 },
    { name: 'Saridon', count: 9 },
    { name: 'Moov', count: 6 },
    { name: 'Zandu', count: 2 },
  ];

  filterByCategory(category: string) {
    console.log('🔄 Category filter applied:', category);
    this.isLoading = true;
    this.selectedCategory$.next(category); 
    this.currentPage$.next(0); 
  }

  filterByBrands(brands: string[]) {
    console.log('🔄 Brands filter applied:', brands);
    this.isLoading = true;
    this.selectedBrands$.next(brands);
    this.currentPage$.next(0);
  }
}