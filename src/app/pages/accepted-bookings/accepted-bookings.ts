import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { API_URL1 } from '@src/app/core/const';

@Component({
  selector: 'app-accepted-bookings',
  imports: [CommonModule],
  templateUrl: './accepted-bookings.html',
  styleUrl: './accepted-bookings.scss',
})
export class AcceptedBookings implements OnInit {
  bookings: any[] = [];
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAcceptedBookings();
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

  getAcceptedBookings() {
    const headers = this.getAuthHeaders();
    this.isLoading = true;

    this.http.get<any[]>(
      `${API_URL1}/user/pharmacybooking/accepted-bookings`,
     { headers }
    )
    .subscribe({

      next: (res) => {
         console.log('Accepted bookings response:', res);
         
        this.bookings = res ?? [];
        this.isLoading = false;
      },

      error: () => {
        this.isLoading = false;
      }

    });
  }
}
