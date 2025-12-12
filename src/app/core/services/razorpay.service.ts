import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  constructor() {}

  loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject('Razorpay script loading failed');
      document.body.appendChild(script);
    });
  }

  openRazorpay(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadRazorpayScript().then(() => {
        const rzp = new Razorpay({
          ...options,
          modal: {
            ondismiss: () => {
              reject('Payment cancelled');
            }
          }
        });

        rzp.on('payment.failed', (response: any) => {
          reject(response.error);
        });

        rzp.open();
      }).catch(error => {
        reject(error);
      });
    });
  }
}