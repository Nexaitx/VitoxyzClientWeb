import { Component } from '@angular/core';
import { Footer } from '../footer/footer';
import { MobileFooterNavComponent } from '@src/app/layouts/mobile-footer-nav/mobile-footer-nav';

@Component({
  selector: 'app-return-refund',
  imports: [Footer, MobileFooterNavComponent],
  templateUrl: './return-refund.html',
  styleUrl: './return-refund.scss'
})
export class ReturnRefund {

}
