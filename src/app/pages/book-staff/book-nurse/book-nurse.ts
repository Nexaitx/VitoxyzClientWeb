import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MapComponent } from '../map/map';


@Component({
  selector: 'app-book-nurse',
  imports: [CommonModule, ReactiveFormsModule, MapComponent],
  templateUrl: './book-nurse.html',
  styleUrls: ['./book-nurse.scss']
})
export class BookNurse {
  nurseBookingForm!: FormGroup;
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
    { value: 'other', label: 'Other' }
  ];

  constructor(private fb: FormBuilder) { }
  ngOnInit(): void {
    // Initialize the main form group with user info and an empty nurse details array
    this.nurseBookingForm = this.fb.group({
      userInfo: this.fb.group({
        name: ['', Validators.required],
        age: ['', [Validators.required, Validators.min(18)]], // Age validation
        phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // 10-digit phone number
        completeAddress: ['', Validators.required],
      }),
      // FormArray to hold multiple nurse detail FormGroups
      nurseDetails: this.fb.array([this.createNurseDetailFormGroup()])
    });
  }

  /**
   * Helper function to create a new FormGroup for a single nurse's details.
   */
  createNurseDetailFormGroup(): FormGroup {
    return this.fb.group({
      typeOfNurse: ['', Validators.required],
      shiftTime: ['', Validators.required],
      gender: ['', Validators.required],
      numberOfNurses: ['', [Validators.required, Validators.min(1)]], // At least 1 nurse
      daysRequired: ['', [Validators.required, Validators.min(1)]],
      shiftHour: ['', Validators.required],
      shiftMinute: ['', Validators.required],
    }, { validators: this.shiftDurationValidator }); 
  }

  /**
   * Getter to easily access the nurseDetails FormArray in the template.
   */
  get nurseDetailsFormArray(): FormArray {
    return this.nurseBookingForm.get('nurseDetails') as FormArray;
  }

  /**
   * Adds a new nurse detail FormGroup to the FormArray when the "Add More" button is clicked.
   */
  addNurseDetail(): void {
    this.nurseDetailsFormArray.push(this.createNurseDetailFormGroup());
  }

  /**
   * Removes a nurse detail FormGroup from the FormArray at a specific index.
   * @param index The index of the nurse detail to remove.
   */
  removeNurseDetail(index: number): void {
    if (this.nurseDetailsFormArray.length > 1) { // Ensure at least one nurse detail remains
      this.nurseDetailsFormArray.removeAt(index);
    }
  }

  /**
   * Handles the form submission.
   * Logs the form's value to the console if it's valid.
   */
  onSubmit(): void {
    if (this.nurseBookingForm.valid) {
    } else {
      this.markAllAsTouched(this.nurseBookingForm); // Mark all fields as touched to show validation errors
    }
  }

  /**
   * Recursively marks all form controls as touched to display validation errors.
   * @param formGroup The FormGroup to mark as touched.
   */
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
