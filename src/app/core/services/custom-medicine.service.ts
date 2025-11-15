import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URL } from '../const';

export interface Medicine {
  medicineId: number;
  name: string;
  description: string;
  price: number;
  quantityInStock: number;
  manufacturer: string;
  expiryDate: string | null;
  category: string;
  productForm: string;
  medicineType: string;
  prescriptionRequired: boolean;
  vitoxyzDiscountPercentage: number | null;
  vitoxyzDiscountPrice: number | null;
  hasVitoxyzDiscount: boolean;
  isAvailable: boolean;
  imageUrl: string[] | null;
}
export interface MedicineResponse {
  success: boolean;
  content: Medicine[];
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

@Injectable({
  providedIn: 'root'
})
export class CustomMedicineService {
  private readonly API_BASE = `${API_URL}/custom-medicines`;

  constructor(private http: HttpClient) {}

//   getAllCustomMedicines(
//     page = 0,
//     size = 20,
//     sortBy = 'name',
//     sortDirection = 'asc'
//   ): Observable<any> {
//     const url = `${this.API_BASE}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
//     return this.http.get(url);
//   }
    getAllCustomMedicines(page: number = 0, size: number = 10, sortBy: string = 'name', sortDirection: string = 'asc'): Observable<MedicineResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<MedicineResponse>(this.API_BASE, { params })
      .pipe(
        map(response => {
          // Process image URLs for each medicine
          if (response.content) {
            response.content = response.content.map(medicine => ({
              ...medicine,
              imageUrl: this.processImageUrls(medicine.imageUrl)
            }));  
          }
          return response;
        })
      );
  }
   private processImageUrls(imageUrl: any): string[] {
    console.log('Raw image URLs:', imageUrl);
    
    if (!imageUrl) {
      console.log('No image URLs found');
      return [];
    }
    
    // If it's an array with pipe-separated URLs
    if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      const firstItem = imageUrl[0];
      
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
    if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      const validUrls = imageUrl
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
}
