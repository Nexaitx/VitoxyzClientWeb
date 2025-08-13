import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../../footer/footer';
import { Header } from '../header/header';

@Component({
  selector: 'app-cart-items',
  imports: [Footer,
    Header
  ],
  templateUrl: './cart-items.html',
  styleUrl: './cart-items.scss'
})
export class CartItems {
  private router = inject(Router)

  goToMedicines() {
    this.router.navigate(['/medicines']);
  }

  goToViewMedicines() {
    this.router.navigate(['/medicines/1']);
  }
}
