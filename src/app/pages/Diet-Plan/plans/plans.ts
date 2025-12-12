
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '@src/app/core/const';
import { Router } from '@angular/router';
import { Footer } from "../../footer/footer";
import { MatProgressSpinner, MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule, Footer, MatProgressSpinnerModule, ],
  templateUrl: './plans.html',
  styleUrl: './plans.scss'
})
export class Plans implements OnInit {
  selectedPlan: string = 'monthly';
  http = inject(HttpClient);
  router = inject(Router)
plans: any[] = [];
loading: boolean = true;
  constructor() { }

 ngOnInit(): void {
  this.loading = true;
  setTimeout(() => { this.loading = false; this.getPlans(); }, 2500);
}

 getPlans() {
  this.loading = true;
  this.http.get(API_URL + ENDPOINTS.SUBSCRIPTION_PLANS).subscribe({
    next: (res: any) => {
      console.log('Plans API Response:', res);
      this.plans = res?.data || res || []; // depends on backend structure
       this.loading = false;
    },
    error: (err) => {
      this.loading = false;
      console.error('Error fetching plans:', err);
    }
  });
}

  // goToPayment() {
  //   this.router.navigate(['/payment']);

  // }
purchasePlan(plan: any) {
  // const token = localStorage.getItem('token'); // 👈 make sure you stored this after login
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  if (!token) {
    alert('Please log in first to purchase a plan.');
    this.router.navigate(['/login']);
    return;
  }


  //   // const payload = {
  //   //   subscriptionId: plan.id || plan.subscriptionId, // depends on your backend field
  //   // };

  const payload = {
    planId: plan.id, // or dynamic: plan.id if needed
    paymentMethod: "null",
    transactionId: "w2S223355Df"
  };

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}` // 👈 attach token here
  });

  console.log('Purchasing Plan with headers:', headers, payload);
    this.loading = true; // show loader while purchasing
  this.http.post(`${API_URL}${ENDPOINTS.PURCHASE_SUBSCRIPTION}`, payload, { headers })
    .subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('Purchase API Response:', res);

        if (res?.status) {
           const paymentData = {
            planTitle: plan.planTitle,
            price: plan.price,
            duration: plan.duration || '1 Month',
            description: plan.description || '',
            apiResponse: res
          };
          localStorage.setItem('paymentData', JSON.stringify(paymentData));
          this.router.navigate(['/payment']);
        } else {
          alert(res.message || 'Failed to purchase plan. Please try again.');
        }
      },
      error: (err) => {
        this.loading = false;
          console.error('Purchase API Error:', err);
        if (err.status === 401) {
          alert('Session expired or unauthorized. Please log in again.');
          this.router.navigate(['/login']);
        } else {
          alert('Something went wrong while purchasing.');
        }
      }
    });
}


}