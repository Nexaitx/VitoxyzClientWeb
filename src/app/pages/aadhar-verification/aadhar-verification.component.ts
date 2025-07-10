import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-aadhar-verification',
    imports: [CommonModule, FormsModule],
    templateUrl: './aadhar-verification.component.html',
    styleUrls: ['./aadhar-verification.component.scss']
})
export class AadharVerificationComponent {
    @Output() verified = new EventEmitter<void>();
    aadharNumber: string = '';
    otp: string = '';
    step: 'input' | 'otp' = 'input'; // toggle view
    otpError = false;
    isVisible = true;

    // Simulated backend OTP for demo
    private generatedOtp = '123456';

    sendOtp(): void {
        if (this.aadharNumber.length !== 12 || !/^\d{12}$/.test(this.aadharNumber)) {
            alert('Please enter a valid 12-digit Aadhar number.');
            return;
        }

        // Simulate API call
        console.log('Sending OTP to:', this.aadharNumber);
        setTimeout(() => {
            console.log('OTP sent successfully!');
            this.step = 'otp'; // Move to OTP step
        }, 500);
    }

    verifyOtp(): void {
        if (this.otp === this.generatedOtp) {
            console.log('OTP verified successfully!');
            this.verified.emit(); // trigger success event
            this.closePopup();
        } else {
            this.otpError = true;
        }
    }

    closePopup(): void {
        this.isVisible = false;
    }
}
