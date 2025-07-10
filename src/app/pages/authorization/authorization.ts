import { Component, Input, SimpleChanges } from '@angular/core';
import { Login } from './login/login';
import { SignUp } from './sign-up/sign-up';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authorization',
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

  constructor() {
  }
  ngOnInit() {
    console.log(this.authMode)
  }
   ngOnChanges(changes: SimpleChanges): void {
    if (changes['authMode']) {
      console.log('authMode changed:', changes['authMode'].currentValue);
    }
  }
}