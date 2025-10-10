import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For using routerLink

interface NavItem {
  label: string;
  icon: string; // This will hold the class name for the icon (e.g., 'bi-house-door')
  link: string;
  isSpecial?: boolean; // To highlight the 'Get Care Plan' button
}

@Component({
  selector: 'app-mobile-footer-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-footer-nav.html',
  styleUrl: './mobile-footer-nav.scss'
})
export class MobileFooterNavComponent implements OnInit {
  
  mobileBreakpoint = 768; 
  isMobile = false; 
  navItems: NavItem[] = [
    { label: 'Pharmacy', icon: 'fa-suitcase-medical', link: '' },
    { label: 'Book Staff', icon: 'fa-user-nurse', link: '/book-staff' },
    { label: 'Diet Plans', icon: 'fa-heart-circle-check', link: '/diet/user-onboarding' },
    { label: 'Profile', icon: 'fa-circle-user', link: '/user-profile' }
  ];

  constructor() { }

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
}
