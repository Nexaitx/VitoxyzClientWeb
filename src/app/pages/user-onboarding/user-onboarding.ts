import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './user-onboarding.html',
  styleUrl: './user-onboarding.scss'
})
export class UserOnboarding implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  @ViewChild('stepper') stepper!: MatStepper; 
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  isOnMedication: string = 'no'; 
  medicalConditionsOptions: string[] = ['Diabetes', 'Thyroid', 'PCOS', 'Hypertension', 'None'];
  displayedMedicalConditionsOptions: string[] = [];

  constructor() {
    this.firstFormGroup = this._formBuilder.group({
      fullName: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],
      gender: ['', Validators.required],
      heightValue: [0, [Validators.required, Validators.min(1)]], 
      heightUnit: ['Feet', Validators.required], 
      weightValue: [0, [Validators.required, Validators.min(1)]], 
    });

    this.secondFormGroup = this._formBuilder.group({
      dietPreference: ['', Validators.required],
      medicalConditions: this._formBuilder.array([], Validators.required), 
      anyMedication: ['no', Validators.required], 
      medicationDetails: [''] 
    });

    this.thirdFormGroup = this._formBuilder.group({
      foodPreference: ['', Validators.required],
      foodToAvoid: [''],
      dailyWaterIntake: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]+)?\\s*(liters|ml|cups)?$')]]
    });

    this.fourthFormGroup = this._formBuilder.group({
      activityLevel: ['', Validators.required],
      wakeUpTime: ['', Validators.required],
      sleepTime: ['', Validators.required],
      breakfastTime: [''], 
      lunchTime: [''],     
      dinnerTime: ['']     
    });
  }

  ngOnInit(): void {
    this.displayedMedicalConditionsOptions = [...this.medicalConditionsOptions];
    this.firstFormGroup.get('gender')?.valueChanges.subscribe(gender => {
      if (gender === 'Male') {
        this.displayedMedicalConditionsOptions = this.medicalConditionsOptions.filter(
          option => option !== 'PCOS'
        );
        const pcosIndexInFormArray = this.medicalConditionsFormArray.controls.findIndex(
          control => control.value === 'PCOS'
        );
        if (pcosIndexInFormArray !== -1) {
          this.medicalConditionsFormArray.removeAt(pcosIndexInFormArray);
          this.medicalConditionsFormArray.updateValueAndValidity(); 
        }
      } else {
        this.displayedMedicalConditionsOptions = [...this.medicalConditionsOptions];
      }
    });

    this.secondFormGroup.get('anyMedication')?.valueChanges.subscribe(value => {
      const medicationDetailsControl = this.secondFormGroup.get('medicationDetails');
      if (value === 'yes') {
        medicationDetailsControl?.setValidators(Validators.required);
      } else {
        medicationDetailsControl?.clearValidators();
        medicationDetailsControl?.setValue('');
      }
      medicationDetailsControl?.updateValueAndValidity();
    });
  }
  get medicalConditionsFormArray(): FormArray {
    return this.secondFormGroup.get('medicalConditions') as FormArray;
  }

  onMedicalConditionChange(event: any) {
    const medicalConditionsArray = this.medicalConditionsFormArray;
    const changedValue = event.target.value;
    const isChecked = event.target.checked;

    if (changedValue === 'None') {
      while (medicalConditionsArray.length !== 0) {
        medicalConditionsArray.removeAt(0);
      }
      if (isChecked) {
        medicalConditionsArray.push(this._formBuilder.control('None'));
      }
    } else {
      if (isChecked) {
        medicalConditionsArray.push(this._formBuilder.control(changedValue));
        const noneIndex = medicalConditionsArray.controls.findIndex(x => x.value === 'None');
        if (noneIndex !== -1) {
          medicalConditionsArray.removeAt(noneIndex);
        }
      } else {
        const index = medicalConditionsArray.controls.findIndex(x => x.value === changedValue);
        if (index !== -1) {
          medicalConditionsArray.removeAt(index);
        }
      }
    }
    medicalConditionsArray.updateValueAndValidity(); 
  }

  isMedicalConditionSelected(condition: string): boolean {
    return this.medicalConditionsFormArray.controls.some(control => control.value === condition);
  }

  adjustValue(controlName: string, type: 'heightValue' | 'weightValue', increment: boolean) {
    const control = this.firstFormGroup.get(controlName);
    if (control) {
      let currentValue = control.value;
      if (increment) {
        currentValue++;
      } else {
        currentValue = Math.max(0, currentValue - 1); 
      }
      control.setValue(currentValue);
    }
  }

  submitForm() {
    this.firstFormGroup.markAllAsTouched();
    this.secondFormGroup.markAllAsTouched();
    this.thirdFormGroup.markAllAsTouched();
    this.fourthFormGroup.markAllAsTouched();
    if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid && this.fourthFormGroup.valid) {
      const selectedMedicalConditions: string[] = this.secondFormGroup.value.medicalConditions;
      const medicalConditionString = selectedMedicalConditions.length > 0
        ? selectedMedicalConditions.join(', ')
        : '';
      const finalPayload = {
        fullName: this.firstFormGroup.value.fullName,
        age: this.firstFormGroup.value.age,
        gender: this.firstFormGroup.value.gender,
        height: `${this.firstFormGroup.value.heightValue} ${this.firstFormGroup.value.heightUnit}`,
        weight: `${this.firstFormGroup.value.weightValue} kg`, 

        health_goals: {
          dietPreference: this.secondFormGroup.value.dietPreference,
          medicalCondition: medicalConditionString, 
          anyMedication: this.secondFormGroup.value.anyMedication === 'yes', 
          medication: this.secondFormGroup.value.medicationDetails
        },
        food_prefrence: {
          foodPreference: this.thirdFormGroup.value.foodPreference,
          food_avoid: this.thirdFormGroup.value.foodToAvoid,
          dailyWaterIntake: this.thirdFormGroup.value.dailyWaterIntake
        },
        lifestyle_activity: {
          activity_level: this.fourthFormGroup.value.activityLevel,
          wakeup: this.fourthFormGroup.value.wakeUpTime,
          sleep: this.fourthFormGroup.value.sleepTime,
          breakfast: this.fourthFormGroup.value.breakfastTime, 
          lunch: this.fourthFormGroup.value.lunchTime,         
          dinner: this.fourthFormGroup.value.dinnerTime        
        }
      };

      console.log('Final Submission Payload:', finalPayload);
      alert('Form Submitted! Check console for payload.');
      this.goToSubscriptionPlans()


     const token = localStorage.getItem('authToken');
           console.log('token Payload:', token);

    if (token) {
      this.http.post(API_URL + ENDPOINTS.ONBOARD_DIET, finalPayload, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (res: any) => {
          console.log('API Response:', res);
          this.goToSubscriptionPlans();
        },
        error: (error) => {
          console.error('API Error:', error);
          this.showErrorToast();
        }
      });
    } else {
      // this.showLoginAlert = true; 
    }

       
    } else {
      alert('Please complete all required fields in all steps.');
      if (this.firstFormGroup.invalid) {
        this.stepper.selectedIndex = 0;
      } else if (this.secondFormGroup.invalid) {
        this.stepper.selectedIndex = 1;
      } else if (this.thirdFormGroup.invalid) {
        this.stepper.selectedIndex = 2;
      } else if (this.fourthFormGroup.invalid) {
        this.stepper.selectedIndex = 3;
      }
    }
  }

  goToPlans() {
    this.submitForm(); 
  }

    showErrorToast() {
      const toastEl = document.getElementById('formErrorToast');
      if (toastEl) {
        const toast = new Toast(toastEl);
        toast.show();
      }
    }
  
    goToSubscriptionPlans() {
     this.router.navigate(['/subscription-plans']);
    }
}
