import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
  imports: [CommonModule, HttpClientModule, RouterModule],
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
  
  // Pagination variables
  currentPage: number = 0;
  pageSize: number = 12;
  hasMoreProducts: boolean = true;

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
    
    const apiUrl = `http://localhost:8080/api/products/filter/multiple-forms?${queryParams}&page=${page}&size=${this.pageSize}`;

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
}