import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../../footer/footer';
import { Header } from '../header/header';

@Component({
  selector: 'app-view-medicine',
  imports: [
    Footer,
    Header
  ],
  templateUrl: './view-medicine.html',
  styleUrl: './view-medicine.scss'
})
export class ViewMedicine {
  private router: Router = inject(Router);

  goToMedicines() {
    this.router.navigate(['medicines']);
  }

  addToCart() {
    this.router.navigate(['cart']);
  }
}