import { Component } from '@angular/core';
import { Authorization } from '../authorization/authorization';
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-help',
  imports: [
    Authorization,
    Footer,
    MobileFooterNavComponent
  ],

  templateUrl: './help.html',
  styleUrl: './help.scss'
})
export class Help { 
  authToken = localStorage.getItem('authToken');
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn: boolean = false;
  showAuth = false;

  ngOnInit(): void { }

  onLoginSuccess() {
    this.isLoggedIn = true;
    this.showAuth = false;
    this.ngOnInit();
  }
  setAuthMode(mode: 'login' | 'signup') {
    this.authMode = mode;
  }
}
