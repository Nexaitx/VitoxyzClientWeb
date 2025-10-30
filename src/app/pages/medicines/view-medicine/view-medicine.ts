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
  selectedQty!: string;
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
      if (this.medicineType === "otc") {
        this.getOTCMedicineById(id);
      } else {
        this.getMedicineById(id);
      }
    } else {
      this.hasError = true;
    }
  }
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
  // Detect mobile/tablet screens
  checkScreenWidth() {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener("resize", () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }

  // Slide controls for carousel
  nextSlide() {
    if (!this.medicine && !this.product) return;
    const length = this.medicine ? this.medicine.images.length : this.product.images.length;
    this.currentIndex = (this.currentIndex + 1) % length;
  }

  prevSlide() {
    if (!this.medicine && !this.product) return;
    const length = this.medicine ? this.medicine.images.length : this.product.images.length;
    this.currentIndex = (this.currentIndex - 1 + length) % length;
  }

 goToSlide(index: number) {
  this.currentIndex = index;
  console.log("current index:", this.currentIndex);

  if (this.medicineType === "health" && this.medicine?.images?.length) {
    this.selectedImage = this.medicine.images[index];
    console.log("selected image:", this.selectedImage);
  } else if (this.medicineType === "otc" && this.product?.images?.length) {
    this.selectedImage = this.product.images[index];
    console.log("selected image:", this.selectedImage);
  }
}



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

  addToCart() {
    if (!this.medicine) return;

    const payload = {
      medicineId: this.medicine.id,
      quantity: Number(this.selectedQty) || 1,
      productType: "health",
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
}
