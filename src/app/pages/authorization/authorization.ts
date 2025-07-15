import { Component, Input, SimpleChanges } from '@angular/core';
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
  @Input() authMode: 'login' | 'signup' = 'login';

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authMode']) {
    }
  }
  
}