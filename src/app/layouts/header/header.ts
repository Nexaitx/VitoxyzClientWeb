import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For NgFor
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CdkMenuModule } from '@angular/cdk/menu';
// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar'; // For the navbar itself
import { MatButtonModule } from '@angular/material/button';   // For the navigation buttons
import { MatIconModule } from '@angular/material/icon';     // Optional: if you want icons
import { MatTabsModule } from '@angular/material/tabs';
import { Authorization } from '../../pages/authorization/authorization';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule,
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatTabsModule,
    Authorization,
    CdkMenuModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  public router = inject(Router);
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn: boolean = false;

  menuItems = [
    { label: 'Medecines', path: '/dashboard' },
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
    { label: 'Support', path: '/support' },
    {
      label: 'Profile',
      icon: 'bi bi-person-circle',
      dropdown: true,
      dropdownItems: [
        { label: 'My Profile', path: '/user-profile' },
        { label: 'My Orders', path: '' },
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
}
