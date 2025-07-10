import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Authorization } from '../authorization/authorization';

@Component({
  selector: 'app-auth-modal',
  imports: [
    CommonModule,
    Authorization
  ],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.scss'
})
export class AuthModal {
@Input() authMode: 'login' | 'signup' = 'login';

  setMode(mode: 'login' | 'signup') {
    this.authMode = mode;
  }
}
