import { Component, inject, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Submission } from '../../submission/submission';
import { Subscription, interval } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { ENDPOINTS, API_URL } from '../../../core/const';

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
  private fb = inject(FormBuilder); // Inject FormBuilder
  loginForm!: FormGroup; // For email/password login
  phoneLoginForm!: FormGroup; // For phone/OTP login
  showPassword = false;
  isLoading = false;
  // authMethod: 'password' | 'otp' = 'password'; // No longer needed with tabs
  // usePassword = true; // No longer needed with tabs
  // useOtp = false; // No longer needed with tabs
  //rememberMe = true;
  // button = 'Next'; // Button text is now dynamic per form/state
  showPhoneInput = true; // Controls visibility of phone input vs. OTP input
  selectedTabIndex: number = 0; // 0 for email/password, 1 for phone/OTP
  timeLeft: number = 30;
  private otpTimerSubscription: Subscription | undefined;
  phoneNumber: string = ''; // Will be set from the form
  maskedPhoneNumber: string = ''; // Initialize here or in ngOnInit
  @Input() authMode: 'login' | 'signup' = 'login'; // Default mode is 'login'
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() loadingChange = new EventEmitter<boolean>();
  constructor() {
    this.initForms();
  }

  ngOnInit() {
    // No initial timer start here, as it depends on phone input submission
  }

  ngOnDestroy() {
    this.otpTimerSubscription?.unsubscribe();
  }

  private initForms(): void {
    // Form for Email/Password Login
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true]
    });

    // Form for Phone/OTP Login
    this.phoneLoginForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?\d{10,14}$/)]], // Basic phone number validation
      otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]] // 6-digit OTP
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 4) return phone; // Handle invalid input or very short numbers
    const countryCodeMatch = phone.match(/^\+\d{1,3}/); // Matches + followed by 1-3 digits
    let countryCode = '';
    let numberPart = phone;
    if (countryCodeMatch) {
      countryCode = countryCodeMatch[0];
      numberPart = phone.substring(countryCode.length);
    }
    if (numberPart.length < 2) return phone; // Ensure at least 2 digits to show
    const lastTwoDigits = numberPart.slice(-2);
    const maskedPart = '*'.repeat(numberPart.length - 2);
    return `${countryCode}${maskedPart}${lastTwoDigits}`;
  }

  resendOtp(): void {
    console.log('Resending OTP...');
    this.isLoading = true;
    // In a real application, you would make an API call here to resend OTP
    // For demonstration, we just simulate success and restart the timer
    setTimeout(() => {
      console.log('OTP Resent (simulated)');
      this.startOtpTimer();
      this.isLoading = false;
    }, 1000); // Simulate API call delay
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

  // --- Email/Password Login Methods ---
  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.log('Email/Password form is invalid');
      return;
    } else {
      this.isLoading = true;
      this.loadingChange.emit(true);
      const { username, password, rememberMe } = this.loginForm.value;
      const apiUrl = API_URL + ENDPOINTS.LOGIN_EMAIL;
      const payload = { username, password }; // Assuming your API expects 'username' and 'password'
      this.http.post(apiUrl, payload).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('Email/Password Login successful', response);
          localStorage.setItem('userProfile', JSON.stringify(response.profile));

          // Store token/user data if rememberMe is true, or in session storage
          if (rememberMe) {
            localStorage.setItem('authToken', response.token);
          } else {
            sessionStorage.setItem('authToken', response.token);
            sessionStorage.setItem('userProfile', JSON.stringify(response.profile));

          }
           console.log('Stored token:', rememberMe ? localStorage.getItem('token') : sessionStorage.getItem('token'));
          console.log('Stored profile:', rememberMe ? 
            JSON.parse(localStorage.getItem('userProfile') || '{}') : 
            JSON.parse(sessionStorage.getItem('userProfile') || '{}'));
          
          this.loginSuccess.emit();
          this.loadingChange.emit(false);
          this.router.navigate(['/dashboard']);

          
        },
        error: (error: HttpErrorResponse) => {
          console.error('Email/Password Login failed', error);
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
          // Display error message to user (e.g., using a MatSnackBar)
          alert(errorMessage); // For simplicity, using alert
          this.isLoading = false;
          this.loadingChange.emit(false);
        }
      });
    }

  }

  sendOtp(): void {
    if (this.phoneLoginForm.get('phoneNumber')?.invalid) {
      this.phoneLoginForm.get('phoneNumber')?.markAsTouched();
      console.log('Phone number form is invalid');
      return;
    }

    this.isLoading = true;
    this.phoneNumber = this.phoneLoginForm.get('phoneNumber')?.value;
    this.maskedPhoneNumber = this.maskPhoneNumber(this.phoneNumber);


    this.http.post(API_URL + ENDPOINTS.SEND_OTP, { phoneNumber: this.phoneNumber }).subscribe({
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
    this.http.post(API_URL + ENDPOINTS.VERIFY_OTP, payload).subscribe({
      next: (response: any) => {
        console.log('OTP verified successfully', response);
        this.router.navigate(['/dashboard']); // Navigate to dashboard on success
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('OTP verification failed', error);
        let errorMessage = 'OTP verification failed. Please try again.';
        if (error.error && error.error.message) {
          errorMessage = `OTP verification failed: ${error.error.message}`;
        } else if (error.status === 400) {
          errorMessage = 'Invalid OTP or OTP expired.';
        }
        alert(errorMessage); // For simplicity, using alert
        this.isLoading = false;
      }
    });
  }
}
