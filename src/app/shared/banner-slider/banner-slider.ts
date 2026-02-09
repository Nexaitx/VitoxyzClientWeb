import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type BannerInput =
  | string
  | { src: string; link?: string; target?: '_self' | '_blank' | string };
@Component({
  selector: 'app-banner-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-slider.html',
  styleUrls: ['./banner-slider.scss']
})
export class BannerSliderComponent implements OnInit {
  /** Accept either string[] or object[] to support links */
  @Input() images: BannerInput[] = [];
  @Input() autoSlide = true;
  @Input() slideInterval = 3000; // default 3s

  currentIndex = 0;
  intervalId: any;

  /** normalized internal format: { src, link?, target? } */
  normalizedImages: { src: string; link?: string; target?: string }[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // this.normalizeImages();

    // if (this.autoSlide && this.normalizedImages.length > 1) {
    //   this.startAutoSlide();
    // }
     this.normalizedImages = (this.images || []).map(item =>
      typeof item === 'string'
        ? { src: item }
        : {
            src: item.src,
            link: item.link,
            target: item.target || '_self'
          }
    );
  }

  // ngOnDestroy() {
  //   this.clearAutoSlide();
  // }

  private normalizeImages() {
    this.normalizedImages = (this.images || []).map((item) => {
      if (typeof item === 'string') {
        return { src: item };
      } else {
        return {
          src: item.src,
          link: item.link,
          target: item.target || (item.link && item.link.startsWith('http') ? '_blank' : '_self'),
        };
      }
    });
  }

  // startAutoSlide() {
  //   this.clearAutoSlide();
  //   this.intervalId = setInterval(() => {
  //     this.nextSlide();
  //   }, this.slideInterval);
  // }

  // clearAutoSlide() {
  //   if (this.intervalId) {
  //     clearInterval(this.intervalId);
  //     this.intervalId = null;
  //   }
  // }

  // nextSlide() {
  //   if (this.normalizedImages.length === 0) return;
  //   this.currentIndex = (this.currentIndex + 1) % this.normalizedImages.length;
  // }

  // prevSlide() {
  //   if (this.normalizedImages.length === 0) return;
  //   this.currentIndex =
  //     (this.currentIndex - 1 + this.normalizedImages.length) % this.normalizedImages.length;
  // }

  // goToSlide(index: number) {
  //   if (index < 0 || index >= this.normalizedImages.length) return;
  //   this.currentIndex = index;
  //   // if auto sliding, reset timer so user sees the clicked slide fully
  //   if (this.autoSlide) {
  //     this.startAutoSlide();
  //   }
  // }

  // onImageClick(item: { src: string; link?: string; target?: string }, index: number) {
  //   if (!item || !item.link) return;

  //   // Stop auto sliding while we handle navigation (optional)
  //   this.clearAutoSlide();

  //   const link = item.link;
  //   const target = item.target || '_self';

  //   // External absolute links -> open in new tab/window
  //   const isExternal = /^(https?:)?\/\//i.test(link);

  //   if (isExternal || target === '_blank') {
  //     window.open(link, '_blank');
  //     // restart autoSlide if enabled
  //     if (this.autoSlide) this.startAutoSlide();
  //   } else {
  //     // Internal route - navigate using router
  //     // Accept either '/path' or ['path','sub'] style - we'll attempt navigateByUrl
  //     try {
  //       this.router.navigateByUrl(link);
  //     } catch (err) {
  //       // fallback: try navigate with segments if someone passed an array-like string
  //       this.router.navigate([link]);
  //     } finally {
  //       if (this.autoSlide) this.startAutoSlide();
  //     }
  //   }
  // }
    onImageClick(item: any) {
    if (!item?.link) return;

    if (item.target === '_blank') {
      window.open(item.link, '_blank');
    } else {
      this.router.navigateByUrl(item.link);
    }
  }
}
