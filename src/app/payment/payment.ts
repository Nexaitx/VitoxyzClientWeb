import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class PaymentSuccessComponent   implements OnInit  {

  paymentId: string = '';
  amount: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['paymentId'] || 'N/A';
      this.amount = params['amount'] || 0;
    });
  }
}
