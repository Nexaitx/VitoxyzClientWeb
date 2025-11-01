import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MedicineService, Medicine, FilterParams } from '../../../core/services/medicine.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CartService } from '@src/app/core/cart.service';
@Component({
  selector: 'app-medicine-filter',
  templateUrl: './medicine-filter.html',
  styleUrls: ['./medicine-filter.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class MedicineFilterComponent implements OnInit {
  categories: string[] = [];
  productForms: string[] = [];
  medicines: Medicine[] = [];
  
  // Filter states
  selectedCategory: string = 'all';
  selectedProductForm: string = 'all';
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  hasNext: boolean = false;
  hasPrevious: boolean = false;
  
  // Loading states
  isLoadingCategories: boolean = false;
  isLoadingProductForms: boolean = false;
  isLoadingMedicines: boolean = false;
  
  // Error handling
  error: string = '';
  quantities: { [productId: string]: number } = {};
  addingProducts: Set<string> = new Set();
  addedProducts: Set<string> = new Set();
  loadingStates: { [productId: string]: boolean } = {};

  // Simple toast
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast: boolean = false;

  // optional: if you use endpoints to decide productType
  endpoint: string = 'otc';
  private subs: Subscription[] = [];
  constructor(
    private medicineService: MedicineService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProductForms();
    this.loadMedicines();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    const sub = this.medicineService.getCategories()
      .pipe(finalize(() => this.isLoadingCategories = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.categories = response.data;
          } else {
            this.error = 'Failed to load categories';
          }
        },
        error: (err) => {
          this.error = 'Error loading categories: ' + err.message;
          console.error('Error loading categories:', err);
        }
      });
      this.subs.push(sub);
  }

  loadProductForms(): void {
    this.isLoadingProductForms = true;
    const sub = this.medicineService.getProductForms()
      .pipe(finalize(() => this.isLoadingProductForms = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.productForms = response.data;
          } else {
            this.error = 'Failed to load product forms';
          }
        },
        error: (err) => {
          this.error = 'Error loading product forms: ' + err.message;
          console.error('Error loading product forms:', err);
        }
      });
      this.subs.push(sub);
  }

  loadMedicines(): void {
    this.isLoadingMedicines = true;
    
    const params: FilterParams = {
      category: this.selectedCategory,
      productForm: this.selectedProductForm,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'name',
      sortDirection: 'asc'
    };

    this.medicineService.filterMedicines(params)
      .pipe(finalize(() => this.isLoadingMedicines = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.medicines = response.data;
            this.totalPages = response.pagination.totalPages;
            this.totalItems = response.pagination.totalItems;
            this.hasNext = response.pagination.hasNext;
            this.hasPrevious = response.pagination.hasPrevious;
            this.currentPage = response.pagination.currentPage;
            
            // Debug: Check image URLs
            console.log('Loaded medicines with images:', this.medicines);
            this.medicines.forEach(medicine => {
              console.log('Medicine:', medicine.name, 'Images:', medicine.imageUrls);
            });
          } else {
            this.error = 'Failed to load medicines';
          }
        },
        error: (err) => {
          this.error = 'Error loading medicines: ' + err.message;
          console.error('Error loading medicines:', err);
        }
      });
  }

  // NEW: Navigate to medicine details
  onMedicineClick(medicine: Medicine): void {
    console.log('Medicine clicked:', medicine);
    
    // Navigate to view medicine page with managementId as parameter
    this.router.navigate(['/view-medicine', medicine.managementId], {
      queryParams: { 
        type: this.getMedicineType(medicine)
      }
    });
  }

  // Helper method to determine medicine type
  private getMedicineType(medicine: Medicine): string {
    if (medicine.entityType === 'PRODUCT_OTC') {
      return 'otc';
    } else if (medicine.entityType === 'MEDICINE_DETAIL') {
      return 'health';
    } else {
      return 'health'; // default fallback
    }
  }
getMedicineKey(medicine: any): string {
  return medicine.id ?? medicine.productId ?? medicine.managementId ?? '';
}
  // NEW: Add to cart functionality
  addToCart(medicine: any, event?: Event): void {
    if (event) { event.stopPropagation(); }

    const productId = (medicine.id ?? medicine.productId ?? medicine.managementId);
    if (!productId) {
      console.error('Cannot add to cart: Product ID missing', medicine);
      this.showCustomToast('Failed to add product to cart', 'error');
      return;
    }
    const productKey = String(productId);

    // mark loading/adding
    this.addingProducts.add(productKey);
    this.loadingStates[productKey] = true;

    // default initial quantity
    this.quantities[productKey] = this.quantities[productKey] ? this.quantities[productKey] : 1;

    // Build cart item (shape used by your local cart service)
    const cartItem = {
      id: productKey,
      name: medicine.name,
      price: this.getDiscountPrice(medicine),
      mrp: medicine.originalPrice ?? medicine.mrp,
      image: this.getFirstImage(medicine),
      qty: medicine.packaging ?? '1',
      count: this.quantities[productKey],
      productType: this.endpoint?.includes('otc') ? 'otc' : 'otc',
      productId: productKey
    };

    try {
      // Add to local cart (implement in your CartService)
      if (typeof this.cartService.addToLocalCart === 'function') {
        this.cartService.addToLocalCart(cartItem);
      }else {
        console.warn('cartService.localAdd not found; skipping local add');
      }

      this.showCustomToast(`${medicine.name} added to cart successfully!`, 'success');

      // Update UI state
      this.addingProducts.delete(productKey);
      this.addedProducts.add(productKey);
      this.loadingStates[productKey] = false;

      // Optional: sync to backend if logged in
      if (typeof this.cartService.isLoggedIn === 'function' && this.cartService.isLoggedIn()) {
        const backendReq = this.cartService.addItem?.({
          medicineId: productKey.toString(),
          quantity: this.quantities[productKey] || 1,
          productType: cartItem.productType
        });

        // if addItem returns an observable
        if (backendReq && typeof backendReq.subscribe === 'function') {
          const sub = backendReq.subscribe({
            next: () => console.log('Item synced with backend'),
            error: (err: any) => console.error('Failed to sync with backend:', err)
          });
          this.subs.push(sub);
        }
      }

      // Reset "added" visual state after a short delay
      setTimeout(() => {
        this.addedProducts.delete(productKey);
      }, 2000);
    } catch (err) {
      console.error('addToCart error', err);
      this.showCustomToast('Failed to add product to cart', 'error');
      this.addingProducts.delete(productKey);
      this.loadingStates[productKey] = false;
    }
  }

  increment(medicine: any): void {
    const productId = (medicine.id ?? medicine.productId ?? medicine.managementId);
    if (!productId) return;
    const key = String(productId);
    this.quantities[key] = (this.quantities[key] || 0) + 1;
    console.log(`Incremented quantity for product ${key}: ${this.quantities[key]}`);
    // Optionally update cart local/backend here
  }

  decrement(medicine: any): void {
    const productId = (medicine.id ?? medicine.productId ?? medicine.managementId);
    if (!productId) return;
    const key = String(productId);
    const current = this.quantities[key] || 0;
    if (current > 1) {
      this.quantities[key] = current - 1;
      console.log(`Decremented quantity for product ${key}: ${this.quantities[key]}`);
    } else {
      // remove from UI/cart
      this.quantities[key] = 0;
      console.log(`Removed product ${key} from cart (quantity set to 0)`);
      // optionally call local remove: this.cartService.removeFromLocalCart(key);
    }
  }

  private showCustomToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  isLoading(productId: string): boolean {
    return !!this.loadingStates[productId];
  }

  // Image related methods
  hasImages(medicine: Medicine): boolean {
    return !!(medicine.imageUrls && medicine.imageUrls.length > 0);
  }

  getFirstImage(medicine: Medicine): string {
    if (this.hasImages(medicine) && medicine.imageUrls && medicine.imageUrls.length > 0) {
      return medicine.imageUrls[0];
    }
    return 'assets/default.avif';
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/default.avif';
  }

  getDiscountPrice(medicine: Medicine): number {
    return medicine.discountPrice || medicine.originalPrice;
  }

  hasDiscount(medicine: Medicine): boolean {
    return medicine.discountPrice !== null && medicine.discountPrice < medicine.originalPrice;
  }

  getDiscountPercentage(medicine: Medicine): number {
    if (this.hasDiscount(medicine) && medicine.discountPrice) {
      return Math.round(((medicine.originalPrice - medicine.discountPrice) / medicine.originalPrice) * 100);
    }
    return medicine.discountPercentage || 0;
  }

  onCategoryChange(): void {
    this.currentPage = 0;
    this.loadMedicines();
  }

  onProductFormChange(): void {
    this.currentPage = 0;
    this.loadMedicines();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadMedicines();
  }

  clearFilters(): void {
    this.selectedCategory = 'all';
    this.selectedProductForm = 'all';
    this.currentPage = 0;
    this.loadMedicines();
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}