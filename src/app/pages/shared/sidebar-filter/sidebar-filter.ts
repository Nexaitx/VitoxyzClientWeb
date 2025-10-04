import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-filter.html',
  styleUrls: ['./sidebar-filter.scss']
})
export class SidebarFilterComponent {
  // Input Properties
  @Input() categories: { label: string, value: string }[] = [];
  @Input() brands: { name: string, count: number }[] = [];
  @Input() disabled: boolean = false;

  // Output Events
  @Output() categorySelected = new EventEmitter<string>();
  @Output() brandSelected = new EventEmitter<string[]>();

  // Internal State
  selectedBrands: string[] = [];

  /**
   * Handle category click
   */
  onCategoryClick(categoryValue: string): void {
    if (!this.disabled) {
      console.log('🎯 Category clicked:', categoryValue);
      this.categorySelected.emit(categoryValue);
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
      this.brandSelected.emit(this.selectedBrands);
    } else {
      console.log('⏳ Brand toggle blocked - loading in progress');
      event.preventDefault(); // ✅ Prevent default behavior when disabled
    }
  }
}
