import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from './login/login';
import { SignUp } from './sign-up/sign-up';
import * as bootstrap from 'bootstrap';
import { ForgotPassword } from "./forgot-password/forgot-password";
import { ResetPassword } from './reset-password/reset-password';

@Component({
  selector: 'app-authorization',
  standalone: true,
  imports: [
    CommonModule,
    Login,
    SignUp,
    ForgotPassword,
    ResetPassword
],
  templateUrl: './authorization.html',
  styleUrl: './authorization.scss'
})
export class Authorization implements AfterViewInit, OnChanges, OnDestroy {
  @Input() authMode: 'login' | 'signup' | 'forgotPassword' | 'resetPassword' = 'login';;

  @Input() showAuthModal: boolean = false;
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('authModal') authModalElement!: ElementRef;
  isChildLoading = false;
  private modalInstance: bootstrap.Modal | undefined;

  ngAfterViewInit() {
    this.modalInstance = new bootstrap.Modal(this.authModalElement.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    if (this.showAuthModal) {
      this.modalInstance.show();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showAuthModal'] && this.modalInstance) {
      if (this.showAuthModal) {
        this.modalInstance.show();
      } else {
        this.modalInstance.hide();
      }
    }
    if (changes['authMode']) {
      console.log('Auth mode changed to:', this.authMode);
    }
  }

  ngOnDestroy() {
    this.modalInstance?.dispose();
  }

  closeAuthModal() {
    this.showAuthModal = false;
    this.modalInstance?.hide();
    this.close.emit();
  }

  handleLoadingChange(isLoading: boolean) {
    this.isChildLoading = isLoading;
  }

  onLoginSuccess() {
    const modalEl = document.getElementById('authModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) ||
        new bootstrap.Modal(modalEl);
      modal.hide();
    }
    window.location.reload();
    this.loginSuccess.emit();
    this.closeAuthModal();
  }
}
