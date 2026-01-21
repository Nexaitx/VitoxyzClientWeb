import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingItem, CancellationItem, PageMeta, ViewStaffBookingHistoryService } from '@src/app/core/services/view-staff-booking-history.service';


import { finalize } from 'rxjs/operators';
import { Footer } from "../footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { CreatePaymentRequest, PaymentService, VerifyPaymentRequest } from '@src/app/core/services/payment.service';
import { environment } from '@src/environments/environment.development';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

type TabKey = 'past' | 'ongoing' | 'upcoming' | 'completed'| 'my-cancellations'| 'payment-pending';

@Component({
  selector: 'app-view-staff-booking-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Footer, MobileFooterNavComponent,MatSnackBarModule],
  templateUrl: './view-staff-booking-history.html',
  styleUrls: ['./view-staff-booking-history.scss']
})
export class ViewStaffBookingHistory implements OnInit {
  activeTab: TabKey = 'upcoming';

  loading = false;
  error: string | null = null;

  // store pages per tab so user can change tabs without losing pagination
  pages: Record<TabKey, PageMeta | null> = {
    past: null,
    ongoing: null,
    upcoming: null,
    completed:null,
    'my-cancellations': null,
     'payment-pending': null 
  };

  // local pagination controls
  page = 0;
  size = 10;

  // Reorder modal state
  reorderOpen = false;
  overrideForm: FormGroup;
  overrideSubmitting = false;
  overrideResult: any = null;
  overrideError: string | null = null;
completedBookings: BookingItem[] = [];
cancellations: CancellationItem[] = [];
  // View details popup
viewDetailsOpen = false;
staffDetailsLoading = false;
staffDetailsError: string | null = null;
staffDetails: any = null;

// Cancel booking popup
cancelModalOpen = false;
cancelBookingId!: number;
cancelReason = '';
cancelSubmitting = false;
cancelResult: string | null = null;
// Cancel success popup
cancelSuccessOpen = false;
cancelSuccessMessage = '';
paymentPendingBookings: BookingItem[] = [];
// Auto staff reassignment popup
staffReassignPopupOpen = false;
staffReassignMessage = 'Please wait, admin assigned new staff';
private staffPopupShown = false;

billingForm!: FormGroup;
isPaymentProcessing = false;
selectedPaymentBooking!: BookingItem;


  private overrideUrl = 'https://vitoxyz.com/Backend/api/booking/override/bulk-request?accountNonExpired=true&credentialsNonExpired=true&accountNonLocked=true&authorities=%5B%7B%22authority%22%3A%22string%22%7D%5D&username=string&password=string&enabled=true';

  constructor(private viewStaffBookingHistoryService : ViewStaffBookingHistoryService,
      private http: HttpClient,
    private fb: FormBuilder,
    private paymentService: PaymentService,
     private router: Router,
     private snackBar: MatSnackBar
   ) {
        // build override form
    this.overrideForm = this.fb.group({
      userLatitude: [0.0, Validators.required],
      userLongitude: [0.0, Validators.required],
      bookings: this.fb.array([])
    });

    this.billingForm = this.fb.group({
  billingName: ['', Validators.required],
  phoneNumber: ['', Validators.required],
  billingAddress: ['', Validators.required],
  gstNumber: ['']
});

 }
   private getToken(): string | null {
    return localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken');
  }

  ngOnInit(): void {
    this.loadTab(this.activeTab);
  }

  private checkCancelledStatus(bookings: any[]): void {
  if (this.staffPopupShown) return;

  const cancelledByStaff = bookings.some(
    b => (b.status || '').toLowerCase() === 'cancelled'
  );

  if (cancelledByStaff) {
    this.staffPopupShown = true;
    this.staffReassignPopupOpen = true;

    setTimeout(() => {
      this.staffReassignPopupOpen = false;
    }, 3000);
  }
}


  setTab(tab: TabKey) {
    this.activeTab = tab;
    this.page = 0; // reset page on tab switch or keep persisted if you want
      if (tab === 'completed') {
    this.loadCompletedBookings();
    return;
  }
   if (tab === 'my-cancellations') {
    this.loadMyCancellations();
    return;
  }
  if (tab === 'payment-pending') {
    this.loadPaymentPendingBookings();
    return;
  }
    if (!this.pages[tab]) {
      this.loadTab(tab);
    }
  }

  private loadTab(tab: TabKey) {
    this.loading = true;
    this.error = null;

    const obs =
      tab === 'past'
        ? this.viewStaffBookingHistoryService.getPastBookings(this.page, this.size, 'startDate', 'desc')
        : tab === 'ongoing'
        ? this.viewStaffBookingHistoryService.getOngoingBookings(this.page, this.size, 'startDate', 'desc')
        : this.viewStaffBookingHistoryService.getUpcomingBookings(this.page, this.size, 'startDate', 'asc');

    obs.pipe(finalize(() => (this.loading = false))).subscribe({
      next: data => {
        this.pages[tab] = data;
   // ✅ trigger popup after data renders
  this.checkCancelledStatus(data.content);
      },
      error: err => {
        console.error('Booking API error', err);
        this.error = (err && err.message) ? err.message : 'Failed to load bookings';
      }
    });
  }
private loadCompletedBookings() {
  this.loading = true;
  this.error = null;

  this.viewStaffBookingHistoryService
    .getCompletedBookings()
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: data => {
        this.completedBookings = data;
   this.checkCancelledStatus(data);
      },
      error: err => {
        console.error('Completed bookings API error', err);
        this.error = 'Failed to load completed bookings';
      }
    });
}

private loadMyCancellations() {
  this.loading = true;
  this.error = null;

  this.viewStaffBookingHistoryService
    .getMyCancellations()
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: (res) => {
        this.cancellations = res.cancellations || [];
      },
      error: (err) => {
        console.error('My cancellations API error', err);
        this.error = 'Failed to load cancellations';
      }
    });
}
private loadPaymentPendingBookings() {
  this.loading = true;
  this.error = null;

  const token = localStorage.getItem('authToken');
  if (!token) {
    this.loading = false;
    this.error = 'User not authenticated';
    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http
    .get<BookingItem[]>(
      'https://vitoxyz.com/Backend/api/user/paymentPending',
      { headers }
    )
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: (data) => {
        this.paymentPendingBookings = data || [];
      },
      error: (err) => {
        console.error('Payment pending API error', err);
        this.error = 'Failed to load payment pending bookings';
      }
    });
}

openPaymentModal(booking: BookingItem) {
  this.selectedPaymentBooking = booking;
  this.billingForm.reset();
  this.showModal('exampleModal');
}

showModal(id: string) {
  const modalEl = document.getElementById(id);
  if (modalEl) {
    const modal = new (window as any).bootstrap.Modal(modalEl);
    modal.show();
  }
}

closeModal(id: string) {
  const modalEl = document.getElementById(id);
  if (modalEl) {
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
}

  // pagination controls
  goToPage(newPage: number) {
    if (newPage < 0) return;
    const current = this.pages[this.activeTab];
    if (current && newPage >= current.totalPages) return;
    this.page = newPage;
    this.loadTab(this.activeTab);
  }

  changeSize(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadTab(this.activeTab);
  }

  // convenience for template
  get items(): BookingItem[] {
      if (this.activeTab === 'completed') {
    return this.completedBookings;
  }
  
  if (this.activeTab === 'payment-pending') {
    return this.paymentPendingBookings;
  }
    const p = this.pages[this.activeTab];
    return p ? p.content : [];
  }
  viewStaffDetails(staffId?: number) {
  if (!staffId) return;

  this.viewDetailsOpen = true;
  this.staffDetailsLoading = true;
  this.staffDetailsError = null;
  this.staffDetails = null;

  const token = localStorage.getItem('authToken');
  if (!token) {
    this.staffDetailsLoading = false;
    this.staffDetailsError = 'User not authenticated';
    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  const url = `https://vitoxyz.com/Backend/api/user/viewStaffDetails/${staffId}`;

  this.http.get<any>(url, { headers }).subscribe({
    next: (res) => {
      this.staffDetailsLoading = false;
      if (res?.status) {
        this.staffDetails = res.data;
      } else {
        this.staffDetailsError = res?.message || 'Failed to load staff details';
      }
    },
    error: (err) => {
      console.error(err);
      this.staffDetailsLoading = false;
      this.staffDetailsError = 'Failed to load staff details';
    }
  });
}
closeViewDetails() {
  this.viewDetailsOpen = false;
  this.staffDetails = null;
}
maskPhone(phone?: string | number): string {
  if (!phone) return '—';

  const phoneStr = phone.toString();

  if (phoneStr.length <= 4) {
    return phoneStr; // nothing to mask
  }

  const visible = phoneStr.slice(0, 4);
  const masked = 'X'.repeat(phoneStr.length - 4);

  return visible + masked;
}

  // ---------- Reorder modal helpers ----------
  get overrideBookings(): FormArray {
    return this.overrideForm.get('bookings') as FormArray;
  }

  private buildBookingGroup(data?: Partial<BookingItem>): FormGroup {
    // data might contain staffId, startDate, endDate, times...
  return this.fb.group({
    staffId: [data?.staffId ?? null, Validators.required],
    startDate: [data?.startDate ?? this.todayString(), Validators.required],
    endDate: [data?.endDate ?? this.todayString(), Validators.required],
    startTimeHour: [data?.startTimeHour ?? '10', Validators.required],
    startTimeMinute: [data?.startTimeMinute ?? '00', Validators.required],
    startTimeAmPm: [data?.startTimeAmPm ?? 'am', Validators.required],
    endTimeHour: [data?.endTimeHour ?? '5', Validators.required],
    endTimeMinute: [data?.endTimeMinute ?? '00', Validators.required],
    endTimeAmPm: [data?.endTimeAmPm ?? 'pm', Validators.required],
    overrideReason: ['Requested by user', Validators.required]
  });
  }

  addBookingRow(initial?: Partial<any>) {
    this.overrideBookings.push(this.buildBookingGroup(initial));
  }

  removeBookingRow(index: number) {
    this.overrideBookings.removeAt(index);
  }

  openReorderModal(booking: BookingItem) {
    // Clear previous state
    this.overrideResult = null;
    this.overrideError = null;
    this.overrideBookings.clear();

    // try to fill with booking data if fields exist on booking
   const staffId: number | undefined = booking.staffId ?? undefined; // be defensive
    const startDate = booking?.startDate ? this.asISODate(booking.startDate) : this.todayString();
    const endDate = booking?.endDate ? this.asISODate(booking.endDate) : startDate;

    // time fields: prefer timeSlot or startTimeHour etc.
    const pre: Partial<BookingItem> = {
  staffId,
  startDate,
  endDate
};

    // if booking has startTimeHour/minute/amPm fields, map them
    if (booking.startTimeHour)pre.startTimeHour = String(booking.startTimeHour);
    if (booking.startTimeMinute) pre.startTimeMinute = String(booking.startTimeMinute).padStart(2, '0');
    if (booking.startTimeAmPm) pre.startTimeAmPm = booking.startTimeAmPm.toString().toLowerCase();

    if (booking.endTimeHour) pre.endTimeHour = String(booking.endTimeHour);
    if (booking.endTimeMinute) pre.endTimeMinute = String(booking.endTimeMinute).padStart(2, '0');
    if (booking.endTimeAmPm) pre.endTimeAmPm = booking.endTimeAmPm.toString().toLowerCase();

    // fallback to split b.timeSlot like "10:00 AM - 05:00 PM"
    if (!pre.startTimeHour && booking?.timeSlot) {
      const ts = booking.timeSlot.split('-')[0]?.trim();
      const m = ts?.match(/(\d{1,2}):(\d{2})\s*([aApP][mM])?/);
      if (m) {
        pre.startTimeHour = m[1];
        pre.startTimeMinute = m[2];
        pre.startTimeAmPm = (m[3] ?? 'am').toLowerCase();
      }
      const te = booking.timeSlot.split('-')[1]?.trim();
      const m2 = te?.match(/(\d{1,2}):(\d{2})\s*([aApP][mM])?/);
      if (m2) {
        pre.endTimeHour = m2[1];
        pre.endTimeMinute = m2[2];
        pre.endTimeAmPm = (m2[3] ?? 'pm').toLowerCase();
      }
    }

    // user coordinates: try booking fields or fallback to 0
    // const lat = (booking?.userLatitude ?? booking?.latitude ?? 0.0);
    // const lng = (booking?.userLongitude ?? booking?.longitude ?? 0.0);

    // this.overrideForm.patchValue({ userLatitude: lat, userLongitude: lng });

    // add at least one booking row pre-filled
    this.addBookingRow(pre);

    // open modal
    this.reorderOpen = true;
  }

  closeReorderModal() {
    this.reorderOpen = false;
  }

  submitOverride() {
    if (this.overrideForm.invalid) {
      this.overrideForm.markAllAsTouched();
      return;
    }
    this.overrideSubmitting = true;
    this.overrideError = null;
    this.overrideResult = null;

    const payload = this.overrideForm.value;
    // convert numeric strings to strings as required by API (it expects strings for hours/minutes)
    payload.bookings = payload.bookings.map((b: any) => ({
      staffId: Number(b.staffId),
      startDate: b.startDate,
      endDate: b.endDate,
      startTimeHour: String(b.startTimeHour),
      startTimeMinute: String(b.startTimeMinute).padStart(2, '0'),
      startTimeAmPm: String(b.startTimeAmPm).toLowerCase(),
      endTimeHour: String(b.endTimeHour),
      endTimeMinute: String(b.endTimeMinute).padStart(2, '0'),
      endTimeAmPm: String(b.endTimeAmPm).toLowerCase(),
      overrideReason: b.overrideReason || 'Requested by user'
    }));

     const token = localStorage.getItem('authToken');

  if (!token) {
    this.overrideSubmitting = false;
    this.overrideError = 'User not logged in';
    return;
  }

  // ✅ REQUIRED HEADERS
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

    // call API
    this.http.post(this.overrideUrl, payload, { headers }).pipe(
      finalize(() => (this.overrideSubmitting = false))
    ).subscribe({
      next: (res: any) => {
        this.overrideResult = res;
         // ✅ REDIRECT AFTER SUCCESS (2 seconds)
        setTimeout(() => {
          this.reorderOpen = false; // close modal if open
          this.router.navigate(['/view-staff']);
        }, 2000);
      },
      error: (err) => {
        console.error('Override API error', err);
        this.overrideError = (err?.error?.message) || err?.message || 'Failed to send override';
      }
    });
  }
  openCancelModal(booking: BookingItem) {
    if (!booking.bookingId) {
    console.error('Booking ID is missing', booking);
    this.cancelResult = 'Unable to cancel booking. Booking ID missing.';
    return;
  }
  this.cancelBookingId = booking.bookingId;
  this.cancelReason = '';
  this.cancelResult = null;
  this.cancelModalOpen = true;
}

closeCancelModal() {
  this.cancelModalOpen = false;
}

confirmCancelBooking() {
  if (!this.cancelReason || !this.cancelBookingId) return;

  this.cancelSubmitting = true;
  this.cancelResult = null;

  const token = localStorage.getItem('authToken');
  if (!token) {
    this.cancelSubmitting = false;
    this.cancelResult = 'User not authenticated';
    return;
  }

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const payload = {
    bookingId: this.cancelBookingId,
    reason: this.cancelReason
  };

  this.http.post<any>(
    'https://vitoxyz.com/Backend/api/bookings/cancel',
    payload,
    { headers }
  ).subscribe({
    next: (res) => {
      if (res?.success) {
         this.cancelModalOpen = false;

    // ✅ Prepare popup message
    if (res.isRefundEligible) {
      this.cancelSuccessMessage =
        `You are eligible for ₹${res.refundAmount} refund.`;
    } else {
      this.cancelSuccessMessage =
        'You are not eligible for a refund.';
    }
         this.cancelSuccessOpen = true;

        // reload cancellations + bookings
        this.loadMyCancellations();
        this.loadTab(this.activeTab);
          // ✅ Auto close popup after 3 seconds (optional)
    setTimeout(() => {
      this.cancelSuccessOpen = false;
    }, 3000);
      } else {
        this.cancelResult = res?.message || 'Cancellation failed';
      }

      this.cancelSubmitting = false;
    },
    error: (err) => {
      console.error('Cancel booking error', err);
      this.cancelResult = 'Failed to cancel booking';
      this.cancelSubmitting = false;
    }
  });
}

  // small helpers
  private asISODate(value: string | Date): string {
    const d = new Date(value);
    // yyyy-mm-dd
    return d.toISOString().split('T')[0];
  }

  private todayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getAllBookingIds(): number[] {
  return this.selectedPaymentBooking?.bookingId
    ? [this.selectedPaymentBooking.bookingId]
    : [];
}
// private getAllBookingIds(): number[] {
//     const bookingIds: number[] = [];
//     this.staffDetails.forEach(categoryGroup => {
//       categoryGroup.availableStaff.forEach((staff: any) => {
//         if (staff.bookingId) {
//           bookingIds.push(staff.bookingId);
//         }
//       });
//     });
//     return bookingIds;
//   }
async onProceedToPayment(
  billingName: string,
  billingAddress: string,
  gstNumber: string,
  phoneNumber: string
) {
  if (this.billingForm.invalid) {
    this.markFormGroupTouched();
    return;
  }

  try {
    this.isPaymentProcessing = true;

    const token = this.getToken();
    if (!token) {
      alert('Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    const bookingIds = this.getAllBookingIds();
    if (!bookingIds.length) {
      alert('No bookings found for payment.');
      this.isPaymentProcessing = false;
      return;
    }

    const totalAmount = this.getTotalAmount();

    const paymentRequest: CreatePaymentRequest = {
      bookingIds: bookingIds,
      fullName: billingName,
      phoneNumber,
      address: billingAddress,
      gstNumber,
      amount: totalAmount
    };

    this.paymentService.createPayment(paymentRequest).subscribe({
      next: async (response: any) => {
        if (!response?.razorpayOrderId) {
          alert('Payment order creation failed.');
          this.isPaymentProcessing = false;
          return;
        }

        this.closeModal('exampleModal');
        await this.loadRazorpaySdk();
        this.openRazorpayCheckout(
          response,
          billingName,
          phoneNumber,
          billingAddress,
          gstNumber
        );
      },
      error: err => {
        this.tryAlternativeEndpoints(
          paymentRequest,
          billingName,
          phoneNumber,
          billingAddress,
          gstNumber
        );
      }
    });

  } catch (err) {
    console.error(err);
    this.isPaymentProcessing = false;
    alert('Payment initiation failed.');
  }
}
private tryAlternativeEndpoints(
  paymentRequest: CreatePaymentRequest,
  billingName: string,
  phoneNumber: string,
  billingAddress: string,
  gstNumber: string
) {
  this.paymentService.createPaymentV2(paymentRequest).subscribe({
    next: async (response: any) => {
      await this.handlePaymentSuccess(
        response,
        billingName,
        phoneNumber,
        billingAddress,
        gstNumber
      );
    },
    error: () => {
      this.paymentService.createPaymentWithToken(paymentRequest).subscribe({
        next: async (response: any) => {
          await this.handlePaymentSuccess(
            response,
            billingName,
            phoneNumber,
            billingAddress,
            gstNumber
          );
        },
        error: err => {
          this.handleAllEndpointsFailed(err);
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
  if (!response.razorpayOrderId) {
    alert('Payment order creation failed.');
    this.isPaymentProcessing = false;
    return;
  }

  this.closeModal('exampleModal');
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
        // this.fetchBookingResponses();
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

  const options = {
    key: environment.razorpayKey,
    amount: response.amount * 100,
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
    theme: { color: '#3399cc' },
      modal: {
        ondismiss: () => {
          console.log('❌ Payment modal dismissed by user');
          this.isPaymentProcessing = false;
        }
      }
  };

  const rzp = new (window as any).Razorpay(options);

  rzp.on('payment.failed', () => {
    this.isPaymentProcessing = false;
    alert('Payment failed. Please try again.');
  });

  rzp.open();
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
        // Verification succeeded
        this.isPaymentProcessing = false;
        console.log('✅ Payment verified successfully:', response);
        this.closeModal('exampleModal');
        // show success snackbar
        this.snackBar.open('Payment completed successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });

        // call paymentDone API to mark booking(s) as paid
        const bookingIds = this.getAllBookingIds();
        if (bookingIds.length) {
          this.paymentService.paymentDone(bookingIds).subscribe({
            next: (doneResp: any) => {
              console.log('📡 paymentDone response:', doneResp);
              setTimeout(() => {
           // close modal if open
          this.router.navigate(['/view-staff-booking-history']);
        },  400);
            },
            error: (err) => {
              console.error('⚠️ paymentDone API failed:', err);
              this.snackBar.open('Payment recorded but finalization failed.', 'Close', {
                duration: 4000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              });

              this.router.navigate(['/payment-success'], {
                queryParams: {
                  paymentId: response?.payment?.paymentId || razorpayResponse.razorpay_payment_id,
                  amount: response?.payment?.amount || this.getTotalAmount()
                }
              });
            }
          });
        } else {
          console.warn('No bookingIds found to mark done.');
          this.router.navigate(['/view-staff-booking-history'], {
            queryParams: {
              paymentId: response?.payment?.paymentId || razorpayResponse.razorpay_payment_id,
              amount: response?.payment?.amount || this.getTotalAmount()
            }
          });
        }
      },

      error: (error) => {
        this.isPaymentProcessing = false;
        console.error('❌ Payment verification failed:', error);

        const errMsg = (error?.error && (error.error.error || error.error.message)) || error?.message || '';
        const status = error?.status;
        const bookingIds = this.getAllBookingIds();

        // If backend sends "PAYMENT_PENDING"
        if (errMsg && errMsg.toUpperCase().includes('PAYMENT_PENDING')) {
          if (bookingIds.length) {
            this.paymentService.paymentPending(bookingIds).subscribe({
              next: (pendingResp: any) => {
                console.log('📡 paymentPending response:', pendingResp);
                this.snackBar.open('Payment pending. Saved status.', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  panelClass: ['info-snackbar']
                });
                this.router.navigate(['/payment-pending']);
              },
              error: (err2) => {
                console.error('⚠️ paymentPending API failed:', err2);
                this.snackBar.open('Payment pending but marking failed.', 'Close', {
                  duration: 4000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  panelClass: ['error-snackbar']
                });
              }
            });
          }
          return;
        }

        // If HTTP pending code
        if (status === 202 || status === 409 || status === 423) {
          if (bookingIds.length) {
            this.paymentService.paymentPending(bookingIds).subscribe({
              next: (pendingResp: any) => {
                console.log('📡 paymentPending response:', pendingResp);
                this.snackBar.open('Payment pending at gateway.', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  panelClass: ['info-snackbar']
                });
                this.router.navigate(['/payment-pending']);
              },
              error: (err2) => {
                console.error('⚠️ paymentPending API failed:', err2);
              }
            });
          }
          return;
        }

        // Fallback generic failure
        this.snackBar.open(
          'Payment verification failed: ' + (error.error?.error || error.message || 'Unknown'),
          'Close',
          {
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }
private loadRazorpaySdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}
  private markFormGroupTouched(): void {
    Object.keys(this.billingForm.controls).forEach(key => {
      const control = this.billingForm.get(key);
      control?.markAsTouched();
    });
  }
getTotalAmount(): number {
  if (!this.selectedPaymentBooking) {
    return 0;
  }

  const price = this.selectedPaymentBooking.price;

  if (price === null || price === undefined) {
    return 0;
  }

  return typeof price === 'string'
    ? Number(price)
    : price;
}

}
