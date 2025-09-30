import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './const';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
    // for testing
//   private readonly API_BASE_URL = 'http://localhost:8080/api/products/filter';
  private readonly FILTER_ENDPOINT = '/products/filter';


  constructor(private http: HttpClient) { }

  getProductsByCategory(categoryName: string): Observable<any> {
        const fullApiUrl = `${API_URL}${this.FILTER_ENDPOINT}`;

    // const url = `${this.fullApiUrl}?productForm=${categoryName}&page=0&size=10`;
        const url = `${fullApiUrl}?productForm=${categoryName}&page=0&size=10`;

    
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
  const url = `${apiUrl}?productForm=${productForm}&page=${page}&size=${size}`;
  return this.http.get<any>(url);
}

}
