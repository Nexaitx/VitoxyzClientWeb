import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, map, BehaviorSubject, combineLatest, tap } from 'rxjs'; 
import { ProductService } from '../../../core/product.service'; 
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; 

import { Router } from '@angular/router';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, 
    MatButtonModule,
    MatPaginatorModule
  ],
  templateUrl: './category-products.html', 
  styleUrls: ['./category-products.scss'] 
})
export class CategoryProductsComponent implements OnInit {
  categoryName: string = '';
  currentEndpoint: string = 'products/filter';

  // Products array for the current page
  products$: Observable<any[]>; 
  
  // Pagination State Variables
  pageSize: number = 30; // Items per page
  totalProducts: number = 0; // Total count from API response
  currentPageIndex: number = 0; // Current page index (0-based)
  
  // Initial value set to 0 (first page)
  private currentPage$ = new BehaviorSubject<number>(0); 

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) { 
    this.products$ = new Observable<any[]>(); 
  }

  // ngOnInit(): void {
  //   const dataStream$ = combineLatest([
  //     this.route.paramMap,
  //     this.currentPage$
  //   ]);

  //   this.products$ = dataStream$.pipe(
  //     tap(([params, page]) => {
  //       this.categoryName = params.get('category') || 'Unknown Category';
  //       this.currentPageIndex = page; // Sync the local index
  //     }),
  //     switchMap(([params, page]) => {
  //       // Note: 'page' is the 0-based index.
  //       return this.productService.getProductsByCategory(
  //         this.categoryName, 
  //         page, 
  //         this.pageSize
  //       );
  //     }),
  //     // Assuming your service returns an Observable<any> (the raw API response)
  //     tap(response => {
       
  //       this.totalProducts = response?.data?.totalElements || 0; 
        
  //       if (this.totalProducts === 0) {
  //          this.currentPageIndex = 0;
  //       }
  //     }),
  //     map(response => {
  //       if (response && response.data && Array.isArray(response.data.content)) {
  //         return response.data.content;
  //       }
  //       return []; 
  //     })
  //   );
  // }

  ngOnInit(): void {
    const dataStream$ = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
      this.currentPage$
    ]);

    this.products$ = dataStream$.pipe(
      tap(([params, queryParams, page]) => {
        // 1. Path Parameter (category/productForm)
        this.categoryName = params.get('category') || 'Unknown Category';
        
        // 2. Query Parameter (endpoint)
        this.currentEndpoint = queryParams.get('endpoint') || 'products/filter'; // Update the class property
        
        // 3. Local Index
        this.currentPageIndex = page; 
      }),
      switchMap(([params, queryParams, page]) => {
        
        // Note: 'page' is the 0-based index.
        return this.productService.getProductsForCategoryPage(
          this.currentEndpoint, // Updated endpoint
          this.categoryName,    
          page, 
          this.pageSize
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
   * Pagination event handler
   * @param event The event object from MatPaginator
   */
  handlePageEvent(event: PageEvent): void {
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
    //  the URL format is "url1|url2|url3"
    return imageUrls.split('|')[0].trim();
  }

goToProduct(product: any) {
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


  
}
