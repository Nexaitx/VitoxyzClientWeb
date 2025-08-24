import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { HttpClient } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '@src/app/core/const';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-user-onboarding',
  standalone: true,
  imports: [
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './user-onboarding.html',
  styleUrl: './user-onboarding.scss'
})
export class UserOnboarding {
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  isOnMedication: string = 'no';

  onBoardDiet = this._formBuilder.group({
    fullName: ['', [Validators.required, this.nameValidator]],
    age: [null, Validators.required],
    gender: ['male', Validators.required],
    height: [''],
    weight: [''],
    healthGoals: this._formBuilder.group({
      dietPreference: ['', Validators.required],
      medicalCondition: [[]],
      anyMedication: [false],
      medication: ['']
    }),
    foodPreference: this._formBuilder.group({
      foodPreference: [''],
      foodAvoid: [''],
      dailyWaterIntake: ['']
    }),
    lifestyleActivity: this._formBuilder.group({
      activity_level: [''],
      wakeup: [''],
      sleep: [''],
      breakfast: [''],
      lunch: [''],
      dinner: ['']
    })
  });
  nameValidator(control: AbstractControl): ValidationErrors | null {
    const regex = /^[A-Za-z\s]+$/;
    if (control.value && !regex.test(control.value)) {
      return { invalidName: true };
    }
    return null;
  }

  constructor() { }

  get f() {
    return this.onBoardDiet.controls;
  }

  get medicalCondition() {
    return (this.onBoardDiet.get('healthGoals') as FormGroup).get('medicalCondition') as FormArray;
  }

  onSubmission() {
    if (this.onBoardDiet.valid) {
      this.http.post(API_URL + ENDPOINTS.ONBOARD_DIET, this.onBoardDiet.value).subscribe((res: any) => {
        this.goToPlans();
      });
    }
    else {
      this.onBoardDiet.markAllAsTouched();
      this.showErrorToast(); // 👈 show toast if invalid
    }
  }

  showErrorToast() {
    const toastEl = document.getElementById('formErrorToast');
    if (toastEl) {
      const toast = new Toast(toastEl);
      toast.show();
    }
  }

  goToPlans() {
    this.router.navigate(['/diet-plans']);
  }
}