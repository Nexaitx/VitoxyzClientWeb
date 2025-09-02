import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-screen',
  imports: [
    CommonModule,
    RouterModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
   
  ],
  templateUrl: './payment-screen.html',
 styleUrls: ['./payment-screen.scss']   ,
})
export class PaymentScreen {
  router = inject(Router);

  goToDietDashboard() {
    this.router.navigate(['/diet-charts']);
  }
form: FormGroup;
  countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

  // values for Order Summary
  plan = 'Premium Health';
  price = 499;
  tax = 5;
  duration = '1 Month';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      country: ['', Validators.required],
    });
  }

  // Getter for total amount
  get total() {
    return this.price + this.tax;
  }

  // Function called on payment
  pay() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    alert('✅ Payment submitted successfully!');
  }

}
