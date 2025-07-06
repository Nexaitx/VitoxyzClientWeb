import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MapComponent } from '../map/map';
import { Submission } from '../../submission/submission';
import { HttpClient } from '@angular/common/http';
import { BookNurseService } from './book-nurse.service';
import { API_URL, ENDPOINTS } from '../../../core/const';
import { SpinnerToastService } from '../../../core/toasts/spinner-toast/spinner-toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-nurse',
  imports: [CommonModule,
    ReactiveFormsModule,
    MapComponent,
    Submission
  ],
  templateUrl: './book-nurse.html',
  styleUrls: ['./book-nurse.scss'],
  providers: [BookNurseService]
})

export class BookNurse {
  fb = inject(FormBuilder);
  bookNurseService = inject(BookNurseService);
  http = inject(HttpClient);
  router = inject(Router)
  staffBookingForm!: FormGroup;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
  minutes: number[] = [0, 15, 30, 45];
  quantity: number[] = Array.from({ length: 20 }, (_, i) => i + 1); // 1 to 10
  nurseTenure = ['1 Day', '15 Days', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly'];
  typesOfNurses = [
    { value: 'general', label: 'General Nurse (Staff Nurse)' },
    { value: 'icu', label: 'ICU/Critical Care Nurse' },
    { value: 'pediatric', label: 'Pediatric Nurse' },
    { value: 'geriatric', label: 'Geriatric Nurse' },
    { value: 'homecare', label: 'Home Care Nurse' },
    { value: 'surgical', label: 'Surgical/Operating Room (OT) Nurse' },
    { value: 'psychiatric', label: 'Psychiatric/Mental Health Nurse' },
    { value: 'midwife', label: 'Midwife (Registered Midwife - RM)' },
    { value: 'dialysis', label: 'Dialysis Nurse' },
    { value: 'rehabilitation', label: 'Rehabilitation Nurse' },
    { value: 'oncology', label: 'Oncology Nurse (Cancer Care)' },
    { value: 'emergency', label: 'Emergency Room (ER) Nurse' },
    { value: 'cardiac', label: 'Cardiac Nurse' },
    { value: 'neonatal', label: 'Neonatal Nurse (NICU Nurse)' },
    { value: 'community_health', label: 'Community Health Nurse' },
    { value: 'public_health', label: 'Public Health Nurse' },
    { value: 'nurse_practitioner', label: 'Nurse Practitioner (NP)' },
    { value: 'clinical_nurse_specialist', label: 'Clinical Nurse Specialist (CNS)' },
    { value: 'nurse_educator', label: 'Nurse Educator' },
    { value: 'nurse_administrator', label: 'Nurse Administrator/Manager' },
    { value: 'nurse_researcher', label: 'Nurse Researcher' },
    { value: 'nurse_informaticist', label: 'Nurse Informaticist' },
    { value: 'auxiliary_nurse_midwife', label: 'Auxiliary Nurse Midwife (ANM)' },
    { value: 'general_nursing_midwifery', label: 'General Nursing and Midwifery (GNM)' },
    { value: 'orthopedic', label: 'Orthopedic Nurse' },
    { value: 'neurology', label: 'Neurology Nurse' },
    { value: 'maternal_child_health', label: 'Maternal and Child Health Nurse' },
    { value: 'occupational_health', label: 'Occupational Health Nurse' },
    { value: 'school_nurse', label: 'School Nurse' },
    { value: 'forensic', label: 'Forensic Nurse' },
    { value: 'travel_nurse', label: 'Travel Nurse' },
    { value: 'flight_nurse', label: 'Flight Nurse' },
    { value: 'certified_registered_nurse_anesthetist', label: 'Certified Registered Nurse Anesthetist (CRNA)' },
    { value: 'babycare', label: 'Baby Care' },
    { value: 'other', label: 'Other' }
  ];
  button = 'Search for staff';

  staffTypes = [
    { label: 'Nurse', value: 'nurse' },
    { label: 'Physiotherapist', value: 'physiotherapist' },
    { label: 'Baby-Sitter', value: 'babysitter' },
    { label: 'Security Guard', value: 'securityguard' },
    { label: 'Psychiatrist', value: 'psychiatrist' }
  ];

  times = [
    { label: '09am-05pm', value: '1' }, { label: '08am-04pm', value: '2' }, { label: '10am-06pm', value: '3' }
  ]

  shiftTypes = ['2 Hours Max', '8 Hours', '12 Hours', '24 Hours'];
  tenure = [
    { label: '1 Day', value: '1' }, { label: '3 Days', value: '2' }, { label: '1 Week', value: '3' }, { label: '2 Weeks', value: '4' }, { label: '1 Month', value: '5' }
  ]


  @Input() initialHours: number = 9;
  @Input() initialMinutes: number = 0;
  @Input() initialAmPm: 'AM' | 'PM' = 'AM';

  @Output() timeSelected = new EventEmitter<{ hours: number; minutes: number; ampm: 'AM' | 'PM' }>();

  timeForm!: FormGroup;

  constructor(
    private spinnerService: SpinnerToastService
  ) { }

  ngOnInit(): void {
    this.getUserLocation();
    this.staffBookingForm = this.fb.group({
      userAddress: ['', Validators.required],
      latitude: [],
      longitude: [],
      staff: this.fb.array([this.createStaffFormGroup()])
    });


     this.timeForm = this.fb.group({
      hours: [this.initialHours, [Validators.required, Validators.min(1), Validators.max(12)]],
      minutes: [this.initialMinutes, [Validators.required, Validators.min(0), Validators.max(59)]],
      ampm: [this.initialAmPm, Validators.required]
    });

    // Emit initial value and subscribe to changes
    this.emitTime();
    this.timeForm.valueChanges.subscribe(() => {
      this.emitTime();
    });
  }

  increment(unit: 'hours' | 'minutes'): void {
    if (unit === 'hours') {
      let currentHours = this.timeForm.get('hours')?.value;
      currentHours = (currentHours % 12) + 1; // Cycle from 1 to 12
      if (currentHours === 0) currentHours = 12; // Handle 12 AM/PM correctly
      this.timeForm.get('hours')?.setValue(currentHours);
    } else if (unit === 'minutes') {
      let currentMinutes = this.timeForm.get('minutes')?.value;
      currentMinutes = (currentMinutes + 1) % 60; // Cycle from 0 to 59
      this.timeForm.get('minutes')?.setValue(currentMinutes);
    }
  }

  /**
   * Decrements the value of the specified time unit (hours or minutes).
   * @param {string} unit - 'hours' or 'minutes'
   */
  decrement(unit: 'hours' | 'minutes'): void {
    if (unit === 'hours') {
      let currentHours = this.timeForm.get('hours')?.value;
      currentHours = (currentHours - 1 + 12) % 12; // Cycle from 12 down to 1
      if (currentHours === 0) currentHours = 12; // Handle 12 AM/PM correctly
      this.timeForm.get('hours')?.setValue(currentHours);
    } else if (unit === 'minutes') {
      let currentMinutes = this.timeForm.get('minutes')?.value;
      currentMinutes = (currentMinutes - 1 + 60) % 60; // Cycle from 59 down to 0
      this.timeForm.get('minutes')?.setValue(currentMinutes);
    }
  }

  /**
   * Emits the currently selected time.
   */
  private emitTime(): void {
    if (this.timeForm.valid) {
      this.timeSelected.emit(this.timeForm.value);
    }
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.getAddressFromCoords(lat, lng);
        },
        error => {
          console.error('Geolocation failed:', error);
        }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
    }
  }

  getAddressFromCoords(lat: number, lng: number) {
    this.staffBookingForm.patchValue({
      latitude: lat,
      longitude: lng
    });
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    this.http.get<any>(url).subscribe(
      (response) => {
        const address = response.display_name;
        if (address) {
          this.staffBookingForm.patchValue({ userAddress: address });
        }
      },
      (error) => {
        console.error('Error fetching address:', error);
      }
    );
  }


  createStaffDetailFormGroup(): FormGroup {
    return this.fb.group({
      category: ['', Validators.required],
      subCategory: ['', Validators.required]
    });
  }

  get staffDetailsFormArray(): FormArray {
    return this.staffBookingForm.get('staffDetails') as FormArray;
  }

  createShiftDetailFormGroup(): FormGroup {
    return this.fb.group({
      shiftType: ['Small Shift'],
      timeSlot: ['1'],
      tenure: ['1'],
      gender: ['Male'],
      male: ['Male'],
      female: ['Female'],
      startDate: [new Date().toISOString().substring(0, 10)],
      quantity: ['1', [Validators.required, Validators.min(1)]],
    }, { validators: this.shiftDurationValidator });
  }

  get shiftDetailsFormArray(): FormArray {
    return this.staffBookingForm.get('shiftDetails') as FormArray;
  }

  createStaffFormGroup(): FormGroup {
    return this.fb.group({
      staffDetails: this.fb.array([this.createStaffDetailFormGroup()]),
      shiftDetails: this.fb.array([this.createShiftDetailFormGroup()]),
    });
  }

  addShift(index: number) {
    const staffGroup = this.staffListFormArray.at(index) as FormGroup;
    const shiftArray = staffGroup.get('shiftDetails') as FormArray;
    shiftArray.push(this.createShiftDetailFormGroup());
  }

  removeShiftDetail(staffIndex: number, shiftIndex: number) {
    const staffGroup = this.staffListFormArray.at(staffIndex) as FormGroup;
    const shiftArray = staffGroup.get('shiftDetails') as FormArray;
    shiftArray.removeAt(shiftIndex);
  }

  addNewStaff() {
    this.staffListFormArray.push(this.createStaffFormGroup());
  }

  get staffListFormArray(): FormArray {
    return this.staffBookingForm.get('staff') as FormArray;
  }

  getNestedShiftDetailsControls(index: number): FormGroup[] {
    const group = this.staffListFormArray.at(index) as FormGroup;
    return (group.get('shiftDetails') as FormArray).controls as FormGroup[];
  }

  getNestedStaffDetailsControls(index: number): FormGroup[] {
    const group = this.staffListFormArray.at(index) as FormGroup;
    return (group.get('staffDetails') as FormArray).controls as FormGroup[];
  }

  removeStaff(index: number) {
    this.staffListFormArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.staffBookingForm.valid) {
      this.spinnerService.show();
      const apiUrl = API_URL + ENDPOINTS.SEARCH;
      const payload = this.staffBookingForm.value;
      this.bookNurseService.searchStaff(apiUrl, payload).subscribe({
        next: (response) => {
          this.spinnerService.hide();
          const staffDetails = response?.staff[0]?.staffDetails || [];
          if (staffDetails.length > 0) {
            this.router.navigate(['/view-staff'], {
              state: { staffDetails } // pass data via navigation state
            });
          } else {
            alert('No staff found.');
          }
        },
        error: (error) => {
          console.error('Staff search failed:', error);
          this.spinnerService.hide();
        }
      });
    } else {
      this.markAllAsTouched(this.staffBookingForm);
    }
  }

  private markAllAsTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsTouched(control);
      }
    });
  }

  shiftDurationValidator(control: AbstractControl): ValidationErrors | null {
    const hour = parseInt(control.get('shiftHour')?.value, 10);
    const minute = parseInt(control.get('shiftMinute')?.value, 10);
    if (isNaN(hour) || isNaN(minute)) {
      return null; // Return null if values are not selected yet
    }
    // Calculate end time (8 hours later)
    const startTime = hour * 60 + minute;
    const endTime = (startTime + 8 * 60) % (24 * 60); // Ensure it wraps around 24 hours
    // For simplicity, we only check if the duration is valid
    // You can extend this to validate specific end times if needed
    return startTime >= 0 && endTime >= 0 ? null : { invalidShiftDuration: true };
  }

}
