import { Component,inject } from '@angular/core';
import { CommonFilterComponent } from "../shared/common-filter-component/common-filter-component";
import { BannerSliderComponent } from "@src/app/shared/banner-slider/banner-slider";
import { TextBanner } from "@src/app/shared/text-banner/text-banner";
import { HealthCarouselComponent } from "../shared/health-carousel/health-carousel";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { Footer } from "../footer/footer";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: 'app-pharmacy',
  imports: [CommonFilterComponent, BannerSliderComponent,  HealthCarouselComponent, MobileFooterNavComponent, Footer],
  templateUrl: './pharmacy.html',
  styleUrl: './pharmacy.scss'
})


export class Pharmacy {

  constructor(private router: Router = inject(Router)) {}

  healthItems = [
  { image: '../../../assets/medicines/1.avif', label: 'Diabetes', link: '/products/Granule' },
  { image: '../../../assets/medicines/2.avif', label: 'Heart Rate', link: '/products/Tablet SR' },
  { image: '../../../assets/medicines/3.avif', label: 'Stomach Care', link: '/products/Digestive Tablet' },
  { image: '../../../assets/medicines/4.avif', label: 'Liver Care', link: '/products/Tablet' },
  { image: '../../../assets/medicines/5.avif', label: 'Eye Care', link: '/products/Eye Drop' },
  { image: '../../../assets/medicines/6.avif', label: 'Bone & Joint', link: '/products/Bandage' },
  { image: '../../../assets/medicines/7.avif', label: 'Kidney Care', link: '/products/Tonic' },
  { image: '../../../assets/medicines/8.avif', label: 'Derma Care', link: '/products/Face Cream' },
];

goToPage(url: string): void {
    console.log(`Navigating to /${url}`);    
    // Safety check, although the router is robust
    if (url) { 
        this.router.navigate([`/${url}`]); 
    }
  }
}
