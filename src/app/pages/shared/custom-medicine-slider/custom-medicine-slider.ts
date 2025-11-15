// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-custom-medicine-slider',
//   imports: [],
//   templateUrl: './custom-medicine-slider.html',
//   styleUrl: './custom-medicine-slider.scss'
// })
// export class CustomMedicineSlider {

// }
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CustomMedicineService, Medicine } from '@src/app/core/services/custom-medicine.service';



@Component({
  selector: 'app-custom-medicine-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './custom-medicine-slider.html',
  styleUrls: ['./custom-medicine-slider.scss']
})
export class CustomMedicineSliderComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Custom Medicines';
  @Input() maxItems: number = 20;
  @Input() showSeeAll: boolean = true;
    @Input() autoSlide: boolean = true;
  @Input() slideInterval: number = 5000;
  @ViewChild('sliderContainer', { static: false }) sliderContainer!: ElementRef;

  medicines: Medicine[] = [];
  isLoading = false;
  error = '';
   currentSlide = 0;

    selectedMedicine: Medicine | null = null;
     currentImageIndex = 0;
     showImageModal = false;
     
     private slideTimer: any;
   
     // Responsive breakpoints
     itemsPerSlide = 4;
     visibleItems = 4;

  constructor(
    private customMedicineService: CustomMedicineService,
    private router: Router
  ) {}

  ngOnInit(): void {
     this.calculateItemsPerSlide();
    this.loadMedicines();
    if (this.autoSlide) {
      this.startAutoSlide();
    }

    window.addEventListener('resize', this.calculateItemsPerSlide.bind(this));
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
    this.customMedicineService
      .getAllCustomMedicines(0, this.maxItems, 'name', 'asc')
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          if (response && response.content) {
            this.medicines = response.content;
          } else {
            this.error = 'Failed to load medicines';
          }
        },
        error: (err: any) => {
          this.error = 'Error loading medicines: ' + err.message;
          console.error(err);
        }
      });
  }

  // Scroll buttons
  scroll(direction: 'left' | 'right'): void {
    if (!this.sliderContainer) return;
    const scrollAmount = this.sliderContainer.nativeElement.offsetWidth * 0.8;
    this.sliderContainer.nativeElement.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

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
      if (this.selectedMedicine && this.selectedMedicine.imageUrl) {
        this.currentImageIndex = 
          (this.currentImageIndex + 1) % this.selectedMedicine.imageUrl.length;
      }
    }
  
    prevImage(): void {
      if (this.selectedMedicine && this.selectedMedicine.imageUrl) {
        this.currentImageIndex = 
          this.currentImageIndex === 0 ? 
          this.selectedMedicine.imageUrl.length - 1 : 
          this.currentImageIndex - 1;
      }
    }
  
    goToImage(index: number): void {
      this.currentImageIndex = index;
    }
  
    // Image related helper methods
    hasImages(medicine: Medicine): boolean {
      return !!(medicine.imageUrl && medicine.imageUrl.length > 0);
    }
      getFirstImage(medicine: Medicine): string {
        if (this.hasImages(medicine) && medicine.imageUrl && medicine.imageUrl.length > 0) {
          return medicine.imageUrl[0];
        }
        return 'assets/images/medicine-placeholder.png';
      }
    
      getCurrentImage(): string {
        if (this.selectedMedicine && this.selectedMedicine.imageUrl && this.selectedMedicine.imageUrl.length > 0) {
          return this.selectedMedicine.imageUrl[this.currentImageIndex];
        }
        return 'assets/images/medicine-placeholder.png';
      }
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

   getImage(medicine: Medicine): string {
    return medicine.imageUrl?.[0] || 'assets/default.avif'; // ✅ first image or default
  }
  hasDiscount(medicine: Medicine): boolean {
    return medicine.hasVitoxyzDiscount && medicine.vitoxyzDiscountPrice !== null;
  }

  getDiscountPrice(medicine: Medicine): number {
    return this.hasDiscount(medicine)
      ? medicine.vitoxyzDiscountPrice!
      : medicine.price;
  }

   getDiscountPercentage(medicine: Medicine): number {
    return this.hasDiscount(medicine)
      ? medicine.vitoxyzDiscountPercentage || 0
      : 0;
  }
   onSeeAllClick(): void {
    this.router.navigate(['/medicine']);
  }
  onImageError(medicine: Medicine, event: Event): void {
     console.log('Image load error for medicine:', medicine.name);
     const imgElement = event.target as HTMLImageElement;
     imgElement.src = 'assets/default.avif';
   }

  onMedicineClick(medicine: Medicine): void {
     
    this.router.navigate(['/view-medicine', medicine.medicineId]);
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

}

