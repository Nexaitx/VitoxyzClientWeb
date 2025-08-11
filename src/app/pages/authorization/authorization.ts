import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Login } from './login/login';
import { SignUp } from './sign-up/sign-up';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authorization',
  standalone: true,
  imports: [
    Login,
    SignUp,
    CommonModule
  ],
  templateUrl: './authorization.html',
  styleUrl: './authorization.scss'
})
export class Authorization {
  @Input() authMode: 'login' | 'signup' = 'login'; // Default mode is 'login'
  @ViewChild('authModal') authModalElement!: ElementRef;
  @Output() loginSuccess = new EventEmitter<void>();
  isChildLoading = false;
  constructor() {
  }

  ngOnInit() {
    console.log(this.authMode)
  }

  closeAuthModal() {
    const closeButton = this.authModalElement.nativeElement.querySelector('.btn-close');
    if (closeButton) {
      this.loginSuccess.emit();
      (closeButton as HTMLElement).click();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authMode']) {
    }
  }

}