import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators

} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Added HttpClient
import { Submission } from '../../submission/submission';
import { API_URL, ENDPOINTS } from '../../../core/const';
import { SpinnerToastService } from '../../../core/toasts/spinner-toast/spinner-toast.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    Submission
  ],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss']
})

export class SignUp {
  signupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  button = 'Sign Up';
  @Input() authMode: 'login' | 'signup' = 'signup';
  private router = inject(Router);
  private http = inject(HttpClient);
  constructor(private fb: FormBuilder, private spinnerService: SpinnerToastService) {
  }

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        userName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        latitude: [],
        longitude: [],
        roleType: "User"
      }, { validators: passwordMatchValidator }
    );
    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      this.signupForm.get('confirmPassword')?.updateValueAndValidity();
    });
    this.getUserLocation();
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.signupForm.patchValue({
            latitude: lat,
            longitude: lng,
          });
        },
        error => {
          console.error('Geolocation failed:', error);
        }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
    }
  }

  onSubmit(): void {
    debugger
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      const confirmPasswordCtrl = this.signupForm.get('confirmPassword');
      if (confirmPasswordCtrl?.hasError('passwordMismatch')) {
        confirmPasswordCtrl.setErrors({ passwordMismatch: true });
      }
      console.log('❌ Form is invalid.');
      return;
    } else {
      const {
        userName,
        email,
        phoneNumber,
        address,
        city,
        pinCode,
        password,
        confirmPassword,
        latitude,
        longitude,
        roleType
      } = this.signupForm.value;

      const signupPayload = {
        userName,
        email,
        phoneNumber,
        password,
        confirmPassword,
        address,
        city,
        pinCode: Number(pinCode),
        latitude,
        longitude,
        roleType
      };
      this.spinnerService.show();
      //post to backend API
      const apiUrl = API_URL + ENDPOINTS.SIGN_UP;
      this.http.post(apiUrl, signupPayload).subscribe({
        next: (res) => {
          this.spinnerService.hide();
          console.log('✅ Signup successful:', res);
          alert('Signup successful! Now redirecting...');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          debugger
          this.spinnerService.hide();
          console.error('❌ Signup failed:', err);
          alert(err.error.message);
        }
      });
    }
  }
}

// Password Match Validator
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
    return null; // Don't validate if controls are not present or values are empty
  }

  if (password.value !== confirmPassword.value) {
    // Set the error on the confirmPassword control directly
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true }; // Also return at the group level for general form validity
  } else {
    // If passwords match, clear the error from confirmPassword
    if (confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
};