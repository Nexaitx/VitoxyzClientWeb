
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '@src/app/core/const';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule
  ],
  templateUrl: './plans.html',
  styleUrl: './plans.scss'
})
export class Plans implements OnInit {
  selectedPlan: string = 'monthly';
  http = inject(HttpClient);
  router = inject(Router)

  constructor() { }

  ngOnInit(): void {
    this.getPlans();
  }

  getPlans() {
    this.http.get(API_URL + ENDPOINTS.SUBSCRIPTION_PLANS).subscribe((res: any) => {
      console.log(res)
    })
  }

  goToPayment() {
    this.router.navigate(['/payment']);
  }
}