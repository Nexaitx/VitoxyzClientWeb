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
import { Authorization } from '../../authorization/authorization';

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
    CommonModule,
    Authorization
  ],
  templateUrl: './user-onboarding.html',
  styleUrl: './user-onboarding.scss'
})
export class UserOnboarding {
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  token = localStorage.getItem('authToken');
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn: boolean = false;
  showAuth = false;
  showLoginAlert: boolean = false;

  onBoardDiet = this._formBuilder.group({
    fullName: ['', [Validators.required, this.nameValidator]],
    age: [null, Validators.required],
    gender: ['male', Validators.required],
    height: [''],
    weight: [''],
    healthGoals: this._formBuilder.group({
      dietPreference: ['', Validators.required],
      medicalCondition: this._formBuilder.array([]),
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

  ngOnInit() { }

  openLogin() {
    this.showLoginAlert = false;   // hide alert
    this.showAuth = true;          // open <app-authorization>
    this.setAuthMode('login');
  }
  onLoginSuccess() {
    this.isLoggedIn = true;
    this.showAuth = false;
    this.ngOnInit();
  }
  setAuthMode(mode: 'login' | 'signup') {
    this.authMode = mode;
  }
  get f() {
    return this.onBoardDiet.controls;
  }

  get medicalCondition(): FormArray {
    return (this.onBoardDiet.get('healthGoals.medicalCondition') as FormArray);
  }

  onSubmission() {
    if (this.onBoardDiet.valid) {
      const token = localStorage.getItem('authToken');

      if (token) {
        // ✅ Logged in → submit + navigate
        this.http.post(API_URL + ENDPOINTS.ONBOARD_DIET, this.onBoardDiet.value).subscribe(
          (res: any) => this.goToPlans(),
          (error) => this.showErrorToast()
        );
      } else {
        // ❌ Not logged in → show alert
        this.showLoginAlert = true; // 👈 new flag
      }
    } else {
      this.onBoardDiet.markAllAsTouched();
      this.showErrorToast();
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
    this.router.navigate(['/subscription-plans']);
  }
}
