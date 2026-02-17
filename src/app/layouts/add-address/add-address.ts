import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-address',
  imports: [
        CommonModule,
    FormsModule,
  ],
  templateUrl: './add-address.html',
  styleUrl: './add-address.scss',
})
export class AddAddress {
address: any = {
    fullName: '',
    phone: '',
    pincode: '',
    state: '',
    city: '',
    house: '',
    area: '',
    type: 'Home'
  };

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }

  saveAddress() {

    if (!this.address.fullName ||
        !this.address.phone ||
        !this.address.pincode ||
        !this.address.state ||
        !this.address.city ||
        !this.address.house ||
        !this.address.area) {
      alert('Please fill all required fields');
      return;
    }

    const saved = JSON.parse(localStorage.getItem('savedAddresses') || '[]');

    saved.push(this.address);

    localStorage.setItem('savedAddresses', JSON.stringify(saved));

    this.router.navigate(['/']);
  }
}
