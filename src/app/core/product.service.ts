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
  // private readonly FILTER_ENDPOINT = '/otc-products/form';
 private readonly FILTER_ENDPOINT = '/products/filter';
    private productCache: Map<string, Observable<any>> = new Map();

  constructor(private http: HttpClient) { }

  private joinUrl(...parts: string[]) {
    return parts
      .map((p, i) => {
        if (i === 0) return p.replace(/\/+$/, '');           // first part: trim trailing slash
        return p.replace(/^\/+|\/+$/g, '');                  // middle/last parts: trim both sides
      })
      .filter(Boolean)
      .join('/');
  }

    getProductsByCategory(categoryName: string, page: number, size: number): Observable<any> {
    const fullApiUrl = `${API_URL}${this.FILTER_ENDPOINT}`;

    // Include page and size parameters in the URL
    const url = `${fullApiUrl}?productForm=${encodeURIComponent(categoryName)}&page=${page}&size=${size}`;

    console.log('CategoryProducts API Calling:', url);
    
    return this.http.get(url);
  }


  getProductsByEndpoint(apiUrl: string, category?: string): Observable<any> {
  if (category) {
    return this.http.get<any>(`${apiUrl}?category=${encodeURIComponent(category)}`);
  }
  return this.http.get<any>(apiUrl);
}


 getFilteredProducts(apiUrl: string, productForm: string, page: number, size: number): Observable<any> {
      // 1. Create a unique cache key
      const cacheKey = `${apiUrl}?productForm=${productForm}&page=${page}&size=${size}`;
      
      // 2. Check if the result is already in the cache
      if (this.productCache.has(cacheKey)) {
      console.log(`Cache HIT for key: ${cacheKey}`);
      return this.productCache.get(cacheKey)!;
    }
    const url = `${apiUrl}?productForm=${encodeURIComponent(productForm || '')}&page=${page}&size=${size}`;
    console.log(`Cache MISS. API Calling: ${url}`);
    const products$ = this.http.get<any>(url).pipe(shareReplay(1));
    this.productCache.set(cacheKey, products$);
    return products$;
  }

    // getProductsForCategoryPage(
    //     endpoint: string, productForm: string, page: number, size: number, selectedBrands: string[] | never[]
    // ): Observable<any> {
    //     const fullApiUrl = `${API_URL}/${endpoint}`;
    //     const url = `${fullApiUrl}?productForm=${productForm}&page=${page}&size=${size}`;
    //     console.log('Category Page API Calling (via See All):', url);
    //     return this.http.get(url);
    // }

getProductsForCategoryPage(
    endpoint: string,
    productForm: string,
    page: number,
    size: number,
    selectedBrands: string[] = []
  ): Observable<any> {
    // Normalize endpoint (it may be 'otc-products/form' or 'Backend/api/otc-products/form')
    // Assumption: API_URL is the base like 'https://vitoxyz.com/Backend/api' (no trailing slash)
    const normalizedEndpoint = endpoint.replace(/^\/+/, ''); // remove leading slash if provided

    // If endpoint contains '/form' (or endsWith 'form'), use path-style URL:
    if (/\/?form(\/|$)/i.test(normalizedEndpoint)) {
      // Build base like: https://vitoxyz.com/Backend/api/otc-products/form
      const base = this.joinUrl(API_URL, normalizedEndpoint);
      const encodedForm = encodeURIComponent(productForm || '');
      // Add brand filters if present (example: &brands=brand1,brand2) — adjust if backend expects other param name
      const brandsParam = (selectedBrands && selectedBrands.length) ? `&brands=${encodeURIComponent(selectedBrands.join(','))}` : '';
      const url = `${base}/${encodedForm}?page=${page}&size=${size}${brandsParam}`;
      console.log('Category Page API Calling (path-style):', url);
      return this.http.get<any>(url);
    }

    // Fallback: query param style: ?productForm=...&page=...&size=...
    const base = this.joinUrl(API_URL, normalizedEndpoint || this.FILTER_ENDPOINT);
    const url = `${base}?productForm=${encodeURIComponent(productForm || '')}&page=${page}&size=${size}`;
    console.log('Category Page API Calling (query-style):', url);
    return this.http.get<any>(url);
  }



}
