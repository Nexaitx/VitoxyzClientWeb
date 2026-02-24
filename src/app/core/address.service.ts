import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_URL } from './const';

export interface Address {
  id?: number;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault?: boolean;
   latitude?: number;
  longitude?: number;
  useMapLocation?: boolean;
  mapSelectedAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressRequest {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: string;
  isDefault?: boolean;
    latitude?: number;
  longitude?: number;
  useMapLocation?: boolean;
  mapSelectedAddress?: string;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  // private API_BASE = 'http://localhost:8080/api/address';
      private API_BASE = `${API_URL}/address`;
  

  private _addresses$ = new BehaviorSubject<Address[]>([]);
  addresses$ = this._addresses$.asObservable();

  private _selectedAddress$ = new BehaviorSubject<Address | null>(null);
  selectedAddress$ = this._selectedAddress$.asObservable();

  //  For edit mode
  private _editingAddress$ = new BehaviorSubject<Address | null>(null);
  editingAddress$ = this._editingAddress$.asObservable();

  //  Get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('User not authenticated');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  //  Get user addresses
  getUserAddresses(): Observable<any> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<any>(`${this.API_BASE}/my`, { headers }).pipe(
        tap(response => {
          if (response.status && response.data) {
            this._addresses$.next(response.data);
          }
        })
      );
    } catch (error) {
      throw error;
    }
  }

  //  Get address by ID
  getAddressById(addressId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.API_BASE}/${addressId}`, { headers });
  }

  //  Add new address
  addAddress(address: AddressRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.API_BASE}/add`, address, { headers }).pipe(
      tap(response => {
        if (response.status) {
          this.getUserAddresses().subscribe();
        }
      })
    );
  }

  //  Update address
  updateAddress(id: number, address: AddressRequest): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.API_BASE}/update/${id}`, address, { headers }).pipe(
      tap(response => {
        if (response.status) {
          this.getUserAddresses().subscribe();
          this._editingAddress$.next(null); // Exit edit mode
        }
      })
    );
  }

  //  Delete address
  deleteAddress(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.API_BASE}/delete/${id}`, { headers }).pipe(
      tap(response => {
        if (response.status) {
          this.getUserAddresses().subscribe();
          // If deleted address was selected, clear selection
          if (this._selectedAddress$.value?.id === id) {
            this._selectedAddress$.next(null);
          }
        }
      })
    );
  }

  // Set default address
  setDefaultAddress(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.API_BASE}/default/${id}`, {}, { headers }).pipe(
      tap(response => {
        if (response.status) {
          this.getUserAddresses().subscribe();
        }
      })
    );
  }

  //  Get default address
  getDefaultAddress(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.API_BASE}/default`, { headers });
  }

  //  Set address for editing
  setEditingAddress(address: Address | null) {
    this._editingAddress$.next(address);
  }

  //  Cancel editing
  cancelEditing() {
    this._editingAddress$.next(null);
  }

  //  Check if authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // address for current order
  selectAddress(address: Address) {
    this._selectedAddress$.next(address);
  }

  //  selected address
  getSelectedAddress(): Address | null {
    return this._selectedAddress$.value;
  }

  // selected address
  clearSelectedAddress() {
    this._selectedAddress$.next(null);
  }
}
