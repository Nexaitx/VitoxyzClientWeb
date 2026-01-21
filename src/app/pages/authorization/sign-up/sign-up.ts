// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
// import {
//   AbstractControl,
//   FormBuilder,
//   FormGroup,
//   ReactiveFormsModule,
//   ValidatorFn,
//   Validators

// } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { Submission } from '../../submission/submission';
// import { API_URL, ENDPOINTS } from '../../../core/const';
// import { Toast } from 'bootstrap';
// import { MatTabsModule } from '@angular/material/tabs';

// @Component({
//   selector: 'app-sign-up',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     RouterModule,
//     Submission,
//     MatTabsModule
//   ],
//   templateUrl: './sign-up.html',
//   styleUrls: ['./sign-up.scss']
// })

// export class SignUp {
//   signupForm!: FormGroup;
//   showPassword = false;
//   showConfirmPassword = false;
//   button = 'Sign Up';
//   isLoading: boolean = false;
//   @Input() authMode: 'login' | 'signup' = 'signup';
//   @Output() signupSuccess = new EventEmitter<void>();
//   @Output() loadingChange = new EventEmitter<boolean>();
//   private router = inject(Router);
//   private http = inject(HttpClient);
//   constructor(private fb: FormBuilder) {
//   }
// selectedTabIndex = 0;

// orgSignupForm!: FormGroup;

//   ngOnInit(): void {
//     this.signupForm = this.fb.group(
//       {
//         userName: ['', Validators.required],
//         email: ['', [Validators.required, Validators.email]],
//         phoneNumber: ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(10),  Validators.pattern('^[0-9]*$') ]],
//         password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(14)]],
//         confirmPassword: ['', Validators.required],
//         roleType: "User"
//       }, { validators: passwordMatchValidator }
//     );
//     this.orgSignupForm = this.fb.group(
//     {
//       orgCategory: ['', Validators.required],
//       orgName: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
//       password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(14)]],
//       confirmPassword: ['', Validators.required],
//       roleType: "Organization"
//     }, { validators: passwordMatchValidator }
//   );
//     this.signupForm.get('password')?.valueChanges.subscribe(() => {
//       this.signupForm.get('confirmPassword')?.updateValueAndValidity();
//     });
//   }

//   onSubmit(): void {
//     if (this.signupForm.invalid) {
//       this.signupForm.markAllAsTouched();
//       const confirmPasswordCtrl = this.signupForm.get('confirmPassword');
//       if (confirmPasswordCtrl?.hasError('passwordMismatch')) {
//         confirmPasswordCtrl.setErrors({ passwordMismatch: true });
//       }
//       console.log('❌ Form is invalid.');
//       return;
//     } else {
//       this.isLoading = true;
//       this.loadingChange.emit(true);
//       const apiUrl = API_URL + ENDPOINTS.SIGN_UP;
//       this.http.post(apiUrl, this.signupForm.value).subscribe({
//         next: (res) => {
//           this.isLoading = false;
//           console.log('✅ Signup successful:', res);
//           //alert('Signup successful! Now redirecting...');
//           // ✨ Add this new block to show the Bootstrap toast
//           const toastElement = document.getElementById('loginToast');
//           if (toastElement) {
//             const toast = new Toast(toastElement);
//             toast.show();
//           }
//           this.signupSuccess.emit();
//           this.loadingChange.emit(false);
//           this.router.navigate(['/dashboard']);
//         },
//         error: (err) => {
//           this.isLoading = false;
//           this.loadingChange.emit(false);
//           console.error('❌ Signup failed:', err);
//           alert(err.error.message);
//         }
//       });
//     }
//   }
// }

// // Password Match Validator
// export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
//   const password = control.get('password');
//   const confirmPassword = control.get('confirmPassword');
//   if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
//     return null; // Don't validate if controls are not present or values are empty
//   }
//   if (password.value !== confirmPassword.value) {
//     // Set the error on the confirmPassword control directly
//     confirmPassword.setErrors({ passwordMismatch: true });
//     return { passwordMismatch: true }; // Also return at the group level for general form validity
//   } else {
//     // If passwords match, clear the error from confirmPassword
//     if (confirmPassword.hasError('passwordMismatch')) {
//       confirmPassword.setErrors(null);
//     }
//     return null;
//   }
// };







import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
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
import { Toast } from 'bootstrap';
import { MatTabsModule } from '@angular/material/tabs';
import { Submission } from '../../submission/submission';
import { API_URL, ENDPOINTS } from '../../../core/const';

// 🔹 Password Match Validator
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (!password || !confirmPassword || !password.value || !confirmPassword.value) return null;

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    if (confirmPassword.hasError('passwordMismatch')) confirmPassword.setErrors(null);
    return null;
  }
};

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    Submission,
    MatTabsModule
  ],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss']
})
export class SignUp implements OnInit {
  @Input() authMode: 'login' | 'signup' = 'signup';
  @Output() authModeChange = new EventEmitter<'login' | 'signup'>();
  @Output() signupSuccess = new EventEmitter<void>();
  @Output() loadingChange = new EventEmitter<boolean>();

  signupForm!: FormGroup;
  orgSignupForm!: FormGroup;

  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  selectedTabIndex = 0;

  private router = inject(Router);
  private http = inject(HttpClient);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        userName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10),   Validators.pattern(/^[0-9]{10}$/)]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(14)]],
        confirmPassword: ['', Validators.required],
        roleType: 'User'
      },
      { validators: passwordMatchValidator }
    );

    this.orgSignupForm = this.fb.group(
      {
        organizationCategory: ['', Validators.required],
        organizationName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(14)]],
        confirmPassword: ['', Validators.required],
        roleType: 'User'
      },
      { validators: passwordMatchValidator }
    );

    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      this.signupForm.get('confirmPassword')?.updateValueAndValidity();
    });
    this.orgSignupForm.get('password')?.valueChanges.subscribe(() => {
      this.orgSignupForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }
  
  onSignupSubmit(): void {
     console.log("personal created ");
        console.log("signup to login");
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loadingChange.emit(true);
    const apiUrl = API_URL + ENDPOINTS.SIGN_UP;

    this.http.post(apiUrl, this.signupForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.loadingChange.emit(false);

        const toastElement = document.getElementById('loginToast');
        if (toastElement) new Toast(toastElement).show();

        this.signupSuccess.emit();
        console.log("personal created ");
        this.showToastMessage('Account created successfully! Please log in.');
       console.log("✅ Signup successful, switching to login view...");
        this.authModeChange.emit('login');
                console.log("loginmode activated ");

      },
      error: (err) => {
        this.isLoading = false;
        this.loadingChange.emit(false);
         this.showToastMessage(
        err.error?.message || 'Signup failed. Please try again.',
        true
      );
      }
    });
  }

 onHandleSubmitOrg(): void {
  if (this.orgSignupForm.invalid) {
    this.orgSignupForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  this.loadingChange.emit(true);

  const apiUrl = API_URL + ENDPOINTS.SIGN_UP;

  this.http.post(apiUrl, this.orgSignupForm.value).subscribe({
    next: (res) => {
      this.isLoading = false;
      this.loadingChange.emit(false);

      const toastElement = document.getElementById('loginToast');
      if (toastElement) {
        new Toast(toastElement).show();
      }
this.showToastMessage('Account created successfully! Please log in.');
      // Navigate to login page or emit mode change
      this.signupSuccess.emit();
      console.log("✅ Signup successful, switching to login view...");
  // ✅ corrected method call (added 'this.')
      this.authModeChange.emit('login');
    },
    error: (err) => {
      this.isLoading = false;
      this.loadingChange.emit(false);
       this.showToastMessage(
        err.error?.message || 'Organization signup failed.',
        true
      );
    }
  });
}

private showToastMessage(message: string, isError: boolean = false): void {
  const toastElement = document.getElementById('loginToast');

  if (!toastElement) return;

  const toastBody = toastElement.querySelector('.toast-body');
  if (toastBody) {
    toastBody.textContent = message;
  }

  // toggle success / error color (NO NEW CLASSES)
  toastElement.classList.remove('text-bg-success', 'text-bg-danger');
  toastElement.classList.add(isError ? 'text-bg-danger' : 'text-bg-success');

  new Toast(toastElement, { delay: 3000 }).show();
}

  goToLogin(): void {
                        console.log("login naviagation ");

    this.router.navigate(['/login']);

  }


  togglePasswordVisibility(field: 'password' | 'confirm'): void {
  if (field === 'password') {
    this.showPassword = !this.showPassword;
  } else {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

}
