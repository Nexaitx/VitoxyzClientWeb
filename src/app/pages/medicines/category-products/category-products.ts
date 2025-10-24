import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { 
  Observable, 
  switchMap, 
  map, 
  BehaviorSubject, 
  combineLatest, 
  tap, 
  finalize, 
  catchError, 
  startWith, 
  Subject,
  takeUntil
} from 'rxjs'; 
import { of } from 'rxjs';
import { ProductService } from '../../../core/product.service'; 
import { CartService, CartItem } from '../../../core/cart.service'; // Import CartItem
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SidebarFilterComponent } from "../../shared/sidebar-filter/sidebar-filter";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { Footer } from "../../footer/footer";
import { BannerSliderComponent } from "@src/app/shared/banner-slider/banner-slider";
// import { TextBanner } from "@src/app/shared/text-banner/text-banner";
import { NotificationService } from '@src/app/core/notification.service';
import { TextBanner } from '@src/app/shared/text-banner/text-banner';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    SidebarFilterComponent,
    MobileFooterNavComponent,
    Footer,
    BannerSliderComponent,
    TextBanner
  ],
  templateUrl: './category-products.html', 
  styleUrls: ['./category-products.scss'] 
})
export class CategoryProductsComponent implements OnInit, OnDestroy {
  categoryName: string = '';
  currentEndpoint: string = 'products/filter';
 showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  // Products array for the current page
  products$: Observable<any[]>; 
  
  // Pagination State Variables
  pageSize: number = 50;
  totalProducts: number = 0;
  currentPageIndex: number = 0;
  
  // Loading state
  isLoading: boolean = false;
   quantities: { [key: string]: number } = {};
  //  Quantity Panel State
  showQuantityPanel: boolean = false;
  selectedProduct: any = null;
  quantity: number = 1;
  selectedUnit: string = 'tablets';
  selectedStrength: string = '500mg';
  
  // Available units and strengths
  availableUnits: string[] = ['tablets', 'capsules', 'bottles', 'strips', 'pieces'];
  availableStrengths: string[] = ['250mg', '500mg', '750mg', '1000mg', '5ml', '10ml'];
  
  // Button states
  addingProducts: Set<string> = new Set();
  addedProducts: Set<string> = new Set();
  
  // Public subjects for template access
  currentPage$ = new BehaviorSubject<number>(0); 
  selectedCategory$ = new BehaviorSubject<string | null>(null);
  selectedBrands$ = new BehaviorSubject<string[]>([]);

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService
  ) { 
    this.products$ = new Observable<any[]>(); 
  }

  ngOnInit(): void {
    this.initializeProductStream();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ UPDATED: Add to cart with proper implementation like CommonFilterComponent
  // addToCart(product: any, event: Event) {
  //   event.stopPropagation(); // Prevent navigation when clicking Add button
    
  //   const productId = product.id ?? product.productId;
  //   if (!productId) {
  //     console.error("Cannot add to cart: Product ID missing", product);
  //     return;
  //   }
    
  //   // Show instant feedback
  //   this.addingProducts.add(productId);
    
  //   // Create cart item exactly like CommonFilterComponent
  //   const cartItem: CartItem = {
  //     id: productId.toString(),
  //     name: product.name,
  //     price: product.mrp, // Using mrp as price
  //     mrp: product.mrpOld || product.mrp, // mrpOld as original price if available
  //     image: this.getFirstImageUrl(product.imageUrl),
  //     qty: product.packaging || '1',
  //     count: 1,
  //     productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc'
  //   };

  //   // Add to local cart
  //   this.cartService.addToLocalCart(cartItem);
    
  //   // Show success feedback
  //   this.addingProducts.delete(productId);
  //   this.addedProducts.add(productId);
    
  //   // Show success message
  //   console.log(`${product.name} added to cart successfully!`);
    
  //   // If user is logged in, also sync to backend
  //   if (this.cartService.isLoggedIn()) {
  //     this.cartService.addItem({
  //       medicineId: productId.toString(),
  //       quantity: 1,
  //       productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc'
  //     }).subscribe({
  //       next: () => console.log('Item also added to backend'),
  //       error: (err) => console.error('Failed to sync with backend:', err)
  //     });
  //   }

  //   // Reset added state after 2 seconds
  //   setTimeout(() => {
  //     this.addedProducts.delete(productId);
  //   }, 2000);
  // }


  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }


addToCart(product: any, event: Event) {
  event.stopPropagation();
  
  const productId = product.id ?? product.productId;
  if (!productId) {
    console.error("Cannot add to cart: Product ID missing", product);
    this.showNotification('Failed to add product to cart', 'error');
    return;
  }
  
  // Show instant feedback
  this.addingProducts.add(productId);
   this.quantities[productId] = 1;
  // Create cart item
  const cartItem: CartItem = {
    id: productId.toString(),
    name: product.name,
    price: product.mrp,
    mrp: product.mrpOld || product.mrp,
    image: this.getFirstImageUrl(product.imageUrl),
    qty: product.packaging || '1',
    count: 1,
    productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc'
  };

  // Add to local cart
  this.cartService.addToLocalCart(cartItem);
  
  //  custom toast instead of notification service
  this.showNotification(`${product.name} added to cart successfully!`);
  
  // Show success feedback
  this.addingProducts.delete(productId);
  this.addedProducts.add(productId);
  
  // If user is logged in, also sync to backend
  if (this.cartService.isLoggedIn()) {
    this.cartService.addItem({
      medicineId: productId.toString(),
      quantity: 1,
      productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc'
    }).subscribe({
      next: () => console.log('Item also added to backend'),
      error: (err) => console.error('Failed to sync with backend:', err)
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
  //  Update cart with notification
  updateCart() {
    if (!this.selectedProduct) return;
    
    const productId = this.selectedProduct.id ?? this.selectedProduct.productId;
    
    console.log('🛒 Updating cart:', this.selectedProduct.name, 'Quantity:', this.quantity);
    
    this.addingProducts.add(productId);
    
    // Create updated cart item
    const cartItem: CartItem = {
      id: productId.toString(),
      name: this.selectedProduct.name,
      price: this.selectedProduct.mrp,
      mrp: this.selectedProduct.mrpOld || this.selectedProduct.mrp,
      image: this.getFirstImageUrl(this.selectedProduct.imageUrl),
      qty: `${this.quantity} ${this.selectedUnit} - ${this.selectedStrength}`,
      count: this.quantity,
      productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc'
    };

    // Update in local cart
    // this.cartService.updateLocalCartItem(cartItem);
    
    this.addingProducts.delete(productId);
    this.closeQuantityPanel();
    
    // Show success notification
    this.notificationService.showSuccess(`${this.selectedProduct.name} updated in cart successfully!`);
    
    // Show success feedback
    this.addedProducts.add(productId);
    setTimeout(() => {
      this.addedProducts.delete(productId);
    }, 2000);

    // If user is logged in, sync with backend
    if (this.cartService.isLoggedIn()) {
      this.cartService.addItem({
        medicineId: productId.toString(),
        quantity: this.quantity,
        productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc'
      }).subscribe({
        next: () => console.log('Cart updated on backend'),
        error: (err) => console.error('Failed to sync with backend:', err)
      });
    }
  }

  //  Open quantity panel for existing items
  openQuantityPanel(product: any, event: Event) {
    event.stopPropagation();
    this.selectedProduct = product;
    this.quantity = 1; // Reset quantity
    this.showQuantityPanel = true;
  }

  //  Close quantity panel
  closeQuantityPanel() {
    this.showQuantityPanel = false;
    this.selectedProduct = null;
  }

  //  Update quantity
  updateQuantity(change: number) {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      this.quantity = newQuantity;
    }
  }

  //  Update cart with new quantity (for existing items)
  // updateCart() {
  //   if (!this.selectedProduct) return;
    
  //   const productId = this.selectedProduct.id ?? this.selectedProduct.productId;
    
  //   console.log('🛒 Updating cart:', this.selectedProduct.name, 'Quantity:', this.quantity);
    
  //   this.addingProducts.add(productId);
    
  //   // Create updated cart item
  //   const cartItem: CartItem = {
  //     id: productId.toString(),
  //     name: this.selectedProduct.name,
  //     price: this.selectedProduct.mrp,
  //     mrp: this.selectedProduct.mrpOld || this.selectedProduct.mrp,
  //     image: this.getFirstImageUrl(this.selectedProduct.imageUrl),
  //     qty: `${this.quantity} ${this.selectedUnit} - ${this.selectedStrength}`,
  //     count: this.quantity,
  //     productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc'
  //   };

  //   // Update in local cart
  //   // this.cartService.updateLocalCartItem(cartItem);
    
  //   this.addingProducts.delete(productId);
  //   this.closeQuantityPanel();
    
  //   // Show success feedback
  //   this.addedProducts.add(productId);
  //   setTimeout(() => {
  //     this.addedProducts.delete(productId);
  //   }, 2000);

  //   // If user is logged in, sync with backend
  //   if (this.cartService.isLoggedIn()) {
  //     this.cartService.addItem({
  //       medicineId: productId.toString(),
  //       quantity: this.quantity,
  //       productType: this.currentEndpoint.includes('otc') ? 'otc' : 'otc'
  //     }).subscribe({
  //       next: () => console.log('Cart updated on backend'),
  //       error: (err) => console.error('Failed to sync with backend:', err)
  //     });
  //   }
  // }

  //  Select unit
  selectUnit(unit: string) {
    this.selectedUnit = unit;
  }

  //  Select strength
  selectStrength(strength: string) {
    this.selectedStrength = strength;
  }

  //  Check button states
  isAddingToCart(productId: string): boolean {
    return this.addingProducts.has(productId);
  }

  isAddedToCart(productId: string): boolean {
    return this.addedProducts.has(productId);
  }

  private initializeProductStream(): void {
    const dataStream$ = combineLatest([
      this.route.paramMap.pipe(startWith(new Map())),
      this.route.queryParamMap.pipe(startWith(new Map())),
      this.currentPage$.pipe(startWith(0)),
      this.selectedCategory$.pipe(startWith(null)),
      this.selectedBrands$.pipe(startWith([]))
    ]).pipe(
      takeUntil(this.destroy$)
    );

    this.products$ = dataStream$.pipe(
      tap(() => {
        console.log('🔄 Loading started - filter/pagination change');
        this.isLoading = true;
      }),
      switchMap(([params, queryParams, page, selectedCategory, selectedBrands]) => {
        console.log('📡 API call triggered:', {
          category: selectedCategory,
          brands: selectedBrands,
          page: page
        });
        
        const categoryFromPath = params.get('category') || 'Unknown Category';
        this.categoryName = selectedCategory || categoryFromPath;
        this.currentEndpoint = queryParams.get('endpoint') || 'products/filter';
        this.currentPageIndex = page;

        return this.productService.getProductsForCategoryPage(
          this.currentEndpoint,
          this.categoryName,
          page,
          this.pageSize,
          selectedBrands
        ).pipe(
          finalize(() => {
            console.log('✅ Loading completed');
            this.isLoading = false;
          }),
          catchError(error => {
            console.error('❌ Error loading products:', error);
            this.isLoading = false;
            return of({ data: { content: [], totalElements: 0 } });
          })
        );
      }),
      tap(response => {
        this.totalProducts = response?.data?.totalElements || 0;
        if (this.totalProducts === 0) {
          this.currentPageIndex = 0;
        }
      }),
       map(response => {
          if (response && response.data && Array.isArray(response.data.content)) {
            const products = response.data.content.map((product: any) => ({
              ...product,
            }));
            // Initialize quantities for each product to 0
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

  handlePageEvent(event: PageEvent): void {
    console.log('🔄 Pagination changed:', event);
    this.isLoading = true;
    
    if (event.pageIndex !== this.currentPageIndex || event.pageSize !== this.pageSize) {
      if (event.pageSize !== this.pageSize) {
        this.pageSize = event.pageSize;
        this.currentPage$.next(0); 
      } else {
        this.currentPage$.next(event.pageIndex);
      }
      window.scrollTo(0, 0); 
    }
  }
  
  getFirstImageUrl(imageUrls: string): string {
    if (!imageUrls) return 'assets/placeholder.png'; 
    return imageUrls.split('|')[0].trim();
  }

  goToProduct(product: any) {
    if (this.isLoading || this.showQuantityPanel) {
      console.log('⏳ Loading in progress, product navigation blocked');
      return;
    }

    const productId = product.id ?? product.productId;

    if (!productId) {
      console.error("Product ID missing", product);
      return;
    }

    let type: string;
    if (this.currentEndpoint.includes('otc')) {
      type = 'otc';
    } else {
      type = 'otc';
    }

    this.router.navigate(['/medicine', productId], { queryParams: { type } });
  }

  // category filter
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

  clearFilters(): void {
    console.log('🔄 Clearing filters');
    this.isLoading = true;
    this.selectedCategory$.next(null);
    this.selectedBrands$.next([]);
    this.currentPage$.next(0);
  }

  getCategoryLabel(value: string): string {
    const category = this.categoryList.find(cat => cat.value === value);
    return category ? category.label : value;
  }

  getBrandLabel(value: string): string {
    const brand = this.brandList.find(b => b.name === value);
    return brand ? brand.name : value;
  }
}
