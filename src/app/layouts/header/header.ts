

import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CdkMenuModule } from '@angular/cdk/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Authorization } from '../../pages/authorization/authorization';
import { ProfileService } from '@src/app/core/services/profile.service';
import { FormsModule } from '@angular/forms';
import { CartService } from '@src/app/core/cart.service';
import { HttpClient } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '@src/app/core/const';
import { Search } from "../search/search";
declare var bootstrap: any;

@Component({
  selector: 'app-header',
  
  imports: [
    MatButtonModule,
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
    RouterLink,
    Search
],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit, OnDestroy {
  aadhaarNumber!: string;
  otp!: string;
  refId!: string;
  verificationResult: any;
constructor(private http: HttpClient) {}
  private profileService = inject(ProfileService);
   private cartService = inject(CartService);
  public router = inject(Router);
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn: boolean = false;
  isSidebarOpen = false;
  isMobileMenuOpen = signal(false);
cartCount: number = 0;
  currentLocation: string = '';
  openSubmenus = new Set<number>();
  redirectAfterLogin: string | null = null; // ✅ added for redirection after login

  menuItems = [
    { label: 'Medicines', icon: 'fi-rr-medicine' , path: '/medicines' },
    {
      label: 'Book Staff',
      icon: 'fi-rr-together-people',
       path: '/book-staff'
      // dropdown: true,
      // dropdownItems: [
      //   { label: 'Nurse', path: '/book-staff' },
      //   { label: 'Physiotherapist', path: '/book-staff' },
      //   { label: 'Baby-Sitter', path: '/book-staff' },
      //   { label: 'Security Guard', path: '/book-staff' },
      //   { label: 'Psychiatrist', path: '/book-staff' }, diet/user-onboarding
      // ]
    },
    { label: 'Diet Plans', icon: 'fi-rr-salad',  path: 'diet/user-onboarding' },
    // { label: 'Diet Plans', icon: 'fi-rr-salad',  path: '/diet' },
    {
    label: 'Staff Booking History',
    icon: 'fi-rr-clipboard-list',
    path: '/view-staff-booking-history',
    mobileOnly: true
  },
    {
      label: 'Profile',
      icon: 'fi-rr-user-pen',
      dropdown: true,
      dropdownItems: [
        { label: 'My Profile', path: '/user-profile' },
        { label: 'My Orders', path: '/orders' },
        { label: 'Booked staff', path: '/view-staff' },
        { label: 'Staff Booking History', path: '/view-staff-booking-history' },
        // { label: 'Manage Payments', path: '' },
        // { label: 'Settings', path: '/settings' },
        { label: 'Logout', path: '/logout' }
      ]
    },
    { label: 'Need Help?', icon: 'fi-rr-exclamation', path: '/help' },
  
  ];
profileMenuItems: any[] = [];

ngOnInit(): void {
  this.checkLoginStatus();
   this.detectLocation();
  // Count only distinct products in the cart
  this.cartService.cart$.subscribe(cart => {
    const uniqueProducts = new Set(cart.map(item => item.id));
    this.cartCount = uniqueProducts.size;
  });
    // ✅ extract profile dropdown items ONCE
  const profileItem = this.menuItems.find(item => item.label === 'Profile');
  this.profileMenuItems = profileItem?.dropdownItems || [];
}


  ngOnDestroy(): void {
   
    document.body.classList.remove('no-scroll');
  }

  // checkLoginStatus(): void {
  //   const token = localStorage.getItem('authToken');
  //   this.isLoggedIn = !!token;
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
   async detectLocation() {
    if (!navigator.geolocation) {
      this.currentLocation = 'Geolocation not supported';
      return;
    }

    this.currentLocation = 'Detecting...';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await response.json();

          if (data.address) {
            this.currentLocation =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              'Your Location';
          } else {
            this.currentLocation = 'Unknown Location';
          }
        } catch (error) {
          console.error('Error fetching location:', error);
          this.currentLocation = 'Unable to fetch location';
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.currentLocation = 'Location permission denied';
      }
    );
  }
  // logout() {
  //   localStorage.removeItem('authToken');
  //   this.isLoggedIn = false;
  //   this.router.navigate(['/']);
  // }
  logout(){
    const token = localStorage.getItem('authToken');
    if(token){
      this.http.post('https://vitoxyz.com/Backend/api/user/logoutUser',{},{
       headers :{
        Authorization:`Bearer ${token}`
       }
      }).subscribe({
        next:(res:any)=>{
          console.log('Logout API success:', res);
          this.clearSessionAndRedirect();
        },
          error: (err) => {
        console.error('Logout API failed:', err);
        // Even if API fails, still logout locally
        this.clearSessionAndRedirect();
      }
      });
    }else {
    this.clearSessionAndRedirect();
  }
  }
  private clearSessionAndRedirect(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('justLoggedIn');

  this.isLoggedIn = false;
  this.router.navigate(['/']);
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

  goToCart() {
    this.router.navigate(['/cart']);
  }
 handleMenuNavigation(path?: string) {
   if (!path) return;
    this.closeSidebar();


    if (!this.isLoggedIn) {
      this.redirectAfterLogin = path;
      // Not logged in → open auth modal
      const modalEl = document.getElementById('authModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        this.setAuthMode('login');
        modal.show();
      }
    } else {
      // Logged in → navigate normally
      this.router.navigate([path]);
    }
  }
 


  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.isMobileMenuOpen.update(m => !m);

    if (this.isSidebarOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    this.isMobileMenuOpen.set(false);
    document.body.classList.remove('no-scroll');
    this.openSubmenus.clear();
  }

  toggleSubmenu(idx: number) {
    if (this.openSubmenus.has(idx)) this.openSubmenus.delete(idx);
    else this.openSubmenus.add(idx);
  }

  isSubmenuOpen(idx: number): boolean {
    return this.openSubmenus.has(idx);
  }

  toggleNavbar() {
    const navbar = document.getElementById('navbarNav');
    this.isMobileMenuOpen.update(menu => !menu);
    if (!navbar) return;
    try {
      const instance = bootstrap.Collapse.getOrCreateInstance(navbar);
      if (navbar.classList.contains('show')) {
        instance.hide();
      } else {
        instance.show();
      }
    } catch (err) {
      navbar.classList.toggle('show');
    }
  }
}
