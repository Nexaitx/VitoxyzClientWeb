import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, ENDPOINTS } from '../const';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  updateProfile(data: any): Observable<any> {
    const token = localStorage.getItem('token');  // login ke baad aap token store karte ho
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${API_URL}${ENDPOINTS.UPDATE_PROFILE}`, data, { headers });
  }

  private readonly baseUrl = 'https://sandbox.cashfree.com/verification/offline-aadhaar';
  private readonly clientId = 'CF10767430D2MKJT172ADC73E23EDG';
  private readonly clientSecret = 'cfsk_ma_test_6b55ef9c6e06797500805e2e971dfcb2_eebae5fa';


requestAadhaarOtp(aadhaarNumber: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-client-id': this.clientId,
      'x-client-secret': this.clientSecret
    });

    const body = {
      aadhaar_number: aadhaarNumber
    };

    const url = `${this.baseUrl}/otp`;
    return this.http.post(url, body, { headers: headers });
  }
verifyAadhaarOtp(otp: string, refId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-client-id': this.clientId,
      'x-client-secret': this.clientSecret
    });

    const body = {
      otp: otp,
      ref_id: refId
    };

    const url = `${this.baseUrl}/verify`;
    return this.http.post(url, body, { headers: headers });
  }
  
authenticateAadhaar(aadhaarData: any): Observable<any> {
    // This calls your own server, NOT the UIDAI API directly
    return this.http.post('https://sandbox.cashfree.com/verification/offline-aadhaar/otp', aadhaarData);
}
}
