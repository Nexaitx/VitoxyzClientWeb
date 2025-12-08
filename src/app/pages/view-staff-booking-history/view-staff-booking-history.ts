import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BookingItem, PageMeta, ViewStaffBookingHistoryService } from '@src/app/core/services/view-staff-booking-history.service';


import { finalize } from 'rxjs/operators';

type TabKey = 'past' | 'ongoing' | 'upcoming';

@Component({
  selector: 'app-view-staff-booking-history',
  standalone: true,
  imports: [CommonModule],
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
    upcoming: null
  };

  // local pagination controls
  page = 0;
  size = 10;

  constructor(private viewStaffBookingHistoryService : ViewStaffBookingHistoryService ) {}

  ngOnInit(): void {
    this.loadTab(this.activeTab);
  }

  setTab(tab: TabKey) {
    this.activeTab = tab;
    this.page = 0; // reset page on tab switch or keep persisted if you want
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
      },
      error: err => {
        console.error('Booking API error', err);
        this.error = (err && err.message) ? err.message : 'Failed to load bookings';
      }
    });
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
    const p = this.pages[this.activeTab];
    return p ? p.content : [];
  }
}
