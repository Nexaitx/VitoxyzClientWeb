import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponseService } from '../../core/booking-response.service';
import { PaymentService, CreatePaymentRequest, VerifyPaymentRequest } from '../../core/services/payment.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Footer } from "../footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { environment } from '@src/environments/environment.development';

declare var Razorpay: any;

@Component({
  selector: 'app-view-staff',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Footer, MobileFooterNavComponent],
  templateUrl: './view-staff.html',
  styleUrls: ['./view-staff.scss']
})
export class ViewStaff implements OnInit {
  staffDetails: any[] = [];
  selectedStaff: any;
  billingForm!: FormGroup;
  loading: boolean = true;
  isPaymentProcessing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingResponseService: BookingResponseService,
    private paymentService: PaymentService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initBillingForm();
    this.fetchBookingResponses();
    this.checkToken();
  }

  private checkToken(): void {
    const token = this.getToken();
    console.log('🔑 Token Check - Available:', !!token);
    if (token) {
      console.log('📝 Token Preview:', token.substring(0, 20) + '...');
    }
  }

  private getToken(): string | null {
    return localStorage.getItem('token') || 
           sessionStorage.getItem('token') ||
           localStorage.getItem('auth_token') || 
           sessionStorage.getItem('auth_token') ||
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('authToken');
  }

  initBillingForm(): void {
    this.billingForm = this.fb.group({
      billingAddress: ['', [Validators.required, Validators.minLength(5)]],
      billingName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      gstNumber: ['']
    });
  }

  fetchBookingResponses() {
    const MIN_LOADING_TIME = 2000;
    const startTime = Date.now();
    this.loading = true;
    this.cd.detectChanges();

    this.bookingResponseService.getBookingResponse().subscribe({
      next: (res) => {
        console.log("📦 RAW API RESPONSE:", res);

        const raw = res ?? [];
        const grouped: any = {};

        raw.forEach((s: any) => {
          const category = s.category || 'Others';

          if (!grouped[category]) {
            grouped[category] = {
              category,
              availableStaff: []
            };
          }

          grouped[category].availableStaff.push({
            id: s.staffId,
            name: s.staffName,
            phone: s.staffPhone,
            staffPhone: s.staffPhone,
            startDate: s.startDate,
            endDate: s.endDate,
            category: s.category,
            subCategory: s.subCategory,
            rating: s.rating || 0,
            duties: s.duties || 0,
            price: s.price || 0,
            gender: s.gender,
            experience: s.experience || 0,
            tenure: s.tenure,
            imageUrl: s.imageUrl || null,
            bookingId: s.bookingId
          });
        });

        this.staffDetails = Object.values(grouped);
        console.log("👥 FINAL FORMATTED STAFF:", this.staffDetails);

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
        setTimeout(() => (this.loading = false), remaining);
      },
      error: (err) => {
        console.error('❌ Error fetching booking responses', err);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
        setTimeout(() => (this.loading = false), remaining);
      }
    });
  }

  async onProceedToPayment(billingName: string, billingAddress: string, gstNumber: string, phoneNumber: string) {
    if (this.billingForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    try {
      this.isPaymentProcessing = true;

      // Check authentication token
      const token = this.getToken();
      if (!token) {
        alert('Please login again. Authentication token missing.');
        this.router.navigate(['/login']);
        return;
      }

      console.log('🔑 Auth Token Found');

      // Get all booking IDs from accepted staff
      const bookingIds = this.getAllBookingIds();
      if (bookingIds.length === 0) {
        alert('No bookings found for payment.');
        this.isPaymentProcessing = false;
        return;
      }

      console.log('📋 Booking IDs for payment:', bookingIds);

      // Calculate total amount
      const totalAmount = this.calculateTotalAmount();
      console.log('💰 Total Amount:', totalAmount);

      // Create payment request with GST Number
      const paymentRequest: CreatePaymentRequest = {
        bookingIds: bookingIds,
        fullName: billingName,
        phoneNumber: phoneNumber,
        address: billingAddress,
        gstNumber: gstNumber, // GST Number add karein
        amount: totalAmount
      };

      console.log('📦 Payment Request:', paymentRequest);

      // Try primary endpoint first
      this.paymentService.createPayment(paymentRequest).subscribe({
        next: async (response: any) => {
          console.log('✅ Payment order created:', response);
          
          if (!response.razorpayOrderId) {
            console.error('❌ Razorpay Order ID missing in response');
            alert('Payment order creation failed. Missing Razorpay Order ID.');
            this.isPaymentProcessing = false;
            return;
          }

          // Load Razorpay SDK
          await this.loadRazorpaySdk();
          
          // Open Razorpay checkout
          this.openRazorpayCheckout(response, billingName, phoneNumber, billingAddress, gstNumber);
        },
        error: (error) => {
          console.error('❌ Payment creation error:', error);
          
          // Try alternative endpoints if primary fails
          this.tryAlternativeEndpoints(paymentRequest, billingName, phoneNumber, billingAddress, gstNumber);
        }
      });

    } catch (error) {
      console.error('💥 Payment initiation error:', error);
      alert('Payment initiation failed. Please try again.');
      this.isPaymentProcessing = false;
    }
  }

  private tryAlternativeEndpoints(
    paymentRequest: CreatePaymentRequest,
    billingName: string,
    phoneNumber: string,
    billingAddress: string,
    gstNumber: string
  ) {
    // Try V2 endpoint
    this.paymentService.createPaymentV2(paymentRequest).subscribe({
      next: async (response: any) => {
        console.log('✅ V2 endpoint success:', response);
        await this.handlePaymentSuccess(response, billingName, phoneNumber, billingAddress, gstNumber);
      },
      error: (error2) => {
        console.log('❌ V2 endpoint failed, trying token endpoint...', error2);
        
        // Try token endpoint
        this.paymentService.createPaymentWithToken(paymentRequest).subscribe({
          next: async (response: any) => {
            console.log('✅ Token endpoint success:', response);
            await this.handlePaymentSuccess(response, billingName, phoneNumber, billingAddress, gstNumber);
          },
          error: (error3) => {
            console.log('❌ All endpoints failed:', error3);
            this.handleAllEndpointsFailed(error3);
          }
        });
      }
    });
  }

  private async handlePaymentSuccess(
    response: any,
    billingName: string,
    phoneNumber: string,
    billingAddress: string,
    gstNumber: string
  ) {
    console.log('✅ Payment order created successfully:', response);
    
    if (!response.razorpayOrderId) {
      console.error('❌ Razorpay Order ID missing in response');
      alert('Payment order creation failed. Missing Razorpay Order ID.');
      this.isPaymentProcessing = false;
      return;
    }

    try {
      // Load Razorpay SDK
      await this.loadRazorpaySdk();
      console.log('✅ Razorpay SDK loaded successfully');
      
      // Open Razorpay checkout
      this.openRazorpayCheckout(response, billingName, phoneNumber, billingAddress, gstNumber);
    } catch (error) {
      console.error('❌ Razorpay SDK loading failed:', error);
      alert('Payment gateway loading failed. Please try again.');
      this.isPaymentProcessing = false;
    }
  }

private handleAllEndpointsFailed(error: any) {
  this.isPaymentProcessing = false;
  
  const errorMsg = error.error?.error || error.message || 'Payment failed';
  
  if (error.status === 401 || error.status === 403) {
    alert('Session expired. Please login again.');
    this.router.navigate(['/login']);
  } else if (errorMsg.includes('PAYMENT_PENDING')) {
    // ✅ Specific handling for PAYMENT_PENDING - allow retry
    const confirmed = confirm(
      'A payment is already in process for this booking. Would you like to continue with the existing payment?'
    );
    if (confirmed) {
      // Refresh and try again with force retry
      this.fetchBookingResponses();
      setTimeout(() => {
        this.retryPaymentWithExisting();
      }, 1000);
    }
  } else if (errorMsg.includes('already paid') || errorMsg.includes('already PAID')) {
    alert('This booking is already paid. Please check your bookings.');
    this.router.navigate(['/my-bookings']);
  } else {
    alert('Payment failed: ' + errorMsg);
  }
  
  console.error('Payment failed:', error);
}

// ✅ New method for retrying with existing payment
private retryPaymentWithExisting() {
  // Get the latest booking data and try payment again
  const billingName = this.billingForm.get('billingName')?.value;
  const billingAddress = this.billingForm.get('billingAddress')?.value;
  const gstNumber = this.billingForm.get('gstNumber')?.value;
  const phoneNumber = this.billingForm.get('phoneNumber')?.value;
  
  if (billingName && billingAddress && phoneNumber) {
    this.onProceedToPayment(billingName, billingAddress, gstNumber, phoneNumber);
  }
}

  private openRazorpayCheckout(
    response: any, 
    billingName: string, 
    phoneNumber: string, 
    billingAddress: string,
    gstNumber: string
  ): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    console.log('🎯 Opening Razorpay Checkout...');
    console.log('🔑 Razorpay Key:', environment.razorpayKey);
    console.log('📝 Order ID:', response.razorpayOrderId);
    console.log('💰 Amount:', response.amount * 100);

    // Razorpay options
    const options = {
      key: environment.razorpayKey,
      amount: response.amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Staff Booking Service',
      description: 'Staff Booking Payment',
      order_id: response.razorpayOrderId,
      handler: (razorpayResponse: any) => {
        console.log('✅ Payment successful:', razorpayResponse);
        this.verifyPayment(razorpayResponse);
      },
      prefill: {
        name: billingName,
        email: user.email || 'user@example.com',
        contact: phoneNumber
      },
      notes: {
        address: billingAddress,
        gst_number: gstNumber,
        booking_ids: this.getAllBookingIds().join(','),
        user_id: user.userId || 'unknown'
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: () => {
          console.log('❌ Payment modal dismissed by user');
          this.isPaymentProcessing = false;
        }
      }
    };

    console.log('🎯 Razorpay Options:', options);

    try {
      // Check if Razorpay is available
      if (typeof Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded');
      }

      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response);
        this.isPaymentProcessing = false;
        const errorMsg = response.error?.description || 'Payment failed. Please try again.';
        alert('Payment Failed: ' + errorMsg);
      });

      // Open Razorpay checkout
      rzp.open();
      console.log('✅ Razorpay checkout opened successfully');
      
    } catch (error) {
      console.error('❌ Razorpay initialization failed:', error);
      this.isPaymentProcessing = false;
      alert('Payment gateway initialization failed. Please try again.');
    }
  }

  private verifyPayment(razorpayResponse: any): void {
    const verifyRequest: VerifyPaymentRequest = {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature
    };

    console.log('🔍 Verifying payment:', verifyRequest);

    this.paymentService.verifyPayment(verifyRequest).subscribe({
      next: (response: any) => {
        this.isPaymentProcessing = false;
        console.log('✅ Payment verified successfully:', response);
        
        alert('Payment completed successfully!');
        this.router.navigate(['/payment-success'], {
          queryParams: { 
            paymentId: response.payment?.paymentId,
            amount: response.payment?.amount 
          }
        });
      },
      error: (error) => {
        this.isPaymentProcessing = false;
        console.error('❌ Payment verification failed:', error);
        alert('Payment verification failed: ' + (error.error?.error || error.message));
      }
    });
  }

  // Utility methods
  private getAllBookingIds(): number[] {
    const bookingIds: number[] = [];
    this.staffDetails.forEach(categoryGroup => {
      categoryGroup.availableStaff.forEach((staff: any) => {
        if (staff.bookingId) {
          bookingIds.push(staff.bookingId);
        }
      });
    });
    return bookingIds;
  }

  private calculateTotalAmount(): number {
    let total = 0;
    this.staffDetails.forEach(categoryGroup => {
      categoryGroup.availableStaff.forEach((staff: any) => {
        const price = parseFloat(staff.price) || 0;
        total += price;
      });
    });
    return total;
  }

  private async loadRazorpaySdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') {
        console.log('✅ Razorpay SDK already loaded');
        resolve();
        return;
      }

      console.log('📥 Loading Razorpay SDK...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay SDK loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Razorpay SDK failed to load');
        reject(new Error('Razorpay SDK failed to load'));
      };
      document.body.appendChild(script);
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.billingForm.controls).forEach(key => {
      const control = this.billingForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for template
  getTotalAmount(): number {
    return this.calculateTotalAmount();
  }

  getTotalStaff(): number {
    let count = 0;
    this.staffDetails.forEach(categoryGroup => {
      count += categoryGroup.availableStaff.length;
    });
    return count;
  }

  get formControls() {
    return this.billingForm.controls;
  }

  getStars(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 0; i < 5; i++) {
      const current = i + 1;
      if (rating >= current) stars.push('full');
      else if (rating > current - 1 && rating < current) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  }

  removeStaff(staff: any): void {
    if (!staff.id) {
      console.error('No ID found for staff:', staff);
      return;
    }
    this.bookingResponseService.removeStaffFromBooking(staff.id).subscribe({
      next: () => {
        this.staffDetails.forEach(categoryGroup => {
          categoryGroup.availableStaff = categoryGroup.availableStaff.filter((s: any) => s.id !== staff.id);
        });
      },
      error: (err) => {
        console.error('Error removing staff:', err);
      }
    });
  }

  addSpecificStaff(staff: any): void {
    const token = this.getToken();
    if (!token) {
      alert('Please login or signup first to access book staff page');
      this.router.navigate(['/login']);
      return;
    }

    const payload = {
      staffForms: [
        {
          typeOfStaff: staff.typeOfStaff || staff.category,
          typeOfSubStaff: staff.typeOfSubStaff,
          shifts: [
            {
              timeSlot: staff.timeSlot,
              shiftType: staff.shiftType || 'Day',
              maleQuantity: staff.gender?.toLowerCase() === 'male' ? 1 : 0,
              femaleQuantity: staff.gender?.toLowerCase() === 'female' ? 1 : 0,
              tenure: staff.tenure,
              dutyStartDate: String(
                staff.dutyStartDate || new Date().toISOString().split('T')[0]
              )
            }
          ]
        }
      ]
    };

    this.bookingResponseService.addIndividualStaff(payload).subscribe({
      next: () => {
        alert(`${staff.name} has been added to your booking!`);
        staff.isBooked = true;
      },
      error: (err) => {
        console.error('Error adding staff:', err);
        alert('Failed to add staff. Please try again.');
      }
    });
  }
}