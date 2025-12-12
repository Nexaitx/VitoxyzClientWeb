import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { Footer } from "../footer/footer";
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { API_URL } from '@src/app/core/const';
import { CommonModule } from '@angular/common';

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
  }

  ngOnInit(): void {
    this.loadProfile();
  }
get f() {
  return this.profileForm.controls;
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

  // -------------------------
  // EDIT START
  // -------------------------
  startEdit(field: 'mobile' | 'email' | 'address'): void {
    this.editField = field;
    if (this.profile) {
      if (field === 'mobile') this.profileForm.controls['phoneNumber'].setValue(this.profile.phoneNumber || '');
      if (field === 'email') this.profileForm.controls['email'].setValue(this.profile.email || '');
      if (field === 'address') this.profileForm.controls['fullAddress'].setValue(this.profile.fullAddress || '');
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

    if (field === 'mobile') this.profileForm.controls['phoneNumber'].markAsTouched();
    if (field === 'email') this.profileForm.controls['email'].markAsTouched();
    if (field === 'address') this.profileForm.controls['fullAddress'].markAsTouched();

    if (this.profileForm.invalid) {
      this.snackBar.open('Please fix validation errors before saving.', 'Close', { duration: 3000 });
      return;
    }

    const payload = {
      userName: this.profileForm.value.userName || this.profile.userName || this.profile.displayName || '',
      phoneNumber: this.profileForm.value.phoneNumber,
      email: this.profileForm.value.email,
      fullAddress: this.profileForm.value.fullAddress
    };

    this.saving = true;
    const headers = this.getAuthHeaders();
    const url = this.UPDATE_PROFILE_URL +
      '?enabled=true&password=string&username=string&authorities=%5B%7B%22authority%22%3A%22string%22%7D%5D&accountNonExpired=true&accountNonLocked=true&credentialsNonExpired=true';

    this.http.put<any>(url, payload, { headers }).subscribe({
      next: (res) => {
        this.saving = false;
        if (res?.status && res?.data) {
          this.profile = res.data;

          this.profileForm.patchValue({
            phoneNumber: this.profile.phoneNumber || '',
            email: this.profile.email || '',
            fullAddress: this.profile.fullAddress || '',
            userName: this.profile.userName || ''
          });

          this.editField = null;
          this.snackBar.open('Profile updated successfully.', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(res?.message || 'Update failed', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error('Update error', err);
        this.saving = false;
        const message = err?.error?.message || 'Failed to update profile';
        this.snackBar.open(message, 'Close', { duration: 3500 });
      }
    });
  }
}
