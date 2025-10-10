import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_URL } from './const';

export interface CreateOrderRequest {
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    addressType: string;
  };
  specialInstructions?: string;
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: any;
  orderItems: any[];
  summary: any;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  // private API_BASE = 'http://localhost:8080/api/orders';
  private API_BASE = `${API_URL}/orders`;

  private _currentOrder$ = new BehaviorSubject<OrderResponse | null>(null);
  currentOrder$ = this._currentOrder$.asObservable();

  // Get auth headers with token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    console.log('🔐 Order Service - Token from localStorage:', token ? 'Exists' : 'Missing');
    
    if (!token) {
      console.error('❌ Order Service - No authentication token found');
      throw new Error('User not authenticated');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Create order from cart with authentication
  createOrder(orderData: CreateOrderRequest): Observable<any> {
    try {
      const headers = this.getAuthHeaders();
      console.log('📦 Creating order with data:', orderData);
      
      return this.http.post<any>(`${this.API_BASE}/create`, orderData, { headers }).pipe(
        tap(response => {
          console.log('✅ Order creation response:', response);
          if (response.status && response.data) {
            this._currentOrder$.next(response.data);
          }
        })
      );
    } catch (error) {
      console.error('❌ Error getting auth headers for order creation:', error);
      throw error;
    }
  }

  // Get order by ID with authentication
  getOrderById(orderId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('📥 Fetching order by ID:', orderId);
    
    return this.http.get<any>(`${this.API_BASE}/${orderId}`, { headers }).pipe(
      tap(response => {
        console.log('✅ Get order by ID response:', response);
      })
    );
  }

  //  Get user orders with authentication
  getUserOrders(): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('📥 Fetching user orders...');
    
    return this.http.get<any>(`${this.API_BASE}/my-orders`, { headers }).pipe(
      tap(response => {
        console.log('✅ User orders response:', response);
      })
    );
  }

  //  Cancel order with authentication
  cancelOrder(orderId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('❌ Cancelling order:', orderId);
    
    return this.http.put<any>(`${this.API_BASE}/${orderId}/cancel`, {}, { headers }).pipe(
      tap(response => {
        console.log('✅ Cancel order response:', response);
      })
    );
  }

  //  Get order statistics with authentication
  getOrderStatistics(): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('📊 Fetching order statistics...');
    
    return this.http.get<any>(`${this.API_BASE}/statistics`, { headers }).pipe(
      tap(response => {
        console.log('✅ Order statistics response:', response);
      })
    );
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  //  Get current token (for debugging)
  getCurrentToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
