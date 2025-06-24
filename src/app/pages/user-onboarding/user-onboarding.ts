import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { Router, RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Added for checkboxes

@Component({
  selector: 'app-user-onboarding',
  standalone: true,
  imports: [
    MatButtonModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule, // Added for checkboxes
    CommonModule,
  ],
  templateUrl: './user-onboarding.html',
  styleUrl: './user-onboarding.scss'
})
export class UserOnboarding implements OnInit {
  onboardingForm!: FormGroup;
  secondFormGroup!: FormGroup; // For address
  dietaryPreferenceForm!: FormGroup;
  medicalForm!: FormGroup;
  
  feetOptions: number[] = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12 feet
  inchesOptions: number[] = Array.from({ length: 12 }, (_, i) => i); // 0 to 11 inches
  dietaryOptions: string[] = ['Vegan', 'Pure Vegetarian', 'Ovo vegetarian', 'Non vegetarian'];
  goalsOptions = [
    { label: 'Improve physical appearance', value: 'physical_appearance' },
    { label: 'Become healthier', value: 'healthier' },
    { label: 'Feel better day to day', value: 'feel_better' }
  ];

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    // Initialize onboardingForm
    this.onboardingForm = this.fb.group({
      fullName: ['', Validators.required],
      gender: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      heightUnit: ['cm', Validators.required],
      heightCm: ['', [Validators.required, Validators.min(50), Validators.max(250)]],
      heightFeet: [''],
      heightInches: [''],
      weightKg: ['', [Validators.required, Validators.min(10), Validators.max(300)]],
      city: ['', Validators.required]
    });

    // Initialize secondFormGroup for address
    this.secondFormGroup = this.fb.group({
      address: ['', Validators.required]
    });

    // Initialize dietaryPreferenceForm
    this.dietaryPreferenceForm = this.fb.group({
      preferences: this.fb.array([], Validators.required)
    });

    // Add controls for dietary preferences
    this.addDietaryPreferenceCheckboxes();

    this.medicalForm = this.fb.group({
      // 'no' means no conditions, 'yes' means conditions selected below
      hasMedicalConditions: ['no', Validators.required],
      medicalConditions: this.fb.group({
        thyroid: [false],
        diabetes: [false],
        pcodPcos: [false],
        cholesterol: [false],
        others: [false] // Control for the "Others" checkbox
      }),
      otherSpecify: [''] // Input for specifying "Others"
    });


    // Height unit conditional validation
    this.onboardingForm.get('heightUnit')?.valueChanges.subscribe(unit => {
      const heightCmControl = this.onboardingForm.get('heightCm');
      const heightFeetControl = this.onboardingForm.get('heightFeet');
      const heightInchesControl = this.onboardingForm.get('heightInches');

      if (!heightCmControl || !heightFeetControl || !heightInchesControl) {
        return;
      }

      if (unit === 'cm') {
        heightFeetControl.clearValidators();
        heightFeetControl.disable();
        heightFeetControl.setValue('');

        heightInchesControl.clearValidators();
        heightInchesControl.disable();
        heightInchesControl.setValue('');

        heightCmControl.setValidators([Validators.required, Validators.min(50), Validators.max(250)]);
        heightCmControl.enable();
      } else {
        heightCmControl.clearValidators();
        heightCmControl.disable();
        heightCmControl.setValue('');

        heightFeetControl.setValidators([Validators.required, Validators.min(1), Validators.max(12)]);
        heightFeetControl.enable();

        heightInchesControl.setValidators([Validators.required, Validators.min(0), Validators.max(11)]);
        heightInchesControl.enable();
      }

      heightCmControl.updateValueAndValidity();
      heightFeetControl.updateValueAndValidity();
      heightInchesControl.updateValueAndValidity();
    });

    // Trigger initial heightUnit validation
    this.onboardingForm.get('heightUnit')?.setValue('cm');
     // --- Conditional Logic: Radio Button (No medical condition) affects checkboxes ---
    this.medicalForm.get('hasMedicalConditions')?.valueChanges.subscribe(value => {
      const conditionsGroup = this.medicalForm.get('medicalConditions') as FormGroup;
      const otherSpecifyControl = this.medicalForm.get('otherSpecify') as FormControl;

      if (value === 'no') {
        // If "no medical condition" is selected, disable all checkboxes and uncheck them
        conditionsGroup.disable();
        conditionsGroup.patchValue({
          thyroid: false,
          diabetes: false,
          pcodPcos: false,
          cholesterol: false,
          others: false
        });

        // Also disable and clear 'otherSpecify' if it was active
        otherSpecifyControl.clearValidators();
        otherSpecifyControl.disable();
        otherSpecifyControl.setValue('');

      } else { // value === 'yes'
        // If "yes" is selected, enable the checkboxes
        conditionsGroup.enable();
        // Re-run validation for 'others' specifically in case it was selected before disabling
        this.onOthersCheckboxChange();
      }
      // Update validity for the entire form group
      conditionsGroup.updateValueAndValidity();
      otherSpecifyControl.updateValueAndValidity();
    });

    // --- Conditional Logic: "Others" checkbox affects "otherSpecify" input ---
    // Note: We subscribe to the individual control within the nested group
    this.medicalForm.get('medicalConditions.others')?.valueChanges.subscribe(isOthersSelected => {
      this.toggleOtherSpecifyControl(isOthersSelected);
    });

    // Manually trigger the valueChanges on init to set initial state correctly
    this.medicalForm.get('hasMedicalConditions')?.setValue('no'); // Default initial state
  
  }

   // Method called when the 'Others' checkbox is changed
  onOthersCheckboxChange(): void {
    const isOthersSelected = this.medicalForm.get('medicalConditions.others')?.value;
    this.toggleOtherSpecifyControl(isOthersSelected);
  }

  // Helper method to enable/disable and set validators for 'otherSpecify'
  private toggleOtherSpecifyControl(enable: boolean): void {
    const otherSpecifyControl = this.medicalForm.get('otherSpecify') as FormControl;

    if (enable) {
      otherSpecifyControl.setValidators(Validators.required);
      otherSpecifyControl.enable();
    } else {
      otherSpecifyControl.clearValidators();
      otherSpecifyControl.disable();
      otherSpecifyControl.setValue(''); // Clear value when not needed
    }
    otherSpecifyControl.updateValueAndValidity();
  }

  // Helper to get the FormArray for dietary preferences
  get preferencesFormArray() {
    return this.dietaryPreferenceForm.controls['preferences'] as FormArray;
  }

  // Add FormControls for each dietary option
  private addDietaryPreferenceCheckboxes() {
    while (this.preferencesFormArray.length) {
      this.preferencesFormArray.removeAt(0);
    }
    this.dietaryOptions.forEach(() => this.preferencesFormArray.push(new FormControl(false)));
  }

  // Handle checkbox change
  onCheckboxChange(event: any, index: number) {
    const preferences = this.preferencesFormArray;
    preferences.controls[index].setValue(event.checked);
  }

  onStepperSubmit(): void {
    this.router.navigate(['/plans']);
    // if (this.onboardingForm.valid && this.dietaryPreferenceForm.valid) {
    //   const selectedPreferences = this.preferencesFormArray.controls
    //     .map((control, i) => control.value ? this.dietaryOptions[i] : null)
    //     .filter(v => v !== null);

    //   const combinedData = {
    //     ...this.onboardingForm.value,
    //     dietaryPreferences: selectedPreferences
    //   };
    //   console.log('Final Combined Data Submitted:', combinedData);
    //   alert('All stepper data submitted!');
    //   // You would send `combinedData` to your backend here
    //   // this.router.navigate(['/client/next-step']); // Example navigation
    // } else {
    //   // Mark all controls as touched to show validation errors for all steps
    //   this.dietaryPreferenceForm.markAllAsTouched();
    //   console.log('One or more stepper forms are invalid. Please check.');
    //   // Optionally, you might want to automatically jump to the first invalid step
    // }
  }
}