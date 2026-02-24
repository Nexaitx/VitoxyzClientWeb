import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { Footer } from "../footer/footer";
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { API_URL } from '@src/app/core/const';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-profile',
  imports: [
    RouterLink,
    MobileFooterNavComponent,
    Footer,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  profile: any = null;
  editField: 'mobile' | 'email' | 'address' | null = null;
  saving = false;
  profileLoaded = false;

  addresses: any[] = [];
  defaultAddress: any = null;
  addressesLoaded = false;
  showAddAddressPopup = false;
  addressSaving = false;
  selectedAddress: any = null;
  addressForm: FormGroup;
@ViewChild('mapSearchInput') mapSearchInput!: ElementRef;

map: google.maps.Map | undefined;
marker: google.maps.Marker | undefined;

  private ADD_ADDRESS_URL = `${API_URL}/address/add`;
  private GET_ADDRESS_URL = `${API_URL}/address/my`;
  private UPDATE_ADDRESS_URL = `${API_URL}/address/update`;

  private GET_PROFILE_URL = `${API_URL}/user/profile`;
  private UPDATE_PROFILE_URL = `${API_URL}/user/profile/update`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      fullAddress: ['', [Validators.required, Validators.minLength(3)]],
      userName: ['']
    });
    this.addressForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      landmark: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', Validators.required],
      addressType: ['', Validators.required],

        // ✅ NEW FIELDS (NOT USED IN UI)
 // ✅ NEW FIELDS (NOT USED IN UI)
  latitude: [null],
  longitude: [null],
  useMapLocation: [true],
  mapSelectedAddress: [''],
 

    });


  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadMyAddresses();
  }
  get f() {
    return this.profileForm.controls;
  }
  openAddAddressPopup(): void {
    const profile = this.profile;

    this.addressForm.patchValue({
      fullName: profile?.displayName || profile?.userName || '',
      phoneNumber: profile?.phoneNumber || '',
        useMapLocation: true,
    isDefault: true,
    isaddress: true
    });

    // store in localStorage as requested
    localStorage.setItem('address_fullName', this.addressForm.value.fullName);
    localStorage.setItem('address_phoneNumber', this.addressForm.value.phoneNumber);

    this.showAddAddressPopup = true;
      setTimeout(() => {
    this.initializeMap();
  }, 300);
  }
  closeAddAddressPopup(): void {
    this.showAddAddressPopup = false;
    this.addressForm.reset({
      isDefault: true,
      isaddress: true
    });
  }
  buildAddress(addr: any): string {
    if (!addr) return '';

    return [
      addr.addressLine1,
      addr.addressLine2,
      addr.landmark,
      addr.city,
      addr.state,
      addr.pincode
    ].filter(Boolean).join(', ');
  }

initializeMap(): void {

  const defaultLat = 20.5937;
  const defaultLng = 78.9629;

  const mapElement = document.getElementById('map') as HTMLElement;

  this.map = new google.maps.Map(mapElement, {
    center: { lat: defaultLat, lng: defaultLng },
    zoom: 5
  });

  this.marker = new google.maps.Marker({
    map: this.map,
    draggable: true
  });

  const geocoder = new google.maps.Geocoder();

  // ----------------------------------
  // 1️⃣ MAP CLICK → UPDATE INPUT
  // ----------------------------------
  this.map.addListener('click', (event: google.maps.MapMouseEvent) => {

    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    this.setMarkerAndLocation(lat, lng);
  });

  // ----------------------------------
  // 2️⃣ AUTOCOMPLETE SELECT
  // ----------------------------------
  const autocomplete = new google.maps.places.Autocomplete(
    this.mapSearchInput.nativeElement
  );

  autocomplete.addListener('place_changed', () => {

    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    this.setMarkerAndLocation(lat, lng, place.formatted_address);
  });

  // ----------------------------------
  // 3️⃣ LIVE TYPING → GEOCODE UPDATE
  // ----------------------------------
  let typingTimer: any;

  this.mapSearchInput.nativeElement.addEventListener('input', () => {

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {

      const input = this.mapSearchInput.nativeElement.value;

      if (!input || input.length < 3) return;

      geocoder.geocode({ address: input }, (results, status) => {

        if (status === 'OK' && results && results.length > 0) {

          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const formattedAddress = results[0].formatted_address;

          this.setMarkerAndLocation(lat, lng, formattedAddress);
        }
      });

    }, 600); // wait 600ms after typing
  });
}
setMarkerAndLocation(lat: number, lng: number, address?: string): void {

  if (!this.marker || !this.map) return;

  this.marker.setPosition({ lat, lng });
  this.map.setCenter({ lat, lng });
  this.map.setZoom(12);

  const geocoder = new google.maps.Geocoder();

  const updateForm = (formattedAddress: string) => {

    this.mapSearchInput.nativeElement.value = formattedAddress;

    this.addressForm.patchValue({
      latitude: lat,
      longitude: lng,
      mapSelectedAddress: formattedAddress,
      useMapLocation: true
    });

    // 🔥 VERY IMPORTANT FIX
    if (this.selectedAddress) {
      this.selectedAddress.latitude = lat;
      this.selectedAddress.longitude = lng;
    }
  };

  if (address) {
    updateForm(address);
  } else {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        updateForm(results[0].formatted_address);
      }
    });
  }
}
  // -------------------------
  // FIXED HEADERS
  // -------------------------
  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      '';

    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // -------------------------
  // FIXED LOAD PROFILE
  // -------------------------
  loadMyAddresses(): void {
    this.addressesLoaded = false;
    const headers = this.getAuthHeaders();

    this.http.get<any>(this.GET_ADDRESS_URL, { headers }).subscribe({
      next: (res) => {
        if (res?.status && Array.isArray(res.data)) {
          this.addresses = res.data;


          // pick default OR first
          this.selectedAddress =
            this.addresses.find(a => a.isDefault) || this.addresses[0] || null;

          // 🔥 show address in profile form (UI only)
          if (this.selectedAddress) {
            this.profileForm.patchValue({
              fullAddress: this.buildAddress(this.selectedAddress)
            });
          }
        }
        this.addressesLoaded = true;
      },
      error: (err) => {
        console.error('Failed to load addresses', err);
        this.addressesLoaded = true;
      }
    });
  }


  loadProfile(): void {
    this.profileLoaded = false;
    const headers = this.getAuthHeaders();

    const simpleUrl = this.GET_PROFILE_URL;

    const queryParams =
      '?enabled=true&password=string&username=string&authorities=%5B%7B%22authority%22%3A%22string%22%7D%5D&accountNonExpired=true&accountNonLocked=true&credentialsNonExpired=true';

    const fullUrl = simpleUrl + queryParams;

    console.log('Simple Profile URL:', simpleUrl);
    console.log('Full Profile URL:', fullUrl);

    // ----- HANDLE SUCCESS -----
    const handleSuccess = (res: any) => {
      if (res?.status && res?.data) {
        this.profile = res.data;

        this.profileForm.patchValue({
          phoneNumber: this.profile.phoneNumber || '',
          email: this.profile.email || '',
          fullAddress: this.profile.fullAddress || '',
          userName: this.profile.userName || ''
        });
      } else {
        this.snackBar.open(res?.message || 'Failed to load profile', 'Close', { duration: 3000 });
      }

      this.profileLoaded = true;
    };

    // ----- HANDLE ERROR -----
    const handleError = (err: any, attemptedUrl: string, tryFallback: boolean) => {
      console.error(`Error loading profile from ${attemptedUrl}`, err);

      if (tryFallback) {
        console.warn('Retrying profile loading using Postman-style URL...');
        this.http.get<any>(fullUrl, { headers }).subscribe({
          next: (r2) => handleSuccess(r2),
          error: (err2) => {
            console.error('Fallback also failed:', err2);
            const message =
              err2?.error?.message ||
              err2?.error?.error ||
              `Server returned ${err2?.status || 500}`;

            this.snackBar.open('Unable to load profile: ' + message, 'Close', { duration: 5000 });
            this.profileLoaded = true;
          }
        });
        return;
      }

      const message = err?.error?.message || 'Unable to load profile';
      this.snackBar.open(message, 'Close', { duration: 4000 });
      this.profileLoaded = true;
    };

    // FIRST TRY SIMPLE URL
    this.http.get<any>(simpleUrl, { headers }).subscribe({
      next: (res) => handleSuccess(res),
      error: (err) => handleError(err, simpleUrl, true)
    });
  }
  submitAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.addressSaving = true;
    const headers = this.getAuthHeaders();
    const payload = {
  ...this.addressForm.value,
  // 🔥 ALWAYS TAKE FROM FORM (NOT selectedAddress)
  latitude: this.addressForm.value.latitude,
  longitude: this.addressForm.value.longitude,
  useMapLocation: true,
  mapSelectedAddress: this.addressForm.value.mapSelectedAddress
};

    this.http.post<any>(this.ADD_ADDRESS_URL, payload, { headers }).subscribe({
      next: (res) => {
        this.addressSaving = false;

        if (res?.status && res.data) {
            const newAddress = {
    ...res.data,
    latitude: res.data.latitude,
    longitude: res.data.longitude
    
  };
 console.log(res.data.latitude);
 
  this.selectedAddress = newAddress;
          this.snackBar.open('Address added successfully', 'Close', { duration: 3000 });
          this.closeAddAddressPopup();
          this.loadMyAddresses(); // refresh address list
        } else {
          this.snackBar.open(res?.message || 'Failed to add address', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error(err);
        this.addressSaving = false;
        this.snackBar.open('Failed to add address', 'Close', { duration: 3000 });
      }
    });
  }

  // -------------------------
  // EDIT START
  // -------------------------
  startEdit(field: 'mobile' | 'email' | 'address'): void {
    this.editField = field;
    if (this.profile) {
      if (field === 'mobile') this.profileForm.controls['phoneNumber'].setValue(this.profile.phoneNumber || '');
      if (field === 'email') this.profileForm.controls['email'].setValue(this.profile.email || '');
      // if (field === 'address') this.profileForm.controls['fullAddress'].setValue(this.profile.fullAddress || '');

    }
  }

  // -------------------------
  // CANCEL EDIT
  // -------------------------
  cancelEdit(): void {
    this.editField = null;
    if (this.profile) {
      this.profileForm.patchValue({
        phoneNumber: this.profile.phoneNumber || '',
        email: this.profile.email || '',
        fullAddress: this.profile.fullAddress || ''
      });
    }
  }

  // -------------------------
  // SUBMIT EDIT (unchanged)
  // -------------------------
  submitEdit(field: 'mobile' | 'email' | 'address'): void {
    if (!this.profile) return;

    // ---------------- MOBILE & EMAIL (UNCHANGED)
    if (field !== 'address') {
      if (field === 'mobile') this.profileForm.controls['phoneNumber'].markAsTouched();
      if (field === 'email') this.profileForm.controls['email'].markAsTouched();

      if (this.profileForm.invalid) return;

      const payload = {
        userName: this.profileForm.value.userName || this.profile.userName || '',
        phoneNumber: this.profileForm.value.phoneNumber,
        email: this.profileForm.value.email
      };

      this.saving = true;
      const headers = this.getAuthHeaders();

      this.http.put<any>(this.UPDATE_PROFILE_URL, payload, { headers }).subscribe({
        next: () => {
          this.saving = false;
          this.editField = null;
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Profile update failed', 'Close', { duration: 3000 });
        }
      });

      return;
    }

    // ---------------- ADDRESS UPDATE (CORRECT API)
    if (!this.selectedAddress) return;

    const payload = {
      fullName: this.selectedAddress.fullName,
      phoneNumber: this.selectedAddress.phoneNumber,
      addressLine1: this.selectedAddress.addressLine1,
      addressLine2: this.selectedAddress.addressLine2,
      landmark: this.selectedAddress.landmark,
      city: this.selectedAddress.city,
      state: this.selectedAddress.state,
      pincode: this.selectedAddress.pincode,
      addressType: this.selectedAddress.addressType,
      isDefault: this.selectedAddress.isDefault,
      isaddress: true,
        // ✅ NEW FIELDS
latitude: this.selectedAddress.latitude,
  longitude: this.selectedAddress.longitude,
  useMapLocation: true,
  mapSelectedAddress: this.buildAddress(this.selectedAddress)
    };

    this.saving = true;
    const headers = this.getAuthHeaders();

    this.http.put<any>(
      `${this.UPDATE_ADDRESS_URL}/${this.selectedAddress.id}`,
      payload,
      { headers }
    ).subscribe({
      next: (res) => {
        this.saving = false;
        if (res?.status && res.data) {
            this.selectedAddress = {...this.selectedAddress,...res.data};
          this.profileForm.patchValue({
            fullAddress: this.buildAddress(this.selectedAddress)
          });
          this.editField = null;
          this.snackBar.open('Address updated successfully', 'Close', { duration: 3000 });
        }
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Address update failed', 'Close', { duration: 3000 });
      }
    });
  }
  deleteAccount(): void {

    const userId = this.profile?.id || this.profile?.userId;

    if (!userId) {
      Swal.fire('Error', 'User ID not found', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete your account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33'
    }).then((result) => {

      if (!result.isConfirmed) return;

      this.saving = true;

      const headers = this.getAuthHeaders();

      const DELETE_URL = `${API_URL}/user/soft-delete/${userId}`;

      this.http.delete<any>(DELETE_URL, { headers }).subscribe({
        next: (res) => {
          this.saving = false;

          if (res?.status) {

            Swal.fire({
              icon: 'success',
              title: 'Account Deleted',
              text: 'Your account is temporarily deleted successfully but not permanently deleted. Please contact supporter.',
              confirmButtonColor: '#ff4500'
            }).then(() => {
              localStorage.clear();
              sessionStorage.clear();
              this.router.navigate(['/login']); // change if needed
            });

          } else {
            Swal.fire('Failed', res?.message || 'Delete failed', 'error');
          }
        },
        error: (err) => {
          this.saving = false;
          console.error(err);
          Swal.fire('Error', 'Unable to delete account', 'error');
        }
      });

    });
  }

}
