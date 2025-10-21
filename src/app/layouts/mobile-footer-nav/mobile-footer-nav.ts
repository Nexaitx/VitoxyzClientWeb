import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Authorization } from "@src/app/pages/authorization/authorization"; // For using routerLink

interface NavItem {
  label: string;
  icon: string; // This will hold the class name for the icon (e.g., 'bi-house-door')
  link: string;
  isSpecial?: boolean; // To highlight the 'Get Care Plan' button
}

@Component({
  selector: 'app-mobile-footer-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, Authorization],
  templateUrl: './mobile-footer-nav.html',
  styleUrl: './mobile-footer-nav.scss'
})
export class MobileFooterNavComponent implements OnInit {
  
  mobileBreakpoint = 768; 
  isMobile = false; 
  navItems: NavItem[] = [
    { label: 'Pharmacy', icon: 'fa-suitcase-medical', link: '/medicines' },
    { label: 'Book Staff', icon: 'fa-user-nurse', link: '/book-staff' },
    { label: 'Diet Plans', icon: 'fa-heart-circle-check', link: '/diet/user-onboarding' },
    { label: 'Profile', icon: 'fa-circle-user', link: '/user-profile' }
  ];
authMode: 'login' | 'signup' | 'forgotPassword' = 'login';
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkMobileView();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobileView();
  }

  private checkMobileView() {
    this.isMobile = window.innerWidth <= this.mobileBreakpoint;
  }
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken'); // your login check
  }

  // Handle navigation for footer items
  navigate(item: NavItem) {
  if (item.label === 'Book Staff' && !this.isLoggedIn) {
    // Open login modal
    this.authMode = 'login';
    localStorage.setItem('redirectAfterLogin', item.link);

    const modalElement = document.getElementById('authModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  } else if (item.link) {
    this.router.navigate([item.link]);
  }
}

// Function to apply active class for current route
isActive(path: string): boolean {
  return this.router.url === path;
}
  // Call this after login is successful
  onLoginSuccess() {
  // Get the stored redirect URL
  const redirectUrl = localStorage.getItem('redirectAfterLogin');

  // Remove it so it doesn't persist
  localStorage.removeItem('redirectAfterLogin');

  if (redirectUrl) {
    // If user clicked Book Staff, redirect there
    this.router.navigate([redirectUrl]);
  } else {
    // Otherwise, go to dashboard by default
    this.router.navigate(['/dashboard']);
  }
}

}
