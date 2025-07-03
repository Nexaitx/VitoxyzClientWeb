import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MapComponent } from '../map/map';
import { Submission } from '../../submission/submission';
import { HttpClient } from '@angular/common/http';
import { BookNurseService } from './book-nurse.service';

@Component({
  selector: 'app-book-nurse',
  imports: [CommonModule, ReactiveFormsModule, Submission, MapComponent],
  templateUrl: './book-nurse.html',
  styleUrls: ['./book-nurse.scss'],
  providers: [BookNurseService]
})

export class BookNurse {
  fb = inject(FormBuilder);
  bookNurseService = inject(BookNurseService);
  http = inject(HttpClient);
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
  gender = [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' },]

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

  tenure = [
    { label: '1 Day', value: '1' }, { label: '3 Days', value: '2' }, { label: '1 Week', value: '3' }, { label: '2 Weeks', value: '4' }, { label: '1 Month', value: '5' }
  ]

  constructor(
  ) { }

  ngOnInit(): void {
    this.getUserLocation();
    this.staffBookingForm = this.fb.group({
      userAddress: ['', Validators.required],
      latitude: [],
      longitude: [],
      staff: this.fb.array([this.createStaffFormGroup()])
    });
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
      shiftType: ['morning'],
      timeSlot: ['1'],
      tenure: ['1'],
      gender: ['male'],
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
      const apiUrl = 'https://7df0-152-56-69-87.ngrok-free.app/api/search';
      const payload = this.staffBookingForm.value;
      this.bookNurseService.searchStaff(apiUrl, payload).subscribe({
        next: (response) => {
          console.log('Staff search response:', response);
        },
        error: (error) => {
          console.error('Staff search failed:', error);
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
