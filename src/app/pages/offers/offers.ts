import { Component } from '@angular/core';
import { Footer } from "../../components/footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [Footer, MobileFooterNavComponent],
  templateUrl: './offers.html',
  styleUrl: './offers.scss'
})
export class Offers {

}