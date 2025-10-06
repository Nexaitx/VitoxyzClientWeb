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
  imports: [CommonFilterComponent, BannerSliderComponent, TextBanner, HealthCarouselComponent, MobileFooterNavComponent, Footer],
  templateUrl: './pharmacy.html',
  styleUrl: './pharmacy.scss'
})


export class Pharmacy {

  constructor(private router: Router = inject(Router)) {}

  healthItems = [
  { image: '../../../assets/medicines/1.png', label: 'Diabetes', link: '/products/Lancet' },
  { image: '../../../assets/medicines/2.png', label: 'Heart Rate', link: '/products/HeartRate' },
  { image: '../../../assets/medicines/3.png', label: 'Stomach Care', link: '/products/StomachCare' },
  { image: '../../../assets/medicines/4.png', label: 'Liver Care', link: '/products/LiverCare' },
  { image: '../../../assets/medicines/5.png', label: 'Eye Care', link: '/products/EyeCare' },
  { image: '../../../assets/medicines/6.png', label: 'Bone & Joint', link: '/products/BoneJoint' },
  { image: '../../../assets/medicines/7.png', label: 'Kidney Care', link: '/products/KidneyCare' },
  { image: '../../../assets/medicines/8.png', label: 'Derma Care', link: '/products/DermaCare' },
];

goToPage(url: string): void {
    console.log(`Navigating to /${url}`);    
    // Safety check, although the router is robust
    if (url) { 
        this.router.navigate([`/${url}`]); 
    }
  }
}
