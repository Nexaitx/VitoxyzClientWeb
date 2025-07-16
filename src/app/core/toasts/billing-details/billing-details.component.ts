import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

export interface BillingDetails {
  address: string;
  name: string;
  gstNumber?: string;
}

@Component({
  selector: 'app-billing-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './billing-details.component.html',
  styleUrls: ['./billing-details.component.scss']
})
export class BillingDetailsComponent implements OnInit {
  @Input() initialGstNumber: string = '';
  @Input() initialName: string = '';
  @Input() initialAddress: string = '';
  @Input() paymentAmount: number = 0;
  @Output() proceedToPayment = new EventEmitter<BillingDetails>();
  @Output() closePopup = new EventEmitter<void>();

  billingForm!: FormGroup; 
  private fb = inject(FormBuilder); 
  constructor() { }

  ngOnInit(): void {
    this.billingForm = this.fb.group({
      address: [this.initialAddress, Validators.required], 
      name: [this.initialName, Validators.required],   
      gstNumber: [this.initialGstNumber, Validators.pattern('^[0-9A-Za-z]{15}$')] 
    });
    if (this.initialGstNumber) {
      this.billingForm.get('gstNumber')?.setValue(this.initialGstNumber);
    }
  }

  onSubmit(): void {
    if (this.billingForm.valid) {
      this.proceedToPayment.emit(this.billingForm.value as BillingDetails);
      this.closePopup.emit();
    } else {
      this.billingForm.markAllAsTouched();
      console.log('Billing form is invalid. Please check the fields.');
    }
  }

  onClose(): void {
    this.closePopup.emit(); 
  }
}
