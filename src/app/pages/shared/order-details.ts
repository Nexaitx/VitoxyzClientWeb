// order-details.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, OrderResponse } from '@src/app/core/order.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Footer } from "../footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatCardModule, Footer, MobileFooterNavComponent],
  template: `
    <div class="container my-4">
      <!-- Loading Spinner -->
      <div *ngIf="isLoading" class="text-center my-5">
        <mat-spinner></mat-spinner>
        <p class="mt-2">Loading order details...</p>
      </div>

      <!-- Order Details -->
      <div *ngIf="!isLoading && order" class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Order Details</h2>
            <button mat-raised-button color="primary" (click)="goBack()">
              Back to Orders
            </button>
          </div>

          <!-- Order Summary Card -->
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>Order #{{ order.orderNumber }}</mat-card-title>
              <mat-card-subtitle>
                Placed on {{ formatDate(order.orderDate) }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Status:</strong> 
                    <span [class]="getStatusClass(order.status)">
                      {{ getStatusText(order.status) }}
                    </span>
                  </p>
                  <p><strong>Payment Status:</strong> 
                    <span [class]="getPaymentStatusClass(order.paymentStatus)">
                      {{ getPaymentStatusText(order.paymentStatus) }}
                    </span>
                  </p>
                  <p><strong>Payment Method:</strong> {{ order.paymentMethod }}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Total Amount:</strong> ₹{{ order.finalAmount }}</p>
                  <p><strong>Items:</strong> {{ getTotalItems(order) }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Order Items -->
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>Order Items</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngFor="let item of order.orderItems" class="order-item row align-items-center mb-3 pb-3 border-bottom">
                <div class="col-2">
                  <img [src]="item.imageUrl || 'assets/no-image.png'" 
                       [alt]="item.productName"
                       class="img-fluid rounded"
                       style="max-height: 80px; object-fit: cover;">
                </div>
                <div class="col-6">
                  <h6 class="mb-1">{{ item.productName }}</h6>
                  <small class="text-muted">
                    {{ item.packaging }} • Qty: {{ item.quantity }}
                  </small>
                  <div *ngIf="item.productForm" class="mt-1">
                    <small class="text-muted">Form: {{ item.productForm }}</small>
                  </div>
                </div>
                <div class="col-4 text-end">
                  <div class="fw-bold">₹{{ item.totalPrice }}</div>
                  <small class="text-muted">₹{{ item.unitPrice }} each</small>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Shipping Address -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Shipping Address</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p><strong>{{ order.shippingAddress.fullName }}</strong></p>
              <p>{{ order.shippingAddress.addressLine1 }}</p>
              <p *ngIf="order.shippingAddress.addressLine2">{{ order.shippingAddress.addressLine2 }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} - {{ order.shippingAddress.pincode }}</p>
              <p>Phone: {{ order.shippingAddress.phoneNumber }}</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="!isLoading && !order" class="text-center my-5">
        <h4>Order Not Found</h4>
        <p class="text-muted">The order you're looking for doesn't exist.</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          Back to Orders
        </button>
      </div>
    </div>
    <app-footer></app-footer>
    <app-mobile-footer-nav></app-mobile-footer-nav>
  `,
  styles: [`
    .badge {
      padding: 0.25em 0.6em;
      font-size: 0.75em;
    }
  `]
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);

  order: OrderResponse | null = null;
  isLoading = false;

  ngOnInit() {
    this.loadOrderDetails();
  }

  loadOrderDetails() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    
    if (!orderId) {
      this.showError('Invalid order ID');
      return;
    }

    this.isLoading = true;
    
    this.orderService.getOrderById(Number(orderId)).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.status && response.data) {
          this.order = response.data;
          console.log('✅ Order details loaded:', this.order);
        } else {
          this.showError('Failed to load order details');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error loading order details:', error);
        this.showError('Failed to load order details. Please try again.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/my-orders']);
  }

  // Helper methods (same as order-history component)
  getStatusClass(status: string): string {
    switch (status) {
      case 'DELIVERED': return 'badge bg-success';
      case 'CANCELLED': case 'RETURNED': case 'REFUNDED': return 'badge bg-danger';
      case 'PENDING': return 'badge bg-warning';
      case 'CONFIRMED': case 'PROCESSING': return 'badge bg-info';
      case 'SHIPPED': case 'OUT_FOR_DELIVERY': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pending', 'CONFIRMED': 'Confirmed', 'PROCESSING': 'Processing',
      'SHIPPED': 'Shipped', 'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered', 'CANCELLED': 'Cancelled',
      'RETURNED': 'Returned', 'REFUNDED': 'Refunded'
    };
    return statusMap[status] || status;
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PAID': return 'badge bg-success';
      case 'PENDING': return 'badge bg-warning';
      case 'FAILED': case 'CANCELLED': return 'badge bg-danger';
      case 'REFUNDED': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  getPaymentStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Payment Pending', 'PAID': 'Paid', 
      'FAILED': 'Payment Failed', 'REFUNDED': 'Refunded', 
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getTotalItems(order: OrderResponse): number {
    return order.orderItems.reduce((total, item) => total + item.quantity, 0);
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
