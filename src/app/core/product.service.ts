import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API_URL } from './const';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
    // for testing
//   private readonly API_BASE_URL = 'http://localhost:8080/api/products/filter';
  private readonly FILTER_ENDPOINT = '/products/filter';

    private productCache: Map<string, Observable<any>> = new Map();

  constructor(private http: HttpClient) { }

 

    getProductsByCategory(categoryName: string, page: number, size: number): Observable<any> {
    const fullApiUrl = `${API_URL}${this.FILTER_ENDPOINT}`;

    // Include page and size parameters in the URL
    const url = `${fullApiUrl}?productForm=${categoryName}&page=${page}&size=${size}`;

    console.log('CategoryProducts API Calling:', url);
    
    return this.http.get(url);
  }


  getProductsByEndpoint(apiUrl: string, category?: string): Observable<any> {
  if (category) {
    return this.http.get<any>(`${apiUrl}?category=${category}`);
  }
  return this.http.get<any>(apiUrl);
}


 getFilteredProducts(apiUrl: string, productForm: string, page: number, size: number): Observable<any> {
      // 1. Create a unique cache key
      const cacheKey = `${apiUrl}?productForm=${productForm}&page=${page}&size=${size}`;
      
      // 2. Check if the result is already in the cache
      if (this.productCache.has(cacheKey)) {
        console.log(`Cache HIT for key: ${productForm}`);
        return this.productCache.get(cacheKey)!;
      }

      // 3. If not in cache, prepare the API call
      const url = `${apiUrl}?productForm=${productForm}&page=${page}&size=${size}`;
      console.log(`Cache MISS. API Calling: ${url}`);
      
      // 4. Make the HTTP call, cache the observable, and use shareReplay
      const products$ = this.http.get<any>(url).pipe(
          // shareReplay(1) ensures that the API is called only once, 
          // and all subsequent subscribers get the cached result.
          shareReplay(1)
      );

      this.productCache.set(cacheKey, products$);
      return products$;
    }

    getProductsForCategoryPage(
        endpoint: string, productForm: string, page: number, size: number, selectedBrands: string[] | never[]
    ): Observable<any> {
        const fullApiUrl = `${API_URL}/${endpoint}`;
        const url = `${fullApiUrl}?productForm=${productForm}&page=${page}&size=${size}`;
        console.log('Category Page API Calling (via See All):', url);
        return this.http.get(url);
    }





}
