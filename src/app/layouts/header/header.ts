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
    { label: 'Book Staff', path: '/locate-nurse' },
    { label: 'Lab Test', path: '/user-onboarding' },
    { label: 'Diet Plans', path: '/user-profile' },
    { label: 'Doctor Consultation', path: '/meera-ai' },
    { label: 'Support', path: '/support' },
    { label: 'Log in', path: '/login' },
    { label: 'Sign up', path: '/signup' },
    { label: 'Need Help?', path: '/help' }
  ];

  ngOnInit() {
    this.router.navigate([this.menuItems[1].path]);
  }
}
