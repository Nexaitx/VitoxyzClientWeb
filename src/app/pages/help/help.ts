import { Component } from '@angular/core';
import { Authorization } from '../authorization/authorization';

@Component({
  selector: 'app-help',
  imports: [
    Authorization
  ],
  templateUrl: './help.html',
  styleUrl: './help.scss'
})
export class Help {
  authToken = localStorage.getItem('authToken');
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn: boolean = false;
  showAuth = false;

  ngOnInit(): void {
    console.log(this.isLoggedIn);
    console.log(this.authToken)
  }

  onLoginSuccess() {
    this.isLoggedIn = true;
    this.showAuth = false;
    this.ngOnInit();
  }
  setAuthMode(mode: 'login' | 'signup') {
    this.authMode = mode;
  }
}
