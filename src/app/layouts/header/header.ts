

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
    RouterLink
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

ngOnInit(): void {
  this.checkLoginStatus();

  // Count only distinct products in the cart
  this.cartService.cart$.subscribe(cart => {
    const uniqueProducts = new Set(cart.map(item => item.id));
    this.cartCount = uniqueProducts.size;
  });
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
      this.router.navigate([redirectPath]);
    }
  }
  setAuthMode(mode: 'login' | 'signup') {
    this.authMode = mode;
  }

  logout() {
    localStorage.removeItem('authToken');
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
// navigateToDiet() {
//   const token = localStorage.getItem("authToken");

//   if (!token) {
//     // Not logged in → open login modal
//     const modal = new (window as any).bootstrap.Modal(
//       document.getElementById("loginModal")
//     );
//     modal.show();
//     return;
//   }

//   // Logged in → check if user purchased a diet plan
//  // this.http.get(`${API_URL}${ENDPOINTS.DIET_DASHBOARD}?id=1073741824&username=string&password=string&authorities=%5B%7B%22authority%22%3A%22string%22%7D%5D&userType=string&enabled=true&accountNonExpired=true&accountNonLocked=true&credentialsNonExpired=true`, {
//    this.http.get(`${API_URL}${ENDPOINTS.DIET_DASHBOARD}` , {
//   headers: { Authorization: `Bearer ${token}` }
//   }).subscribe({
//     next: (res: any) => {
//        console.log("Diet Dashboard Response:", res);
//        const hasPlan = res?.totalPlans > 0;

//       if (hasPlan) {
//         this.router.navigate(["diet-charts"]);
//       } else {
//         this.router.navigate(["diet/user-onboarding"]);
//       }
//     },
//     error: () => {
//       this.router.navigate(["diet/user-onboarding"]);
//     }
//   });
// }
navigateToDiet() {
  const token = localStorage.getItem("authToken");

  // 1. USER NOT LOGGED IN
  if (!token) {
    this.redirectAfterLogin = "diet";

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

  // 2. USER LOGGED IN → CHECK LOCAL PURCHASE STATUS
  const planStatus = localStorage.getItem("dietPlanPurchased");

  const hasPlan = planStatus === "true";

  if (hasPlan) {
    this.router.navigate(["/diet-charts"]);
  } else {
    this.router.navigate(["/diet/user-onboarding"]);
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
