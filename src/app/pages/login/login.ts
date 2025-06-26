import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../src/environments/environment.development'; // Import your environment file
import { MatCheckboxModule } from '@angular/material/checkbox';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatCheckboxModule,
    RouterLink,
    HttpClientModule,
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  //styleUrl: './login.scss'
})
export class Login implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm!: FormGroup;
  hide = true; // For password visibility toggle
  isLoading = false; // New property for loading state
  authMethod: 'password' | 'otp' = 'password';
  usePassword = true;
  useOtp = false;
  rememberMe = true;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
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
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
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
        this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }
}
