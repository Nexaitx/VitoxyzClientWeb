import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment.development'; // Import your environment file
import { Submission } from '../book-staff/submission/submission';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    Submission
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  authMethod: 'password' | 'otp' = 'password';
  usePassword = true;
  useOtp = false;
  rememberMe = true;
  button = 'Login';

  constructor(
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true],
      otp: ['', Validators.required],
      otpCode: ['', Validators.required],
      otpPhone: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.log('Form is invalid');
      return;
    }

    this.isLoading = true; // Set loading to true before API call
    const { username, password } = this.loginForm.value;
    //  environment for api
    const apiUrl = `${environment.apiBaseUrl}api/user/loginWithPasswordUser`; // Assuming environment.apiBaseUrl is defined

    const payload = { username, password };

    this.http.post(apiUrl, payload).subscribe({
      next: (response: any) => {
        console.log('Login successful', response);
        this.router.navigate(['/dashboard']); // Navigate to dashboard on success
        this.isLoading = false; // Set loading to false on success
      },
      error: (error: HttpErrorResponse) => {
        console.error('Login failed', error);
        let errorMessage = 'Login failed. Please try again.';
        if (error.error && typeof error.error === 'object' && error.error.message) {
          // Check if error.error is an object and has a message property
          errorMessage = `Login failed: ${error.error.message}`;
        } else if (typeof error.error === 'string' && error.error.length > 0) {
          // Sometimes the error.error is a plain string
          errorMessage = `Login failed: ${error.error}`;
        } else if (error.status === 401) {
          errorMessage = 'Invalid credentials. Please check your email and password.';
        } else if (error.status === 0) {
          errorMessage = 'Could not connect to the server. Please check your internet connection.';
        }
        this.isLoading = false;
      }
    });
  }
}
