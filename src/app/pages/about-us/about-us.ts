import { Component } from '@angular/core';
import { Footer } from "../../components/footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [Footer, MobileFooterNavComponent],
  templateUrl: './about-us.html',
  styleUrl: './about-us.scss'
})
export class AboutUs {

}