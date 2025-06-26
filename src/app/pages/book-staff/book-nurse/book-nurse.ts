import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-book-nurse',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-nurse.html',
  styleUrl: './book-nurse.scss'
})
export class BookNurse {
  center: google.maps.LatLngLiteral = { lat: 34.052235, lng: -118.243683 }; // Example: Los Angeles
  zoom = 12;
  nurseBookingForm!: FormGroup;

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
      daysRequired: ['', [Validators.required, Validators.min(1)]] // At least 1 day
    });
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
      console.log('Form Submitted!', this.nurseBookingForm.value);
      alert('Form submitted successfully! Check console for data.'); // Using alert for demo
    } else {
      console.log('Form is invalid. Please fill all required fields correctly.');
      this.markAllAsTouched(this.nurseBookingForm); // Mark all fields as touched to show validation errors
      alert('Please fill all required fields correctly.'); // Using alert for demo
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
}
