import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '../../core/const';

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
  step: 'input' | 'otp' = 'input';
  otpError = false;
  isVisible = true;

  private sessionId = ''; // Optional: If your API returns sessionId

  constructor(private http: HttpClient) {}

  sendOtp(): void {
    if (this.aadharNumber.length !== 12 || !/^\d{12}$/.test(this.aadharNumber)) {
      alert('Please enter a valid 12-digit Aadhar number.');
      return;
    }

    this.http.post(`${API_URL}${ENDPOINTS.AADHAAR_VERIFICATION}`, {
      aadharNumber: this.aadharNumber
    }).subscribe({
      next: (res: any) => {
        console.log('OTP sent:', res);
        // Optional: if API returns sessionId or transactionId, store it
        this.sessionId = res.sessionId || '';
        this.step = 'otp';
      },
      error: (err) => {
        console.error('Error sending OTP:', err);
        alert('Failed to send OTP. Try again.');
      }
    });
  }
verifyOtp(): void {
  this.http.post(`${API_URL}${ENDPOINTS.AADHAAR_VERIFICATION}`, {
    aadharNumber: this.aadharNumber,
    otp: this.otp,
    sessionId: this.sessionId
  }).subscribe({
    next: (res: any) => {
      // Update user data in localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.aadhaarStatus = { 
          ...user.aadhaarStatus, 
          verified: true 
        };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('aadharVerified', 'true');
      }

      this.verified.emit();
      this.closePopup();
    },
    error: (err) => {
      console.error('OTP verification failed', err);
      this.otpError = true;
    }
  });
}


  closePopup(): void {
    this.isVisible = false;
  }
}
