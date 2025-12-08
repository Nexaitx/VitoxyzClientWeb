// src/app/services/booking.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { ApiResponse, PageMeta } from '../models/booking.model';
import { map } from 'rxjs/operators';
import { API_URL } from '../const';
export interface PageMeta {
  content: BookingItem[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface BookingItem {
  // add fields that actually come back from your API.
  // You gave empty arrays as example so these are a best guess.
  bookingId?: number;
  staffId?: number;
  staffName?: string;
  clientName?: string;
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
  status?: string;
  // any other properties from your backend
  // NEW FIELDS BASED ON YOUR API RESPONSE
  distanceKm?: number;
 
  timeSlot?: string;

  category?: string;
  subCategory?: string;

  price?: string | number;
  userAddress?: string;

  rating?: number | null;
  duties?: string | null;

  expiryAt?: string;

  startTimeHour?: string;
  startTimeMinute?: string;
  startTimeAmPm?: string;

  endTimeHour?: string;
  endTimeMinute?: string;
  endTimeAmPm?: string;

  expired?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class ViewStaffBookingHistoryService {
  // Prefer reading base URL from environment (replace with actual)
  private baseUrl = `${API_URL}/user`;

  constructor(private http: HttpClient) {}

//   private defaultQueryParams(page = 0, size = 10, sortBy = 'startDate', sortDirection = 'desc') {
//     let params = new HttpParams()
//       .set('page', String(page))
//       .set('size', String(size))
//       .set('sortBy', sortBy)
//       .set('sortDirection', sortDirection);

//     // The API example contains several auth-like query params (enabled, username, etc).
//     // If your backend actually requires them as query params, include them here.
//     // If they are not required remove them.
//     params = params
//       .set('enabled', 'true')
//       .set('password', 'string')
//       .set('username', 'string')
//       .set('authorities', '[{"authority":"string"}]')
//       .set('accountNonExpired', 'true')
//       .set('accountNonLocked', 'true')
//       .set('credentialsNonExpired', 'true');

//     return params;
//   }

  // Note: if you use authentication (JWT), provide headers accordingly:
  // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
private defaultQueryParams(page = 0, size = 10, sortBy = 'startDate', sortDirection = 'desc') {
  return new HttpParams()
    .set('page', String(page))
    .set('size', String(size))
    .set('sortBy', sortBy)
    .set('sortDirection', sortDirection);
}
 
  getPastBookings(page = 0, size = 10, sortBy = 'startDate', sortDirection = 'desc'): Observable<PageMeta> {
    const url = `${this.baseUrl}/past`;
    const params = this.defaultQueryParams(page, size, sortBy, sortDirection);
  const token = localStorage.getItem('authToken'); // or get from auth service
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get<ApiResponse<PageMeta>>(url, { params, headers })
    .pipe(map(res => res.data));
  }

  getOngoingBookings(page = 0, size = 10, sortBy = 'startDate', sortDirection = 'desc'): Observable<PageMeta> {
    const url = `${this.baseUrl}/ongoing`;
    const params = this.defaultQueryParams(page, size, sortBy, sortDirection);
    const token = localStorage.getItem('authToken'); // or get from auth service
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get<ApiResponse<PageMeta>>(url, { params, headers })
    .pipe(map(res => res.data));
  }

getUpcomingBookings(page = 0, size = 10, sortBy = 'startDate', sortDirection = 'asc'): Observable<PageMeta> {
  const url = `${this.baseUrl}/upcoming`;
  const params = this.defaultQueryParams(page, size, sortBy, sortDirection);

  const token = localStorage.getItem('authToken'); // or get from auth service
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get<ApiResponse<PageMeta>>(url, { params, headers })
    .pipe(map(res => res.data));
}
}
