import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// 'map' operator ko import karein
import { Observable, switchMap, map } from 'rxjs'; 
import { ProductService } from '../../../core/product.service'; 
import { CommonModule } from '@angular/common';
import {ElementRef, ViewChild, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card'; // <-- Card tags ke liye
import { MatButtonModule } from '@angular/material/button';
import { API_URL } from '@src/app/core/const';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [
    CommonModule,
     MatCardModule, 
    MatButtonModule 
  ],
  templateUrl: './category-products.html', 
  styleUrls: ['./category-products.scss'] 
})
export class CategoryProductsComponent implements OnInit {
  categoryName: string = '';
    API_BASE_URL: string = ''; 

  products$: Observable<any[]> | undefined; 
  // personal care 
  

  // API_BASE_URL: string = 'http://localhost:8080/api/products/filter';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.API_BASE_URL = `${API_URL}/products/filter`; 

    this.products$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.categoryName = params.get('category') || 'Unknown Category';
        
        // ProductService ko call karke products fetch karna
        return this.productService.getProductsByCategory(this.categoryName);
      }),
      
    
      map(response => {
        if (response && response.data && Array.isArray(response.data.content)) {
          return response.data.content;
        }
        return []; 
      })
    );
  }

   @ViewChild("productCarouselWrapper", { static: false }) 
    carouselWrapper!: ElementRef<HTMLDivElement>;

    getFirstImageUrl(imageUrls: string): string {
        if (!imageUrls) return 'assets/placeholder.png'; 
        return imageUrls.split('|')[0].trim();
    }

  scrollCarousel(direction: 'left' | 'right'): void {
        if (this.carouselWrapper) {
            const element = this.carouselWrapper.nativeElement;
            const cardWidth = 250; 
            const gap = 16;
            const scrollAmount = (cardWidth + gap) * 4; 
            
            if (direction === 'left') {
                element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    }
}
