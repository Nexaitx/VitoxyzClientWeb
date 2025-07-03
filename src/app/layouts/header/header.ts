import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For NgFor
import { Router, RouterModule, RouterOutlet } from '@angular/router';

// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar'; // For the navbar itself
import { MatButtonModule } from '@angular/material/button';   // For the navigation buttons
import { MatIconModule } from '@angular/material/icon';     // Optional: if you want icons
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-header',
  imports: [MatButtonModule,
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatTabsModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  public router = inject(Router);

  menuItems = [
    { label: 'Medecines', path: '/dashboard' },
    {
      label: 'Book Staff',
      dropdown: true,
      dropdownItems: [
        { label: 'Nurse', path: 'book-staff/book-nurse' },
        { label: 'Physiotherapist', path: 'book-staff/book-physiotherapist' },
        { label: 'Baby-Sitter', path: 'book-staff/book-baby-sitter' },
        { label: 'Security Guard', path: 'book-staff/book-security-guard' },
        { label: 'Psychiatrist', path: 'book-staff/book-psychiatrist' },
      ]
    },
    { label: 'Diet Plans', path: '/user-profile' },
    { label: 'Support', path: '/support' },
    { label: 'Log In', path: '/login' },
    { label: 'Sign up', path: '/sign-up' },
    {
      label: 'Profile', // This will be the key to identify your profile menu
      icon: 'bi bi-person-circle', // Example using Bootstrap Icons or Font Awesome class
      dropdown: true,
      dropdownItems: [
        { label: 'My Profile', path: '/profile' },
        { label: 'Settings', path: '/settings' },
        { label: 'Logout', path: '/logout' }
      ]
    },
    { label: 'Need Help?', path: '/help' }
  ];

  ngOnInit() {
  }
}
