import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  @Output() goToReset = new EventEmitter<void>();
  @Output() backToLogin = new EventEmitter<void>();
  @Output() loadingChange = new EventEmitter<boolean>();

  forgotForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.loadingChange.emit(true);

      // Simulate API call
      setTimeout(() => {
        alert('Password reset link sent to ' + this.forgotForm.value.email);
        this.loadingChange.emit(false);
       this.goToReset.emit(); 
      }, 1500);
    }
  }
}
