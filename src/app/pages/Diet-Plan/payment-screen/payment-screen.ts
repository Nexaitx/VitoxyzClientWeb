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
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';

declare var Razorpay: any;

@Component({
  selector: 'app-payment-screen',
  standalone: true,
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
    MatDividerModule, 
  ],
  templateUrl: './payment-screen.html',
  styleUrls: ['./payment-screen.scss'],
})
export class PaymentScreen {
  router = inject(Router);

 
  private readonly razorpayKeyId = 'rzp_test_RARA6BGk8D2Y2o';
  private isPaymentLoading = false;
  

  form: FormGroup;
  countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];


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

  get total() {
    return this.price + this.tax; 
  }

  
  goToDietDashboard() {
    this.router.navigate(['/diet-charts']);
  }

  

  async pay() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (!this.razorpayKeyId) {
      alert('Razorpay Key ID is missing. Please set it in the component.');
      return;
    }

    try {
      this.isPaymentLoading = true;
      await this.loadRazorpaySdk();

      const amountInINR = this.getPayableAmount(); 
      const { name, email, country } = this.form.value;

      const options: any = {
        key: this.razorpayKeyId,
        amount: Math.round(amountInINR * 100), 
        currency: 'INR',
        name: 'Your Company Name',
        description: `${this.plan} - ${this.duration}`,
        prefill: {
          name: name || '',
          email: email || '',
          contact: '' 
        },
        notes: {
          plan: this.plan,
          duration: this.duration,
          price: String(this.price),
          tax: String(this.tax),
          country: country || ''
        },
        theme: { color: '#0d6efd' },
        modal: {
          ondismiss: () => console.log('Razorpay Checkout closed.')
        },
        handler: (response: any) => this.onPaymentSuccess(response),
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

 private onPaymentSuccess(response: any) {
  console.log('Payment success:', response);
  // Later: send response { payment_id, order_id, signature } to your backend for verification
  alert(`✅ Payment successful! Payment ID: ${response?.razorpay_payment_id || 'N/A'}`);
  this.goToDietDashboard();
}

  private onPaymentFailed(resp: any) {
    console.error('Payment failed:', resp);
    const msg = resp?.error?.description || 'Payment failed. Please try again.';
    alert(msg);
  }

  private loadRazorpaySdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') return resolve();

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

  private getPayableAmount(): number {
    return this.total; 
  }
}
