
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './plans.html',
  styleUrl: './plans.scss'
})
export class Plans implements OnInit {
  // No specific logic needed for now, just displays content
  constructor() {}
  ngOnInit(): void {}
}