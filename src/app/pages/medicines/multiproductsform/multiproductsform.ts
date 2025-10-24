import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SidebarFilterComponent } from '../../shared/sidebar-filter/sidebar-filter';
import { API_URL } from '@src/app/core/const';
import { BehaviorSubject } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CartService } from '@src/app/core/cart.service';
import { BannerSliderComponent } from "@src/app/shared/banner-slider/banner-slider";
import { MatIcon } from "@angular/material/icon";
import { Footer } from "../../footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";

// Product interface based on your API response
interface Product {
  id: string | null;
  productId?: string;
  name: string;
  productForm?: string;
  mrp: number;
  imageUrl?: string;
  packaging?: string;
  manufacturers?: string;
  discountPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  isAvailable?: boolean;
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
    };
  };
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  qty: string;
  count: number;
  productType: string;
}

@Component({
  selector: 'app-multiproductsform',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    SidebarFilterComponent,
    RouterModule,
    MatProgressSpinnerModule,
    MatCardModule,
    BannerSliderComponent,
    MatIcon,
    Footer,
    MobileFooterNavComponent
],
  templateUrl: './multiproductsform.html',
  styleUrls: ['./multiproductsform.scss'],
})
export class MultiproductsformComponent implements OnInit {
  products: Product[] = [];
  categoryName: string = '';
  isLoading: boolean = false;
  quantities: { [key: string]: number } = {};
  isLoadMoreLoading: boolean = false;
  error: string = '';
  productForms: string[] = [];
  totalProducts: number = 0;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showQuantityPanel: boolean = false;

  // Pagination variables
  currentPage: number = 0;
  pageSize: number = 12;
  hasMoreProducts: boolean = true;
  currentPage$ = new BehaviorSubject<number>(0);
  selectedCategory$ = new BehaviorSubject<string | null>(null);
  selectedBrands$ = new BehaviorSubject<string[]>([]);

  // Additional fields that were referenced but not defined
  currentEndpoint: string = 'otc'; // defaulting to 'otc'
  addingProducts: Set<string> = new Set();
  addedProducts: Set<string> = new Set();
  selectedProduct: Product | null = null;
  quantity: number = 1;
  selectedUnit: string = '';
  selectedStrength: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    console.log('Component initialized');
    this.route.queryParams.subscribe((params) => {
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

  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
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

    const queryParams = productForms
      .map((form) => `productForms=${encodeURIComponent(form.trim())}`)
      .join('&');

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
      },
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
  getFirstImage(imageUrl?: string): string {
    if (!imageUrl) return 'assets/medicines/placeholder.png';

    // Split by | and take first image
    const firstImage = imageUrl.split('|')[0].trim();
    return firstImage || 'assets/medicines/placeholder.png';
  }

  goToProduct(product: any) {
    if (this.isLoading || this.showQuantityPanel) {
      console.log('⏳ Loading in progress, product navigation blocked');
      return;
    }

    const productId = (product.id ?? product.productId)?.toString();

    if (!productId) {
      console.error('Product ID missing', product);
      return;
    }

    const type = this.currentEndpoint.includes('otc') ? 'otc' : 'otc'; // kept same behavior as original

    this.router.navigate(['/medicine', productId], { queryParams: { type } });
  }

  // Navigate back to home
  goBack(): void {
    this.router.navigate(['/']);
  }

  // View product details
  viewProductDetails(product: Product): void {
    console.log('View product details:', product);
    // navigate if needed
    // this.router.navigate(['/product', product.productId || product.id]);
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation();

    const productIdRaw = product.id ?? product.productId;
    if (!productIdRaw) {
      console.error('Cannot add to cart: Product ID missing', product);
      this.showNotification('Failed to add product to cart', 'error');
      return;
    }
    const productId = productIdRaw.toString();

    // Show instant feedback
    this.addingProducts.add(productId);
    this.quantities[productId] = 1;

    // Create cart item
    const cartItem: CartItem = {
      id: productId,
      name: product.name,
      price: product.mrp,
      mrp: (product.mrpOld as number) || product.mrp,
      image: this.getFirstImage(product.imageUrl),
      qty: product.packaging || '1',
      count: 1,
      productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc',
    };

    // Add to local cart
    this.cartService.addToLocalCart(cartItem);

    // custom toast instead of notification service
    this.showNotification(`${product.name} added to cart successfully!`);

    // Show success feedback
    this.addingProducts.delete(productId);
    this.addedProducts.add(productId);

    // If user is logged in, also sync to backend
    if (this.cartService.isLoggedIn && this.cartService.isLoggedIn()) {
      this.cartService
        .addItem({
          medicineId: productId.toString(),
          quantity: 1,
          productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc',
        } as any)
        .subscribe({
          next: () => console.log('Item also added to backend'),
          error: (err) => console.error('Failed to sync with backend:', err),
        });
    }

    // Reset added state after 2 seconds
    setTimeout(() => {
      this.addedProducts.delete(productId);
    }, 2000);
  }

  increment(product: any) {
    const productId = (product.id ?? product.productId).toString();
    this.quantities[productId] = (this.quantities[productId] || 0) + 1;
    console.log(`Incremented quantity for product ${productId}: ${this.quantities[productId]}`);
  }

  decrement(product: any) {
    const productId = (product.id ?? product.productId).toString();
    const current = this.quantities[productId] || 0;
    if (current > 1) {
      this.quantities[productId] = current - 1;
      console.log(`Decremented quantity for product ${productId}: ${this.quantities[productId]}`);
    } else {
      this.quantities[productId] = 0; // Reset to 0 to show "Add" button
      console.log(`Removed product ${productId} from cart`);
    }
  }

  updateCart() {
    if (!this.selectedProduct) return;

    const productIdRaw = this.selectedProduct.id ?? this.selectedProduct.productId;
    if (!productIdRaw) return;
    const productId = productIdRaw.toString();

    console.log('🛒 Updating cart:', this.selectedProduct.name, 'Quantity:', this.quantity);

    this.addingProducts.add(productId);

    // Create updated cart item
    const cartItem: CartItem = {
      id: productId,
      name: this.selectedProduct.name,
      price: this.selectedProduct.mrp,
      mrp: (this.selectedProduct as any).mrpOld || this.selectedProduct.mrp,
      image: this.getFirstImage(this.selectedProduct.imageUrl),
      qty: `${this.quantity} ${this.selectedUnit} - ${this.selectedStrength}`,
      count: this.quantity,
      productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc',
    };

    // Update in local cart (uncomment if method exists)
    // this.cartService.updateLocalCartItem(cartItem);

    this.addingProducts.delete(productId);
    this.closeQuantityPanel();

    // Show success notification using local method
    this.showNotification(`${this.selectedProduct.name} updated in cart successfully!`);

    // Show success feedback
    this.addedProducts.add(productId);
    setTimeout(() => {
      this.addedProducts.delete(productId);
    }, 2000);

    // If user is logged in, sync with backend
    if (this.cartService.isLoggedIn && this.cartService.isLoggedIn()) {
      this.cartService
        .addItem({
          medicineId: productId.toString(),
          quantity: this.quantity,
          productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc',
        } as any)
        .subscribe({
          next: () => console.log('Cart updated on backend'),
          error: (err) => console.error('Failed to sync with backend:', err),
        });
    }
  }

  closeQuantityPanel() {
    this.showQuantityPanel = false;
    this.selectedProduct = null;
    this.quantity = 1;
    this.selectedUnit = '';
    this.selectedStrength = '';
  }

  // Get display price
  getDisplayPrice(product: Product): number {
    return (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.mrp;
  }

  isAddingToCart(productId: string): boolean {
    return this.addingProducts.has(productId);
  }

  // Check if product has discount
  hasDiscount(product: Product): boolean {
    return !!product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.mrp;
  }

  // Get packaging info
  getPackagingInfo(product: Product): string {
    return product.packaging || `${product.productForm || 'Pack'} Product`;
  }

  getProductKey(product: any): string | number {
  return product.id ?? product.productId;
}


  // Get remaining products count
  getRemainingProductsCount(): number {
    return Math.min(this.pageSize, Math.max(0, this.totalProducts - this.products.length));
  }

  // Add this method to your component class
  trackByProductId(index: number, product: Product): string {
    return product.productId || (product.id ? product.id.toString() : index.toString());
  }

  categoryList = [
    { label: 'Syrups & Tonics', value: 'syrup' },
    { label: 'Chest Rubs & Balms', value: 'chest_rubs' },
    { label: 'Cough Syrups', value: 'cough_syrup' },
    { label: 'Herbal Juices & Teas', value: 'herbal_juices' },
    { label: 'Candy & Lozenges', value: 'lozenges' },
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
    // Optionally call fetchProducts again based on filters
    // this.resetPagination(); this.fetchProducts(this.productForms, 0, true);
  }

  filterByBrands(brands: string[]) {
    console.log('🔄 Brands filter applied:', brands);
    this.isLoading = true;
    this.selectedBrands$.next(brands);
    this.currentPage$.next(0);
    // Optionally call fetchProducts again based on filters
    // this.resetPagination(); this.fetchProducts(this.productForms, 0, true);
  }

   clearFilters(): void {
    console.log('🔄 Clearing filters');
    this.isLoading = true;
    this.selectedCategory$.next(null);
    this.selectedBrands$.next([]);
    this.currentPage$.next(0);
  }

}
