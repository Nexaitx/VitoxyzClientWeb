import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // For NgFor
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CdkMenuModule } from '@angular/cdk/menu';
// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Authorization } from '../../pages/authorization/authorization';
import { ProfileService } from '@src/app/core/services/profile.service';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-header',
  imports: [MatButtonModule,
    CommonModule,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatTabsModule,
    Authorization,
    CdkMenuModule,
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
   aadhaarNumber !: string;
  otp !: string;
  refId !: string;
  verificationResult: any;

  private profileService = inject(ProfileService)
  public router = inject(Router);
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn: boolean = false;
  isMobileMenuOpen = signal(false);
  menuItems = [
    { label: 'Medecines', path: '/medicines' },
    {
      label: 'Book Staff',
      dropdown: true,
      dropdownItems: [
        { label: 'Nurse', path: 'book-staff' },
        { label: 'Physiotherapist', path: 'book-staff' },
        { label: 'Baby-Sitter', path: 'book-staff' },
        { label: 'Security Guard', path: 'book-staff' },
        { label: 'Psychiatrist', path: 'book-staff' },
      ]
    },
    { label: 'Diet Plans', path: 'diet/user-onboarding' },
    // { label: 'Support', path: '/support' },
    {
      label: 'Profile',
      icon: 'bi bi-person-circle',
      dropdown: true,
      dropdownItems: [
        { label: 'My Profile', path: '/user-profile' },
        { label: 'My Orders', path: '/orders' },
        { label: 'Manage Payments', path: '' },
        { label: 'Settings', path: '/settings' },
        { label: 'Logout', path: '/logout' }
      ]
    },
    { label: 'Need Help?', path: '/help' }
  ];

 

  ngOnInit(): void {
   
    this.checkLoginStatus();
  }

  requestOtp() {
    this.profileService.requestAadhaarOtp(this.aadhaarNumber).subscribe(
      (response) => {
        this.refId = response.ref_id; // Store the reference ID
        console.log('OTP requested successfully. Reference ID:', this.refId);
      },
      (error) => console.error('Error requesting OTP:', error)
    );
  }

  verifyOtp() {
    // Make sure you have the OTP and the refId before calling this
    if (this.otp && this.refId) {
      this.profileService.verifyAadhaarOtp(this.otp, this.refId).subscribe(
        (response) => {
          this.verificationResult = response;
          console.log('Verification Result:', response);
        },
        (error) => console.error('Error verifying OTP:', error)
      );
    }
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;
  }

  setAuthMode(mode: 'login' | 'signup') {
    this.authMode = mode;
  }

  logout() {
    localStorage.removeItem('authToken');
    this.isLoggedIn = false;
    this.router.navigate(['/']); 
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  toggleNavbar() {
    const navbar = document.getElementById('navbarNav');
    this.isMobileMenuOpen.update((menu)=>!menu);
    if (!navbar) return;
    try {
      const instance = bootstrap.Collapse.getOrCreateInstance(navbar);
      // toggle based on current shown state
      if (navbar.classList.contains('show')) {
        instance.hide();
      } else {
        instance.show();
      }
    } catch (err) {
      // fallback to class toggle
      navbar.classList.toggle('show');
    }
  }
}
