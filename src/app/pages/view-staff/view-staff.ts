import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-staff',
  imports: [CommonModule],
  templateUrl: './view-staff.html',
  styleUrl: './view-staff.scss',
  standalone: true
})
export class ViewStaff {
  staffDetails: any[] = [];
  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.staffDetails = nav?.extras?.state?.['staffDetails'] ?? [];
  }

  getStars(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 0; i < 5; i++) {
      const current = i + 1;
      if (rating >= current) {
        stars.push('full');
      } else if (rating > current - 1 && rating < current) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  addStaff(index: number) {
    console.log('Add clicked for', this.staffDetails[index]);
  }

  removeStaff(index: number) {
    console.log('Remove clicked for', this.staffDetails[index]);
  }

}
