import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class SharedProductService {
  private productService = inject(ProductService);

  getSharedProducts(
    endpoint: string,
    productForm: string,
    page: number = 0,
    size: number = 10
  ): Observable<any[]> {
    return this.productService
      .getFilteredProducts(endpoint, productForm, page, size)
      .pipe(
        map(response => {
          if (response && response.data && Array.isArray(response.data.content)) {
            return response.data.content.map((product: any) => ({
              ...product,
              price: product.price ?? 378,
              mrp: product.mrp ?? 429,
              form: product.form ?? '30 ml Shampoo'
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Product API Error:', error);
          return [];
        })
      );
  }

}
