import { CommonModule, JsonPipe } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, FormControl, FormsModule } from '@angular/forms';
import { MapComponent } from '../map/map';
import { Submission } from '../../submission/submission';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '../../../core/const';
import { SpinnerToastService } from '../../../core/toasts/spinner-toast/spinner-toast.service';
import { Router } from '@angular/router';
// import { AadharVerificationComponent } from "../../aadhar-verification/aadhar-verification.component";
import { Login } from "../../authorization/login/login";
import { Authorization } from '../../authorization/authorization';
import { Footer } from "../../footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { TextBanner } from "../../../../app/shared/text-banner/text-banner";
import { TextImageComponent } from "../../../pages/shared/text-image/text-image";
import { MedicineSliderComponent } from "../../../shared/medicine-slider/medicine-slider";
import { BookingTextBanner } from "../../shared/booking-text-banner/booking-text-banner";

@Component({
  selector: 'app-book-staff',
  imports: [CommonModule,
    ReactiveFormsModule,
    MapComponent,
    Submission,
    // AadharVerificationComponent,
    Authorization, Footer, MobileFooterNavComponent, TextBanner, TextImageComponent, BookingTextBanner],
  templateUrl: './book-staff.html',
  styleUrls: ['./book-staff.scss'],
})

export class BookStaff  {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router)
  staffBookingForm!: FormGroup;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = [0, 15, 30, 45];
  // nurseTenure = ['1 Day', '15 Days', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearlys'];
  button = 'Search for staff';
  staffCategories: { id: number; name: string }[] = [];
  staffSubCategories: { [index: number]: { label: string; value: string }[] } = {};
  preferredTimeSlots = ['Monthly(8 hour, 4 Holidays)','Monthly(12 hour, 4 Holidays)','Monthly(24 hour, 4 Holidays)'];
  nursePreferredTimeSlots = [ '8 Hours', '12 Hours', '24 Hours', 'Monthly(8 hour, 4 Holidays)', 'Monthly(12 hour, 4 Holidays)', 'Monthly(24 hour, 4 Holidays)'];
// nurse-specific tenure list (use your full list)
nursetenure = [
  { label: '1 Day', value: '1' }, { label: '2 Days', value: '2' }, { label: '3 Days', value: '3' },
  { label: '4 Days', value: '4' }, { label: '5 Days', value: '5' }, { label: '6 Days', value: '6' },
  { label: '7 Days', value: '7' }, { label: '8 Days', value: '8' }, { label: '9 Days', value: '9' },
  { label: '10 Days', value: '10' }, { label: '11 Days', value: '11' }, { label: '12 Days', value: '12' },
  { label: '13 Days', value: '13' }, { label: '14 Days', value: '14' }, { label: '15 Days', value: '15' },
  { label: '16 Days', value: '16' }, { label: '17 Days', value: '17' }, { label: '18 Days', value: '18' },
  { label: '19 Days', value: '19' }, { label: '20 Days', value: '20' }, { label: '21 Days', value: '21' },
  { label: '22 Days', value: '22' }, { label: '23 Days', value: '23' }, { label: '24 Days', value: '24' },
  { label: '25 Days', value: '25' }, { label: '26 Days', value: '26' }, { label: '27 Days', value: '27' },
  { label: '28 Days', value: '28' }, { label: '29 Days', value: '29' }, { label: '30 Days', value: '30' },
  // keep monthly options too (if you want both day & month options available for nurses)
  { label: '1 Month', value: '1m' }, { label: '2 Months', value: '2m' }, { label: '3 Months', value: '3m' },
  { label: '4 Months', value: '4m' }, { label: '5 Months', value: '5m' }, { label: '6 Months', value: '6m' },
  { label: '7 Months', value: '7m' }, { label: '8 Months', value: '8m' }, { label: '9 Months', value: '9m' },
  { label: '10 Months', value: '10m' }, { label: '11 Months', value: '11m' }, { label: '12 Months', value: '12m' }
];
  monthsTenure = [
    { label: '1 Month', value: '1m' }, { label: '2 Months', value: '2m' },  { label: '3 Months', value: '3m' }, { label: '4 Months', value: '4m' }, { label: '5 Months', value: '5m' }, { label: '6 Months', value: '6m' }, { label: '7 Months', value: '7m' }, { label: '8 Months', value: '8m' }, { label: '9 Months', value: '9m' }, { label: '10 Months', value: '10m' }, { label: '11 Months', value: '11m' }, { label: '12 Months', value: '12m' },
  ]
  today: string = new Date().toISOString().split('T')[0];
  showAadharPopup = false; 
  showAuthPopup = false;
  time = { hour: 13, minute: 30 };
  meridian = true;

   isSubmitting = false;
  message: string = '';
messageType: 'success' | 'error' | '' = ''; 
  constructor(
    private spinnerService: SpinnerToastService
  ) { }
    @ViewChild('bookingSection', { read: ElementRef }) bookingSection!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.getUserLocation();
    this.getStaffCategories();
    this.staffBookingForm = this.fb.group({
      userAddress: ['', Validators.required],
      address: ['', Validators.required],
      latitude: [],
      longitude: [],
      staffForms: this.fb.array([this.createStaffFormGroup()])
    });
    this.subscribeToCategoryChange(0);
  }
  
getSlotsByStaffIndex(staffIndex: number): string[] {
  const staffGroup = this.staffListFormArray.at(staffIndex) as FormGroup | undefined;
  if (!staffGroup) return this.preferredTimeSlots;

  // staffDetails is an array; we use first item (your current structure)
  const staffDetailsArray = staffGroup.get('staffDetails') as FormArray | null;
  const staffDetails = staffDetailsArray?.at(0) as FormGroup | null;
  if (!staffDetails) return this.preferredTimeSlots;

  const main = (staffDetails.get('typeOfStaff')?.value ?? '').toString().toLowerCase();
  const sub = (staffDetails.get('typeOfSubStaff')?.value ?? '').toString().toLowerCase();

  // if either main or sub contains 'nurse' => return nurse list
  if ((main && main.includes('nurse')) || (sub && sub.includes('nurse'))) {
    return this.nursePreferredTimeSlots;
  }

  // default fallback options (monthly ones)
  return this.preferredTimeSlots;
}

private calculateEndDate(
  startDate: string,
  tenure: string
): string {
  const start = new Date(startDate);

  if (tenure === '1') {
    // 1 day → same day
    return startDate;
  }

  // DAY BASED (2–30)
  if (/^\d+$/.test(tenure)) {
    const days = parseInt(tenure, 10);
    start.setDate(start.getDate() + days - 1);
  }

  // MONTH BASED (1m, 2m, ...)
  if (/^\d+m$/.test(tenure)) {
    const months = parseInt(tenure.replace('m', ''), 10);
    start.setMonth(start.getMonth() + months);
    start.setDate(start.getDate() - 1);
  }

  return start.toISOString().substring(0, 10);
}

// returns the appropriate tenure options for the staff at `staffIndex`
// returns the appropriate tenure options for the staff at `staffIndex`
getTenureOptions(staffIndex: number) {
  // get staffDetails FormGroup at staffIndex
  const staffGroup = this.staffListFormArray.at(staffIndex) as FormGroup;
  if (!staffGroup) return this.monthsTenure;

  const staffDetailsArray = staffGroup.get('staffDetails') as FormArray;
  const details = staffDetailsArray && staffDetailsArray.length ? staffDetailsArray.at(0) as FormGroup : null;
  if (!details) return this.monthsTenure;

  const type = (details.get('typeOfStaff')?.value ?? '').toString().toLowerCase();
  const sub  = (details.get('typeOfSubStaff')?.value ?? '').toString().toLowerCase();

  // treat anything containing 'nurse' as nurse - adjust matching rule if needed
  if (type.includes('nurse') || sub.includes('nurse')) {
    return this.nursetenure;
  }
  return this.monthsTenure;
}
// called when sub-staff changes (from template or subscription)
onSubStaffChange(staffIndex: number): void {
  const allowed = this.getTenureOptions(staffIndex).map(t => t.value);
  const staffGroup = this.staffListFormArray.at(staffIndex) as FormGroup | null;
  if (!staffGroup) return;
  const shiftArray = staffGroup.get('shiftDetails') as FormArray | null;
  if (!shiftArray) return;

  const options = this.getSlotsByStaffIndex(staffIndex);
  // update each shift's preferredTimeSlot if current value not valid
  shiftArray.controls.forEach((shiftCtrl: AbstractControl) => {
    const prefCtrl = (shiftCtrl as FormGroup).get('preferredTimeSlot');
    if (!prefCtrl) return;
    const current = prefCtrl.value;
    if (!current || !options.includes(current)) {
    prefCtrl.setValue(null, { emitEvent: false });
    }
  });
   // update tenure if invalid (FIXED)
  shiftArray.controls.forEach((shCtrl: AbstractControl) => {
    const grp = shCtrl as FormGroup;
    const tenureCtrl = grp.get('tenure');
    if (!tenureCtrl) return;

    const current = tenureCtrl.value;

    if (current == null || !allowed.includes(current)) {
      tenureCtrl.setValue(null, { emitEvent: false });
    }
  });
}
  getStaffCategories(): void {
    const apiUrl = API_URL + ENDPOINTS.CATEGORIES;
    this.http.get<{ id: number; name: string }[]>(apiUrl).subscribe({
      next: (response) => {
        this.staffCategories = response || [];
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }


  subscribeToCategoryChange(staffIndex: number): void {
    const staffGroup = this.staffListFormArray.at(staffIndex) as FormGroup;
    const staffDetailsArray = staffGroup.get('staffDetails') as FormArray;
    const staffDetailsGroup = staffDetailsArray.at(0) as FormGroup;
    staffDetailsGroup.get('typeOfStaff')?.valueChanges.subscribe(selectedName => {
      const selected = this.staffCategories.find(cat => cat.name === selectedName);
      if (selected) {
        const categoryId = selected.id;
        this.fetchSubCategories(categoryId, staffIndex);
        staffDetailsGroup.get('typeOfSubStaff')?.setValue('');

             // ensure shift options update
      this.onSubStaffChange(staffIndex);
      }
    });
     // subscribe to typeOfSubStaff changes so we update shift options automatically
  staffDetailsGroup.get('typeOfSubStaff')?.valueChanges.subscribe(() => {
    this.onSubStaffChange(staffIndex);
  });
  }

  incrementTimes(unit: 'hours' | 'minutes', staffIndex: number, shiftIndex: number, timeType: 'start' | 'end' = 'start'): void {
    const shiftGroup = this.getShiftGroup(staffIndex, shiftIndex);
    if (!shiftGroup) return;
     const hourKey = timeType === 'start' ? 'startTimeHour' : 'endTimeHour';
  const minuteKey = timeType === 'start' ? 'startTimeMinute' : 'endTimeMinute';
    if (unit === 'hours') {
      let currentHours = +shiftGroup.get(hourKey)?.value || 1;
      currentHours = (currentHours % 12) + 1;
      if (currentHours === 0) currentHours = 12;
      shiftGroup.get(hourKey)?.setValue(currentHours);
    } else {
      let currentMinutes = +shiftGroup.get(minuteKey)?.value || 0;
      currentMinutes = (currentMinutes + 1) % 60;
      shiftGroup.get(minuteKey)?.setValue(currentMinutes);
    }
     if (timeType === 'start') this.updateTimeSlot(shiftGroup);
  }

  decrementTimes(unit: 'hours' | 'minutes', staffIndex: number, shiftIndex: number, timeType: 'start' | 'end' = 'start'): void {
    const shiftGroup = this.getShiftGroup(staffIndex, shiftIndex);
    if (!shiftGroup) return;
     const hourKey = timeType === 'start' ? 'startTimeHour' : 'endTimeHour';
  const minuteKey = timeType === 'start' ? 'startTimeMinute' : 'endTimeMinute';
    if (unit === 'hours') {
      let currentHours = +shiftGroup.get(hourKey)?.value || 1;
      currentHours = (currentHours - 1 + 12) % 12;
      if (currentHours === 0) currentHours = 12;
      shiftGroup.get(hourKey)?.setValue(this.pad(currentHours));
    } else {
      let currentMinutes = +shiftGroup.get(minuteKey)?.value || 0;
      currentMinutes = (currentMinutes - 1 + 60) % 60;
      shiftGroup.get(minuteKey)?.setValue(this.pad(currentMinutes));
    }
    if (timeType === 'start') this.updateTimeSlot(shiftGroup);
  }
incrementTime(unit: 'hours' | 'minutes', staffIndex: number, shiftIndex: number): void {
    const shiftGroup = this.getShiftGroup(staffIndex, shiftIndex);
    if (!shiftGroup) return;
    if (unit === 'hours') {
      let currentHours = +shiftGroup.get('hours')?.value || 1;
      currentHours = (currentHours % 12) + 1;
      if (currentHours === 0) currentHours = 12;
      shiftGroup.get('hours')?.setValue(currentHours);
    } else {
      let currentMinutes = +shiftGroup.get('minutes')?.value || 0;
      currentMinutes = (currentMinutes + 1) % 60;
      shiftGroup.get('minutes')?.setValue(currentMinutes);
    }
  }

  decrementTime(unit: 'hours' | 'minutes', staffIndex: number, shiftIndex: number): void {
    const shiftGroup = this.getShiftGroup(staffIndex, shiftIndex);
    if (!shiftGroup) return;
    if (unit === 'hours') {
      let currentHours = +shiftGroup.get('hours')?.value || 1;
      currentHours = (currentHours - 1 + 12) % 12;
      if (currentHours === 0) currentHours = 12;
      shiftGroup.get('hours')?.setValue(this.pad(currentHours));
    } else {
      let currentMinutes = +shiftGroup.get('minutes')?.value || 0;
      currentMinutes = (currentMinutes - 1 + 60) % 60;
      shiftGroup.get('minutes')?.setValue(this.pad(currentMinutes));
    }
  }
  private getShiftGroup(staffIndex: number, shiftIndex: number): FormGroup | null {
    const staffGroup = this.staffListFormArray.at(staffIndex) as FormGroup;
    const shiftArray = staffGroup.get('shiftDetails') as FormArray;
    return shiftArray.at(shiftIndex) as FormGroup;
  }

  pad(value: number): string {
    return value != null ? value.toString().padStart(2, '0') : '00';
  }

  increase(type: 'maleQuantity' | 'femaleQuantity', staffIndex: number, shiftIndex: number): void {
    const control = this.getQuantityControl(type, staffIndex, shiftIndex);
    control.setValue(Math.min((control.value || 0) + 1, 10));
    this.updateGenderInShift(staffIndex, shiftIndex);
  }

  decrease(type: 'maleQuantity' | 'femaleQuantity', staffIndex: number, shiftIndex: number): void {
    const control = this.getQuantityControl(type, staffIndex, shiftIndex);
    control.setValue(Math.max((control.value || 1) - 1, 0));
    this.updateGenderInShift(staffIndex, shiftIndex);
  }

  private updateGenderInShift(staffIndex: number, shiftIndex: number): void {
    const shiftGroup = this.getShiftGroup(staffIndex, shiftIndex);
    if (shiftGroup) {
      this.updateGenderQty(shiftGroup);
    }
  }

  getQuantityControl(type: 'maleQuantity' | 'femaleQuantity', staffIndex: number, shiftIndex: number): FormControl {
    const staffGroup = this.staffListFormArray.at(staffIndex) as FormGroup;
    const shiftArray = staffGroup.get('shiftDetails') as FormArray;
    const shiftGroup = shiftArray.at(shiftIndex) as FormGroup;
    return shiftGroup.get(type === 'maleQuantity' ? 'maleQuantity' : 'femaleQuantity') as FormControl;
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
// getAddressFromCoords(lat: number, lng: number) {
//   this.staffBookingForm.patchValue({
//     latitude: lat,
//     longitude: lng
//   });

//   const url = `https://nominatim.openstreetmap.org/reverse`;

//   const params = {
//     format: 'jsonv2',
//     lat: lat.toString(),
//     lon: lng.toString()
//   };

//   const headers = new HttpHeaders({
//     'Accept': 'application/json',
//     // REQUIRED by Nominatim (mobile fix)
//     'User-Agent': 'YourAppName/1.0 (support@yourdomain.com)'
//   });

//   this.http.get<any>(url, { params, headers }).subscribe({
//     next: (response) => {
//       if (response?.display_name) {
//         this.staffBookingForm.patchValue({
//           userAddress: response.display_name
//         });
//       }
//     },
//     error: (error) => {
//       console.error('Reverse geocoding failed:', error);
//     }
//   });
// }

  createStaffDetailFormGroup(): FormGroup {
    return this.fb.group({
      typeOfStaff: ['', Validators.required],
      typeOfSubStaff: ['', Validators.required]
    });
  }

  fetchSubCategories(categoryId: number, staffIndex: number): void {
    const apiUrl = `${API_URL}${ENDPOINTS.CATEGORIES}/${categoryId}${ENDPOINTS.SUB_CATEGORIES}`;
    this.http.get<{ label: string; value: string }[]>(apiUrl).subscribe({
      next: (subcategories) => {
        this.staffSubCategories[staffIndex] = subcategories;
      },
      error: (err) => {
        console.error('Failed to fetch subcategories', err);
        this.staffSubCategories[staffIndex] = [];
      }
    });
  }
// onStartTimeChange(i: number, sh: number) {
//   const shiftDetail = this.getNestedShiftDetailsControls(i)[sh];
//   const time = shiftDetail.get('startTime')?.value; // Example: "14:30"
  
//   shiftDetail.get('timeSlot')?.setValue(time);
// }
// onStartTimeChange(i: number, sh: number) {
//   const shiftDetail = this.getNestedShiftDetailsControls(i)[sh];
//   const time = shiftDetail.get('startTime')?.value; // "13:45"

//   if (!time) return;

//   const [hour, minute] = time.split(':');
//   let h = parseInt(hour);
//   let ampm = 'AM';

//   if (h === 0) {
//     h = 12;
//   } else if (h === 12) {
//     ampm = 'PM';
//   } else if (h > 12) {
//     h = h - 12;
//     ampm = 'PM';
//   }

//   shiftDetail.patchValue({
//     startTimeHour: h,
//     startTimeMinute: minute,
//     startTimeAmPm: ampm,
//   });

//   this.updateTimeSlot(shiftDetail);
// }
convertTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  let hour = h;
  let ampm = 'AM';

  if (hour === 0) {
    hour = 12;
  } else if (hour === 12) {
    ampm = 'PM';
  } else if (hour > 12) {
    hour -= 12;
    ampm = 'PM';
  }

  return {
    hour: String(hour),
    minute: String(m),
    ampm
  };
}

  createShiftDetailFormGroup(): FormGroup {
   
    const group = this.fb.group({
      preferredTimeSlot: ['', Validators.required],
      timeSlot: [''],
      tenure: [''],
 startTime: ['', Validators.required], // "10:00"
    endTime: ['', Validators.required],
      dutyStartDate: [new Date().toISOString().substring(0, 10)],
       dutyEndDate: [''],  
      maleQuantity: ['0', [Validators.min(0), Validators.max(10)]],
      femaleQuantity: ['0', [Validators.min(0), Validators.max(10)]],
    //   hours: [currentHour, [Validators.required, Validators.min(1), Validators.max(12)]],
    //   // minutes: [minutes, [Validators.required, Validators.min(0), Validators.max(59)]],
    //    minutes: [currentMinute, [Validators.required, Validators.min(0), Validators.max(59)]],
    //   ampm: [ampm, Validators.required],
    //    startTimeHour: [currentHour, [Validators.required, Validators.min(1), Validators.max(12)]],
    // startTimeMinute: [currentMinute, [Validators.required, Validators.min(0), Validators.max(59)]],
    // startTimeAmPm: [ampm, Validators.required],
    // // END time fields
    // endTimeHour: [currentHour, [Validators.required, Validators.min(1), Validators.max(12)]],
    // endTimeMinute: [currentMinute, [Validators.required, Validators.min(0), Validators.max(59)]],
    // endTimeAmPm: [ampm, Validators.required],
    }, { validators: [this.shiftDurationValidator] });
     // Subscribe to start-time changes to update timeSlot string
  group.get('startTimeHour')?.valueChanges.subscribe(() => this.updateTimeSlot(group));
  group.get('startTimeMinute')?.valueChanges.subscribe(() => this.updateTimeSlot(group));
  group.get('startTimeAmPm')?.valueChanges.subscribe(() => this.updateTimeSlot(group));
    group.get('hours')?.valueChanges.subscribe(() => this.updateTimeSlot(group));
    group.get('minutes')?.valueChanges.subscribe(() => this.updateTimeSlot(group));
    group.get('ampm')?.valueChanges.subscribe(() => this.updateTimeSlot(group));
    group.get('maleQuantity')?.valueChanges.subscribe(() => this.updateGenderQty(group));
    group.get('femaleQuantity')?.valueChanges.subscribe(() => this.updateGenderQty(group));
    group.get('tenure')?.valueChanges.subscribe((tenure) => {
  const startDate = group.get('dutyStartDate')?.value;
  const endCtrl = group.get('dutyEndDate');

  if (!tenure || !startDate) {
    endCtrl?.setValue('');
    return;
  }

  if (tenure === '1') {
    endCtrl?.setValue(startDate);
    endCtrl?.clearValidators();
  } else {
    const endDate = this.calculateEndDate(startDate, tenure);
    endCtrl?.setValue(endDate);
    endCtrl?.setValidators([Validators.required]);
  }

  endCtrl?.updateValueAndValidity({ emitEvent: false });
});

group.get('dutyStartDate')?.valueChanges.subscribe((startDate) => {
  const tenure = group.get('tenure')?.value;
  const endCtrl = group.get('dutyEndDate');

  if (!startDate || !tenure) return;

  if (tenure === '1') {
    endCtrl?.setValue(startDate);
  } else {
    endCtrl?.setValue(this.calculateEndDate(startDate, tenure));
  }
});


  return group;

  }

   updateTimeSlot(shiftGroup: FormGroup): void {
    const hours = shiftGroup.get('startTimeHour')?.value ?? 0;
    const minutes = shiftGroup.get('startTimeMinute')?.value ?? 0;
    const ampm = shiftGroup.get('startTimeAmPm')?.value ?? 'AM';
    const pad = (v: number): string => v.toString().padStart(2, '0');
    const time = `${pad(+hours)}:${pad(+minutes)} ${ampm}`;
    const timeSlotControl = shiftGroup.get('timeSlot');
    timeSlotControl?.setValue(time, { emitEvent: false });
    timeSlotControl?.markAsTouched();
    timeSlotControl?.markAsDirty();
  }

  private updateGenderQty(group: FormGroup): void {
    const maleQuantity = Number(group.get('maleQuantity')?.value || 0);
    const femaleQuantity = Number(group.get('femaleQuantity')?.value || 0);
    group.get('maleQuantity')?.setValue(maleQuantity, { emitEvent: false });
  group.get('femaleQuantity')?.setValue(femaleQuantity, { emitEvent: false });
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
    const index = this.staffListFormArray.length - 1;
    this.subscribeToCategoryChange(index);
  }

  get staffListFormArray(): FormArray {
    return this.staffBookingForm.get('staffForms') as FormArray;
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
      if (this.isSubmitting) return; // prevent multiple clicks
    this.isSubmitting = true;

    const hasPastTimeError = this.hasPastTimeError();
    const hasZeroQuantityError = this.hasZeroQuantityError();
    console.log("SUBMIT CALLED");
    if (!this.staffBookingForm.valid || hasPastTimeError || hasZeroQuantityError) {
      this.markAllAsTouched(this.staffBookingForm);
            this.isSubmitting = false;
      return;
    }

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const isAadharVerified = userProfile.aadhaarStatus === true;

    if (!token) {
      console.log('User not logged in. Redirecting to login page.');
      this.showAuthPopup = true;
        this.isSubmitting = false;
      return;
    }

    // if (!isAadharVerified) {
    //   this.showAadharPopup = false; //It must be true to verify the aadhaar in future
    //   return;
    // }
    this.spinnerService.show();
    const apiUrl = API_URL + ENDPOINTS.BOOK_STAFF;
    const payload = {
      ...this.staffBookingForm.value,
      staffForms: this.staffListFormArray.controls.map((staffGroup: AbstractControl) => {
        const staffDetailsControl = (staffGroup.get('staffDetails') as FormArray).at(0);
        const { typeOfStaff, typeOfSubStaff } = staffDetailsControl.value;
        const shiftDetailsArray = (staffGroup.get('shiftDetails') as FormArray).controls.map((shiftGroup: AbstractControl) => {
          const { tenure, maleQuantity, femaleQuantity, dutyStartDate,dutyEndDate,startTime,
      endTime} = shiftGroup.value;
       const start = this.convertTime(startTime);
    const end = this.convertTime(endTime);
          return {  tenure, maleQuantity, femaleQuantity, dutyStartDate,dutyEndDate , startTimeHour: start.hour,
      startTimeMinute: start.minute,
      startTimeAmPm: start.ampm,

      endTimeHour: end.hour,
      endTimeMinute: end.minute,
      endTimeAmPm: end.ampm
    }
        });
        return {
          typeOfStaff,
          typeOfSubStaff,
          shifts: shiftDetailsArray
        };
      })
    };

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers = headers.set('Authorization', `Bearer ${token}`);
    this.http.post<any>(apiUrl, payload, { headers }).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        this.isSubmitting = false;
        if (response?.status === true) {
          const staffDetails = response?.staff?.[0]?.staffDetails || [];
           this.messageType = 'success';
      this.message = response?.message || 'Success';
          this.router.navigate(['/view-staff'], {
            state: { staffDetails: staffDetails, bookingIds: response.bookingIds }
          });
        } else {
          // alert(response?.message || 'Something went wrong.');
                this.messageType = 'error';
      this.message = response?.message || 'Something went wrong.';

        }
      },
      error: (error) => {
        this.spinnerService.hide();
        this.isSubmitting = false;
         console.error('Staff search API call failed:', error);
        // alert('An error occurred while processing your request.');
            this.messageType = 'error';
    this.message = 'An error occurred while processing your request.';
      }
    });
  }

  onAuthSuccess() {
    this.showAuthPopup = false;
    this.onSubmit();
  }

  onAuthClose() {
    this.showAuthPopup = false;
  }
  onAadharVerified() {
    this.showAadharPopup = false;

    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    userProfile.aadhaarStatus = false;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    this.onSubmit();
  }

  hasPastTimeError(): boolean {
    let hasPastTimeError = false;
    this.staffListFormArray.controls.forEach((staffGroup: AbstractControl) => {
      const shiftArray = staffGroup.get('shiftDetails') as FormArray;
      shiftArray.controls.forEach((shiftGroup: AbstractControl) => {
        const dutyStartDate = shiftGroup.get('dutyStartDate')?.value;
        const hours = +shiftGroup.get('hours')?.value;
        const minutes = +shiftGroup.get('minutes')?.value;
        const ampm = shiftGroup.get('ampm')?.value;
        if (!dutyStartDate || hours == null || minutes == null || !ampm) return;
        const selectedDate = new Date(dutyStartDate);
        const today = new Date();
        const pad = (v: number) => v.toString().padStart(2, '0');
        const formattedTime = `${pad(hours)}:${pad(minutes)} ${ampm}`;
        shiftGroup.get('timeSlot')?.setValue(formattedTime, { emitEvent: false });
        const isToday =
          selectedDate.getFullYear() === today.getFullYear() &&
          selectedDate.getMonth() === today.getMonth() &&
          selectedDate.getDate() === today.getDate();
        if (isToday) {
          let h = hours;
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          const selectedTime = new Date();
          selectedTime.setHours(h, minutes, 0, 0);
          if (selectedTime < today) {
            shiftGroup.get('timeSlot')?.setErrors({ pastTime: true });
            hasPastTimeError = true;
          } else {
            const ctrl = shiftGroup.get('timeSlot');
            if (ctrl?.hasError('pastTime')) {
              ctrl.setErrors(null);
            }
          }
        }
      });
    });
    return hasPastTimeError;
  }

  hasZeroQuantityError(): boolean {
    let hasError = false;
    this.staffListFormArray.controls.forEach((staffGroup: AbstractControl) => {
      const shiftArray = staffGroup.get('shiftDetails') as FormArray;
      shiftArray.controls.forEach((shiftGroup: AbstractControl) => {
        const maleQuantity = +shiftGroup.get('maleQuantity')?.value || 0;
        const femaleQuantity = +shiftGroup.get('femaleQuantity')?.value || 0;
        if (maleQuantity === 0 && femaleQuantity === 0) {
          shiftGroup.setErrors({ ...(shiftGroup.errors || {}), zeroQuantity: true });
          hasError = true;
        } else {
          if (shiftGroup.errors?.['zeroQuantity']) {
            const errors = { ...shiftGroup.errors };
            delete errors['zeroQuantity'];
            shiftGroup.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      });
    });
    return hasError;
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
      return null;
    }
    const startTime = hour * 60 + minute;
    const endTime = (startTime + 8 * 60) % (24 * 60);
    return startTime >= 0 && endTime >= 0 ? null : { invalidShiftDuration: true };
  }


  onManualChange(field: string, i: number, sh: number, event: Event) {
  const input = event.target as HTMLInputElement;
  let value = Number(input.value);

  if (isNaN(value)) value = 0;
  if (value < 0) value = 0;
  if (value > 10) value = 10;

  this.getNestedShiftDetailsControls(i)[sh].get(field)?.setValue(value);
}


onManualTimeChange(field: string, i: number, sh: number, event: Event) {
  const input = event.target as HTMLInputElement;
  let value = Number(input.value);

  if (isNaN(value)) value = 0;

  if (field.toLowerCase().includes('hour')){
    if (value < 0) value = 0;
    if (value > 12) value = 12;
  }

  if (field.toLowerCase().includes('minute')) {
    if (value < 0) value = 0;
    if (value > 59) value = 59;
  }

  this.getNestedShiftDetailsControls(i)[sh].get(field)?.setValue(value);
 if (field.startsWith('startTime')) {
    this.updateTimeSlot(this.getNestedShiftDetailsControls(i)[sh]);
  }
}


// put this inside your BookStaff class (you already declared the ViewChild)
centerContent(): void {
  try {
    const el = this.bookingSection?.nativeElement as HTMLElement | undefined;
    if (!el) {
      // fallback to query selector if ViewChild didn't resolve
      const fallback = document.querySelector('.container-fluid') as HTMLElement | null;
      if (fallback) {
        fallback.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // If you have fixed header, set its selector here. Adjust if your header uses a different selector.
    const header = document.querySelector('header') as HTMLElement | null;
    const headerHeight = header ? header.offsetHeight : 72; // fallback 72px if header unknown

    // Compute scroll top with header offset
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY - headerHeight - 8; // small gap of 8px

    window.scrollTo({
      top: Math.max(0, Math.floor(top)),
      behavior: 'smooth'
    });

  } catch (err) {
    // last-resort fallback
    const el = document.querySelector('#bookingSection') || document.querySelector('.container-fluid');
    (el as HTMLElement | null)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    console.warn('centerContent fallback used', err);
  }
}




}
