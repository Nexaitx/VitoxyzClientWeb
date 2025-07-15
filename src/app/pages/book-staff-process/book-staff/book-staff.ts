import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { MapComponent } from '../map/map';
import { Submission } from '../../submission/submission';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '../../../core/const';
import { SpinnerToastService } from '../../../core/toasts/spinner-toast/spinner-toast.service';
import { Router } from '@angular/router';
import { AadharVerificationComponent } from "../../aadhar-verification/aadhar-verification.component";

@Component({
  selector: 'app-book-staff',
  imports: [CommonModule,
    ReactiveFormsModule,
    MapComponent,
    Submission,
    AadharVerificationComponent],
  templateUrl: './book-staff.html',
  styleUrls: ['./book-staff.scss'],
})

export class BookStaff {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router)
  staffBookingForm!: FormGroup;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
  minutes: number[] = [0, 15, 30, 45];
  nurseTenure = ['1 Day', '15 Days', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly'];
  button = 'Search for staff';
  staffCategories: { id: number; name: string }[] = [];
  staffSubCategories: { [index: number]: { label: string; value: string }[] } = {};
  shiftTypes = ['2 Hours Max', '8 Hours', '12 Hours', '24 Hours'];
  tenure = [
    { label: '1 Day', value: '1' }, { label: '3 Days', value: '2' }, { label: '1 Week', value: '3' }, { label: '2 Weeks', value: '4' }, { label: '1 Month', value: '5' }
  ]
  today: string = new Date().toISOString().split('T')[0];
  isToken = localStorage.getItem('authToken')
  isLogin = false; // This should ideally come from an AuthService
  showAadharPopup = false; // Toggle for popup
  staffSearchResponse: any = null; // Store response temporarily

  constructor(
    private spinnerService: SpinnerToastService
  ) { }

  ngOnInit(): void {
    this.getUserLocation();
    this.getStaffCategories();
    this.staffBookingForm = this.fb.group({
      userAddress: ['', Validators.required],
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

  get staffDetailsFormArray(): FormArray {
    return this.staffBookingForm.get('staffDetails') as FormArray;
  }

  createShiftDetailFormGroup(): FormGroup {
    const now = new Date();
    let currentHour = now.getHours(); // 0 - 23
    const minutes = '00';
    const ampm = currentHour >= 12 ? 'PM' : 'AM';
    if (currentHour === 0) currentHour = 12;
    else if (currentHour > 12) currentHour -= 12;
    const group = this.fb.group({
      shiftType: ['', Validators.required],
      timeSlot: [''],
      tenure: ['1'],
      //gender: [''],
      dutyStartDate: [new Date().toISOString().substring(0, 10)],
      maleQuantity: ['0', [Validators.min(0), Validators.max(10)]],
      femaleQuantity: ['0', [Validators.min(0), Validators.max(10)]],
      hours: [currentHour, [Validators.required, Validators.min(1), Validators.max(12)]],
      minutes: [minutes, [Validators.required, Validators.min(0), Validators.max(59)]],
      ampm: [ampm, Validators.required],
    }, { validators: [this.shiftDurationValidator] });
    group.get('hours')?.valueChanges.subscribe(() => this.updateTimeSlot(group));
    group.get('minutes')?.valueChanges.subscribe(() => this.updateTimeSlot(group));
    group.get('ampm')?.valueChanges.subscribe(() => this.updateTimeSlot(group));
    group.get('maleQuantity')?.valueChanges.subscribe(() => this.updateGenderQty(group));
    group.get('femaleQuantity')?.valueChanges.subscribe(() => this.updateGenderQty(group));
    group.get('dutyStartDate')?.valueChanges.subscribe((value) => {
      if (!value) {
        const today = new Date().toISOString().substring(0, 10);
        group.get('dutyStartDate')?.setValue(today, { emitEvent: false });
      }
    });
    return group;
  }

  private updateTimeSlot(shiftGroup: FormGroup): void {
    const hours = shiftGroup.get('hours')?.value ?? 0;
    const minutes = shiftGroup.get('minutes')?.value ?? 0;
    const ampm = shiftGroup.get('ampm')?.value ?? 'AM';
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
    group.get('maleQuantity')?.setValue(maleQuantity);
    group.get('gender')?.setValue(femaleQuantity);
    //group.get('gender')?.setValue({ maleQuantity, femaleQuantity }, { emitEvent: false });
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
    const hasPastTimeError = this.hasPastTimeError();
    const hasZeroQuantityError = this.hasZeroQuantityError();
    if (this.staffBookingForm.valid && !hasPastTimeError && !hasZeroQuantityError) {
      this.spinnerService.show();
      const apiUrl = API_URL + ENDPOINTS.BOOK_STAFF;
      const payload = {
        ...this.staffBookingForm.value,
        staffForms: this.staffListFormArray.controls.map((staffGroup: AbstractControl) => {
          const staffDetailsControl = (staffGroup.get('staffDetails') as FormArray).at(0);
          const { typeOfStaff, typeOfSubStaff } = staffDetailsControl.value;
          const shiftDetailsArray = (staffGroup.get('shiftDetails') as FormArray).controls.map((shiftGroup: AbstractControl) => {
            const { shiftType, timeSlot, tenure, maleQuantity, femaleQuantity, dutyStartDate } = shiftGroup.value;
            return { shiftType, timeSlot, tenure, maleQuantity, femaleQuantity, dutyStartDate };
          });
          return {
            typeOfStaff,
            typeOfSubStaff,
            shifts: shiftDetailsArray
          };
        })
      };
      let headers = new HttpHeaders({
        'Content-Type': 'application/json' // Often required for POST requests
      });
      if (this.isToken) {
        headers = headers.set('Authorization', `Bearer ${this.isToken}`);
      }
      this.http.post<any>(apiUrl, payload, { headers: headers }).subscribe({
        next: (response) => {
          this.spinnerService.hide();
          const staffDetails = response?.staff[0]?.staffDetails || [];
          if (staffDetails.length > 0) {
            if (this.isLogin) {
              this.router.navigate(['/view-staff'], { state: { staffDetails } });
            } else {
              this.staffSearchResponse = staffDetails;
              this.showAadharPopup = true;
            }
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

  onAadharVerified() {
    this.isLogin = true;
    this.showAadharPopup = false;
    if (this.staffSearchResponse) {
      this.router.navigate(['/view-staff'], {
        state: { staffDetails: this.staffSearchResponse }
      });
      this.staffSearchResponse = null; // clear
    }
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

}
