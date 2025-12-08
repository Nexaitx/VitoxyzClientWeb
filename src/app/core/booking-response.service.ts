import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '../core/const';
import { Observable, throwError } from 'rxjs';

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

  removeStaffFromBooking(bookingId: string): Observable<any> {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    //  REMOVE_STAFF: '/user/remove-staff/{bookingId}'
    return this.http.delete(`${API_URL}${ENDPOINTS.REMOVE_STAFF.replace('{bookingId}', bookingId)}`, { headers });
  }

  //suffle logic 
addIndividualStaff(payload: {
  staffForms: {
    typeOfStaff: string;
    typeOfSubStaff: string;
    shifts: {
       maleQuantity: number;
      femaleQuantity: number;
      tenure: string;
      dutyStartDate: string;
      dutyEndDate: string;
      startTimeHour: string;
      startTimeMinute: string;
      startTimeAmPm: string;
      endTimeHour: string;
      endTimeMinute: string;
      endTimeAmPm: string;
    }[];
  }[];
    latitude: number;
  longitude: number;
}): Observable<any> {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) {
    return throwError(() => new Error('No auth token found'));
  }

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  return this.http.post(`${API_URL}${ENDPOINTS.BOOK_SINGLE_STAFF}`, payload, { headers });
}

}
