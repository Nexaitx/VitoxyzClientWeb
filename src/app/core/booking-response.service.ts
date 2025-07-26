import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '../core/const';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingResponseService {
  constructor(private http: HttpClient) {}

  getBookingResponse(): Observable<any> {
const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${API_URL}${ENDPOINTS.BOOKING_RESPONSE}`, { headers });
  }
}
