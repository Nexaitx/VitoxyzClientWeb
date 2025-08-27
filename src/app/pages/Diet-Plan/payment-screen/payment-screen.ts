import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-screen',
  imports: [],
  templateUrl: './payment-screen.html',
  styleUrl: './payment-screen.scss'
})
export class PaymentScreen {
  router = inject(Router);

  goToDietDashboard() {
    this.router.navigate(['/diet-charts']);
  }
}
