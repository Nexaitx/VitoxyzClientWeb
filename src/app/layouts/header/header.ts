

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

  private profileService = inject(ProfileService);
  public router = inject(Router);
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn: boolean = false;
  isSidebarOpen = false;
  isMobileMenuOpen = signal(false);

  
  openSubmenus = new Set<number>();

  menuItems = [
    { label: 'Medicines', icon: 'fa-stethoscope' , path: '/medicines' },
    {
      label: 'Book Staff',
      icon: 'fa-user-nurse',
      dropdown: true,
      dropdownItems: [
        { label: 'Nurse', path: '/book-staff' },
        { label: 'Physiotherapist', path: '/book-staff' },
        { label: 'Baby-Sitter', path: '/book-staff' },
        { label: 'Security Guard', path: '/book-staff' },
        { label: 'Psychiatrist', path: '/book-staff' },
      ]
    },
    { label: 'Diet Plans', icon: 'fa-heart-circle-check',  path: 'diet/user-onboarding' },

    {
      label: 'Profile',
      icon: 'fa-circle-user',
      dropdown: true,
      dropdownItems: [
        { label: 'My Profile', path: '/user-profile' },
        { label: 'My Orders', path: '/orders' },
        { label: 'Manage Payments', path: '' },
        { label: 'Settings', path: '/settings' },
        { label: 'Logout', path: '/logout' }
      ]
    },
    { label: 'Need Help?', path: '/help' },
  ];

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  ngOnDestroy(): void {
   
    document.body.classList.remove('no-scroll');
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
 handleMenuNavigation(path: string) {
    this.closeSidebar();

    if (!this.isLoggedIn) {
      // Not logged in → open auth modal
      const modalEl = document.getElementById('authModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
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
