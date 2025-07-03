import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-view-staff',
  imports: [CommonModule],
  templateUrl: './view-staff.html',
  styleUrl: './view-staff.scss',
  standalone: true
})
export class ViewStaff {
staffList = [
  {
    name: 'Nurse A',
    experience: 5,
    rating: 4.5,
    rate: 250,
    imageUrl: 'https://via.placeholder.com/100'
  },
  {
    name: 'Nurse B',
    experience: 3,
    rating: 4.0,
    rate: 200,
    imageUrl: 'https://via.placeholder.com/100'
  },
  {
    name: 'Nurse A',
    experience: 5,
    rating: 4.5,
    rate: 250,
    imageUrl: 'https://via.placeholder.com/100'
  },
  {
    name: 'Nurse B',
    experience: 3,
    rating: 4.0,
    rate: 200,
    imageUrl: 'https://via.placeholder.com/100'
  },
  {
    name: 'Nurse A',
    experience: 5,
    rating: 4.5,
    rate: 250,
    imageUrl: 'https://via.placeholder.com/100'
  },
  {
    name: 'Nurse B',
    experience: 3,
    rating: 4.0,
    rate: 200,
    imageUrl: 'https://via.placeholder.com/100'
  },
  {
    name: 'Nurse A',
    experience: 5,
    rating: 4.5,
    rate: 250,
    imageUrl: 'https://via.placeholder.com/100'
  },
  {
    name: 'Nurse B',
    experience: 3,
    rating: 4.0,
    rate: 200,
    imageUrl: 'https://via.placeholder.com/100'
  },
  {
    name: 'Nurse A',
    experience: 5,
    rating: 4.5,
    rate: 250,
    imageUrl: 'https://via.placeholder.com/100'
  },
  {
    name: 'Nurse B',
    experience: 3,
    rating: 4.0,
    rate: 200,
    imageUrl: 'https://via.placeholder.com/100'
  },
  // Add more objects as needed
];

addStaff(index: number) {
  console.log('Add clicked for', this.staffList[index]);
}

removeStaff(index: number) {
  console.log('Remove clicked for', this.staffList[index]);
}

}
