import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-medicine',
  imports: [],
  templateUrl: './view-medicine.html',
  styleUrl: './view-medicine.scss'
})
export class ViewMedicine {
private router: Router = inject(Router);
  goToMedicines() {
    this.router.navigate(['/dashboard/medicines']);
  }
}
