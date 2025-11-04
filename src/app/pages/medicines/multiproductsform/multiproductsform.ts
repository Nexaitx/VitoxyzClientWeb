import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { Footer } from "../../footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { TextBanner } from "@src/app/shared/text-banner/text-banner";
import { MatIconModule } from '@angular/material/icon';
import { CommonFilterComponentComponent } from "../../shared/product-slider/product-slider";
import { SingleProductFormComponentComponent } from "../../shared/single-product-form/single-product-form";
import { SingleProductFormGridComponent } from "../../shared/single-product-form-grid/single-product-form-grid";
import { MedicineSliderComponent } from "@src/app/shared/medicine-slider/medicine-slider";

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

interface Category {
  name: string;
  apiValue: string[]; // API mein bhej jaane wali value (e.g., 'skin_care' agar zarurat ho)
  cssClass: string;
  imageUrl: string;
  altText: string;
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
    MatIconModule,
    Footer,
    MobileFooterNavComponent,
    TextBanner,
    CommonFilterComponentComponent,
    SingleProductFormComponentComponent,
    SingleProductFormGridComponent,
    MedicineSliderComponent
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
  pageSize: number = 20;
  hasMoreProducts: boolean = true;
  currentPage$ = new BehaviorSubject<number>(0);
  selectedCategory$ = new BehaviorSubject<string | null>(null);
  selectedBrands$ = new BehaviorSubject<string[]>([]);
  availableUnits: string[] = ['tablets', 'capsules', 'bottles', 'strips', 'pieces'];
  availableStrengths: string[] = ['250mg', '500mg', '750mg', '1000mg', '5ml', '10ml'];
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
 updateQuantity(change: number) {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      this.quantity = newQuantity;
    }
  }
  // Get display price
  getDisplayPrice(product: Product): number {
    return (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.mrp;
  }
 selectUnit(unit: string) {
    this.selectedUnit = unit;
  }
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

  // Check if product has discount
  hasDiscount(product: Product): boolean {
    return !!product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.mrp;
  }

  // Get packaging info
  getPackagingInfo(product: Product): string {
    return product.packaging || `${product.productForm || 'Pack'} Product`;
  }


getProductKey(product: any): string {
  return (product.id ?? product.productId ?? '').toString();
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
    { label: 'Syrups ', value: 'syrup' },
    { label: 'Chest Rubs', value: 'Balm' },
    { label: 'Cough Syrups', value: 'Syrups' },
    { label: 'Herbal Juices & Teas', value: 'Juice' },
    { label: 'Candy & Lozenges', value: 'candy' },
    { label: 'Yoga Mat', value: 'Yoga Mat' },
    { label: 'Self Test Kit', value: 'Self Test Kit' },
    { label: 'Sanitizer', value: 'Sanitizer' },
    { label: 'Pet Food', value: 'Pet Food' },
    { label: 'Oxygen Mask', value: 'Oxygen Mask' },
    { label: 'Massager', value: 'Massager' },
    { label: 'Inhaler', value: 'Inhaler' },
    { label: 'Face Mask', value: 'Face Mask' },

    { label: 'Eye/Ear Drop', value: 'Eye/Ear Drop' },
    { label: 'Face Wash', value: 'Face Wash' },
    { label: 'Conditioner', value: 'Conditioner' },
    { label: 'Cream', value: 'Cream' },
    { label: 'Contact Lens', value: 'Contact Lens' },
    { label: 'Body Wash', value: 'Body Wash' },
    { label: 'Capsule CR', value: 'Capsule CR' },
    { label: 'Churna', value: 'Churna' },   
    { label: 'Crepe bandage', value: 'Crepe bandage' },
    { label: 'Butter', value: 'Butter' },
    { label: 'Band aid', value: 'Band aid' },
    { label: 'Mouth Spray', value: 'Mouth Spray' },
    { label: 'Dropper', value: 'Dropper' },
    { label: 'Plaster', value: 'Plaster' },
    { label: 'Elixir', value: 'Elixir' },
    { label: 'Shampoo', value: 'Shampoo' },


    
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

  filterByCategory1(category: string) {
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
getCategoryLabel(value: string): string {
    const category = this.categoryList.find(cat => cat.value === value);
    return category ? category.label : value;
  }

  getBrandLabel(value: string): string {
    const brand = this.brandList.find(b => b.name === value);
    return brand ? brand.name : value;
  }
  @ViewChild("categoryCarouselWrapper3", { static: false })
  carouselWrapper3!: ElementRef<HTMLDivElement>;
  
   scrollCarousel5(direction: 'left' | 'right'): void {
    if (this.carouselWrapper3) {
      const element = this.carouselWrapper3.nativeElement;
      const scrollAmount = 180 * 4;

      if (direction === 'left') {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }




   scrollBrandCarousel(direction: 'left' | 'right'): void {
    if (this.brandCarouselWrapper) {
      const element = this.brandCarouselWrapper.nativeElement;
      // Scroll by the visible width minus a little gap so items align nicely
      const scrollAmount = Math.max(element.clientWidth - 80, 180);
      if (direction === 'left') {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }
    @ViewChild('brandCarouselWrapper', { static: false })
  brandCarouselWrapper!: ElementRef<HTMLDivElement>;

  

  skinCare = [
    {
      productForm: 'Cream',
      label: 'Face Creams',
      imageUrl: 'assets/skin-care/face-cream.avif',
      cssClass: 'cream-category',
      description: 'Face creams for different skin types'
    },
    {
      productForm: 'Lotion',
      label: 'Body Lotions',
      imageUrl: 'assets/skin-care/body-lotion.avif',
      cssClass: 'lotion-category',
      description: 'Moisturizing body lotions'
    },
    {
      productForm: 'Gel',
      label: 'Face Gels',
      imageUrl: 'assets/skin-care/face-gel.avif',
      cssClass: 'gel-category',
      description: 'Cooling and refreshing face gels'
    },
    {
      productForm: 'Ointment',
      label: 'Ointments',
      imageUrl: 'assets/skin-care/ointment.avif',
      cssClass: 'cream-category',
      description: 'Medicated skin ointments'
    },
     {
      productForm: 'Wax',
      label: 'Wax',
      imageUrl: 'assets/skin-care/ointment.avif',
      cssClass: 'cream-category',
      description: 'Medicated skin Wax'
    },
     {
      productForm: 'Body Wash',
      label: 'Body Wash',
      imageUrl: 'assets/skin-care/ointment.avif',
      cssClass: 'cream-category',
      description: 'Medicated skin Body Wash'
    },
     {
      productForm: 'Face Pack',
      label: 'Face Pack',
      imageUrl: 'assets/skin-care/ointment.avif',
      cssClass: 'cream-category',
      description: 'Medicated skin Face Pack'
    },
     {
      productForm: 'Face Mask',
      label: 'Face Mask',
      imageUrl: 'assets/skin-care/ointment.avif',
      cssClass: 'cream-category',
      description: 'Medicated skin Face Mask'
    }
  ];
  productFormsfilter = [
    {
      productForm: 'Cream',
      label: 'Skin Creams',
      imageUrl: 'assets/product-forms/cream.avif',
      altText: 'Skin Creams',
      cssClass: 'cream-category',
      description: 'Medicated and cosmetic creams for skin care'
    },
    {
      productForm: 'Tablet',
      label: 'Tablets',
      imageUrl: 'assets/product-forms/tablet.avif',
      altText: 'Medicine Tablets',
      cssClass: 'tablet-category',
      description: 'Various medicinal tablets for different health conditions'
    },
    {
      productForm: 'Syrup',
      label: 'Syrups',
      imageUrl: 'assets/product-forms/syrup.avif',
      altText: 'Medicinal Syrups',
      cssClass: 'syrup-category',
      description: 'Liquid medicines and health syrups'
    },
    {
      productForm: 'Injection',
      label: 'Injections',
      imageUrl: 'assets/product-forms/injection.avif',
      altText: 'Medical Injections',
      cssClass: 'injection-category',
      description: 'Injectable medicines and vaccines'
    },
    {
      productForm: 'Capsule',
      label: 'Capsules',
      imageUrl: 'assets/product-forms/capsule.avif',
      altText: 'Medicine Capsules',
      cssClass: 'capsule-category',
      description: 'Gelatin capsules with powdered medicine'
    },
    {
      productForm: 'Lotion',
      label: 'Lotions',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Medicated and cosmetic lotions'
    }
  ];

   womencare = [
    {
      productForm: 'Pad',
      label: 'Pads',
      imageUrl: 'assets/product-forms/cream.avif',
      altText: 'Skin Creams',
      cssClass: 'cream-category',
      description: 'Pads for women hygiene'
    },
    {
      productForm: 'Vaginal Capsule',
      label: 'Vaginal Capsule',
      imageUrl: 'assets/product-forms/tablet.avif',
      altText: 'Medicine Tablets',
      cssClass: 'tablet-category',
      description: 'Vaginal Capsules for women health'
    },
    {
      productForm: 'Breast Pad',
      label: 'Breast Pad',
      imageUrl: 'assets/product-forms/syrup.avif',
      altText: 'Medicinal Syrups',
      cssClass: 'syrup-category',
      description: 'Breast Pads for women'
    },
    {
      productForm: 'Vaginal Cream',
      label: 'Vaginal Cream',
      imageUrl: 'assets/product-forms/injection.avif',
      altText: 'Medical Injections',
      cssClass: 'injection-category',
      description: 'Vaginal Creams for women health'
    },
    {
      productForm: 'Panty',
      label: 'Panty',
      imageUrl: 'assets/product-forms/capsule.avif',
      altText: 'Medicine Capsules',
      cssClass: 'capsule-category',
      description: 'Pantys'
    },
    {
      productForm: 'Pumping Bra',
      label: 'Pumping Bra',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Pumping Bras for  women'
    }
  ];
   sexualcare = [
    {
      productForm: 'Condom',
      label: 'Condoms',
      imageUrl: 'assets/product-forms/cream.avif',
      altText: 'Skin Creams',
      cssClass: 'cream-category',
      description: 'Condoms for safe sexual activity'
    },
    {
      productForm: 'VaginalSpray',
      label: 'Vaginal Spray',
      imageUrl: 'assets/product-forms/tablet.avif',
      altText: 'Medicine Tablets',
      cssClass: 'tablet-category',
      description: 'Vaginal Sprays for sexual wellness'
    },
    {
      productForm: 'Spray',
      label: 'Sprays',
      imageUrl: 'assets/product-forms/syrup.avif',
      altText: 'Medicinal Syrups',
      cssClass: 'syrup-category',
      description: 'Sprays for sexual wellness'
    },
    {
      productForm: 'Sublingual Spray',
      label: 'Sublingual Spray',
      imageUrl: 'assets/product-forms/injection.avif',
      altText: 'Medical Injections',
      cssClass: 'injection-category',
      description: 'Sublingual Sprays for sexual wellness'
    },
    {
      productForm: 'Ointment',
      label: 'Ointment',
      imageUrl: 'assets/product-forms/capsule.avif',
      altText: 'Medicine Capsules',
      cssClass: 'capsule-category',
      description: 'Ointment with powdered medicine'
    },
    {
      productForm: 'Massage Oil',
      label: 'Massage Oil',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Massage Oils'
    }
  ];

   oralcare = [
    {
      productForm: 'Toothpaste',
      label: 'Toothpastes',
      imageUrl: 'assets/product-forms/cream.avif',
      altText: 'Skin Creams',
      cssClass: 'cream-category',
      description: 'Toothpastes for oral hygiene'
    },
    {
      productForm: 'Toothbrush',
      label: 'Toothbrushs',
      imageUrl: 'assets/product-forms/tablet.avif',
      altText: 'Medicine Tablets',
      cssClass: 'tablet-category',
      description: 'Toothbrushs for oral hygiene'
    },
    {
      productForm: 'Mouth Wash',
      label: 'Mouth Wash',
      imageUrl: 'assets/product-forms/syrup.avif',
      altText: 'Medicinal Syrups',
      cssClass: 'syrup-category',
      description: 'Mouth Wash for oral hygiene'
    },
    {
      productForm: 'Mouth Spray',
      label: 'Mouth Spray',
      imageUrl: 'assets/product-forms/injection.avif',
      altText: 'Medical Injections',
      cssClass: 'injection-category',
      description: 'Mouth Spray for oral hygiene'
    },
    {
      productForm: 'Dental Brush',
      label: 'Dental Brush',
      imageUrl: 'assets/product-forms/capsule.avif',
      altText: 'Medicine Capsules',
      cssClass: 'capsule-category',
      description: 'Dental Brushs for oral hygiene'
    },
    {
      productForm: 'Tongue Cleaner',
      label: 'Tongue Cleaner',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Tongue Cleaners for oral hygiene'
    },
     {
      productForm: 'Oral Gel',
      label: 'Oral Gel',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Oral Gels for oral hygiene'
    },
     {
      productForm: 'Disintegrating Strip',
      label: 'Disintegrating Strip',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Disintegrating Strip for oral hygiene'
    }
  ];
   eldercare = [
    {
      productForm: 'Wheelchair',
      label: 'Wheelchair',
      imageUrl: 'assets/product-forms/cream.avif',
      altText: 'Skin Creams',
      cssClass: 'cream-category',
      description: 'Wheelchairs for elder mobility'
    },
    {
      productForm: 'Tonic',
      label: 'Tonic',
      imageUrl: 'assets/product-forms/tablet.avif',
      altText: 'Medicine Tablets',
      cssClass: 'tablet-category',
      description: 'Tonics for elder health'
    },
    {
      productForm: 'Knee Support',
      label: 'Knee Support',
      imageUrl: 'assets/product-forms/syrup.avif',
      altText: 'Medicinal Syrups',
      cssClass: 'syrup-category',
      description: 'Knee Supports for elder mobility'
    },
    {
      productForm: 'Walker',
      label: 'Walker',
      imageUrl: 'assets/product-forms/injection.avif',
      altText: 'Medical Injections',
      cssClass: 'injection-category',
      description: 'Walkers for elder mobility'
    },
    {
      productForm: 'Foot Support',
      label: 'Foot Support',
      imageUrl: 'assets/product-forms/capsule.avif',
      altText: 'Medicine Capsules',
      cssClass: 'capsule-category',
      description: 'Foot Supports for elder comfort'
    },
    {
      productForm: 'Massager',
      label: 'Massager',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Massagers for elder relaxation'
    }, {
      productForm: 'Belt',
      label: 'Belt',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Belts for elder support'
    }
  ];
   babycare = [
    {
      productForm: 'Diaper',
      label: 'Diapers',
      imageUrl: 'assets/product-forms/cream.avif',
      altText: 'Skin Creams',
      cssClass: 'cream-category',
      description: 'Diapers for baby care'
    },
    {
      productForm: 'Wipe',
      label: 'Wipe',
      imageUrl: 'assets/product-forms/tablet.avif',
      altText: 'Medicine Tablets',
      cssClass: 'tablet-category',
      description: 'Wipe'
    },
    {
      productForm: 'Powder',
      label: 'Powder',
      imageUrl: 'assets/product-forms/syrup.avif',
      altText: 'Medicinal Syrups',
      cssClass: 'syrup-category',
      description: 'Powder for baby care'
    },
    {
      productForm: 'Nipple',
      label: 'Nipple',
      imageUrl: 'assets/product-forms/injection.avif',
      altText: 'Medical Injections',
      cssClass: 'injection-category',
      description: 'Nipple for baby feeding'
    },
    {
      productForm: 'Feeding Bottle',
      label: 'Feeding Bottle',
      imageUrl: 'assets/product-forms/capsule.avif',
      altText: 'Medicine Capsules',
      cssClass: 'capsule-category',
      description: 'Feeding Bottles for baby feeding'
    },
    {
      productForm: 'Syrup',
      label: 'Syrup',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Syrups for baby health'
    }
  ];
   mencare = [
    {
       productForm: 'Beard Oil',
      label: 'Beard Oil',
      imageUrl: 'assets/product-forms/Beard Oil.avif',
      altText: 'Beard Oil',
      cssClass: 'cream-category',
      description: 'Beard Oil for men '
    },
    {
       productForm: 'Shaving Cream',
      label: 'Shaving Cream',
      imageUrl: 'assets/product-forms/Shaving Cream.avif',
      altText: 'Shaving Cream',
      cssClass: 'cream-category',
      description: 'Shaving Cream for men '
    },
     {
       productForm: 'Shaving Gel',
      label: 'Shaving Gel',
      imageUrl: 'assets/product-forms/Shaving Gel.avif',
      altText: 'Shaving Gel',
      cssClass: 'cream-category',
      description: 'Shaving Gelfor men '
    },
     {
       productForm: 'After Shave Lotion',
      label: 'After Shave Lotion',
      imageUrl: 'assets/product-forms/After Shave Lotion.avif',
      altText: 'After Shave Lotion',
      cssClass: 'cream-category',
      description: 'After Shave Lotion for men '
    },
    {
       productForm: 'Deodorant',
      label: 'Deodorant',
      imageUrl: 'assets/product-forms/Deodorant.avif',
      altText: 'Deodorant',
      cssClass: 'cream-category',
      description: 'Deodorant for men '
    },
     {
       productForm: 'Spray',
      label: 'Spray',
      imageUrl: 'assets/product-forms/Spray.avif',
      altText: 'Spray',
      cssClass: 'cream-category',
      description: 'Spray for men '
    },
     {
       productForm: 'Shampoo',
      label: 'Shampoo',
      imageUrl: 'assets/product-forms/Shampoo.avif',
      altText: 'Shampoo',
      cssClass: 'cream-category',
      description: 'Shampoo for men '
    },
     {
       productForm: 'Face Wash',
      label: 'Face Wash',
      imageUrl: 'assets/product-forms/Face Wash.avif',
      altText: 'Face Wash',
      cssClass: 'cream-category',
      description: 'Face Wash for men '
    },
   
    {
      productForm: 'Juice',
      label: 'Juice',
      imageUrl: 'assets/product-forms/cream.avif',
      altText: 'Skin Creams',
      cssClass: 'cream-category',
      description: 'Juices for men health'
    },
    {
      productForm: 'Tablet SR',
      label: 'Tablet SR',
      imageUrl: 'assets/product-forms/tablet.avif',
      altText: 'Medicine Tablets',
      cssClass: 'tablet-category',
      description: 'Tablet SR for men health'
    },
    
    {
      productForm: 'Powder',
      label: 'Powder',
      imageUrl: 'assets/product-forms/syrup.avif',
      altText: 'Medicinal Syrups',
      cssClass: 'syrup-category',
      description: 'Powder for  men health'
    },
    {
      productForm: 'Gel',
      label: 'Gel',
      imageUrl: 'assets/product-forms/injection.avif',
      altText: 'Medical Injections',
      cssClass: 'injection-category',
      description: 'Gel for men health'
    }
  ];
   ayurveda = [
    {
      productForm: 'Churna',
      label: 'Churna',
      imageUrl: 'assets/product-forms/cream.avif',
      altText: 'Skin Creams',
      cssClass: 'cream-category',
      description: 'Churna for ayurvedic health'
    },
    {
      productForm: 'Bhasma',
      label: 'Bhasma',
      imageUrl: 'assets/product-forms/tablet.avif',
      altText: 'Medicine Tablets',
      cssClass: 'tablet-category',
      description: 'Bhasma for ayurvedic health'
    },
    {
      productForm: 'Ark',
      label: 'Ark',
      imageUrl: 'assets/product-forms/syrup.avif',
      altText: 'Medicinal Syrups',
      cssClass: 'syrup-category',
      description: 'Ark for ayurvedic health'
    },
    {
      productForm: 'Tablet SR',
      label: 'Tablet SR',
      imageUrl: 'assets/product-forms/injection.avif',
      altText: 'Medical Injections',
      cssClass: 'injection-category',
      description: 'Tablet SR'
    },
    {
      productForm: 'Flower',
      label: 'Flower',
      imageUrl: 'assets/product-forms/capsule.avif',
      altText: 'Medicine Capsules',
      cssClass: 'capsule-category',
      description: 'Flowers for ayurvedic health'
    },
    {
      productForm: 'Leaf',
      label: 'Leaf',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Leaf  for ayurvedic health'
    },
     {
      productForm: 'Seed',
      label: 'Seed',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Seed  for ayurvedic health'
    },
     {
      productForm: 'Nut',
      label: 'Nut',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Nut  for ayurvedic health'
    }
    ,
     {
      productForm: 'Candy',
      label: 'Candy',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Candy  for ayurvedic health'
    },
     {
      productForm: 'Oat',
      label: 'Oat',
      imageUrl: 'assets/product-forms/lotion.avif',
      altText: 'Body Lotions',
      cssClass: 'lotion-category',
      description: 'Oat for ayurvedic health'
    }
  ];
   petcare = [
    {
      productForm: 'Pet Food',
      label: 'Pet Food',
      imageUrl: 'assets/product-forms/cream.avif',
      altText: 'Skin Creams',
      cssClass: 'cream-category',
      description: 'Pet Food for your lovely pets'
    },
    {
      productForm: 'Pet Spray',
      label: 'Pet Spray',
      imageUrl: 'assets/product-forms/tablet.avif',
      altText: 'Medicine Tablets',
      cssClass: 'tablet-category',
      description: 'Pet Spray for your lovely pets'
    },
    {
      productForm: 'Dog Bone',
      label: 'Dog Bone',
      imageUrl: 'assets/product-forms/syrup.avif',
      altText: 'Medicinal Syrups',
      cssClass: 'syrup-category',
      description: 'Dog Bone for your lovely pets'
    }
  ];
 
  Diabetes1 = [
      {
        productForm: 'Self Test Kit',
        label: 'Self Test Kit',
        imageUrl: 'assets/product-forms/cream.avif',
        altText: 'Self Test Kit',
        cssClass: 'cream-category',
        description: 'Self Test Kit health'
      },
      {
        productForm: 'Injection',
        label: 'Injection',
        imageUrl: 'assets/product-forms/tablet.avif',
        altText: 'Injection',
        cssClass: 'tablet-category',
        description: 'Injection for health'
      },
      {
        productForm: 'Test Strip',
        label: 'Test Strip',
        imageUrl: 'assets/product-forms/syrup.avif',
        altText: 'Medicinal Test Strip',
        cssClass: 'syrup-category',
        description: 'Test Strip for  health'
      },
      {
        productForm: 'Tablet SR',
        label: 'Tablet SR',
        imageUrl: 'assets/product-forms/injection.avif',
        altText: 'Medical Injections',
        cssClass: 'injection-category',
        description: 'Tablet SR'
      },
      {
        productForm: 'Tablet',
        label: 'Tablet',
        imageUrl: 'assets/product-forms/capsule.avif',
        altText: 'Medicine Capsules',
        cssClass: 'capsule-category',
        description: 'Tablet for health'
      },
      {
        productForm: 'Needle',
        label: 'Needle',
        imageUrl: 'assets/product-forms/Needle.avif',
        altText: 'Needle',
        cssClass: 'lotion-category',
        description: 'Needle  for  health'
      },
      {
        productForm: 'Insulin Syringe (Syringe)',
        label: 'Insulin Syringe (Syringe)',
        imageUrl: 'assets/product-forms/Insulin Syringe (Syringe).avif',
        altText: 'Insulin Syringe (Syringe)',
        cssClass: 'lotion-category',
        description: 'Insulin Syringe (Syringe)  for  health'
      },
      {
        productForm: 'Lancet',
        label: 'Lancet',
        imageUrl: 'assets/product-forms/Lancet.avif',
        altText: 'Lancet',
        cssClass: 'lotion-category',
        description: 'Lancet  for  health'
      }
      ,
      {
        productForm: 'Test kit',
        label: 'Test kit',
        imageUrl: 'assets/product-forms/Test kit.avif',
        altText: 'Test kit',
        cssClass: 'lotion-category',
        description: 'Test kit  for  health'
      },
      
    ];

    HeartRatecare1 = [
      {
        productForm: 'Capsule',
        label: 'Capsule',
        imageUrl: 'assets/product-forms/Capsule.avif',
        altText: 'Capsule',
        cssClass: 'cream-category',
        description: 'Capsule for  health'
      },
      {
        productForm: 'Syrup',
        label: 'Syrup',
        imageUrl: 'assets/product-forms/Syrup.avif',
        altText: 'Syrup',
        cssClass: 'tablet-category',
        description: 'Syrup for  health'
      },
    
      {
        productForm: 'Tablet',
        label: 'Tablet',
        imageUrl: 'assets/product-forms/Tablet.avif',
        altText: 'Medicinal Tablet',
        cssClass: 'syrup-category',
        description: 'Tablet for  health'
      },
      {
        productForm: 'Injection',
        label: 'Injection',
        imageUrl: 'assets/product-forms/injection.avif',
        altText: 'Medical Injections',
        cssClass: 'injection-category',
        description: 'Injection'
      },
      {
        productForm: 'Solution for Infusion',
        label: 'Solution for Infusion',
        imageUrl: 'assets/product-forms/Solution for Infusion.avif',
        altText: 'Medicine Solution for Infusion',
        cssClass: 'capsule-category',
        description: 'Solution for Infusion for  health'
      },
      {
        productForm: 'Infusion',
        label: 'Infusion',
        imageUrl: 'assets/product-forms/Infusion.avif',
        altText: 'Infusion',
        cssClass: 'lotion-category',
        description: 'Infusion  for  health'
      },
      
    ];
    StomachCare1 = [
      {
        productForm: 'Capsule',
        label: 'Capsule',
        imageUrl: 'assets/product-forms/Capsule.avif',
        altText: 'Capsule',
        cssClass: 'cream-category',
        description: 'Capsule for  health'
      },
      {
        productForm: 'Digestive Tablet',
        label: 'Digestive Tablet',
        imageUrl: 'assets/product-forms/Digestive Tablet.avif',
        altText: 'Digestive Tablet',
        cssClass: 'tablet-category',
        description: 'Digestive Tablet for  health'
      },
      {
        productForm: 'Tablet',
        label: 'Tablet',
        imageUrl: 'assets/product-forms/Tablet.avif',
        altText: 'Medicinal Tablet',
        cssClass: 'syrup-category',
        description: 'Tablet for  health'
      },
      {
        productForm: 'Oral Suspension',
        label: 'Oral Suspension',
        imageUrl: 'assets/product-forms/Oral Suspension.avif',
        altText: 'Medical Oral Suspension',
        cssClass: 'injection-category',
        description: 'Oral Suspension'
      },
      {
        productForm: 'Syrup',
        label: 'Syrup',
        imageUrl: 'assets/product-forms/Syrup.avif',
        altText: 'Medicine Syrup',
        cssClass: 'capsule-category',
        description: 'Syrup for  health'
      },
      {
        productForm: 'Powder for Oral Suspension',
        label: 'Powder for Oral Suspension',
        imageUrl: 'assets/product-forms/Powder for Oral Suspension.avif',
        altText: 'Powder for Oral Suspension',
        cssClass: 'lotion-category',
        description: 'Powder for Oral Suspension  for  health'
      },
      {
        productForm: 'Oral Solution',
        label: 'Oral Solution',
        imageUrl: 'assets/product-forms/Oral Solution.avif',
        altText: 'Oral Solution',
        cssClass: 'lotion-category',
        description: 'Oral Solution  for  health'
      },
      {
        productForm: 'Oral Liquid',
        label: 'Oral Liquid',
        imageUrl: 'assets/product-forms/Oral Liquid.avif',
        altText: 'Oral Liquid',
        cssClass: 'lotion-category',
        description: 'Oral Liquid  for  health'
      },
      {
        productForm: 'Oral Gel',
        label: 'Oral Gel',
        imageUrl: 'assets/product-forms/Oral Gel.avif',
        altText: 'Oral Gel',
        cssClass: 'lotion-category',
        description: 'Oral Gel  for  health'
      },
      {
        productForm: 'Powder for Oral Solution',
        label: 'Powder for Oral Solution',
        imageUrl: 'assets/product-forms/Powder for Oral Solution.avif',
        altText: 'Powder for Oral Solution',
        cssClass: 'lotion-category',
        description: 'Powder for Oral Solution  for  health'
      },
    
    ];
    LiverCare1 = [
      {
        productForm: 'Capsule',
        label: 'Capsule',
        imageUrl: 'assets/product-forms/Capsule.avif',
        altText: 'Capsule',
        cssClass: 'cream-category',
        description: 'Capsule for  health'
      },
      {
        productForm: 'Syrup',
        label: 'Syrup',
        imageUrl: 'assets/product-forms/Syrup.avif',
        altText: 'Syrup',
        cssClass: 'tablet-category',
        description: 'Syrup for  health'
      },
    
      {
        productForm: 'Tablet',
        label: 'Tablet',
        imageUrl: 'assets/product-forms/Tablet.avif',
        altText: 'Medicinal Tablet',
        cssClass: 'syrup-category',
        description: 'Tablet for  health'
      },
      {
        productForm: 'Granule',
        label: 'Granule',
        imageUrl: 'assets/product-forms/Granule.avif',
        altText: 'Medical Granule',
        cssClass: 'injection-category',
        description: 'Granule'
      },
      {
        productForm: 'Tonic',
        label: 'Tonic',
        imageUrl: 'assets/product-forms/Tonic.avif',
        altText: 'Medicine Tonic',
        cssClass: 'capsule-category',
        description: 'Tonic for  health'
      },
      {
        productForm: 'Liver Care Juice',
        label: 'Liver Care Juice',
        imageUrl: 'assets/product-forms/Liver Care Juice.avif',
        altText: 'Liver Care Juice',
        cssClass: 'lotion-category',
        description: 'Liver Care Juice for  health'
      },
      
    ];
      EyeCare1 = [
      {
        productForm: 'Eye Drop',
        label: 'Eye Drop',
        imageUrl: 'assets/product-forms/Eye Drop.avif',
        altText: 'Eye Drop',
        cssClass: 'cream-category',
        description: 'Eye Drop for  health'
      },
      {
        productForm: 'Eye Gel',
        label: 'Eye Gel',
        imageUrl: 'assets/product-forms/Eye Gel.avif',
        altText: 'Eye Gel',
        cssClass: 'tablet-category',
        description: 'Eye Gel for  health'
      },
    
      {
        productForm: 'Eye Cream',
        label: 'Eye Cream',
        imageUrl: 'assets/product-forms/Eye Cream.avif',
        altText: 'Eye Cream',
        cssClass: 'syrup-category',
        description: 'Eye Cream '
      },
      {
        productForm: 'Eye Ointment',
        label: 'Eye Ointment',
        imageUrl: 'assets/product-forms/Eye Ointment.avif',
        altText: 'Medical Eye Ointment',
        cssClass: 'injection-category',
        description: 'Eye Ointment'
      },
      {
        productForm: 'Eye Pad',
        label: 'Eye Pad',
        imageUrl: 'assets/product-forms/Eye Pad.avif',
        altText: 'Medicine Eye Pad',
        cssClass: 'capsule-category',
        description: 'Eye Pad'
      },
      {
        productForm: 'Eye Capsule',
        label: 'Eye Capsule',
        imageUrl: 'assets/product-forms/Eye Capsule.avif',
        altText: 'Eye Capsule',
        cssClass: 'lotion-category',
        description: 'Eye Capsule'
      },
      {
        productForm: 'Eye/Ear Drop',
        label: 'Eye/Ear Drop',
        imageUrl: 'assets/product-forms/Eye/Ear Drop.avif',
        altText: 'Eye/Ear Drop',
        cssClass: 'lotion-category',
        description: 'Eye/Ear Drop'
      },
      {
        productForm: 'Ophthalmic Solution',
        label: 'Ophthalmic Solution',
        imageUrl: 'assets/product-forms/Ophthalmic Solution.avif',
        altText: 'Ophthalmic Solution',
        cssClass: 'lotion-category',
        description: 'Ophthalmic Solution'
      },
      {
        productForm: 'Lens Solution',
        label: 'Lens Solution',
        imageUrl: 'assets/product-forms/Lens Solution.avif',
        altText: 'Lens Solution',
        cssClass: 'lotion-category',
        description: 'Lens Solution'
      },
      {
        productForm: 'Reading Eyeglass',
        label: 'Reading Eyeglass',
        imageUrl: 'assets/product-forms/Reading Eyeglass.avif',
        altText: 'Reading Eyeglass',
        cssClass: 'lotion-category',
        description: 'Reading Eyeglass'
      },
    ];
      BoneAndJoint1 = [
      {
        productForm: 'Knee Support',
        label: 'Knee Support',
        imageUrl: 'assets/product-forms/Knee Support.avif',
        altText: 'Knee Support',
        cssClass: 'cream-category',
        description: 'Knee Support for supporting bones and jointes'
      },
      {
        productForm: 'Liniment',
        label: 'Liniment',
        imageUrl: 'assets/product-forms/Liniment.avif',
        altText: 'Liniment',
        cssClass: 'tablet-category',
        description: 'Liniment for  health'
      },
    
      {
        productForm: 'Wrist Support',
        label: 'Wrist Support',
        imageUrl: 'assets/product-forms/Wrist Support.avif',
        altText: 'Wrist Support',
        cssClass: 'syrup-category',
        description: 'Wrist Support'
      },
      {
        productForm: 'Ointment',
        label: 'Ointment',
        imageUrl: 'assets/product-forms/Ointment.avif',
        altText: 'Ointment',
        cssClass: 'injection-category',
        description: 'Ointment'
      },
      {
        productForm: 'Massager',
        label: 'Massager',
        imageUrl: 'assets/product-forms/Massager.avif',
        altText: 'Massager',
        cssClass: 'capsule-category',
        description: 'Massager'
      },
        {
        productForm: 'Bandage',
        label: 'Bandage',
        imageUrl: 'assets/product-forms/Bandage.avif',
        altText: 'Bandage',
        cssClass: 'capsule-category',
        description: 'Bandage'
      },
        {
        productForm: 'Bone & Joint Tablet',
        label: 'Bone & Joint Tablet',
        imageUrl: 'assets/product-forms/Bone & Joint Tablet.avif',
        altText: 'Bone & Joint Tablet',
        cssClass: 'capsule-category',
        description: 'Bone & Joint Tablet'
      },
      {
        productForm: 'Balm',
        label: 'Balm',
        imageUrl: 'assets/product-forms/Balm.avif',
        altText: 'Balm',
        cssClass: 'lotion-category',
        description: 'Balm'
      },
      
    ];
        KidneyCare1 = [
      {
        productForm: 'Kidney Tablet',
        label: 'Kidney Tablet',
        imageUrl: 'assets/product-forms/Kidney Tablet.avif',
        altText: 'Kidney Tablet',
        cssClass: 'cream-category',
        description: 'Kidney Tablet for health'
      },
      {
        productForm: 'Tonic',
        label: 'Tonic',
        imageUrl: 'assets/product-forms/Tonic.avif',
        altText: 'Tonic',
        cssClass: 'tablet-category',
        description: 'Tonic for  health'
      },
      {
        productForm: 'Kidney Capsule',
        label: 'Kidney Capsule',
        imageUrl: 'assets/product-forms/Kidney Capsule.avif',
        altText: 'Kidney Capsule',
        cssClass: 'syrup-category',
        description: 'Kidney Capsule'
      },
      {
        productForm: 'Kidney Syrup',
        label: 'Kidney Syrup',
        imageUrl: 'assets/product-forms/Kidney Syrup.avif',
        altText: 'Kidney Syrup',
        cssClass: 'injection-category',
        description: 'Kidney Syrup'
      },
      {
        productForm: 'Kidney Infusion',
        label: 'Kidney Infusion',
        imageUrl: 'assets/product-forms/Kidney Infusion.avif',
        altText: 'Kidney Infusion',
        cssClass: 'capsule-category',
        description: 'Kidney Infusion'
      },
        {
        productForm: 'Kidney Solution for Infusion',
        label: 'Kidney Solution for Infusion',
        imageUrl: 'assets/product-forms/Kidney Solution for Infusion.avif',
        altText: 'Kidney Solution for Infusion',
        cssClass: 'capsule-category',
        description: 'Kidney Solution for Infusion'
      },
        {
        productForm: 'Juice',
        label: 'Juice',
        imageUrl: 'assets/product-forms/Juice.avif',
        altText: 'Juice',
        cssClass: 'capsule-category',
        description: 'Juice'
      },
      
    ];
  DermaCare1 = [
      {
        productForm: 'Face Cream',
        label: 'Face Cream',
        imageUrl: 'assets/product-forms/Face Cream.avif',
        altText: 'Face Cream',
        cssClass: 'cream-category',
        description: 'Face Cream'
      },
      {
        productForm: 'Face Pack',
        label: 'Face Pack',
        imageUrl: 'assets/product-forms/Face Pack.avif',
        altText: 'Face Pack',
        cssClass: 'tablet-category',
        description: 'Face Pack for  health'
      },
    
      {
        productForm: 'Lotion',
        label: 'Wrist Support',
        imageUrl: 'assets/product-forms/Lotion.avif',
        altText: 'Lotion',
        cssClass: 'syrup-category',
        description: 'Lotion'
      },
      {
        productForm: 'Face Wash',
        label: 'Face Wash',
        imageUrl: 'assets/product-forms/Face Wash.avif',
        altText: 'Face Wash',
        cssClass: 'injection-category',
        description: 'Face Wash'
      },
      {
        productForm: 'Serum',
        label: 'Serum',
        imageUrl: 'assets/product-forms/Serum.avif',
        altText: 'Serum',
        cssClass: 'capsule-category',
        description: 'Serum'
      },
        {
        productForm: 'Cream',
        label: 'Cream',
        imageUrl: 'assets/product-forms/Cream.avif',
        altText: 'Cream',
        cssClass: 'capsule-category',
        description: 'Cream'
      },
        {
        productForm: 'Moisturiser',
        label: 'Moisturiser',
        imageUrl: 'assets/product-forms/Moisturiser.avif',
        altText: 'Moisturiser',
        cssClass: 'capsule-category',
        description: 'Moisturiser'
      },
      {
        productForm: 'Dusting Powder',
        label: 'Dusting Powder',
        imageUrl: 'assets/product-forms/Dusting Powder.avif',
        altText: 'Dusting Powder',
        cssClass: 'lotion-category',
        description: 'Dusting Powder'
      },
        {
        productForm: 'Body Wash',
        label: 'Body Wash',
        imageUrl: 'assets/product-forms/Body Wash.avif',
        altText: 'Body Wash',
        cssClass: 'lotion-category',
        description: 'Body Wash'
      },
        {
        productForm: 'Conditioner',
        label: 'Conditioner',
        imageUrl: 'assets/product-forms/Conditioner.avif',
        altText: 'Conditioner',
        cssClass: 'lotion-category',
        description: 'Conditionerr'
      },

        {
        productForm: 'Wax',
        label: 'Wax',
        imageUrl: 'assets/product-forms/Wax.avif',
        altText: 'Wax',
        cssClass: 'lotion-category',
        description: 'Wax'
      },
        {
        productForm: 'Scrub',
        label: 'Scrub',
        imageUrl: 'assets/product-forms/Scrub.avif',
        altText: 'Scrub',
        cssClass: 'lotion-category',
        description: 'Scrub'
      },
        {
        productForm: 'Gel',
        label: 'Gel',
        imageUrl: 'assets/product-forms/Gel.avif',
        altText: 'Gel',
        cssClass: 'lotion-category',
        description: 'Gel'
      },
    
    ];
}
