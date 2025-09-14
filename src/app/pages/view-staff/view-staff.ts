import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponseService } from '../../core/booking-response.service';
import { API_URL, ENDPOINTS } from '@src/app/core/const';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Footer } from "../footer/footer";


declare var Razorpay: any;

@Component({
  selector: 'app-view-staff',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule, Footer],
  templateUrl: './view-staff.html',
  styleUrls: ['./view-staff.scss']
})
export class ViewStaff implements OnInit {
  staffDetails: any[] = [];
  selectedStaff: any;
billingForm!: FormGroup;

  private readonly razorpayKeyId = 'rzp_test_RARA6BGk8D2Y2o';
  private isPaymentLoading = false;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingResponseService: BookingResponseService
  ) { }

  ngOnInit(): void {
    this.fetchBookingResponses();
    this.billingForm = this.fb.group({
    billingAddress: ['', [Validators.required, Validators.minLength(5)]],
    billingName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
    gstNumber: ['', [Validators.required, ]]
  });
  }
    // gstNumber: ['', [Validators.required, Validators.pattern(/^([0-9A-Z]{15})$/)]]


  fetchBookingResponses() {
    this.bookingResponseService.getBookingResponse().subscribe({
      next: (res) => {
        
        const rawStaffList = res?.staff ?? [];
const formatted: any[] = [];

rawStaffList.forEach((entry: any) => {
  (entry.staffDetails ?? []).forEach((detail: any) => {
    formatted.push({
      category: detail.typeOfStaff,
      availableStaff: detail.availableStaff ?? []
    });
  });
});

this.staffDetails = formatted;

console.log('API staff:', res.staff);
console.log('Formatted staff:', formatted);

      },
      error: (err) => {
        console.error('Error fetching booking responses', err);
      }
    });
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
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
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

  async onProceedToPayment(billingName: string, billingAddress: string, gstNumber: string) {
    try {
      if (!this.razorpayKeyId) {
        alert('Razorpay Key ID is missing. Please add it in the component.');
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
        amount: Math.round(amountInINR * 100), 
        currency: 'INR',
        name: 'Your Company Name',
        description: 'Booking Payment',

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
          // response.razorpay_payment_id
          // response.razorpay_order_id (only when using order)
          // response.razorpay_signature  (only when using order)
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
          // this.router.navigate(['/medicines']);

    // alert(`Payment successful! Payment ID: ${response?.razorpay_payment_id || 'N/A'}`);
  }

  private onPaymentFailed(resp: any) {
    console.error('Payment failed:', resp);
    const msg = resp?.error?.description || 'Payment failed. Please try again.';
    alert(msg);
  }

  /** Loads Razorpay Checkout SDK once. */
  private loadRazorpaySdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Already loaded?
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

  
  private getPayableAmount(): number {
    return 1212; // INR
  }

}
