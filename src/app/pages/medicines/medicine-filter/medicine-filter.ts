import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MedicineService, Medicine, FilterParams } from '../../../core/services/medicine.service';
import { finalize } from 'rxjs/operators';

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

  constructor(
    private medicineService: MedicineService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProductForms();
    this.loadMedicines();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.medicineService.getCategories()
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
  }

  loadProductForms(): void {
    this.isLoadingProductForms = true;
    this.medicineService.getProductForms()
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

  // NEW: Add to cart functionality
  addToCart(medicine: Medicine, event: Event): void {
    event.stopPropagation();
    
    // You can implement cart functionality here
    console.log('Add to cart clicked for:', medicine.name);
    
    // Optional: Show quick add confirmation
    alert(`${medicine.name} added to cart!`);
    
    // Or you can call your cart service directly
    // this.cartService.addItem({
    //   medicineId: medicine.managementId,
    //   productId: medicine.productId,
    //   quantity: 1,
    //   productType: this.getMedicineType(medicine),
    //   name: medicine.name,
    //   price: this.getDiscountPrice(medicine),
    //   image: this.getFirstImage(medicine)
    // }).subscribe(...);
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