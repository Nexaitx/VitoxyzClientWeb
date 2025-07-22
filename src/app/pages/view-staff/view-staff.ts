import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponseService } from '../../core/booking-response.service';

@Component({
  selector: 'app-view-staff',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-staff.html',
  styleUrl: './view-staff.scss'
})
export class ViewStaff implements OnInit {
  staffDetails: any[] = [];

  constructor(
    private router: Router,
    private bookingResponseService: BookingResponseService
  ) {}

  ngOnInit(): void {
    this.fetchBookingResponses(); // ✅ API call here
  }

 fetchBookingResponses() {
  this.bookingResponseService.getBookingResponse().subscribe({
    next: (res) => {
      console.log('Raw booking response:', res);

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

      console.log('Formatted staff details:', formatted);
      this.staffDetails = formatted;
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
      if (rating >= current) {
        stars.push('full');
      } else if (rating > current - 1 && rating < current) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  addStaff(index: number): void {
    console.log('Add clicked for', this.staffDetails[index]);
  }

  removeStaff(index: number): void {
    console.log('Remove clicked for', this.staffDetails[index]);
  }
}
