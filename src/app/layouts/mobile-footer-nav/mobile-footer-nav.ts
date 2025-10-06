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
  
  // Mobile breakpoint (768px is standard for mobile/tablet)
  mobileBreakpoint = 768; 
  isMobile = false; 

  navItems: NavItem[] = [
    { label: 'Home', icon: 'bi-house-door', link: '' },
    { label: 'Health Plans', icon: 'bi-file-text', link: '/plans' },
    { label: 'Get Care Plan', icon: 'bi-plus-circle-fill', link: '/care-plan', isSpecial: true }, // Special item
    { label: 'Book Staff', icon: 'bi-people', link: '/tests' },
    { label: 'Profile', icon: 'bi-person', link: '/profile' }
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
