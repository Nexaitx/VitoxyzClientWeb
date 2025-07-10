import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-book-staff-process',
  imports: [
    RouterOutlet
  ],
  templateUrl: './book-staff-process.html',
  styleUrls: ['./book-staff-process.scss']
})
export class BookStaff {


  getAddressFromCoords(lat: number, lng: number) {

  }
}
