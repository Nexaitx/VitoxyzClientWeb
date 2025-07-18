import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators

} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Submission } from '../../submission/submission';
import { API_URL, ENDPOINTS } from '../../../core/const';

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
  isLoading: boolean = false;
  @Input() authMode: 'login' | 'signup' = 'signup';
  @Output() signupSuccess = new EventEmitter<void>(); 
  @Output() loadingChange = new EventEmitter<boolean>();
  private router = inject(Router);
  private http = inject(HttpClient);
  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        userName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        roleType: "User"
      }, { validators: passwordMatchValidator }
    );
    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      this.signupForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      const confirmPasswordCtrl = this.signupForm.get('confirmPassword');
      if (confirmPasswordCtrl?.hasError('passwordMismatch')) {
        confirmPasswordCtrl.setErrors({ passwordMismatch: true });
      }
      console.log('❌ Form is invalid.');
      return;
    } else {
      this.isLoading = true;
      this.loadingChange.emit(true);
      const apiUrl = API_URL + ENDPOINTS.SIGN_UP;
      this.http.post(apiUrl, this.signupForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log('✅ Signup successful:', res);
          //alert('Signup successful! Now redirecting...');
          this.signupSuccess.emit();
          this.loadingChange.emit(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.loadingChange.emit(false);
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