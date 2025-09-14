import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '../../../core/const';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  @Output() backToLogin = new EventEmitter<void>();
  @Output() loadingChange = new EventEmitter<boolean>();

  resetForm: FormGroup;
  isLoading = false;

  constructor() {
    this.resetForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }


  showPassword = false;
  showConfirmPassword = false;

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loadingChange.emit(true);

    const { phoneNumber, password,confirmPassword } = this.resetForm.value;
    const payload = { phoneNumber, newPassword: password, confirmPassword:confirmPassword };

    const apiUrl = API_URL + ENDPOINTS.RESET_PASSWORD;

    this.http.post(apiUrl, payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.loadingChange.emit(false);

        alert('✅ Password has been reset successfully!');
        this.backToLogin.emit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Reset password failed:', error);
        let errorMessage = 'Password reset failed. Please try again.';

        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = `Password reset failed: ${error.error.message}`;
        } else if (typeof error.error === 'string' && error.error.length > 0) {
          errorMessage = `Password reset failed: ${error.error}`;
        } else if (error.status === 0) {
          errorMessage = 'Could not connect to the server. Please check your internet connection.';
        }

        alert(errorMessage);
        this.isLoading = false;
        this.loadingChange.emit(false);
      }
    });
  }
}

