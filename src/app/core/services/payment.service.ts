import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

export interface CreatePaymentRequest {
  bookingIds: number[];
  fullName: string;
  phoneNumber: string;
  address: string;
  amount: number;
  gstNumber?: string; // GST Number optional add karein
}

export interface PaymentResponse {
  paymentId: number;
  userId: number;
  bookingIds: number[];
  fullName: string;
  phoneNumber: string;
  address: string;
  gstNumber?: string; // Change from number to string
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  status: string;
  createdAt: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthToken(): string | null {
    const token = 
      localStorage.getItem('token') || 
      sessionStorage.getItem('token') ||
      localStorage.getItem('auth_token') || 
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken');

    console.log('🔑 Retrieved Token:', token ? 'Token found' : 'No token found');
    return token;   
  }

  private getHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    
    if (!token) {
      console.warn('❌ No authentication token found in any storage');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    console.log('📨 Using Auth Header:', authToken.substring(0, 20) + '...');
    
    return new HttpHeaders({
      'Authorization': authToken,
      'Content-Type': 'application/json'
    });
  }

  // Method 1: Try primary endpoint
  createPayment(paymentRequest: CreatePaymentRequest): Observable<any> {
    const headers = this.getHeaders();
    console.log('🚀 Creating payment with primary endpoint');
    
    return this.http.post(`${this.apiUrl}/payments/create`, paymentRequest, { headers });
  }

  // Method 2: Try V2 endpoint with request attribute
  createPaymentV2(paymentRequest: CreatePaymentRequest): Observable<any> {
    const headers = this.getHeaders();
    console.log('🚀 Creating payment with V2 endpoint');
    
    return this.http.post(`${this.apiUrl}/payments/create-v2`, paymentRequest, { headers });
  }

  // Method 3: Try token endpoint
  createPaymentWithToken(paymentRequest: CreatePaymentRequest): Observable<any> {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    const headers = new HttpHeaders({
      'Authorization': authToken,
      'Content-Type': 'application/json'
    });

    console.log('🚀 Creating payment with token endpoint');
    return this.http.post(`${this.apiUrl}/payments/create-with-token`, paymentRequest, { headers });
  }

  // Verify payment
  verifyPayment(verifyRequest: VerifyPaymentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/verify`, verifyRequest, {
      headers: this.getHeaders()
    });
  }

  // Get user payments
  getUserPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/payments/user/payments`, {
      headers: this.getHeaders()
    });
  }

  // Get payments by booking ID
  getPaymentsByBooking(bookingId: number): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/payments/booking/${bookingId}`, {
      headers: this.getHeaders()
    });
  }

  // Get payment by order ID
  getPaymentByOrderId(orderId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/payments/order/${orderId}`, {
      headers: this.getHeaders()
    });
  }
}