import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { HttpClient } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '@src/app/core/const';

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
    firstCtrl: ['', Validators.required],
    fullName: [''],
    lastName: [''],
    age: [null],
    gender: [''],
    height: [''],
    weight: [''],
    healthGoals: this._formBuilder.group({
      dietPreference: [''],
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

  constructor() { }

  get medicalCondition() {
    return (this.onBoardDiet.get('healthGoals') as FormGroup).get('medicalCondition') as FormArray;
  }

  onSubmission() {
    console.log(this.onBoardDiet.value);
    this.http.post(API_URL, ENDPOINTS.ONBOARD_DIET + this.onBoardDiet.value).subscribe((res: any) => {
      console.log(res);
      this.goToPlans();
    })
  }

  goToPlans() {
    this.router.navigate(['/diet-plans']);
  }

}