import { Component } from '@angular/core';
import { BookNurse } from './book-nurse/book-nurse';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-book-staff',
  imports: [
    RouterOutlet
  ],
  templateUrl: './book-staff.html',
  styleUrl: './book-staff.scss'
})
export class BookStaff {


  getAddressFromCoords(lat: number, lng: number) {

  }
}
