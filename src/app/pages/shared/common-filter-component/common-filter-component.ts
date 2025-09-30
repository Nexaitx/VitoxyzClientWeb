import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable, map, of } from 'rxjs'; 
import { ProductService } from '../../../core/product.service'; 
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { API_URL } from '@src/app/core/const';

@Component({
  selector: 'app-common-filter-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, 
    MatButtonModule 
  ],
  templateUrl: './common-filter-component.html',
  styleUrls: ['./common-filter-component.scss']
})
export class CommonFilterComponent implements OnInit {
  @Input() title: string = 'Explore Products';   // default value
  @Input() endpoint: string = '';    
  @Input() productForm: string = ''; 
  @Input() page: number = 0;         
  @Input() size: number = 10;        

  products$: Observable<any[]> = of([]); 
  API_BASE_URL: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.API_BASE_URL = `${API_URL}/${this.endpoint}`;

    this.products$ = this.productService
      .getFilteredProducts(this.API_BASE_URL, this.productForm, this.page, this.size)
      .pipe(
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
