import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, ENDPOINTS } from '../const';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) {}

  updateProfile(data: any): Observable<any> {
    const token = localStorage.getItem('token');  // login ke baad aap token store karte ho
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${API_URL}${ENDPOINTS.UPDATE_PROFILE}`, data, { headers });
  }
}
