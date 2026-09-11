import { Component } from '@angular/core';
import { Footer } from "../../components/footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";

@Component({
  selector: 'app-health-advice',
  standalone: true,
  imports: [Footer, MobileFooterNavComponent],
  templateUrl: './health-advice.html',
  styleUrl: './health-advice.scss'
})
export class HealthAdvice {

}