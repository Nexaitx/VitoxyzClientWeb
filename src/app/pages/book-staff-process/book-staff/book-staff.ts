import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-book-staff',
  imports: [CommonModule,
    ReactiveFormsModule,
    MapComponent,
    Submission,
    // AadharVerificationComponent,
    Authorization, Footer, MobileFooterNavComponent, TextBanner, TextImageComponent,],
  templateUrl: './book-staff.html',
  styleUrls: ['./book-staff.scss'],
})

export class BookStaff {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router)
  staffBookingForm!: FormGroup;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = [0, 15, 30, 45];
  nurseTenure = ['1 Day', '15 Days', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly'];
  button = 'Search for staff';
  staffCategories: { id: number; name: string }[] = [];
  staffSubCategories: { [index: number]: { label: string; value: string }[] } = {};
  preferredTimeSlots = ['2 Hours', '8 Hours', '12 Hours', '24 Hours'];
  tenure = [
    { label: '1 Day', value: '1' }, { label: '3 Days', value: '2' }, { label: '1 Week', value: '3' }, { label: '2 Weeks', value: '4' }, { label: '1 Month', value: '5' }
  ]
  today: string = new Date().toISOString().split('T')[0];
  showAadharPopup = false; 
  showAuthPopup = false;
  time = { hour: 13, minute: 30 };
  meridian = true;

   isSubmitting = false;
   
  constructor(
    private spinnerService: SpinnerToastService
  ) { }

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
      }
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

  createShiftDetailFormGroup(): FormGroup {
    const now = new Date();
    let currentHour = now.getHours(); 
   let currentMinute = now.getMinutes();
    const ampm = currentHour >= 12 ? 'PM' : 'AM';
    if (currentHour === 0) currentHour = 12;
    else if (currentHour > 12) currentHour -= 12;
    const group = this.fb.group({
      preferredTimeSlot: ['', Validators.required],
      timeSlot: [''],
      tenure: [''],
      dutyStartDate: [new Date().toISOString().substring(0, 10)],
       dutyEndDate: [''],  
      maleQuantity: ['0', [Validators.min(0), Validators.max(10)]],
      femaleQuantity: ['0', [Validators.min(0), Validators.max(10)]],
      hours: [currentHour, [Validators.required, Validators.min(1), Validators.max(12)]],
      // minutes: [minutes, [Validators.required, Validators.min(0), Validators.max(59)]],
       minutes: [currentMinute, [Validators.required, Validators.min(0), Validators.max(59)]],
      ampm: [ampm, Validators.required],
       startTimeHour: [currentHour, [Validators.required, Validators.min(1), Validators.max(12)]],
    startTimeMinute: [currentMinute, [Validators.required, Validators.min(0), Validators.max(59)]],
    startTimeAmPm: [ampm, Validators.required],
    // END time fields
    endTimeHour: [currentHour, [Validators.required, Validators.min(1), Validators.max(12)]],
    endTimeMinute: [currentMinute, [Validators.required, Validators.min(0), Validators.max(59)]],
    endTimeAmPm: [ampm, Validators.required],
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
     group.get('tenure')?.valueChanges.subscribe((value) => {
    const endDateCtrl = group.get('dutyEndDate');
    if (value === '1') {
      // Hide & clear validation if 1 Day
      endDateCtrl?.clearValidators();
      endDateCtrl?.setValue('');
    } else {
      // Add validation back for other tenures
      endDateCtrl?.setValidators([Validators.required]);
    }
    endDateCtrl?.updateValueAndValidity();
  });

    group.get('dutyStartDate')?.valueChanges.subscribe((value: string | null) => {
    if (!value) {
      const today = new Date().toISOString().substring(0, 10);
      group.get('dutyStartDate')?.setValue(today, { emitEvent: false });
      return; 
    }

   const endDateCtrl = group.get('dutyEndDate');
  if (endDateCtrl) {  
    const endDateVal = endDateCtrl.value as string | null; 

    if (endDateVal && new Date(endDateVal) < new Date(value)) {
      endDateCtrl.setValue(value, { emitEvent: false });
    }
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
          const { tenure, maleQuantity, femaleQuantity, dutyStartDate,dutyEndDate,startTimeHour, startTimeMinute, startTimeAmPm,
          endTimeHour, endTimeMinute, endTimeAmPm } = shiftGroup.value;
          return {  tenure, maleQuantity, femaleQuantity, dutyStartDate,dutyEndDate ,startTimeHour: String(startTimeHour),
          startTimeMinute: String(startTimeMinute),
          startTimeAmPm: String(startTimeAmPm),
          endTimeHour: String(endTimeHour),
          endTimeMinute: String(endTimeMinute),
          endTimeAmPm: String(endTimeAmPm)};
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
          this.router.navigate(['/view-staff'], {
            state: { staffDetails: staffDetails, bookingIds: response.bookingIds }
          });
        } else {
          alert(response?.message || 'Something went wrong.');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        this.isSubmitting = false;
         console.error('Staff search API call failed:', error);
        alert('An error occurred while processing your request.');
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


centerContent() {
  const banner = document.querySelector('.banner .banner-content');
  if (banner) {
    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}


}
