// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Output } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// @Component({
//   selector: 'app-forgot-password',
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './forgot-password.html',
//   styleUrl: './forgot-password.scss'
// })
// export class ForgotPassword {
//   @Output() goToReset = new EventEmitter<void>();
//   @Output() backToLogin = new EventEmitter<void>();
//   @Output() loadingChange = new EventEmitter<boolean>();

//   forgotForm: FormGroup;

//   constructor(private fb: FormBuilder) {
//     this.forgotForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]]
//     });
//   }

//   onSubmit() {
//     if (this.forgotForm.valid) {
//       this.loadingChange.emit(true);

//       // Simulate API call
//       setTimeout(() => {
//         alert('Password reset link sent to ' + this.forgotForm.value.email);
//         this.loadingChange.emit(false);
//        this.goToReset.emit(); 
//       }, 1500);
//     }
//   }
// }
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '../../../core/const';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  @Output() goToReset = new EventEmitter<void>();
  @Output() backToLogin = new EventEmitter<void>();
  @Output() loadingChange = new EventEmitter<boolean>();

  forgotForm: FormGroup;
  isLoading = false;

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loadingChange.emit(true);

    const { email } = this.forgotForm.value;
    const apiUrl = API_URL + ENDPOINTS.FORGOT_PASSWORD;
    const payload = { email };

    this.http.post(apiUrl, payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.loadingChange.emit(false);

        alert(res.message || `Password reset link sent to ${email}`);
        this.goToReset.emit(); // move to reset step
      },
      error: (error: HttpErrorResponse) => {
        console.error('Forgot Password failed', error);

        let errorMessage = 'Failed to send reset link. Please try again.';
        if (error.error && error.error.message) {
          errorMessage = `Error: ${error.error.message}`;
        } else if (error.status === 0) {
          errorMessage = 'Could not connect to the server. Check your internet.';
        }

        alert(errorMessage);
        this.isLoading = false;
        this.loadingChange.emit(false);
      }
    });
  }
}

