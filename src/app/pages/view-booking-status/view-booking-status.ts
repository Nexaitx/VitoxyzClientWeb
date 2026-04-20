import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { API_URL1, API_URL2 } from '@src/app/core/const';

@Component({
  selector: 'app-view-booking-status',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-booking-status.html',
  styleUrl: './view-booking-status.scss',
})
export class ViewBookingStatus implements OnInit {
bookings: any[] = [];
  isLoading = false;
selectedStatus = 'PENDING';

showDetailsPopup = false;
bookingDetails: any = null;
detailsLoading = false;

offers: any[] = [];
  filteredOffers: any[] = [];
  showBookingPopup = false;
// bookingDetails: any = null;
bookingLoading = false;

showDriverPopup = false;
driverDetails: any = null;
driverLoading = false;

showMapPopup = false;
mapLoading = false;
mapUrl: SafeResourceUrl | null = null;


  mainTab = 'Bookingstatus';
  activeTab = 'pending';

  // isLoading = false;
  orders: any[] = [];
orderStatus = 'READY_FOR_PICKUP';
orderLoading = false;

showResponsePopup = false;
responseData: any = null;
responseLoading = false;
  
constructor(private http: HttpClient,
    private route: ActivatedRoute , private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.getBookings();
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
    getOffers() {

    const headers = this.getAuthHeaders();

    this.isLoading = true;

    this.http.get<any[]>(`${API_URL1}/user/offers/my-offers`, { headers })
    .subscribe({

      next: (res) => {

        this.offers = res || [];

        this.filterOffers();

        this.isLoading = false;

      },

      error: () => {
        this.isLoading = false;
      }

    });

  }

  filterOffers() {

    const status = this.activeTab.toUpperCase();

    this.filteredOffers = this.offers.filter(o =>
      o.offerStatus === status ||
      (status === 'EXPIRED' && o.isExpired === true)
    );

  }
  viewBookingDetails(bookingId: number) {

  const headers = this.getAuthHeaders();

  this.showDetailsPopup = true;
  this.detailsLoading = true;
  this.bookingDetails = null;

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
viewBookingDetailsOrder(bookingId: number) {

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
closePopup(){
  this.showBookingPopup = false;
  this.bookingDetails = null;
}
viewDriverDetails(driverId: number) {
  const headers = this.getAuthHeaders();

    // ✅ Close booking popup first
  this.showBookingPopup = false;
    // ✅ Open driver popup
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
closeDriverPopup(){
  this.showDriverPopup = false;
  this.driverDetails = null;
}
viewDriverLocation(driverId: number) {

  const headers = this.getAuthHeaders();

  // ✅ close driver popup
  this.showDriverPopup = false;

  // ✅ open map popup
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

      // ✅ create google map url
      const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

      this.mapLoading = false;

    },

    error: () => {
      this.mapLoading = false;
    }

  });

}
closeMapPopup(){
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

      // ✅ store full response
      this.responseData = res;
      this.responseLoading = false;

      // ✅ update list
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
closeResponsePopup() {
  this.showResponsePopup = false;
  this.responseData = null;
}

}
