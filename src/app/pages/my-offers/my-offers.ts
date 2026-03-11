import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { API_URL1 } from '@src/app/core/const';

@Component({
  selector: 'app-my-offers',
  imports: [CommonModule],
  templateUrl: './my-offers.html',
  styleUrl: './my-offers.scss',
})
export class MyOffers implements OnInit {
  offers: any[] = [];

  pendingOffers: any[] = [];
  acceptedOffers: any[] = [];
  rejectedOffers: any[] = [];
  expiredOffers: any[] = [];
  cancelledOffers: any[] = [];

  activeTab = 'pending';

  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getOffers();
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

    this.http.get<any[]>(
      `${API_URL1}/user/offers/my-offers`,{ headers }
      
    )
    .subscribe({

      next: (res) => {

        this.offers = res || [];

        this.filterOffers();
         // ✅ Automatically open ACCEPTED tab
      this.activeTab = 'accepted';
        this.isLoading = false;
      },

      error: () => {
        this.isLoading = false;
      }

    });

  }

  filterOffers() {



    this.acceptedOffers = this.offers.filter(o =>
      o.offerStatus === 'ACCEPTED' 
    );

        this.pendingOffers = this.offers.filter(o =>
      o.offerStatus === 'PENDING'
    );

    this.rejectedOffers = this.offers.filter(o =>
      o.offerStatus === 'REJECTED'
    );

    this.expiredOffers = this.offers.filter(o =>
      o.offerStatus === 'EXPIRED' || o.isExpired === true
    );

    this.cancelledOffers = this.offers.filter(o =>
      o.offerStatus === 'CANCELLED'
    );

  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }
}
