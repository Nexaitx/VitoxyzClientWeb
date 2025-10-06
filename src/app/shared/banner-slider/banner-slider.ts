import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-slider.html',
  styleUrls: ['./banner-slider.scss']
})
export class BannerSliderComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];  
  @Input() autoSlide = true;
  @Input() slideInterval = 3000;    // 3 seconds default

  currentIndex = 0;
  intervalId: any;

  ngOnInit() {
    if (this.autoSlide) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    this.clearAutoSlide();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, this.slideInterval);
  }

  clearAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }
}
