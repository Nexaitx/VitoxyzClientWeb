import { Component } from '@angular/core';
import { Footer } from "../footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";

@Component({
  selector: 'app-termsandconditions',
  imports: [Footer, MobileFooterNavComponent],
  templateUrl: './termsandconditions.html',
  styleUrl: './termsandconditions.scss'
})
export class Termsandconditions {

}
