import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {
    searchQuery: string = '';
  currentLocation: string = '';

  constructor(private router: Router) {}
ngOnInit() {
    this.detectLocation();
  }
  onSearch() {
    if (!this.searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
  }
   onQuickOrder() {
    this.router.navigate(['/order-prescription']);
  }
  async detectLocation() {
    if (!navigator.geolocation) {
      this.currentLocation = 'Geolocation not supported';
      return;
    }

    this.currentLocation = 'Detecting...';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await response.json();

          if (data.address) {
            this.currentLocation =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              'Your Location';
          } else {
            this.currentLocation = 'Unknown Location';
          }
        } catch (error) {
          console.error('Error fetching location:', error);
          this.currentLocation = 'Unable to fetch location';
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.currentLocation = 'Location permission denied';
      }
    );
  }
}
