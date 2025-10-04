import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../../footer/footer';
import { Header } from '../header/header';
import { CartItem, CartService } from '@src/app/core/cart.service';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

declare var Razorpay: any;

@Component({
  selector: 'app-cart-items',
  imports: [Footer, CommonModule, Header],
  standalone: true,
  templateUrl: './cart-items.html',
  styleUrls: ['./cart-items.scss']
})
export class CartItems implements OnInit {

  cart: CartItem[] = [];
  shippingFee = 70;
  billingForm!: FormGroup;

  

  private readonly razorpayKeyId = 'rzp_test_RARA6BGk8D2Y2o';
  private isPaymentLoading = false;
  
  private router = inject(Router);
  private cartService = inject(CartService);

  ngOnInit() {
  this.refreshCart();
  console.log("cartdata",this.cart);

}



refreshCart() {

  this.cartService.fetchCart().subscribe({
    next: () => {
      this.cartService.cart$.subscribe(items => this.cart = items);
    },
    error: (err) => console.error('Failed to fetch cart:', err)
  });
}

removeItem(id: string) {
  this.cartService.removeItem(id).subscribe({
    next: () => alert('Item removed from cart!'),
    error: (err) => alert('Failed to remove item.')
  });
}

// increaseQty(item: CartItem) {
//   const newQty = (item.count || 1) + 1;
//   this.updateQuantity(item, newQty);
// }

// decreaseQty(item: CartItem) {
//   const newQty = (item.count || 1) - 1;
//   if (newQty > 0) this.updateQuantity(item, newQty);
// }
increaseQty(item: CartItem) {
  this.cartService.incrementQty(item.id).subscribe({
    next: () => console.log('Quantity increased'),
    error: () => alert('Failed to increase quantity')
  });
}

decreaseQty(item: CartItem) {
  if (item.count > 1) {
    this.cartService.decrementQty(item.id).subscribe({
      next: () => console.log('Quantity decreased'),
      error: () => alert('Failed to decrease quantity')
    });
  } else {
    // If qty becomes 0 → remove item
    this.removeItem(item.id);
  }
}

updateQuantity(item: CartItem, quantity: number) {
  this.cartService.updateQty(item.id, quantity, item.productType || 'otc').subscribe({
    next: () => console.log('Quantity updated'),
    error: () => alert('Failed to update quantity')
  });
}


// private updateQuantity(item: CartItem, quantity: number) {
//   this.cartService.addItem({
//     medicineId: item.id,
//     quantity,
//     productType: item.productType || 'otc'
//   }).subscribe({
//     next: () => console.log('Quantity updated'),
//     error: () => alert('Failed to update quantity')
//   });
// }


  /** Navigation helpers */
  goToMedicines() {
    this.router.navigateByUrl('/medicines');
  }

  goToViewMedicines() {
    this.router.navigateByUrl('/medicines/1');
  }

  /** Cart operations */
  // removeItem(id: string) {
  //   this.cartService.removeItem(id);
  //   this.refreshCart();
  // }

  // increaseQty(item: CartItem) {
  //   item.count = (item.count || 1) + 1;
  //   this.cartService.updateItem(item);
  //   this.refreshCart();
  // }

  // decreaseQty(item: CartItem) {
  //   if ((item.count || 1) > 1) {
  //     item.count--;
  //     this.cartService.updateItem(item);
  //     this.refreshCart();
  //   }
  // }

  /** Calculations */
  getDiscount(item: CartItem): number {
    if (item.mrp && item.mrp > item.price) {
      return Math.round(((item.mrp - item.price) / item.mrp) * 100);
    }
    return 0;
  }

  getItemTotal(): number {
    return this.cart.reduce((sum, i) => sum + (i.price * i.count), 0);
  }

  getTotalDiscount(): number {
    return this.cart.reduce((sum, i) => sum + ((i.mrp ? i.mrp - i.price : 0) * i.count), 0);
  }

  getFinalAmount(): number {
    return this.getItemTotal() + this.shippingFee - this.getTotalDiscount();
  }

  /** Razorpay Integration */
  async onProceedToPayment(billingName?: string, billingAddress?: string, gstNumber?: string) {
    try {
      if (!this.razorpayKeyId) {
        alert('Razorpay Key ID is missing.');
        return;
      }

      const amountInINR = this.getPayableAmount();
      if (!(amountInINR > 0)) {
        alert('Invalid amount.');
        return;
      }

      this.isPaymentLoading = true;
      await this.loadRazorpaySdk();

      const options: any = {
        key: this.razorpayKeyId,
        amount: Math.round(amountInINR * 100), // Razorpay requires paise
        currency: 'INR',
        name: 'Your Company Name',
        description: 'Cart Payment',
        prefill: {
          name: billingName || '',
          email: '',
          contact: ''
        },
        notes: {
          billing_address: billingAddress || '',
          gst_number: gstNumber || ''
        },
        theme: { color: '#0d6efd' },
        modal: {
          ondismiss: () => console.log('Razorpay Checkout closed.')
        },
        handler: (response: any) => {
          this.onPaymentSuccess(response, amountInINR);
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (resp: any) => this.onPaymentFailed(resp));
      rzp.open();

    } catch (err) {
      console.error('Payment init error:', err);
      alert('Unable to start payment. Please try again.');
    } finally {
      this.isPaymentLoading = false;
    }
  }

  private onPaymentSuccess(response: any, amountInINR: number) {
    console.log('Payment success:', response);
    alert(`Payment successful! Amount paid: ₹${amountInINR}\nPayment ID: ${response?.razorpay_payment_id || 'N/A'}`);
    // Optional: redirect to medicines page after payment
    this.router.navigate(['/medicines']);
  }

  private onPaymentFailed(resp: any) {
    console.error('Payment failed:', resp);
    const msg = resp?.error?.description || 'Payment failed. Please try again.';
    alert(msg);
  }

  /** Load Razorpay SDK dynamically */
  private loadRazorpaySdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') {
        resolve();
        return;
      }

      const existing = document.getElementById('razorpay-checkout-js') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay SDK.')));
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
      document.body.appendChild(script);
    });
  }

  /** Use dynamic total for payment */
  private getPayableAmount(): number {
    return this.getFinalAmount();
  }

}
