import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MedicineService, Medicine } from '../../core/services/medicine.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-medicine-slider',
  templateUrl: './medicine-slider.html',
  styleUrls: ['./medicine-slider.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MedicineSliderComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Featured Medicines';
  @Input() showSeeAll: boolean = true;
  @Input() maxItems: number = 10;
  @Input() autoSlide: boolean = true;
  @Input() slideInterval: number = 5000;
@ViewChild('sliderContainer', { static: false }) sliderContainer!: ElementRef;
  medicines: Medicine[] = [];
  currentSlide = 0;
  isLoading = false;
  error = '';
  
  // Image gallery state
  selectedMedicine: Medicine | null = null;
  currentImageIndex = 0;
  showImageModal = false;
  
  private slideTimer: any;

  // Responsive breakpoints
  itemsPerSlide = 4;
  visibleItems = 4;

  constructor( private medicineService: MedicineService,private router: Router) {}

  ngOnInit(): void {
    this.calculateItemsPerSlide();
    this.loadMedicines();
    
    if (this.autoSlide) {
      this.startAutoSlide();
    }

    window.addEventListener('resize', this.calculateItemsPerSlide.bind(this));
  }
 scroll(direction: 'left' | 'right'): void {
    if (!this.sliderContainer) return;
    const scrollAmount = this.sliderContainer.nativeElement.offsetWidth * 0.8;
    this.sliderContainer.nativeElement.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
  ngOnDestroy(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
    window.removeEventListener('resize', this.calculateItemsPerSlide.bind(this));
  }

  calculateItemsPerSlide(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.itemsPerSlide = 1;
      this.visibleItems = 1;
    } else if (width < 1024) {
      this.itemsPerSlide = 2;
      this.visibleItems = 2;
    } else if (width < 1280) {
      this.itemsPerSlide = 3;
      this.visibleItems = 3;
    } else {
      this.itemsPerSlide = 4;
      this.visibleItems = 4;
    }
  }

  loadMedicines(): void {
    this.isLoading = true;
    this.medicineService.getAllMedicines(0, this.maxItems, 'name', 'asc')
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.medicines = response.data;
            console.log('Loaded medicines:', this.medicines);
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

  // Image Gallery Methods
  openImageGallery(medicine: Medicine, event: Event): void {
    event.stopPropagation();
    if (this.hasImages(medicine)) {
      this.selectedMedicine = medicine;
      this.currentImageIndex = 0;
      this.showImageModal = true;
      this.pauseAutoSlide();
    }
  }

  closeImageGallery(): void {
    this.showImageModal = false;
    this.selectedMedicine = null;
    this.currentImageIndex = 0;
    this.resumeAutoSlide();
  }

  nextImage(): void {
    if (this.selectedMedicine && this.selectedMedicine.imageUrls) {
      this.currentImageIndex = 
        (this.currentImageIndex + 1) % this.selectedMedicine.imageUrls.length;
    }
  }

  prevImage(): void {
    if (this.selectedMedicine && this.selectedMedicine.imageUrls) {
      this.currentImageIndex = 
        this.currentImageIndex === 0 ? 
        this.selectedMedicine.imageUrls.length - 1 : 
        this.currentImageIndex - 1;
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Image related helper methods
  hasImages(medicine: Medicine): boolean {
    return !!(medicine.imageUrls && medicine.imageUrls.length > 0);
  }

  getFirstImage(medicine: Medicine): string {
    if (this.hasImages(medicine) && medicine.imageUrls && medicine.imageUrls.length > 0) {
      return medicine.imageUrls[0];
    }
    return 'assets/images/medicine-placeholder.png';
  }

  getCurrentImage(): string {
    if (this.selectedMedicine && this.selectedMedicine.imageUrls && this.selectedMedicine.imageUrls.length > 0) {
      return this.selectedMedicine.imageUrls[this.currentImageIndex];
    }
    return 'assets/images/medicine-placeholder.png';
  }

  // Handle image loading errors
  onImageError(medicine: Medicine, event: Event): void {
    console.log('Image load error for medicine:', medicine.name);
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/default.avif';
  }

  // Slider methods
  startAutoSlide(): void {
    this.slideTimer = setInterval(() => {
      this.nextSlide();
    }, this.slideInterval);
  }

  nextSlide(): void {
    if (this.medicines.length <= this.itemsPerSlide) return;
    this.currentSlide = (this.currentSlide + 1) % this.getTotalSlides();
  }

  prevSlide(): void {
    if (this.medicines.length <= this.itemsPerSlide) return;
    this.currentSlide = this.currentSlide === 0 ? 
      this.getTotalSlides() - 1 : 
      this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  getTotalSlides(): number {
    return Math.ceil(this.medicines.length / this.itemsPerSlide);
  }

  getVisibleMedicines(): Medicine[] {
    const start = this.currentSlide * this.itemsPerSlide;
    const end = start + this.itemsPerSlide;
    return this.medicines.slice(start, end);
  }

  onSeeAllClick(): void {
    this.router.navigate(['/medicine']);
  }

  // UPDATED: Navigate to view medicine page
  onMedicineClick(medicine: Medicine): void {
    console.log('Medicine clicked:', medicine);
    
    // Determine the medicine type based on entityType
    const medicineType = this.getMedicineType(medicine);
    
    // Navigate to view medicine page with managementId as parameter
    this.router.navigate(['/view-medicine', medicine.managementId], {
      queryParams: { 
        type: medicineType
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
    return 0;
  }

  pauseAutoSlide(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }

  resumeAutoSlide(): void {
    if (this.autoSlide) {
      this.startAutoSlide();
    }
  }

  // Add to cart from slider
addToCart(medicine: Medicine, event: Event): void {
  event.stopPropagation();
  
  // You can implement cart functionality here or navigate to product page
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
}