import { Component, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleProductFormComponentComponent } from "../single-product-form/single-product-form";
import { SingleProductFormConfig } from '../single-product-form/single-product-form-component.interface';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-single-product-form-grid',
  standalone: true,
  imports: [CommonModule, SingleProductFormComponentComponent, MatIconModule],
  template: `
    <div class="single-product-form-grid">
      <div class="grid-header" *ngIf="title">
        <h2>{{ title }}</h2>
        <p *ngIf="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>

      <!-- Desktop Slider with Navigation -->
      <div class="grid-container" [class]="getGridClass()" #sliderContainer>
        @for (item of items; track item.productForm) {
          <app-single-product-form-component 
            [config]="item"
            class="grid-item">
          </app-single-product-form-component>
        }
      </div>

      <!-- Navigation Arrows for Desktop -->
      <div class="slider-nav" *ngIf="isDesktopView()">
        <button class="nav-btn prev" (click)="scrollLeft()">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button class="nav-btn next" (click)="scrollRight()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <!-- Scroll Indicators -->
      <div class="scroll-indicators" *ngIf="isDesktopView() && items.length > 4">
        @for (indicator of getScrollIndicators(); track indicator) {
          <div 
            class="indicator" 
            [class.active]="indicator === currentIndicator"
            (click)="scrollToIndicator(indicator)">
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./single-product-form-grid.scss']
})
export class SingleProductFormGridComponent implements AfterViewInit {
  @Input() items: SingleProductFormConfig[] = [];
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() columns: number = 3;
  @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLDivElement>;

  currentIndicator = 0;
  private isDesktop = window.innerWidth > 768;

  ngAfterViewInit() {
    this.setupScrollListener();
  }

  getGridClass(): string {
    if (this.isDesktop) {
      return 'grid-slider';
    } else if (window.innerWidth <= 480) {
      return 'grid-mobile';
    } else {
      return 'grid-tablet';
    }
  }

  isDesktopView(): boolean {
    return this.isDesktop;
  }

  scrollLeft(): void {
    if (this.sliderContainer) {
      const container = this.sliderContainer.nativeElement;
      const scrollAmount = 350; // Card width + gap
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.sliderContainer) {
      const container = this.sliderContainer.nativeElement;
      const scrollAmount = 350; // Card width + gap
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  scrollToIndicator(indicator: number): void {
    if (this.sliderContainer) {
      const container = this.sliderContainer.nativeElement;
      const scrollAmount = indicator * 350; // Card width * indicator index
      container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      this.currentIndicator = indicator;
    }
  }

  getScrollIndicators(): number[] {
    const visibleCards = Math.floor(this.sliderContainer?.nativeElement.clientWidth / 350) || 4;
    const totalIndicators = Math.ceil(this.items.length / visibleCards);
    return Array.from({ length: totalIndicators }, (_, i) => i);
  }

  private setupScrollListener(): void {
    if (this.sliderContainer && this.isDesktop) {
      const container = this.sliderContainer.nativeElement;
      container.addEventListener('scroll', () => {
        const scrollLeft = container.scrollLeft;
        const cardWidth = 350; // Approximate card width
        this.currentIndicator = Math.round(scrollLeft / cardWidth);
      });
    }
  }
}