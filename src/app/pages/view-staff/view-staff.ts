import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponseService } from '../../core/booking-response.service';
import { API_URL, ENDPOINTS } from '@src/app/core/const';

@Component({
  selector: 'app-view-staff',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-staff.html',
  styleUrl: './view-staff.scss'
})
export class ViewStaff implements OnInit {
  staffDetails: any[] = [];
  selectedStaff: any;
  constructor(
    private router: Router,
    private bookingResponseService: BookingResponseService
  ) { }

  ngOnInit(): void {
    this.fetchBookingResponses(); //API call here
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



  removeStaff(staff: any): void {
    if (!staff.id) {
      console.error('No ID found for staff:', staff);
      return;
    }

    // if (confirm(`Are you sure you want to remove ${staff.name}?`)) {
    this.bookingResponseService.removeStaffFromBooking(staff.id).subscribe({
      next: (res) => {
        // Update UI
        this.staffDetails.forEach(categoryGroup => {
          categoryGroup.availableStaff = categoryGroup.availableStaff.filter((s: any) => s.id !== staff.id);
        });
      },
      error: (err) => {
        console.error('Error removing staff:', err);
      }
    });
    // }
  }


  // Kisi ek staff ko ke badle dusra staff add karna
  addSpecificStaff(staff: any): void {
    // Token check
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      alert('Please login or signup first to access book staff page');
      this.router.navigate(['/login']);
      return;
    }

    // Payload
    const payload = {
      staffForms: [
        {
          typeOfStaff: staff.typeOfStaff || staff.category, // category field agar staff me available hai
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


    // if (confirm(`Add ${staff.name} (${staff.typeOfSubStaff} ${staff.typeOfStaff || staff.category}) to your booking?`)) {
    this.bookingResponseService.addIndividualStaff(payload).subscribe({
      next: (res) => {
        console.log('Staff added successfully:', res);
        alert(`${staff.name} has been added to your booking!`);
        staff.isBooked = true;
      },
      error: (err) => {
        console.error('Error adding staff:', err);
        alert('Failed to add staff. Please try again.');
      }
    });
    // }
  }



}
