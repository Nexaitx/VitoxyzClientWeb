import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { Submission } from '../submission/submission';

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
    Submission
  ],
  templateUrl: './user-onboarding.html',
  styleUrl: './user-onboarding.scss'
})
export class UserOnboarding {
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  constructor() { }
  
  goToPlans() {
    this.router.navigate(['/plans']);
  }
}