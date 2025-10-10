import { Component, OnInit, OnDestroy,ElementRef,ViewChild } from '@angular/core';
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
  takeUntil // ✅ ADD THIS IMPORT
} from 'rxjs'; 
import { of } from 'rxjs';
import { ProductService } from '../../../core/product.service'; 
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { SidebarFilterComponent } from "../../shared/sidebar-filter/sidebar-filter";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { Footer } from "../../footer/footer";
import { BannerSliderComponent } from "@src/app/shared/banner-slider/banner-slider";
import { TextBanner } from "@src/app/shared/text-banner/text-banner";

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
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

  // Products array for the current page
  products$: Observable<any[]>; 
  
  // Pagination State Variables
  pageSize: number = 50; // Items per page
  totalProducts: number = 0; // Total count from API response
  currentPageIndex: number = 0; // Current page index (0-based)
  
  // Loading state
  isLoading: boolean = false;
  
  // Public subjects for template access
  currentPage$ = new BehaviorSubject<number>(0); 
  selectedCategory$ = new BehaviorSubject<string | null>(null);
  selectedBrands$ = new BehaviorSubject<string[]>([]); // ✅ ADDED for brand filtering
  
  private destroy$ = new Subject<void>(); // ✅ ADDED for cleanup

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
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

  /**
   * Initialize the product data stream with loading states - ✅ FIXED
   */
  private initializeProductStream(): void {
    const dataStream$ = combineLatest([
      this.route.paramMap.pipe(startWith(new Map())), // ✅ FIX: Add startWith
      this.route.queryParamMap.pipe(startWith(new Map())), // ✅ FIX: Add startWith
      this.currentPage$.pipe(startWith(0)), // ✅ FIX: Add startWith
      this.selectedCategory$.pipe(startWith(null)), // ✅ FIX: Add startWith
      this.selectedBrands$.pipe(startWith([])) // ✅ FIX: Add startWith
    ]).pipe(
      takeUntil(this.destroy$) // ✅ NOW WORKING - no error
    );

    this.products$ = dataStream$.pipe(
      tap(() => {
        // ✅ HAR FILTER/PAGINATION CHANGE PAR LOADING START - NOW WORKING
        console.log('🔄 Loading started - filter/pagination change');
        this.isLoading = true;
      }),
      switchMap(([params, queryParams, page, selectedCategory, selectedBrands]) => {
        console.log('📡 API call triggered:', {
          category: selectedCategory,
          brands: selectedBrands,
          page: page
        });
        
        // Path se category (default)
        const categoryFromPath = params.get('category') || 'Unknown Category';
        this.categoryName = selectedCategory || categoryFromPath;
        this.currentEndpoint = queryParams.get('endpoint') || 'products/filter';
        this.currentPageIndex = page;

        return this.productService.getProductsForCategoryPage(
          this.currentEndpoint,
          this.categoryName,
          page,
          this.pageSize,
          selectedBrands // ✅ NOW USING selectedBrands
        ).pipe(
          // ✅ API call complete hone par loading stop karein - RELIABLE
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
          return response.data.content;
        }
        return [];
      })
    );
  }

  /**
   * Pagination event handler - ✅ IMPROVED
   */
  handlePageEvent(event: PageEvent): void {
    console.log('🔄 Pagination changed:', event);
    
    // ✅ IMMEDIATE LOADING TRIGGER
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
  
  /**
   * Helper function to get the first image URL
   */
  getFirstImageUrl(imageUrls: string): string {
    if (!imageUrls) return 'assets/placeholder.png'; 
    return imageUrls.split('|')[0].trim();
  }

  goToProduct(product: any) {
    if (this.isLoading) {
      console.log('⏳ Loading in progress, product navigation blocked');
      return; // ✅ Loading ke time navigation block
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

  /**
   * Category filter handler - ✅ NOW WORKING PROPERLY
   */
  filterByCategory(category: string) {
    console.log('🔄 Category filter applied:', category);
    
    // ✅ IMMEDIATE LOADING TRIGGER
    this.isLoading = true;
    
    // ✅ Data stream update karo
    this.selectedCategory$.next(category); 
    this.currentPage$.next(0); 
    
    console.log('🎯 Loading state set to:', this.isLoading);
  }

  /**
   * Brand filter handler - ✅ NOW WORKING PROPERLY
   */
  filterByBrands(brands: string[]) {
    console.log('🔄 Brands filter applied:', brands);
    
    // ✅ IMMEDIATE LOADING TRIGGER
    this.isLoading = true;
    
    // ✅ Data stream update karo
    this.selectedBrands$.next(brands);
    this.currentPage$.next(0);
    
    console.log('🎯 Loading state set to:', this.isLoading);
  }

  /**
   * Clear current filters and reset to default - ✅ NOW WORKING PROPERLY
   */
  clearFilters(): void {
    console.log('🔄 Clearing filters');
    
    //  IMMEDIATE LOADING TRIGGER
    this.isLoading = true;
    
    this.selectedCategory$.next(null);
    this.selectedBrands$.next([]);
    this.currentPage$.next(0);
    
    console.log('🎯 Loading state set to:', this.isLoading);
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
