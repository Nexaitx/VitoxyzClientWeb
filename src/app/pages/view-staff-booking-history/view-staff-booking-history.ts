import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingItem, PageMeta, ViewStaffBookingHistoryService } from '@src/app/core/services/view-staff-booking-history.service';


import { finalize } from 'rxjs/operators';

type TabKey = 'past' | 'ongoing' | 'upcoming';

@Component({
  selector: 'app-view-staff-booking-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  // Reorder modal state
  reorderOpen = false;
  overrideForm: FormGroup;
  overrideSubmitting = false;
  overrideResult: any = null;
  overrideError: string | null = null;

  // View details popup
viewDetailsOpen = false;
staffDetailsLoading = false;
staffDetailsError: string | null = null;
staffDetails: any = null;

  private overrideUrl = 'https://vitoxyz.com/Backend/api/booking/override/bulk-request?accountNonExpired=true&credentialsNonExpired=true&accountNonLocked=true&authorities=%5B%7B%22authority%22%3A%22string%22%7D%5D&username=string&password=string&enabled=true';

  constructor(private viewStaffBookingHistoryService : ViewStaffBookingHistoryService,
      private http: HttpClient,
    private fb: FormBuilder,
     private router: Router,
   ) {
        // build override form
    this.overrideForm = this.fb.group({
      userLatitude: [0.0, Validators.required],
      userLongitude: [0.0, Validators.required],
      bookings: this.fb.array([])
    });

   }

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

  // small helpers
  private asISODate(value: string | Date): string {
    const d = new Date(value);
    // yyyy-mm-dd
    return d.toISOString().split('T')[0];
  }

  private todayString(): string {
    return new Date().toISOString().split('T')[0];
  }
}
