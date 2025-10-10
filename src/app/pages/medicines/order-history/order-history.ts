// order-history.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { OrderService, OrderResponse } from '@src/app/core/order.service';
import { CartService } from '@src/app/core/cart.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { Footer } from '../../footer/footer';
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";


@Component({
  selector: 'app-order-history',
  imports: [
    CommonModule,
    Footer,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MobileFooterNavComponent
],
  standalone: true,
  templateUrl: './order-history.html',
  styleUrls: ['./order-history.scss']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  public router = inject(Router);
public cartService = inject(CartService);

  private snackBar = inject(MatSnackBar);

  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  isLoading = false;
  selectedTab = 0; // 0: All, 1: Pending, 2: Delivered, 3: Cancelled
  
  // Order status filters
  orderFilters = [
    { value: 'all', label: 'All Orders', count: 0 },
    { value: 'pending', label: 'Pending', count: 0 },
    { value: 'delivered', label: 'Delivered', count: 0 },
    { value: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  private ordersSubscription!: Subscription;

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  // Load user orders
  loadOrders() {
    this.isLoading = true;
    
    this.ordersSubscription = this.orderService.getUserOrders().subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.status && response.data) {
          this.orders = response.data;
          this.filteredOrders = this.orders;
          this.updateOrderCounts();
          console.log('✅ Orders loaded:', this.orders.length);
        } else {
          this.showError('Failed to load orders');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error loading orders:', error);
        this.showError('Failed to load orders. Please try again.');
      }
    });
  }

  // Update order counts for filters
  updateOrderCounts() {
    this.orderFilters[0].count = this.orders.length; // All
    this.orderFilters[1].count = this.orders.filter(order => 
      ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status)
    ).length; // Pending
    this.orderFilters[2].count = this.orders.filter(order => 
      order.status === 'DELIVERED'
    ).length; // Delivered
    this.orderFilters[3].count = this.orders.filter(order => 
      ['CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.status)
    ).length; // Cancelled
  }

  // Filter orders by status
  filterOrders(status: string) {
    switch (status) {
      case 'all':
        this.filteredOrders = this.orders;
        break;
      case 'pending':
        this.filteredOrders = this.orders.filter(order => 
          ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status)
        );
        break;
      case 'delivered':
        this.filteredOrders = this.orders.filter(order => 
          order.status === 'DELIVERED'
        );
        break;
      case 'cancelled':
        this.filteredOrders = this.orders.filter(order => 
          ['CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.status)
        );
        break;
      default:
        this.filteredOrders = this.orders;
    }
  }

  // On tab change
  onTabChange(tabIndex: number) {
    this.selectedTab = tabIndex;
    const status = this.orderFilters[tabIndex].value;
    this.filterOrders(status);
  }

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'badge bg-success';
      case 'CANCELLED':
      case 'RETURNED':
      case 'REFUNDED':
        return 'badge bg-danger';
      case 'PENDING':
        return 'badge bg-warning';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'badge bg-info';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'badge bg-primary';
      default:
        return 'badge bg-secondary';
    }
  }

  // Get status display text
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'PROCESSING': 'Processing',
      'SHIPPED': 'Shipped',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled',
      'RETURNED': 'Returned',
      'REFUNDED': 'Refunded'
    };
    return statusMap[status] || status;
  }

  // Get payment status class
  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'badge bg-success';
      case 'PENDING':
        return 'badge bg-warning';
      case 'FAILED':
      case 'CANCELLED':
        return 'badge bg-danger';
      case 'REFUNDED':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  }

  // Get payment status text
  getPaymentStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Payment Pending',
      'PAID': 'Paid',
      'FAILED': 'Payment Failed',
      'REFUNDED': 'Refunded',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  // View order details
  viewOrderDetails(order: OrderResponse) {
    this.router.navigate(['/order', order.orderId]);
  }

  // Reorder items
  reorderItems(order: OrderResponse) {
    // Add all items from order to cart
    order.orderItems.forEach(item => {
      const cartItem = {
        id: item.productId,
        name: item.productName,
        price: item.unitPrice,
        mrp: item.unitPrice, // You might want to fetch current price
        image: item.imageUrl,
        qty: item.packaging,
        count: item.quantity,
        productType: item.productType
      };
      
      // This would need to be implemented in your cart service
      this.cartService.addItem(cartItem, item.quantity).subscribe({
        next: () => {
          console.log(' Item added to cart:', item.productName);
        },
        error: (error) => {
          console.error('❌ Failed to add item to cart:', error);
        }
      });
    });
    
    this.showSuccess('Items added to cart!');
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 1000);
  }

  // Cancel order
  cancelOrder(order: OrderResponse) {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    if (order.status === 'DELIVERED' || order.status === 'SHIPPED') {
      this.showError('This order cannot be cancelled as it is already shipped or delivered.');
      return;
    }

    this.orderService.cancelOrder(order.orderId).subscribe({
      next: (response) => {
        if (response.status) {
          this.showSuccess('Order cancelled successfully!');
          this.loadOrders(); // Reload orders
        } else {
          this.showError('Failed to cancel order.');
        }
      },
      error: (error) => {
        console.error(' Error cancelling order:', error);
        this.showError('Failed to cancel order. Please try again.');
      }
    });
  }

  // Track order
  trackOrder(order: OrderResponse) {
    // Navigate to order tracking page
    this.router.navigate(['/order-tracking', order.orderNumber]);
  }

  // Helper methods for alerts
  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Check if order can be cancelled
  canCancelOrder(order: OrderResponse): boolean {
    return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status);
  }

  // Check if order can be tracked
  canTrackOrder(order: OrderResponse): boolean {
    return ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status);
  }

  // Format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Get total items count in order
  getTotalItems(order: OrderResponse): number {
    return order.orderItems.reduce((total, item) => total + item.quantity, 0);
  }
}
