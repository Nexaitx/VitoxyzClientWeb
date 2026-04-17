import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_URL1, API_URL2 } from '@src/app/core/const';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare var Razorpay: any; // Add Razorpay declaration

@Component({
  selector: 'app-my-offers',
  imports: [CommonModule, FormsModule],
  templateUrl: './my-offers.html',
  styleUrl: './my-offers.scss',
})
export class MyOffers implements OnInit {

  offers: any[] = [];
  filteredOffers: any[] = [];
  showBookingPopup = false;
  bookingDetails: any = null;
  bookingLoading = false;
page = 1;
pageSize = 10;
paginatedOffers: any[] = [];

  showDetailsPopup = false;
bookingDetailed: any = null;
detailsLoading = false;

  showDriverPopup = false;
  driverDetails: any = null;
  driverLoading = false;

  showMapPopup = false;
  mapLoading = false;
  mapUrl: SafeResourceUrl | null = null;

  mainTab = 'offers';
  activeTab = 'pending';

bookings: any[] = [];
  isLoading = false;
selectedStatus = 'PENDING';

  // isLoading = false;
  orders: any[] = [];
  orderStatus = 'READY_FOR_PICKUP';
  orderLoading = false;

  showResponsePopup = false;
  responseData: any = null;
  responseLoading = false;

  // Payment method related properties
  paymentMethodLoading = false;
  razorpayKey = ''; // Will be set from environment or response

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.getOffers();
    this.loadRazorpayScript();
  }

  loadRazorpayScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }

  selectMainTab(tab: string) {
    this.mainTab = tab;

    if (tab === 'offers') {
      this.getOffers();
    }
    if (tab === 'orders') {
      this.getOrders();
    }
     if (tab === 'Bookingstatus') {
       this.getBookings();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      '';

    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getOffers() {
    const headers = this.getAuthHeaders();
    this.isLoading = true;

    this.http.get<any[]>(`${API_URL1}/user/offers/my-offers`, { headers })
    .subscribe({
      next: (res) => {
        this.offers = res || [];
        // Initialize selectedPaymentMethod for each offer
        this.offers.forEach(offer => {
          offer.selectedPaymentMethod = offer.paymentType || '';
        });
        this.filterOffers();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
 getBookings() {

    const headers = this.getAuthHeaders();

    this.isLoading = true;

    this.http.get<any>(
      `${API_URL1}/user/pharmacybooking/by-status?status=${this.selectedStatus}`,
      { headers }
    )
    .subscribe({

      next: (res) => {

        // adjust based on API structure
        this.bookings = res?.bookings || res || [];

        this.isLoading = false;

      },

      error: () => {
        this.isLoading = false;
      }

    });

  }
  viewBookingDetailed(bookingId: number) {

  const headers = this.getAuthHeaders();

  this.showDetailsPopup = true;
  this.detailsLoading = true;
  this.bookingDetailed = null;

  this.http.get<any>(
    `${API_URL1}/user/pharmacybooking/${bookingId}/details`,
    { headers }
  ).subscribe({

    next: (res) => {
      this.bookingDetails = res;
      this.detailsLoading = false;
    },

    error: (err) => {
      console.error('Details API error', err);
      this.detailsLoading = false;
    }

  });

}
  closeDetailsPopup() {
  this.showDetailsPopup = false;
}

  filterOffers() {
    const status = this.activeTab.toUpperCase();
    this.filteredOffers = this.offers.filter(o =>
      o.offerStatus === status ||
      (status === 'EXPIRED' && o.isExpired === true)
    );

      // 👉 reset page when tab changes
  this.page = 1;

  this.applyPagination();
  }

  applyPagination() {
  const start = (this.page - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.paginatedOffers = this.filteredOffers.slice(start, end);
}

nextPage() {
  if (this.page * this.pageSize < this.filteredOffers.length) {
    this.page++;
    this.applyPagination();
  }
}

prevPage() {
  if (this.page > 1) {
    this.page--;
    this.applyPagination();
  }
}

  completePendingPayment(offer: any) {
  if (!offer.paymentType || offer.paymentType !== 'ONLINE') {
    alert('Please select ONLINE payment method first');
    return;
  }

  // Directly call same payment flow
  this.proceedToOnlinePayment(offer);
}

  // Update payment method API call
  updatePaymentMethod(offer: any) {
    if (!offer.selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    this.paymentMethodLoading = true;
    const headers = this.getAuthHeaders();

    const payload = {
      bookingId: offer.bookingId,
      paymentMethod: offer.selectedPaymentMethod
    };

    this.http.post<any>(
      `${API_URL1}/user/offers/payment-method`,
      payload,
      { headers }
    ).subscribe({
      next: (res) => {
        // Update the offer's payment type
        offer.paymentType = offer.selectedPaymentMethod;
        
        // Update in the main offers array
        const mainOffer = this.offers.find(o => o.bookingId === offer.bookingId);
        if (mainOffer) {
          mainOffer.paymentType = offer.selectedPaymentMethod;
        }
        
        this.paymentMethodLoading = false;
        
        // If online payment is selected, proceed to payment
        if (offer.selectedPaymentMethod === 'ONLINE') {
          this.proceedToOnlinePayment(offer);
        } else {
          // For COD, just show success message
          alert(`Payment method updated to Cash on Delivery successfully!`);
        }
        
        // Refresh filtered offers to reflect changes
        this.filterOffers();
      },
      error: (err) => {
        console.error('Failed to update payment method', err);
        this.paymentMethodLoading = false;
        alert('Failed to update payment method. Please try again.');
      }
    });
  }

  // Proceed to online payment
  proceedToOnlinePayment(offer: any) {
    const headers = this.getAuthHeaders();
    
    const payload = {
      bookingId: offer.bookingId,
      paymentMethod: 'ONLINE',
      amount: offer.finalAmount,
      paymentRemarks: 'medicine payment'
    };

    this.paymentMethodLoading = true;

    this.http.post<any>(
      `${API_URL1}/pharmacy-payments/online/create`,
      payload,
      { headers }
    ).subscribe({
      next: (res) => {
        this.paymentMethodLoading = false;
        
        if (res.success && res.data) {
          const paymentData = res.data;
          this.razorpayKey = paymentData.key;
          this.openRazorpay(paymentData, offer);
        } else {
          alert('Failed to create payment order');
        }
      },
      error: (err) => {
        console.error('Payment creation failed', err);
        this.paymentMethodLoading = false;
        alert('Failed to initiate payment. Please try again.');
      }
    });
  }

  // Open Razorpay checkout
  openRazorpay(paymentData: any, offer: any) {
    const options = {
      key: this.razorpayKey,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'Pharmacy Vitoxyz',
      description: `Payment for Booking ID: ${offer.bookingId}`,
      order_id: paymentData.razorpayOrderId,
      handler: (response: any) => {
        // Payment successful, verify payment
        this.verifyPayment(response, offer.bookingId);
      },
      prefill: {
        name: '', // You can get from user data
        email: '', // You can get from user data
        contact: '' // You can get from user data
      },
      notes: {
        bookingId: offer.bookingId
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal closed');
          alert('Payment was cancelled');
        }
      }
    };

    const razorpay = new Razorpay(options);
    razorpay.open();
  }

  // Verify payment with backend
  verifyPayment(response: any, bookingId: number) {
    const headers = this.getAuthHeaders();
    
    const payload = {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
      bookingId: bookingId
    };

    this.paymentMethodLoading = true;

    this.http.post<any>(
      `${API_URL1}/pharmacy-payments/online/verify`,
      payload,
      { headers }
    ).subscribe({
      next: (res) => {
        this.paymentMethodLoading = false;
        
        if (res.success) {
          alert('Payment successful! Your order has been confirmed.');
          // Refresh offers to update status
          this.getOffers();
        } else {
          alert('Payment verification failed. Please contact support.');
        }
      },
      error: (err) => {
        console.error('Payment verification failed', err);
        this.paymentMethodLoading = false;
        alert('Payment verification failed. Please contact support.');
      }
    });
  }

  editPaymentMethod(offer: any) {
    offer.selectedPaymentMethod = offer.paymentType;
    offer.paymentType = '';
    this.filterOffers();
  }

  getOrders() {
    const headers = this.getAuthHeaders();
    this.orderLoading = true;

    this.http.get<any>(
      `${API_URL1}/user/pharmacyorder/light?status=${this.orderStatus}`,
      { headers }
    )
    .subscribe({
      next: (res) => {
        this.orders = res?.bookings || [];
        this.orderLoading = false;
      },
      error: () => {
        this.orderLoading = false;
      }
    });
  }

  viewBookingDetails(bookingId: number) {
    const headers = this.getAuthHeaders();
    this.showBookingPopup = true;
    this.bookingLoading = true;

    this.http.get<any>(
      `${API_URL1}/user/pharmacyorder/detail/${bookingId}`,
      { headers }
    )
    .subscribe({
      next: (res) => {
        this.bookingDetails = res?.booking || null;
        this.bookingLoading = false;
      },
      error: () => {
        this.bookingLoading = false;
      }
    });
  }

  closePopup() {
    this.showBookingPopup = false;
    this.bookingDetails = null;
  }

  viewDriverDetails(driverId: number) {
    const headers = this.getAuthHeaders();
    this.showBookingPopup = false;
    this.showDriverPopup = true;
    this.driverLoading = true;

    this.http.get<any>(
      `${API_URL2}/drivers/${driverId}`, { headers }
    )
    .subscribe({
      next: (res) => {
        this.driverDetails = res?.driver || null;
        this.driverLoading = false;
      },
      error: () => {
        this.driverLoading = false;
      }
    });
  }

  closeDriverPopup() {
    this.showDriverPopup = false;
    this.driverDetails = null;
  }

  viewDriverLocation(driverId: number) {
    const headers = this.getAuthHeaders();
    this.showDriverPopup = false;
    this.showMapPopup = true;
    this.mapLoading = true;

    this.http.get<any>(
      `${API_URL2}/drivers/${driverId}/location`,
      { headers }
    )
    .subscribe({
      next: (res) => {
        const lat = res?.latitude;
        const lng = res?.longitude;
        const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.mapLoading = false;
      },
      error: () => {
        this.mapLoading = false;
      }
    });
  }

  closeMapPopup() {
    this.showMapPopup = false;
    this.mapUrl = null;
  }

  respondOffer(offer: any, isAccept: boolean) {
    const headers = this.getAuthHeaders();

    const payload = {
      bookingId: offer.bookingId,
      userRemarks: '',
      accept: isAccept
    };

    this.responseLoading = true;
    this.showResponsePopup = true;

    this.http.post<any>(
      `${API_URL1}/user/offers/respond`,
      payload,
      { headers }
    ).subscribe({
      next: (res) => {
        this.responseData = res;
        this.responseLoading = false;
        // Initialize selectedPaymentMethod for each offer
        this.offers.forEach(res => {
          res.selectedPaymentMethod = res.bookingPaymentType || '';
        });
        // Update list
        offer.offerStatus = res?.offerStatus;
        offer.bookingStatus = res?.bookingStatus;
        this.filterOffers();
      },
      error: (err) => {
        console.error('Offer response failed', err);
        this.responseLoading = false;
      }
    });
  }

  // Update payment method API call
  PaymentMethod(offer: any) {
    if (!offer.selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    this.paymentMethodLoading = true;
    const headers = this.getAuthHeaders();

    const payload = {
      bookingId: offer.bookingId,
      paymentMethod: offer.selectedPaymentMethod
    };

    this.http.post<any>(
      `${API_URL1}/user/offers/payment-method`,
      payload,
      { headers }
    ).subscribe({
      next: (apiRes) => {
        // Update the offer's payment type
        offer.bookingPaymentType = offer.selectedPaymentMethod;
        
        // // Update in the main offers array
        // const mainOffer = this.offers.find(res => res.bookingId === res.bookingId);
        // if (mainOffer) {
        //   mainOffer.paymentType = res.selectedPaymentMethod;
        // }
        
        this.paymentMethodLoading = false;
        
        // If online payment is selected, proceed to payment
        if (offer.selectedPaymentMethod === 'ONLINE') {
          this.proceedToOnlinePayment(offer);
        } else {
          // For COD, just show success message
          alert(`Payment method updated to Cash on Delivery successfully!`);
        }
        
        // Refresh filtered offers to reflect changes
        this.filterOffers();
      },
      error: (err) => {
        console.error('Failed to update payment method', err);
        this.paymentMethodLoading = false;
        alert('Failed to update payment method. Please try again.');
      }
    });
  }
  closeResponsePopup() {
    this.showResponsePopup = false;
    this.responseData = null;
  }

  // Keep this for backward compatibility if needed
 

  confirmPaymentFromPopup() {
  if (!this.responseData?.selectedPaymentMethod) {
    alert('Please select payment method');
    return;
  }

  const headers = this.getAuthHeaders();

  const payload = {
    bookingId: this.responseData.bookingId,
    paymentMethod: this.responseData.selectedPaymentMethod
  };

  this.paymentMethodLoading = true;

  // ✅ STEP 1: Save payment method
  this.http.post<any>(
    `${API_URL1}/user/offers/payment-method`,
    payload,
    { headers }
  ).subscribe({
    next: (res) => {
      this.paymentMethodLoading = false;

      // ✅ STEP 2: If ONLINE → proceed to payment
      if (this.responseData.selectedPaymentMethod === 'ONLINE') {
        this.proceedToOnlinePayment(this.responseData);
      } else {
        alert('Order placed with Cash on Delivery');
        this.closeResponsePopup();
        this.getOffers();
      }
    },
    error: () => {
      this.paymentMethodLoading = false;
      alert('Failed to save payment method');
    }
  });
}
}