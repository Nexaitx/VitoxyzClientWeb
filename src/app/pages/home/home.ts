import { Footer } from "../../components/footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Footer, MobileFooterNavComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}