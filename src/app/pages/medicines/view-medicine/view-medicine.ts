import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../../footer/footer';

@Component({
  selector: 'app-view-medicine',
  imports: [Footer],
  templateUrl: './view-medicine.html',
  styleUrl: './view-medicine.scss'
})
export class ViewMedicine {
  private router: Router = inject(Router);

  goToMedicines() {
    this.router.navigate(['/dashboard/medicines']);
  }

  addToCart() {
    this.router.navigate(['/dashboard/cart']);
  }
}