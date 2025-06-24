import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common'; // For *ngIf
import { Router } from '@angular/router'; // For navigation
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // For user feedback

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select'; // For dropdowns
import { MatRadioModule } from '@angular/material/radio'; // For radio buttons
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading indicator
import { MatIconModule } from '@angular/material/icon';

// Mock User Data Interface (Optional, but good practice)
interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  stateProvince?: string;
  zipCode?: string;
  profilePhoto?: string; // URL of the existing profile photo
  gender: string;
  age: number;
  heightCm?: number;
  heightFeet?: number;
  heightInches?: number;
  heightUnit: 'cm' | 'feet_inches';
  weightKg: number;
}

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule, // Added for loading
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile  implements OnInit {
   updateProfileForm!: FormGroup;
  isLoading = false;

  feetOptions: number[] = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12 feet
  inchesOptions: number[] = Array.from({ length: 12 }, (_, i) => i); // 0 to 11 inches

  // For profile photo handling
  selectedFile: File | null = null;
  profilePhotoUrl: string | ArrayBuffer | null = 'assets/placeholder-profile.png'; // Default or existing photo URL

  // Mock existing user data (Updated to include new fields)
  mockUserData: UserProfile = {
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '9876543210',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4B',
    city: 'Mumbai',
    stateProvince: 'Maharashtra',
    zipCode: '400001',
    profilePhoto: 'https://via.placeholder.com/120/007bff/FFFFFF?text=JD', // Example existing photo
    gender: 'female',
    age: 30,
    heightUnit: 'feet_inches',
    heightFeet: 5,
    heightInches: 6,
    weightKg: 65.5,
  };

  constructor(private fb: FormBuilder, private router: Router, private _snackBar: MatSnackBar) {}

   ngOnInit(): void {
    console.log('Initializing Profile Component');
    this.updateProfileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // 10-digit number validation
      addressLine1: [''], // Optional
      addressLine2: [''], // Optional
      city: ['', Validators.required],
      stateProvince: [''], // Optional
      zipCode: [''], // Optional
      gender: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      heightUnit: ['cm', Validators.required],
      heightCm: ['', [Validators.min(50), Validators.max(250)]],
      heightFeet: [''],
      heightInches: [''],
      weightKg: ['', [Validators.required, Validators.min(10), Validators.max(300)]],
    });

    // --- Populate form with existing data ---
    this.populateForm(this.mockUserData);

    // --- Conditional Validation for Height based on Unit selection ---
    // (This logic remains the same as before)
    this.updateProfileForm.get('heightUnit')?.valueChanges.subscribe(unit => {
      const heightCmControl = this.updateProfileForm.get('heightCm');
      const heightFeetControl = this.updateProfileForm.get('heightFeet');
      const heightInchesControl = this.updateProfileForm.get('heightInches');

      if (!heightCmControl || !heightFeetControl || !heightInchesControl) {
        return;
      }

      if (unit === 'cm') {
        heightFeetControl.clearValidators();
        heightFeetControl.disable();
        heightFeetControl.setValue(''); // Clear value when switching units

        heightInchesControl.clearValidators();
        heightInchesControl.disable();
        heightInchesControl.setValue('');

        heightCmControl.setValidators([Validators.required, Validators.min(50), Validators.max(250)]);
        heightCmControl.enable();
      } else { // unit === 'feet_inches'
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

    // Manually trigger valueChanges to apply initial validators correctly
    // And set initial photo URL if exists
    if (this.mockUserData.profilePhoto) {
      this.profilePhotoUrl = this.mockUserData.profilePhoto;
    }
    this.updateProfileForm.get('heightUnit')?.setValue(this.mockUserData.heightUnit); // Re-set to trigger logic
  }

  // Method to populate the form with user data
  populateForm(userData: UserProfile): void {
    this.updateProfileForm.patchValue({
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      addressLine1: userData.addressLine1,
      addressLine2: userData.addressLine2,
      city: userData.city,
      stateProvince: userData.stateProvince,
      zipCode: userData.zipCode,
      gender: userData.gender,
      age: userData.age,
      heightUnit: userData.heightUnit,
      heightCm: userData.heightUnit === 'cm' ? userData.heightCm : null,
      heightFeet: userData.heightUnit === 'feet_inches' ? userData.heightFeet : null,
      heightInches: userData.heightUnit === 'feet_inches' ? userData.heightInches : null,
      weightKg: userData.weightKg,
    });
  }

  // Handle file selection for profile photo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Read file for preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePhotoUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      // Revert to original photo or default placeholder if user cancels selection
      this.profilePhotoUrl = this.mockUserData.profilePhoto || 'assets/placeholder-profile.png';
    }
  }

  onSubmit(): void {
    this.updateProfileForm.markAllAsTouched(); // Show validation errors
    if (this.updateProfileForm.valid) {
      this.isLoading = true;

      const formData = this.updateProfileForm.value;
      console.log('Update Profile Form Data:', formData);

      // Process height to a single unit (e.g., cm) for consistency
      let heightInCm: number | null = null;
      if (formData.heightUnit === 'cm') {
        heightInCm = formData.heightCm;
      } else if (formData.heightUnit === 'feet_inches') {
        if (formData.heightFeet !== null && formData.heightInches !== null) {
          const totalInches = (formData.heightFeet * 12) + formData.heightInches;
          heightInCm = parseFloat((totalInches * 2.54).toFixed(2)); // 1 inch = 2.54 cm
        }
      }

      // Prepare data for backend (excluding UI-specific height fields and including new fields)
      const finalData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        stateProvince: formData.stateProvince,
        zipCode: formData.zipCode,
        gender: formData.gender,
        age: formData.age,
        heightCm: heightInCm, // Standardized height
        weightKg: formData.weightKg,
        // Profile photo would be uploaded separately or as FormData
        // If this.selectedFile is not null, you'd send it here using FormData
      };

      console.log('Processed Data for Backend Update:', finalData);
      if (this.selectedFile) {
        console.log('New Profile Photo selected:', this.selectedFile.name, this.selectedFile.type);
        // In a real application, you would create a FormData object
        // const formDataToUpload = new FormData();
        // formDataToUpload.append('profilePhoto', this.selectedFile);
        // formDataToUpload.append('userData', JSON.stringify(finalData));
        // Then send formDataToUpload via HttpClient.post
      }


      // Simulate API call for update
      setTimeout(() => {
        this.isLoading = false;
        this._snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        // Optionally navigate away after successful update
        // this.router.navigate(['/client/dashboard']);
      }, 1500);
    } else {
      this._snackBar.open('Please correct the errors in the form.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      console.log('Form is invalid, please check errors.');
    }
  }
}