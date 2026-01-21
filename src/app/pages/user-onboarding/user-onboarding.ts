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
import { Footer } from "../footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
import { TextBanner } from "@src/app/shared/text-banner/text-banner";
import { TextImageComponent } from "../shared/text-image/text-image";
import { MedicineSliderComponent } from "@src/app/shared/medicine-slider/medicine-slider";
import { PushNotificationService } from '@src/app/core/services/push-notification.service';

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
    CommonModule,
    Footer,
    MobileFooterNavComponent,
    TextBanner,
    TextImageComponent,

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

  constructor(private notif: PushNotificationService) {
    this.firstFormGroup = this._formBuilder.group({
      fullName: ['', Validators.required],
      lastName: ['', Validators.required],
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
    console.log('[App] ngOnInit: starting');          // <-- confirm component boots
    try {
      this.notif.listen();
      console.log('[App] listenMessages() called');
    } catch (err) {
      console.error('[App] listenMessages failed:', err);
    }
  }
  enable() {
    console.log('[App] enable() pressed — requesting permission');

    this.notif.requestPermission().then(token => {
      console.log('[App] requestPermission returned:', token);

      if (!token) {
        console.warn('[App] No token received. Check SW errors.');
      } else {
        console.log('[App] FCM token acquired:', token);
      }
    })
      .catch(err => {
        console.error('[App] requestPermission threw:', err);
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

  if (
    this.firstFormGroup.invalid ||
    this.secondFormGroup.invalid ||
    this.thirdFormGroup.invalid ||
    this.fourthFormGroup.invalid
  ) {
      this.showErrorToast('Please complete all required fields in all steps.');
    return;
  }

  const selectedMedicalConditions: string[] =
    this.secondFormGroup.value.medicalConditions || [];

  const medicalConditionString =
    selectedMedicalConditions.length > 0
      ? selectedMedicalConditions.join(', ')
      : '';

  // ✅ FINAL PAYLOAD (CORRECT KEYS)
  const finalPayload = {
    fullName: this.firstFormGroup.value.fullName,
     lastName: this.firstFormGroup.value.lastName,
    age: this.firstFormGroup.value.age,
    gender: this.firstFormGroup.value.gender.toLowerCase(),
    height: `${this.firstFormGroup.value.heightValue} ${this.firstFormGroup.value.heightUnit}`,
    weight: String(this.firstFormGroup.value.weightValue),

    healthGoals: {
      dietPreference: this.secondFormGroup.value.dietPreference,
      medicalCondition: selectedMedicalConditions,
      anyMedication: this.secondFormGroup.value.anyMedication === 'yes',
      medication: this.secondFormGroup.value.medicationDetails || 'string'
    },

    foodPreference: {
      foodPreference: this.thirdFormGroup.value.foodPreference,
      foodAvoid: this.thirdFormGroup.value.foodToAvoid,
      dailyWaterIntake: String(this.thirdFormGroup.value.dailyWaterIntake)
    },

    lifestyleActivity: {
      activity_level: this.fourthFormGroup.value.activityLevel,
      wakeUpTime: this.fourthFormGroup.value.wakeUpTime,
      sleepTime: this.fourthFormGroup.value.sleepTime,
      breakfastTime: this.fourthFormGroup.value.breakfastTime,
      lunchTime: this.fourthFormGroup.value.lunchTime,
      dinnerTime: this.fourthFormGroup.value.dinnerTime
    }
  };

  console.log('Final Payload:', finalPayload);

  // ✅ API CALL (THIS IS MY CODE – CORRECT PLACE)
  const token = localStorage.getItem('authToken');
const url = API_URL + ENDPOINTS.ONBOARD_DIET + '?enabled=true';

  if (!token) {
    console.error('No auth token found');
    return;
  }

  this.http.post(url, finalPayload, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: (res: any) => {
      console.log('API Success:', res);
      this.router.navigate(['/subscription-plans']); // ✅ navigate ONLY on success
    },
    error: (err) => {
      console.error('API Failed:', err);
      this.showErrorToast();
    }
  });
}




  // goToPlans() {
  //   this.submitForm(); 
  // }

  showErrorToast(message: string = 'Something went wrong') {
  const toastEl = document.getElementById('formErrorToast');
  if (!toastEl) return;

  const body = toastEl.querySelector('.toast-body');
  if (body) {
    body.textContent = message;
  }

  const toast = new Toast(toastEl);
  toast.show();
}


  goToSubscriptionPlans() {
    this.router.navigate(['/subscription-plans']);
  }
  centerContent() {
    const banner = document.querySelector('.banner .banner-content');
    if (banner) {
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }


}
