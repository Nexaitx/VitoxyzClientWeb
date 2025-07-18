
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

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
  // No specific logic needed for now, just displays content
  constructor() { }
  ngOnInit(): void { }
}