import { Component, EventEmitter, Input, Output, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-filter.html',
  styleUrls: ['./sidebar-filter.scss']
})
export class SidebarFilterComponent implements OnInit {
  // Input Properties
  @Input() categories: { label: string, value: string }[] = [];
  @Input() brands: { name: string, count: number }[] = [];
  @Input() disabled: boolean = false;

  // Output Events
  @Output() categorySelected = new EventEmitter<string>();
  @Output() brandSelected = new EventEmitter<string[]>();

  // Internal State
  selectedBrands: string[] = [];
    
  // --- NEW MOBILE STATE ---
  isMobile: boolean = false;
  isFilterPanelOpen: boolean = false; // Controls the mobile bottom sheet/overlay
  
  // Define mobile breakpoint (e.g., standard tablet/mobile cutoff)
  private mobileBreakpoint: number = 768; 
  // -------------------------

  ngOnInit(): void {
    this.checkIsMobile();
  }

  /**
   * Check screen size and update isMobile flag
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkIsMobile();
  }

  private checkIsMobile(): void {
    this.isMobile = window.innerWidth <= this.mobileBreakpoint;
    
    // Safety check: If screen becomes desktop size, close the mobile panel
    if (!this.isMobile && this.isFilterPanelOpen) {
      this.isFilterPanelOpen = false;
    }
  }

  /**
   * Toggle the mobile filter panel (bottom sheet)
   */
  toggleFilterPanel(): void {
    if (this.isMobile) {
      this.isFilterPanelOpen = !this.isFilterPanelOpen;
    }
  }

  /**
   * Close the mobile filter panel
   */
  closeFilterPanel(): void {
    this.isFilterPanelOpen = false;
  }
    
  /**
   * Handle category click
   */
  onCategoryClick(categoryValue: string): void {
    if (!this.disabled) {
      console.log('🎯 Category clicked:', categoryValue);
      this.categorySelected.emit(categoryValue);
        
      // If on mobile, close the panel after a category is selected
      if (this.isMobile) {
        this.closeFilterPanel();
      }
    } else {
      console.log('⏳ Category click blocked - loading in progress');
    }
  }

  /**
   * Handle brand toggle
   */
  onBrandToggle(brand: string, event: Event): void {
    if (!this.disabled) {
      const inputElement = event.target as HTMLInputElement;
      
      if (inputElement.checked) {
        this.selectedBrands.push(brand);
      } else {
        this.selectedBrands = this.selectedBrands.filter(b => b !== brand);
      }
      
      console.log('🎯 Brands selected:', this.selectedBrands);
      
      // Note: We don't emit here immediately on mobile. Emission happens on Apply button click (in HTML).
      // If we are NOT on mobile, we emit immediately as it's a permanent sidebar.
      if (!this.isMobile) {
        this.brandSelected.emit(this.selectedBrands);
      }
      
    } else {
      console.log('⏳ Brand toggle blocked - loading in progress');
      event.preventDefault();
    }
  }
    
  /**
   * Emit filters when 'Apply Filters' button is clicked on mobile
   */
  applyMobileFilters(): void {
    if (this.isMobile) {
      this.brandSelected.emit(this.selectedBrands);
      this.closeFilterPanel();
    }
  }
}
