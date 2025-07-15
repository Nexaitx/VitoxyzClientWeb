import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Login } from './login/login';
import { SignUp } from './sign-up/sign-up';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap'; // Import Bootstrap's Modal object

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
  private bsModal!: Modal;
  constructor() {
  }

  ngOnInit() {
    console.log(this.authMode)
  }

  ngAfterViewInit() {
    this.bsModal = new Modal(this.authModalElement.nativeElement);
  }

  closeAuthModal() {
    if (this.bsModal) {
      this.bsModal.hide(); // Call Bootstrap's hide method
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authMode']) {
      console.log('authMode changed:', changes['authMode'].currentValue);
    }
  }
}