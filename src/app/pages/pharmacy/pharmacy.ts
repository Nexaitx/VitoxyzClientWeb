import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Needed for *ngFor, *ngIf
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; // ✅ Import module, not class

import { CommonFilterComponent } from "../shared/common-filter-component/common-filter-component";
import { BannerSliderComponent } from "@src/app/shared/banner-slider/banner-slider";
import { HealthCarouselComponent } from "../shared/health-carousel/health-carousel";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { Footer } from "../footer/footer";

interface Category {
  name: string;
  apiValue: string[];
  cssClass: string;
  imageUrl: string;
  altText: string;
}

@Component({
  selector: 'app-pharmacy',
  standalone: true,
  imports: [
    CommonModule,                // ✅ FIX: Needed for *ngFor, *ngIf
    MatCardModule,               // ✅ FIX: Proper module import for MatCard
    CommonFilterComponent,
    BannerSliderComponent,
    HealthCarouselComponent,
    MobileFooterNavComponent,
    Footer
  ],
  templateUrl: './pharmacy.html',
  styleUrls: ['./pharmacy.scss']
})
export class Pharmacy {
  constructor(private router: Router = inject(Router)) {}

  @ViewChild('categoryCarouselWrapper', { static: false })
  carouselWrapper!: ElementRef<HTMLDivElement>;

  categories: Category[] = [
    { name: 'Diabetes', apiValue: ['Insulin Syringe (Syringe)', 'Injection', 'Test Strip', 'Tablet', 'Test kit', 'Lancet', 'Needle', 'Self Test Kit'], cssClass: 'skin-care-bg', imageUrl: 'assets/medicines/1.avif', altText: 'Diabetes Care Products' },
    { name: 'Heart Rate', apiValue: ['Capsule', 'Tablet', 'Injection', 'Solution for Infusion', 'Syrup', 'Infusion'], cssClass: 'hair-care-bg', imageUrl: 'assets/medicines/2.avif', altText: 'Heart Rate Care Products' },
    { name: 'Stomach Care', apiValue: ['Digestive Tablet', 'Syrup', 'Suspension', 'Oral Suspension', 'Oral Solution', 'Oral Liquid', 'Oral Gel', 'Tonic', 'Granule', 'Muesli', 'Powder for Oral Suspension', 'Powder for Oral Solution'], cssClass: 'sexual-wellness-bg', imageUrl: 'assets/medicines/3.avif', altText: 'Stomach Care Products' },
    { name: 'Liver Care', apiValue: ['Tablet', 'Capsule', 'Granule', 'Syrup', 'Tonic', 'Liver Care Juice'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/4.avif', altText: 'Liver Care Products' },
    { name: 'Eye Care', apiValue: ['Eye Drop', 'Eye Gel', 'Eye Cream', 'Eye Ointment', 'Eye Pad', 'Eye Capsule', 'Eye/Ear Drop', 'Ophthalmic Solution', 'Lens Solution', 'Reading Eyeglass'], cssClass: 'Eldercare-bg', imageUrl: 'assets/medicines/5.avif', altText: 'Eye Care Products' },
    { name: 'Bone & Joint', apiValue: ['Knee Support', 'Wrist Support', 'Massager', 'Liniment', 'Balm', 'Ointment', 'Bone & Joint Tablet', 'Bone & Joint Oil', 'Bandage'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/6.avif', altText: 'Bone & Joint Products' },
    { name: 'Kidney Care', apiValue: ['Tonic', 'Kidney Tablet ', 'Tablet', 'Kidney Capsule ', 'Kidney Syrup ', 'Kidney Tonic ', 'Kidney Infusion ', 'Kidney Solution for Infusion ', 'Kidney Drop', ' Juice'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/7.avif', altText: 'Kidney Care Products' },
    { name: 'Derma Care', apiValue: ['Face Cream', 'Face Pack', 'Lotion', 'Face Wash', 'Serum', 'Cream', 'Moisturiser', 'Dusting Powder', 'Body Wash', 'Conditioner', 'Wax', 'Scrub', 'Gel', 'Soap'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/8.avif', altText: 'Derma Care Products' },
   { name: 'Hair Care', apiValue: ['Hair Mask', 'Oil', 'Lotion', 'Conditioner', 'Hair Serum', 'Hair Cream', 'Shampoo', ], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/hair care.avif', altText: 'Derma Care Products' },

  ];





  scrollCarousel(direction: 'left' | 'right'): void {
    if (this.carouselWrapper) {
      const element = this.carouselWrapper.nativeElement;
      const scrollAmount = 180 * 4;
      element.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  }

  fetchProductsByCategory(categoryApiValues: string[]): void {
    const categoryName = this.getCategoryNameByApiValues(categoryApiValues);
    this.router.navigate(['/products'], {
      queryParams: {
        category: categoryName,
        forms: categoryApiValues.join(',')
      }
    });
  }

  private getCategoryNameByApiValues(apiValues: string[]): string {
    const category = this.categories.find(cat => cat.apiValue.join(',') === apiValues.join(','));
    return category ? category.name : 'Products';
  }

  goToPage(url: string): void {
    if (url) this.router.navigate([`/${url}`]);
  }
}
