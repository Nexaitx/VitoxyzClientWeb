import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Authorization } from "@src/app/pages/authorization/authorization"; // For using routerLink
import { API_URL, ENDPOINTS } from '@src/app/core/const';
import { HttpClient } from '@angular/common/http';

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
  isLoggedIn: boolean = false;
  mobileBreakpoint = 768;
  isMobile = false;
  redirectAfterLogin: string | null = null; // ✅ added for redirection after login
  navItems: NavItem[] = [
    { label: 'Pharmacy', icon: 'fi-rr-medicine', link: '/medicines' },
    { label: 'Book Staff', icon: 'fi-rr-together-people', link: '/book-staff' },
    { label: 'Diet Plans', icon: 'fi-rr-salad', link: '/diet/user-onboarding' },
    { label: 'Profile', icon: 'fi-rr-user-pen', link: '/user-profile' }
  ];
  authMode: 'login' | 'signup' | 'forgotPassword' = 'login';
  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.checkMobileView();
     this.checkLoginStatus();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobileView();
  }

  private checkMobileView() {
    this.isMobile = window.innerWidth <= this.mobileBreakpoint;
  }
  // get isLoggedIn(): boolean {
  //   return !!localStorage.getItem('authToken'); // your login check
  // }
  checkLoginStatus(): void {
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;

    if (this.isLoggedIn && this.redirectAfterLogin) {
      const redirectPath = this.redirectAfterLogin;
      this.redirectAfterLogin = null;
      if (redirectPath === '/diet') {
        this.navigateToDiet(); // ✅ smart redirect
      } else {
        this.router.navigate([redirectPath]);
      }

    }
  }
  setAuthMode(mode: 'login' | 'signup') {
    this.authMode = mode;
  }
  // Handle navigation for footer items
  navigate(item: NavItem) {
    // ========== Special Case: Diet Plans ==========
    if (item.label === 'Diet Plans') {

      // User not logged in → open login modal
      if (!this.isLoggedIn) {
        this.authMode = 'login';
        localStorage.setItem('redirectAfterLogin', 'diet-check');

        const modalElement = document.getElementById('authModal');
        if (modalElement) {
          const modal = new (window as any).bootstrap.Modal(modalElement);
          modal.show();
        }
        return;
      }

      // User is logged in → check diet plan API
      this.navigateToDiet();
      return;
    }
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
  private hasActiveDietPlan(): boolean {
    const profileStr = localStorage.getItem('userProfile');
    if (!profileStr) return false;

    try {
      const profile = JSON.parse(profileStr);
      return profile?.hasActiveSubscription === true;
    } catch {
      return false;
    }
  }
  navigateToDiet() {
    const token = localStorage.getItem("authToken");

    // 1. USER NOT LOGGED IN
    if (!token) {
      this.redirectAfterLogin = "/diet";

      const modalEl =
        document.getElementById("loginModal") ||
        document.getElementById("authModal");

      if (modalEl) {
        const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
        this.setAuthMode("login");
        modal.show();
      }
      return;
    }

    // 2️⃣ Logged in → check backend subscription flag
    const hasPlan = this.hasActiveDietPlan();

    if (hasPlan) {
      this.router.navigate(['/diet-charts']);
    } else {
      this.router.navigate(['/diet/user-onboarding']);
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
    if (redirectUrl === 'diet-check') {
      this.navigateToDiet();
      return;
    }
    if (redirectUrl) {
      // If user clicked Book Staff, redirect there
      this.router.navigate([redirectUrl]);
    } else {
      // Otherwise, go to dashboard by default
      this.router.navigate(['/dashboard']);
    }
  }

}
