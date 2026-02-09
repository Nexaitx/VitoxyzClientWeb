import { Component, OnInit } from '@angular/core';
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
  addressType: ['', Validators.required]


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
    phoneNumber: profile?.phoneNumber || ''
  });

  // store in localStorage as requested
  localStorage.setItem('address_fullName', this.addressForm.value.fullName);
  localStorage.setItem('address_phoneNumber', this.addressForm.value.phoneNumber);

  this.showAddAddressPopup = true;
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
  const payload = this.addressForm.value;

  this.http.post<any>(this.ADD_ADDRESS_URL, payload, { headers }).subscribe({
    next: (res) => {
      this.addressSaving = false;

      if (res?.status) {
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
    isaddress: true
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
      if (res?.status) {
        this.selectedAddress = res.data;
        this.profileForm.patchValue({
          fullAddress: this.buildAddress(res.data)
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

    this.http.delete<any>(DELETE_URL,  { headers }).subscribe({
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
