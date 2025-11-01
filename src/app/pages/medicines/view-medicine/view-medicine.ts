import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Footer } from "../../footer/footer";
import { Header } from "../header/header";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { API_URL, ENDPOINTS } from "@src/app/core/const";
import { CartService } from "@src/app/core/cart.service";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { CommonFilterComponent } from "../../shared/common-filter-component/common-filter-component";

@Component({
  selector: "app-view-medicine",
  standalone: true,
  imports: [CommonModule, FormsModule, Footer, Header, MobileFooterNavComponent, CommonFilterComponent],
  templateUrl: "./view-medicine.html",
  styleUrls: ["./view-medicine.scss"],
})
export class ViewMedicine implements OnInit {
  private http: HttpClient = inject(HttpClient);
  private cartService = inject(CartService);
  private route: ActivatedRoute = inject(ActivatedRoute);

  medicine: any;
  product: any;
  selectedImage!: string;
  selectedQty: string = '1';
  medicineType: string | null = null;

  isLoaded = false;
  hasError = false;

  // Mobile carousel
  currentIndex = 0;
  isMobile = false;
  isHovering = false;
  zoomX = 0;
  zoomY = 0;
  lensX = 0;
  lensY = 0;
  zoomScale = 2;

  ngOnInit() {
    this.checkScreenWidth();

    const id = this.route.snapshot.paramMap.get("id");
    this.medicineType = this.route.snapshot.queryParamMap.get("type");

    if (id) {
      // Try management ID API first, fallback to old APIs if needed
      this.getMedicineByManagementId(id);
    } else {
      this.hasError = true;
    }
  }

  // ========== MOUSE AND TOUCH METHODS ==========
  onMouseEnter() {
    this.isHovering = true;
  }

  onMouseLeave() {
    this.isHovering = false;
  }

  onMouseMove(event: MouseEvent) {
    const container = (event.target as HTMLElement).closest('.zoom-container') as HTMLElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // clamp lens position inside the image
    const lensSize = 100;
    this.lensX = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize));
    this.lensY = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize));

    // relative position for zoom
    this.zoomX = x / rect.width * rect.width;
    this.zoomY = y / rect.height * rect.height;
  }

  // ========== RESPONSIVE METHODS ==========
  checkScreenWidth() {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener("resize", () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }

  // ========== CAROUSEL METHODS ==========
  nextSlide() {
    if (!this.medicine && !this.product) return;
    const length = this.medicine ? this.medicine.images.length : this.product.images.length;
    this.currentIndex = (this.currentIndex + 1) % length;
    this.updateSelectedImage();
  }

  prevSlide() {
    if (!this.medicine && !this.product) return;
    const length = this.medicine ? this.medicine.images.length : this.product.images.length;
    this.currentIndex = (this.currentIndex - 1 + length) % length;
    this.updateSelectedImage();
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.updateSelectedImage();
  }

  private updateSelectedImage() {
    if (this.medicineType === "health" && this.medicine?.images?.length) {
      this.selectedImage = this.medicine.images[this.currentIndex];
    } else if (this.medicineType === "otc" && this.product?.images?.length) {
      this.selectedImage = this.product.images[this.currentIndex];
    } else if (this.medicine?.images?.length) {
      this.selectedImage = this.medicine.images[this.currentIndex];
    }
  }

  // ========== API METHODS ==========

  // METHOD 1: New Management ID API
  private getMedicineByManagementId(managementId: string) {
    this.http.get<any>(`${API_URL}/public/medicines/management/${managementId}`)
      .subscribe({
        next: (res) => {
          if (res?.success && res.data) {
            this.processManagementApiResponse(res.data);
          } else {
            // Fallback to old APIs if management API fails
            this.fallbackToOldApis(managementId);
          }
        },
        error: (error) => { 
          console.error('Management API failed, falling back to old APIs:', error);
          this.fallbackToOldApis(managementId);
        },
      });
  }

  // METHOD 2: Old Medicine API (health type)
  private getMedicineById(id: string) {
    this.http.get<any>(`${API_URL}${ENDPOINTS.MEDICINE_BY_ID(id)}`).subscribe({
      next: (res) => {
        if (res?.status && res.data) {
          const data = res.data;
          const images = data.imageUrls?.[0]?.split("|").map((img: string) => img.trim()) || [];

          this.medicine = {
            id: data.productId,
            name: data.productName,
            manufacturer: data.marketer,
            rating: 4.5,
            reviewsCount: 0,
            reviewTextCount: 0,
            highlights: [data.primaryUse, data.saltComposition, data.productForm, data.medicineType].filter(Boolean),
            price: data.mrp,
            mrp: data.mrp,
            discount: 0,
            packSizes: [data.packagingDetail || "1 Pack"],
            images: images,
            deliveryTime: "2 days delivery",
            description: data.description,
            introduction: data.introduction,
            howToUse: data.howToUse,
            safetyAdvise: data.safetyAdvise,
            commonSideEffect: data.commonSideEffect,
            storage: data.storage,
          };

          this.selectedImage = images[0] || "";
          this.selectedQty = this.medicine.packSizes[0];
          this.isLoaded = true;
        } else {
          this.hasError = true;
        }
      },
      error: () => { this.hasError = true; },
    });
  }

  // METHOD 3: Old OTC Medicine API (otc type)
  private getOTCMedicineById(id: string) {
    this.http.get<any>(`${API_URL}${ENDPOINTS.OTC_MEDICINE_BY_ID(id)}`).subscribe({
      next: (res) => {
        if (res?.status && res.data) {
          const data = res.data;
          const images = data.imageUrls?.[0]?.split("|").map((img: string) => img.trim()) || [];

          this.product = {
            id: data.id,
            name: data.name,
            manufacturer: data.manufacturers,
            rating: 4.2,
            reviewsCount: 0,
            reviewTextCount: 0,
            highlights: [data.productHighlights, data.productForm, data.type].filter(Boolean),
            price: data.mrp,
            mrp: data.mrp,
            discount: 0,
            packSizes: [data.packageInfo || "1 Pack"],
            images: images,
            deliveryTime: "3 days delivery",
            description: data.information,
            introduction: data.information,
            howToUse: data.directionsForUse,
            safetyAdvise: data.safetyInformation,
            commonSideEffect: "",
            storage: "",
          };

          this.selectedImage = images[0] || "";
          this.selectedQty = this.product.packSizes[0];
          this.isLoaded = true;
        } else {
          this.hasError = true;
        }
      },
      error: () => { this.hasError = true; },
    });
  }

  // ========== HELPER METHODS ==========

  private processManagementApiResponse(data: any) {
    // Process image URLs
    const images = this.processImageUrls(data.imageUrls);
    
    // Process pipe-separated fields
    const productHighlights = this.processPipeSeparated(data.productHighlights);
    const keyBenefits = this.processPipeSeparated(data.keyBenefits);
    const keyIngredients = this.processPipeSeparated(data.keyIngredients);
    const safetyInfo = this.processPipeSeparated(data.safetyInformation);
    const safetyAdvise = this.processPipeSeparated(data.safetyAdvise);

    this.medicine = {
      // Basic Info
      id: data.managementId,
      productId: data.productId,
      name: data.name,
      description: data.description,
      manufacturer: data.manufacturer || data.manufacturers,
      category: data.category,
      productForm: data.productForm,
      type: data.type,
      entityType: data.entityType,

      // Pricing
      originalPrice: data.originalPrice,
      discountPrice: data.discountPrice,
      discountPercentage: data.discountPercentage,
      hasDiscount: data.discountPrice && data.discountPrice < data.originalPrice,

      // Product Details
      packaging: data.packaging,
      packageInfo: data.packageInfo,
      quantity: data.qty,
      howToUse: data.howToUse || data.directionsForUse,
      safetyAdvise: safetyAdvise,
      storage: data.storage,
      countryOfOrigin: data.countryOfOrigin,
      prescriptionRequired: data.prescriptionRequired,

      // Additional Information
      productHighlights: productHighlights,
      keyBenefits: keyBenefits,
      keyIngredients: keyIngredients,
      information: data.information,
      introduction: data.introduction,
      uses: data.uses,
      precautions: data.precautions,
      sideEffects: data.sideEffects,
      commonSideEffects: data.commonSideEffects,
      saltComposition: data.saltComposition,
      howItWorks: data.howItWorks,

      // Images
      images: images,

      // Static values for UI
      rating: 4.5,
      reviewsCount: 128,
      deliveryTime: "2-3 days",
      packSizes: this.generatePackSizes(data.packaging, data.qty)
    };

    this.selectedImage = images[0] || '';
    this.selectedQty = this.medicine.packSizes[0];
    this.isLoaded = true;

    console.log('Processed medicine data from management API:', this.medicine);
  }

  private fallbackToOldApis(id: string) {
    if (this.medicineType === "otc") {
      this.getOTCMedicineById(id);
    } else {
      this.getMedicineById(id);
    }
  }

  // Process image URLs from API response
  private processImageUrls(imageUrls: any): string[] {
    if (!imageUrls) return [];
    
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const firstItem = imageUrls[0];
      
      if (typeof firstItem === 'string') {
        // Handle pipe-separated URLs
        if (firstItem.includes(' | ')) {
          return firstItem.split(' | ')
            .map(url => url.trim())
            .filter(url => {
              const cleanUrl = url.replace(/\r/g, '').trim();
              return cleanUrl.length > 0;
            });
        } 
        // Handle single URL string
        else if (firstItem.trim()) {
          const cleanUrl = firstItem.replace(/\r/g, '').trim();
          return [cleanUrl];
        }
      }
    }
    
    return [];
  }

  // Process pipe-separated strings into arrays
  private processPipeSeparated(text: string | null): string[] {
    if (!text) return [];
    return text.split('|').map(item => item.trim()).filter(item => item.length > 0);
  }

  // Generate pack sizes based on available data
  private generatePackSizes(packaging: string, qty: string): string[] {
    const sizes = [];
    if (packaging && qty) {
      sizes.push(`${packaging} - ${qty}`);
    } else if (packaging) {
      sizes.push(packaging);
    } else if (qty) {
      sizes.push(qty);
    }
    
    // Add default sizes if none available
    if (sizes.length === 0) {
      sizes.push('1 Pack', '2 Packs', '3 Packs');
    }
    
    return sizes;
  }

  // ========== PRICE AND DISCOUNT METHODS ==========

  // Get current price (discount price if available, otherwise original price)
  getCurrentPrice(): number {
    if (this.medicine) {
      return this.medicine.discountPrice || this.medicine.originalPrice || 0;
    } else if (this.product) {
      return this.product.price || 0;
    }
    return 0;
  }

  // Check if medicine has discount
  hasDiscount(): boolean {
    if (this.medicine) {
      return this.medicine.hasDiscount || false;
    }
    return false;
  }

  // Get discount percentage
  getDiscountPercentage(): number {
    if (this.medicine?.discountPercentage) {
      return this.medicine.discountPercentage;
    }
    
    if (this.hasDiscount() && this.medicine) {
      return Math.round(((this.medicine.originalPrice - this.medicine.discountPrice!) / this.medicine.originalPrice) * 100);
    }
    
    return 0;
  }

  // Get savings amount
  getSavingsAmount(): number {
    if (this.hasDiscount() && this.medicine) {
      return this.medicine.originalPrice - this.medicine.discountPrice!;
    }
    return 0;
  }

  // Format price with proper decimal places
  formatPrice(price: number): string {
    return price % 1 === 0 ? price.toString() : price.toFixed(2);
  }

  // Get original price for display
  getOriginalPrice(): number {
    if (this.medicine) {
      return this.medicine.originalPrice || 0;
    } else if (this.product) {
      return this.product.mrp || 0;
    }
    return 0;
  }

  // ========== CART METHODS ==========

  addToCart() {
    if (!this.medicine) return;

    const payload = {
      medicineId: this.medicine.id,
      productId: this.medicine.productId,
      quantity: Number(this.selectedQty) || 1,
      productType: this.medicine.entityType === 'PRODUCT_OTC' ? 'otc' : 'health',
      name: this.medicine.name,
      price: this.getCurrentPrice(),
      image: this.selectedImage
    };

    this.cartService.addItem(payload).subscribe({
      next: () => alert(`${this.medicine.name} added to cart!`),
      error: () => alert("Failed to add item to cart. Try again."),
    });
  }

  addToCartOtc() {
    if (!this.product) return;

    const payload = {
      medicineId: this.product.id,
      quantity: Number(this.selectedQty) || 1,
      productType: "otc",
    };

    this.cartService.addItem(payload).subscribe({
      next: () => alert(`${this.product.name} added to cart!`),
      error: () => alert("Failed to add item to cart. Try again."),
    });
  }

  // ========== UTILITY METHODS ==========

  // Handle image errors
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/medicine-placeholder.png';
  }

  // Check which data structure is being used
  isUsingManagementApi(): boolean {
    return !!this.medicine?.entityType;
  }

  // Get medicine name for display
  getMedicineName(): string {
    if (this.medicine) return this.medicine.name;
    if (this.product) return this.product.name;
    return '';
  }

  // Get manufacturer for display
  getManufacturer(): string {
    if (this.medicine) return this.medicine.manufacturer;
    if (this.product) return this.product.manufacturer;
    return '';
  }
}