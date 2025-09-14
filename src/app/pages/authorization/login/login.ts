import { Component, inject, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Submission } from '../../submission/submission';
import { Subscription, interval } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { ENDPOINTS, API_URL } from '../../../core/const';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Submission,
    MatTabsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  loginForm!: FormGroup;
  phoneLoginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  showPhoneInput = true;
  selectedTabIndex: number = 0; // 0 for email/password, 1 for phone/OTP
  timeLeft: number = 30;
  private otpTimerSubscription: Subscription | undefined;
  phoneNumber: string = ''; // Will be set from the form
  maskedPhoneNumber: string = ''; // Initialize here or in ngOnInit
 @Input() authMode: 'login' | 'signup' | 'forgotPassword' = 'login';
  @Output() authModeChange = new EventEmitter<'login' | 'signup' | 'forgotPassword'>();
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() loadingChange = new EventEmitter<boolean>();

  constructor() {
    this.initForms();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.otpTimerSubscription?.unsubscribe();
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(14)]],
      rememberMe: [true]
    });

    this.phoneLoginForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?\d{10,14}$/)]], // Basic phone number validation
      otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]] // 6-digit OTP
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  goToForgotPassword() {
    this.authModeChange.emit('forgotPassword');
  }

  private maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    const countryCodeMatch = phone.match(/^\+\d{1,3}/);
    let countryCode = '';
    let numberPart = phone;
    if (countryCodeMatch) {
      countryCode = countryCodeMatch[0];
      numberPart = phone.substring(countryCode.length);
    }
    if (numberPart.length < 2) return phone;
    const lastTwoDigits = numberPart.slice(-2);
    const maskedPart = '*'.repeat(numberPart.length - 2);
    return `${countryCode}${maskedPart}${lastTwoDigits}`;
  }

  resendOtp(): void {
    console.log('Resending OTP...');
    this.isLoading = true;
    setTimeout(() => {
      console.log('OTP Resent (simulated)');
      this.startOtpTimer();
      this.isLoading = false;
    }, 1000);
  }

  startOtpTimer(): void {
    this.timeLeft = 30; // Reset the timer
    this.otpTimerSubscription?.unsubscribe(); // Unsubscribe from any previous timer
    this.otpTimerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.otpTimerSubscription?.unsubscribe(); // Stop the timer when it reaches 0
      }
    });
  }

  //login and save its profile
  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    } else {
      this.isLoading = true;
      this.loadingChange.emit(true);
      const { username, password, rememberMe } = this.loginForm.value;
      const apiUrl = API_URL + ENDPOINTS.LOGIN_EMAIL;
      const payload = { username, password };
      this.http.post(apiUrl, payload).subscribe((res: any) => {
        this.isLoading = false;
        localStorage.setItem('userProfile', JSON.stringify(res.profile));
        if (rememberMe) {
          localStorage.setItem('authToken', res.token);
          this.loginSuccess.emit();
        }
        this.loadingChange.emit(false);
      },
        error => {
          let errorMessage = 'Login failed. Please try again.';
          if (error.error && typeof error.error === 'object' && error.error.message) {
            errorMessage = `Login failed: ${error.error.message}`;
          } else if (typeof error.error === 'string' && error.error.length > 0) {
            errorMessage = `Login failed: ${error.error}`;
          } else if (error.status === 401) {
            errorMessage = 'Invalid credentials. Please check your email and password.';
          } else if (error.status === 0) {
            errorMessage = 'Could not connect to the server. Please check your internet connection.';
          }
          alert(errorMessage);
          this.isLoading = false;
          this.loadingChange.emit(false);
        }
      )
    }
  }

  sendOtp(): void {
    if (this.phoneLoginForm.get('phoneNumber')?.invalid) {
      this.phoneLoginForm.get('phoneNumber')?.markAsTouched();
      return;
    }
    this.isLoading = true;
    this.phoneNumber = this.phoneLoginForm.get('phoneNumber')?.value;
    this.maskedPhoneNumber = this.maskPhoneNumber(this.phoneNumber);

    this.http.post(`${API_URL}${ENDPOINTS.SEND_OTP_LOGIN}?phoneNumber=${this.phoneNumber}`, {}).subscribe({
      next: (response: any) => {
        this.showPhoneInput = false;
        this.startOtpTimer();
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to send OTP', error);
        let errorMessage = 'Failed to send OTP. Please try again.';
        if (error.error && error.error.message) {
          errorMessage = `Failed to send OTP: ${error.error.message}`;
        }
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  verifyOtp(): void {
    if (this.phoneLoginForm.get('otpCode')?.invalid) {
      this.phoneLoginForm.get('otpCode')?.markAsTouched();
      console.log('OTP form is invalid');
      return;
    }
    this.isLoading = true;
    const otpCode = this.phoneLoginForm.get('otpCode')?.value;
    const payload = { phoneNumber: this.phoneNumber, otp: otpCode };
    this.http.post(`${API_URL}${ENDPOINTS.VERIFY_OTP_LOGIN}?phoneNumber=${this.phoneNumber}&otp=${otpCode}`, {}).subscribe({
      next: (response: any) => {
        // console.log('OTP verified successfully', response);
                this.isLoading = false;

                localStorage.setItem('userProfile', JSON.stringify(response.profile));
          localStorage.setItem('authToken', response.token);
          this.loginSuccess.emit();

        // this.router.navigate(['/dashboard']); // Navigate to dashboard on success
      },
      error: (error: HttpErrorResponse) => {
        console.error('OTP verification failed', error);
        let errorMessage = 'OTP verification failed. Please try again.';
        if (error.error && error.error.message) {
          errorMessage = `OTP verification failed: ${error.error.message}`;
        } else if (error.status === 400) {
          errorMessage = 'Invalid OTP or OTP expired.';
        }
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

//   verifyOtp(): void {
//     console.log('verifyOtp() clicked');
    
//   if (this.phoneLoginForm.get('otpCode')?.invalid) {
//     this.phoneLoginForm.get('otpCode')?.markAsTouched();
//     console.log('OTP form is invalid');
//     return;
//   }

//   this.isLoading = true;
//   const otpCode = this.phoneLoginForm.get('otpCode')?.value;
//   const payload = { phoneNumber: this.phoneNumber, otp: otpCode };

//   console.log('🔹 Verify OTP Payload:', payload);
//   console.log('🔹 Verify OTP URL:', API_URL + ENDPOINTS.VERIFY_OTP);

//   this.http.post(`${API_URL}${ENDPOINTS.VERIFY_OTP_LOGIN}?phoneNumber=${this.phoneNumber}&otp=${otpCode}`, {}).subscribe({
//     next: (response: any) => {
//       console.log('✅ OTP verified successfully', response);
//       this.router.navigate(['/dashboard']);
//       this.isLoading = false;
//     },
//     error: (error: HttpErrorResponse) => {
//       console.error('❌ OTP verification failed:', error);
//       this.isLoading = false;
//     }
//   });
// }

}
