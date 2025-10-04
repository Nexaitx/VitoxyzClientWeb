import { Component } from '@angular/core';
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
export class Header {
  searchQuery: string = '';
   selectedLocation: string = 'Delhi'; // Default location
  locations: string[] = ['East Godavari', 'Chennai', 'Delhi', 'Ludhiana', 'Chandigarh'];

  constructor(private router: Router) {}

  onSearch() {
    if (!this.searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    this.router.navigate(['/search'], { queryParams: { q: this.searchQuery, loc: this.selectedLocation } });
  }
   onQuickOrder() {
    alert('Quick order feature coming soon!');
  }
  useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Current location:', position.coords);
          this.selectedLocation = 'Current Location';
          alert('Location updated using GPS!');
        },
        (error) => {
          console.error('Error fetching location:', error);
          alert('Unable to fetch current location');
        }
      );
    } else {
      alert('Geolocation not supported in your browser');
    }
  }
}
