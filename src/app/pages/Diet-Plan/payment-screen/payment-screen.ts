import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { Footer } from "../../../components/footer/footer";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '@src/app/core/const';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    MatProgressSpinnerModule,
    Footer
  ],
  templateUrl: './payment-screen.html',
  styleUrls: ['./payment-screen.scss'],
})
export class PaymentScreen implements OnInit {
  router = inject(Router);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  // ✅ Use the Razorpay Key from your backend
  private readonly razorpayKeyId = 'rzp_test_RARA6BGk8D2Y2o';
  isPaymentLoading = false;
  isProcessing = false;
  
  form: FormGroup;
  countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

  // Plan details
  plan = '';
  price = 0;
  duration = '';
  tax = 0;
  description = '';
  subscriptionId: number | null = null;
  planId: number | null = null;
  
  // Additional subscription details from backend
  subscriptionDetails: any = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      country: ['India', Validators.required],
    });
  }

  ngOnInit() {
    this.loadPaymentData();
    this.loadUserProfile();
  }

  private loadPaymentData(): void {
    // First check for subscription data
    const subscriptionData = localStorage.getItem('currentSubscription');
    
    if (subscriptionData) {
      try {
        this.subscriptionDetails = JSON.parse(subscriptionData);
        console.log('✅ Subscription details loaded:', this.subscriptionDetails);
        
        this.plan = this.subscriptionDetails.planTitle || this.subscriptionDetails.planType || 'Selected Plan';
        this.price = this.subscriptionDetails.price || 0;
        this.duration = this.subscriptionDetails.tenure || '1 Month';
        this.subscriptionId = this.subscriptionDetails.subscriptionId;
        this.planId = this.subscriptionDetails.planId;
      } catch (e) {
        console.error('❌ Error parsing subscription data:', e);
      }
    } 
    
    // Fallback to old paymentData format
    const paymentData = localStorage.getItem('paymentData');
    if (!this.subscriptionId && paymentData) {
      try {
        const parsed = JSON.parse(paymentData);
        console.log('📋 Payment data loaded:', parsed);
        
        this.plan = parsed.apiResponse?.planType || parsed.planTitle || 'Selected Plan';
        this.price = parsed.price || 0;
        this.duration = parsed.duration || '1 Month';
        this.description = parsed.description || '';
        this.subscriptionId = parsed.apiResponse?.subscriptionId;
        this.planId = parsed.planId;
      } catch (e) {
        console.error('❌ Error parsing payment data:', e);
      }
    }

    // If still no data, redirect to plans
    if (!this.subscriptionId) {
      console.error('❌ No subscription data found');
      this.showError('No plan selected! Redirecting to plans page.');
      setTimeout(() => {
        this.router.navigate(['/plans']);
      }, 2000);
      return;
    }

    console.log('💰 Plan loaded:', this.plan, 'Price:', this.price, 'Subscription ID:', this.subscriptionId);

    // Calculate tax (18% GST for India)
    this.tax = this.price * 0.18;
  }

  private loadUserProfile(): void {
    const token = this.getAuthToken();
    
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${API_URL}${ENDPOINTS.USER_PROFILE}`, { headers })
      .subscribe({
        next: (res: any) => {
          if (res?.data) {
            const user = res.data;
            this.form.patchValue({
              name: user.name || user.userName || '',
              email: user.email || '',
              phone: user.phone || user.phoneNumber || '',
              country: user.country || 'India'
            });
          }
        },
        error: (err) => {
          console.error('Failed to load user profile:', err);
        }
      });
  }

  get total() {
    return this.price + this.tax;
  }

  async pay() {
    console.log('🔄 Payment process started...');
    
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.showError('Please fill all required fields correctly.');
      return;
    }

    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.isPaymentLoading = true;

    try {
      // ✅ Step 1: Load Razorpay SDK first
      await this.loadRazorpaySdk();
      console.log('✅ Razorpay SDK loaded');

      // ✅ Step 2: Create REAL Razorpay order through backend
      console.log('🔄 Creating Razorpay order...');
      const orderResponse = await this.createRealRazorpayOrder();
      console.log('✅ Order created:', orderResponse);

      // ✅ Step 3: Initialize Razorpay checkout with REAL order_id
      console.log('🔄 Initializing Razorpay checkout...');
      
      const options: any = {
        key: this.razorpayKeyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency || 'INR',
        order_id: orderResponse.orderId, // ✅ REAL ORDER ID from backend
        name: 'Vitoxyz Health',
        description: `${this.plan} Subscription`,
        image: 'https://vitoxyz.com/logo.png', // Optional
        prefill: {
          name: this.form.value.name || '',
          email: this.form.value.email || '',
          contact: this.form.value.phone || ''
        },
        notes: {
          subscriptionId: this.subscriptionId?.toString() || '',
          plan: this.plan
        },
        theme: {
          color: '#4CAF50'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed by user');
            this.isProcessing = false;
            this.isPaymentLoading = false;
            this.showError('Payment cancelled by user');
          }
        },
        handler: (response: any) => {
          console.log('✅ Payment handler called:', response);
          this.onPaymentSuccess(response);
        }
      };

      console.log('Razorpay options:', JSON.stringify(options, null, 2));

      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response);
        this.onPaymentFailed(response);
      });

      console.log('✅ Opening Razorpay modal...');
      rzp.open();

    } catch (err: any) {
      console.error('❌ Payment initialization error:', err);
      this.showError(err.message || 'Failed to initialize payment. Please try again.');
      this.isProcessing = false;
      this.isPaymentLoading = false;
    }
  }

  // ✅ REAL METHOD: Create Razorpay order through backend
  private async createRealRazorpayOrder(): Promise<any> {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    if (!this.subscriptionId) {
      throw new Error('Subscription ID not found. Please select a plan first.');
    }

    const orderData = {
      amount: Math.round(this.total * 100), // Convert to paise
      currency: 'INR',
      subscriptionId: this.subscriptionId,
      planName: this.plan,
      receipt: `receipt_${Date.now()}`
    };

    console.log('📦 Order request data:', orderData);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    try {
      // ✅ Call the REAL backend endpoint (you need to create this)
      const response: any = await this.http.post(
        `${API_URL}/suscriptionpayments/create-order`,
        orderData,
        { headers }
      ).toPromise();

      console.log('📦 Order creation response:', response);

      if (!response.status) {
        throw new Error(response.message || 'Failed to create payment order');
      }

      if (!response.orderId) {
        throw new Error('Invalid order response from server');
      }

      return {
        orderId: response.orderId,
        amount: response.amount,
        currency: response.currency,
        keyId: response.keyId
      };

    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      
      // More specific error messages
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.status === 400) {
        throw new Error(error.error?.message || 'Invalid request data.');
      } else if (error.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.status === 0) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      
      throw new Error('Failed to create payment order: ' + (error.message || 'Unknown error'));
    }
  }

  // ✅ Handle successful payment
  private async onPaymentSuccess(response: any): Promise<void> {
    console.log('🎉 Payment success response:', response);
    
    try {
      // Extract payment details
      const paymentDetails = {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        subscriptionId: this.subscriptionId
      };

      console.log('🔐 Payment details for verification:', paymentDetails);

      // ✅ Step 1: Verify payment with backend
      const isVerified = await this.verifyPaymentWithBackend(paymentDetails);
      
      if (!isVerified) {
        this.showError('Payment verification failed. Please contact support.');
        this.isProcessing = false;
        this.isPaymentLoading = false;
        return;
      }

      console.log('✅ Payment verified successfully');

      // ✅ Step 2: Update subscription payment status
      const updateSuccess = await this.updateSubscriptionPaymentStatus(
        response.razorpay_payment_id
      );

      if (!updateSuccess) {
        console.warn('⚠️ Subscription status update failed, but payment was successful');
      }

      // ✅ Step 3: Show success and redirect
      this.showSuccess('Payment successful! Your subscription is now active.');
      this.clearPaymentData();
      
      setTimeout(() => {
        this.router.navigate(['/diet-charts']);
      }, 500);

    } catch (error: any) {
      console.error('❌ Payment success handling error:', error);
      this.showError('Error processing payment: ' + error.message);
    } finally {
      this.isProcessing = false;
      this.isPaymentLoading = false;
    }
  }

  // ✅ REAL METHOD: Verify payment with backend
  private async verifyPaymentWithBackend(paymentDetails: any): Promise<boolean> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    try {
      console.log('🔐 Sending payment for verification...');
      
      // ✅ Call the REAL verification endpoint
      const response: any = await this.http.post(
        `${API_URL}/suscriptionpayments/verify`,
        paymentDetails,
        { headers }
      ).toPromise();

      console.log('🔐 Verification response:', response);

      if (response.status === true) {
        console.log('✅ Payment verification successful');
        return true;
      } else {
        console.error('❌ Payment verification failed:', response.message);
        return false;
      }

    } catch (error: any) {
      console.error('❌ Verification error:', error);
      return false;
    }
  }

  // ✅ Update subscription payment status
  private async updateSubscriptionPaymentStatus(transactionId: string): Promise<boolean> {
    if (!this.subscriptionId) return false;

    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    try {
      console.log('🔄 Updating subscription status...');
      
      const params = {
        status: 'SUCCESS',
        transactionId: transactionId
      };

      const response: any = await this.http.post(
        `${API_URL}/subscriptions/${this.subscriptionId}/payment-status`,
        null,
        { 
          headers: headers,
          params: params 
        }
      ).toPromise();

      console.log('✅ Subscription update response:', response);
      return response?.status === true;

    } catch (error) {
      console.error('❌ Error updating subscription status:', error);
      return false;
    }
  }

  // ✅ Handle failed payment
  private onPaymentFailed(response: any): void {
    console.error('❌ Payment failed response:', response);
    
    const errorMsg = response.error?.description || 
                    response.error?.reason || 
                    'Payment failed. Please try again.';
    
    this.showError(errorMsg);
    this.isProcessing = false;
    this.isPaymentLoading = false;
    
    // Optionally, update subscription status to FAILED
    if (this.subscriptionId) {
      this.updatePaymentStatus('FAILED', response.error?.payment_id);
    }
  }

  // ✅ Update payment status to FAILED
  private updatePaymentStatus(status: string, transactionId?: string): void {
    if (!this.subscriptionId) return;

    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const params: any = { status };
    if (transactionId) params.transactionId = transactionId;

    this.http.post(
      `${API_URL}/subscriptions/${this.subscriptionId}/payment-status`,
      null,
      { headers, params }
    ).subscribe({
      next: () => console.log('✅ Subscription status updated to FAILED'),
      error: (err) => console.error('❌ Failed to update payment status:', err)
    });
  }

  // ✅ Load Razorpay SDK
  private loadRazorpaySdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') {
        console.log('✅ Razorpay SDK already loaded');
        resolve();
        return;
      }

      const existingScript = document.getElementById('razorpay-checkout-js') as HTMLScriptElement;
      
      if (existingScript) {
        existingScript.onload = () => resolve();
        existingScript.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        return;
      }

      console.log('🔄 Loading Razorpay SDK...');
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Razorpay SDK loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay SDK');
        reject(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
      };
      
      document.body.appendChild(script);
    });
  }

  // ✅ Helper: Get authentication token
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  // ✅ Helper: Get user ID from token
  private getUserIdFromToken(): string | null {
    const token = this.getAuthToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || null;
    } catch {
      return null;
    }
  }

  private clearPaymentData(): void {
    localStorage.removeItem('paymentData');
    localStorage.removeItem('currentSubscription');
  }

  goToDietDashboard() {
    this.router.navigate(['/diet-charts']);
  }

  goBackToPlans() {
    this.router.navigate(['/subscription-plans']);
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

  // Form field getters for template
  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get phone() { return this.form.get('phone'); }
  get country() { return this.form.get('country'); }
}