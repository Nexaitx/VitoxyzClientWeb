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
  //staffDetails: any[] = [];
  staffDetails: any[] = [
    {
      "category": "nurse",
      "availableStaff": [
        {
          "subCategory": "babycare",
          "id": 6,
          "name": "string",
          "gender": "male",
          "tenure": null,
          "startDate": "2025-07-04",
          "timeSlot": "1",
          "experience": '3',
          "duties": "34",
          "rating": "3",
          "payment": "230"
        },
        {
          "subCategory": "babycare",
          "id": 3,
          "name": "test",
          "gender": "female",
          "tenure": null,
          "startDate": "2025-07-04",
          "timeSlot": "1",
          "experience": '3',
          "duties": "34",
          "rating": "4",
          "payment": "230"
        },
        {
          "subCategory": "dialysis",
          "id": 3,
          "name": "test",
          "gender": "female",
          "tenure": null,
          "startDate": "2025-07-04",
          "timeSlot": "1",
          "experience": '3',
          "duties": "34",
          "rating": "2",
          "payment": "230"
        }
      ]
    },
    {
      "category": "Security",
      "availableStaff": [
        {
          "subCategory": "day",
          "id": 6,
          "name": "string",
          "gender": "male",
          "tenure": null,
          "startDate": "2025-07-04",
          "timeSlot": "1",
          "experience": '3',
          "duties": "34",
          "rating": "4",
          "payment": "230"
        },
        {
          "subCategory": "night",
          "id": 3,
          "name": "test",
          "gender": "female",
          "tenure": null,
          "startDate": "2025-07-04",
          "timeSlot": "1",
          "experience": '3',
          "duties": "34",
          "rating": "4",
          "payment": "230"
        }
      ]
    }
  ]
  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    //this.staffDetails = nav?.extras?.state?.['staffDetails'] ?? [];
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i);
  }

  addStaff(index: number) {
    console.log('Add clicked for', this.staffDetails[index]);
  }

  removeStaff(index: number) {
    console.log('Remove clicked for', this.staffDetails[index]);
  }

}
