import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface HealthItem {
  image: string;
  label: string;
  link: string;
}

@Component({
  selector: 'app-health-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-carousel.html',
  styleUrls: ['./health-carousel.scss']
})
export class HealthCarouselComponent implements AfterViewInit , OnDestroy {
  @Input() items: HealthItem[] = [];
  @ViewChild('carouselTrack', { static: true }) carouselTrack!: ElementRef;
  
  visibleItems: HealthItem[] = [];
  currentStartIndex: number = 0;
  readonly visibleCount = 8; 
  private slideInterval: any;
  
  // Touch scroll variables
  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  isMobile = false;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.checkMobileView();
    this.updateVisibleItems();

    // Auto-scroll every 5s only if not mobile
    if (!this.isMobile) {
      this.slideInterval = setInterval(() => {
        this.nextSlide();
      }, 5000000);
    }

    // Add touch event listeners for mobile
    if (this.isMobile) {
      this.addTouchListeners();
    }
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobileView();
  }

  private checkMobileView() {
    this.isMobile = window.innerWidth <= 768;
  }

  private addTouchListeners() {
    const track = this.carouselTrack.nativeElement;
    
    track.addEventListener('touchstart', (e: TouchEvent) => {
      this.isDragging = true;
      this.startX = e.touches[0].pageX - track.offsetLeft;
      this.scrollLeft = track.scrollLeft;
    });

    track.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.touches[0].pageX - track.offsetLeft;
      const walk = (x - this.startX) * 2;
      track.scrollLeft = this.scrollLeft - walk;
    });

    track.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  goToCategory(link: string) {
    if (link) this.router.navigate([link]);
  }

  nextSlide() {
    if (this.isMobile) return;
    
    this.currentStartIndex = (this.currentStartIndex + 1) % this.items.length;
    this.updateVisibleItems();
  }

  prevSlide() {
    if (this.isMobile) return;
    
    this.currentStartIndex =
      (this.currentStartIndex - 1 + this.items.length) % this.items.length;
    this.updateVisibleItems();
  }

  private updateVisibleItems() {
    if (this.isMobile) {
      // Mobile: show all items for scrolling
      this.visibleItems = [...this.items];
    } else {
      // Desktop: show limited items
      this.visibleItems = [];
      for (let i = 0; i < this.visibleCount; i++) {
        const index = (this.currentStartIndex + i) % this.items.length;
        this.visibleItems.push(this.items[index]);
      }
    }
  }
}
