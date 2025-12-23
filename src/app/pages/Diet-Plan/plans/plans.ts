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
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule, 
    Footer, 
    MatProgressSpinnerModule
  ],
  templateUrl: './plans.html',
  styleUrl: './plans.scss'
})
export class Plans implements OnInit {
  selectedPlan: string = 'monthly';
  http = inject(HttpClient);
  router = inject(Router);
  private snackBar = inject(MatSnackBar);
  
  plans: any[] = [];
  loading: boolean = true;
  purchasingPlanId: number | null = null;

  constructor() { }

  ngOnInit(): void {
    this.loading = true;
    this.getPlans();
  }

  getPlans() {
    this.http.get(API_URL + ENDPOINTS.SUBSCRIPTION_PLANS).subscribe({
      next: (res: any) => {
        console.log('📋 Plans API Response:', res);
        this.plans = res?.data || res || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error fetching plans:', err);
        this.showError('Failed to load subscription plans');
      }
    });
  }

  purchasePlan(plan: any) {
    // Check if user is logged in
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
      this.showError('Please login first to purchase a plan');
      this.router.navigate(['/login']);
      return;
    }

    // Confirm purchase
    if (!confirm(`Are you sure you want to purchase "${plan.title || plan.planTitle}" for ₹${plan.price}?`)) {
      return;
    }

    // Set purchasing state
    this.purchasingPlanId = plan.id;
    console.log(`🔄 Purchasing plan ID: ${plan.id}, Name: ${plan.title || plan.planTitle}`);

    // Prepare payload
    const payload = {
      planId: plan.id,
      paymentMethod: "razorpay",
      transactionId: this.generateTransactionId()
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('📦 Purchase payload:', payload);

    this.http.post(`${API_URL}${ENDPOINTS.PURCHASE_SUBSCRIPTION}`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('✅ Purchase API Response:', res);
          this.purchasingPlanId = null;

          if (res?.status === true) {
            this.showSuccess('Subscription created successfully! Proceeding to payment...');
            
            // Store ALL necessary data for payment screen
            const subscriptionData = {
              subscriptionId: res.subscriptionId,
              planId: plan.id,
              planTitle: plan.title || plan.planTitle,
              planType: plan.planType || res.planType,
              price: plan.price || res.amountPaid,
              tenure: plan.tenure || '1 Month',
              description: plan.description || '',
              startDate: res.startDate,
              endDate: res.endDate,
              paymentStatus: res.paymentStatus
            };
            
            console.log('💾 Storing subscription data:', subscriptionData);
            localStorage.setItem('currentSubscription', JSON.stringify(subscriptionData));
            
            // Navigate to payment page
            setTimeout(() => {
              this.router.navigate(['/payment']);
            }, 1000);
            
          } else {
            this.showError(res?.message || 'Failed to create subscription');
          }
        },
        error: (err) => {
          this.purchasingPlanId = null;
          console.error('❌ Purchase API Error:', err);
          
          if (err.status === 401) {
            this.showError('Session expired. Please login again.');
            this.router.navigate(['/login']);
          } else if (err.status === 400) {
            this.showError(err.error?.message || 'Invalid request. Please check your details.');
          } else if (err.status === 500) {
            this.showError('Server error. Please try again later.');
          } else {
            this.showError('Failed to process purchase. Please try again.');
          }
        }
      });
  }

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `TXN${timestamp}${random}`.toUpperCase();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  isPurchasing(planId: number): boolean {
    return this.purchasingPlanId === planId;
  }
}