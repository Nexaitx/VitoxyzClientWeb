import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Medicine {
  managementId: number;
  entityType: string;
  medicineId: number | null;
  productId: string;
  name: string;
  description: string;
  price: number | null;
  originalPrice: number;
  discountPrice: number | null;
  discountPercentage: number | null;
  manufacturer: string | null;
  category: string;
  productForm: string | null;
  packaging?: string;
  imageUrls: string[] | null;
  quantityInStock: number | null;
  expiryDate: string | null;
  // Add other properties as needed
}

export interface MedicineResponse {
  success: boolean;
  data: Medicine[];
  pagination: {
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    currentPage: number;
    pageSize: number;
  };
  message: string;
}

export interface FilterResponse {
  success: boolean;
  data: Medicine[];
  pagination: {
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    currentPage: number;
    hasPrevious: boolean;
    pageSize: number;
  };
  filters: {
    medicineType: string;
    brandName: string;
    productForm: string;
    category: string;
    prescriptionRequired: string;
  };
  message: string;
}

export interface FilterParams {
  category?: string;
  productForm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private baseUrl = 'http://localhost:8080/api/public/medicines';

  constructor(private http: HttpClient) { }

  // Get all medicines for slider with image processing
  getAllMedicines(page: number = 0, size: number = 10, sortBy: string = 'name', sortDirection: string = 'asc'): Observable<MedicineResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<MedicineResponse>(this.baseUrl, { params })
      .pipe(
        map(response => {
          // Process image URLs for each medicine
          if (response.data) {
            response.data = response.data.map(medicine => ({
              ...medicine,
              imageUrls: this.processImageUrls(medicine.imageUrls)
            }));
          }
          return response;
        })
      );
  }

  // Process image URLs from the API response
  private processImageUrls(imageUrls: any): string[] {
    console.log('Raw image URLs:', imageUrls);
    
    if (!imageUrls) {
      console.log('No image URLs found');
      return [];
    }
    
    // If it's an array with pipe-separated URLs
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const firstItem = imageUrls[0];
      
      if (typeof firstItem === 'string') {
        // Handle the case where URLs are separated by " | "
        if (firstItem.includes(' | ')) {
          console.log('Found pipe-separated URLs');
          const separatedUrls = firstItem.split(' | ')
            .map(url => {
              // Clean up each URL
              let cleanUrl = url.trim();
              // Remove any \r characters
              cleanUrl = cleanUrl.replace(/\r/g, '');
              // Remove any extra spaces
              cleanUrl = cleanUrl.replace(/\s+/g, ' ').trim();
              return cleanUrl;
            })
            .filter(url => {
              const isValid = url.length > 0 && this.isValidUrl(url);
              console.log('URL:', url, 'Valid:', isValid);
              return isValid;
            });
          
          console.log('Processed URLs:', separatedUrls);
          return separatedUrls;
        } 
        // Handle single URL string
        else if (firstItem.trim()) {
          let cleanUrl = firstItem.replace(/\r/g, '').trim();
          cleanUrl = cleanUrl.replace(/\s+/g, ' ').trim();
          
          if (this.isValidUrl(cleanUrl)) {
            console.log('Single valid URL:', cleanUrl);
            return [cleanUrl];
          }
        }
      }
    }
    
    // If it's already an array of separate URLs
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const validUrls = imageUrls
        .filter(url => typeof url === 'string' && url.trim())
        .map(url => {
          let cleanUrl = url.replace(/\r/g, '').trim();
          cleanUrl = cleanUrl.replace(/\s+/g, ' ').trim();
          return cleanUrl;
        })
        .filter(url => this.isValidUrl(url));
      
      console.log('Already separated URLs:', validUrls);
      return validUrls;
    }
    
    console.log('No valid URLs found');
    return [];
  }

  private isValidUrl(url: string): boolean {
    try {
      // Basic URL validation
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      console.log('Invalid URL:', url);
      return false;
    }
  }

  getCategories(): Observable<{success: boolean, data: string[]}> {
    return this.http.get<{success: boolean, data: string[]}>(`${this.baseUrl}/categories`);
  }

  getProductForms(): Observable<{success: boolean, data: string[]}> {
    return this.http.get<{success: boolean, data: string[]}>(`${this.baseUrl}/product-forms`);
  }

  filterMedicines(params: FilterParams): Observable<FilterResponse> {
    let httpParams = new HttpParams();
    
    if (params.category && params.category !== 'all') {
      httpParams = httpParams.set('category', params.category);
    }
    
    if (params.productForm && params.productForm !== 'all') {
      httpParams = httpParams.set('productForm', params.productForm);
    }
    
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    
    if (params.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<FilterResponse>(`${this.baseUrl}/filter`, { params: httpParams })
      .pipe(
        map(response => {
          // Process image URLs for filtered medicines too
          if (response.data) {
            response.data = response.data.map(medicine => ({
              ...medicine,
              imageUrls: this.processImageUrls(medicine.imageUrls)
            }));
          }
          return response;
        })
      );
  }
}