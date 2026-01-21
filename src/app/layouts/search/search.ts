import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit {
    searchQuery: string = '';
  currentLocation: string = '';

  constructor(private router: Router) {}
ngOnInit() {
    this.detectLocation();
  }
  private showToastMessage(message: string, isError: boolean = false): void {
  const toastElement = document.getElementById('loginToast');
  if (!toastElement) return;

  const toastBody = toastElement.querySelector('.toast-body');
  if (toastBody) {
    toastBody.textContent = message;
  }

  // toggle success / error (NO new classes)
  toastElement.classList.remove('text-bg-success', 'text-bg-danger');
  toastElement.classList.add(isError ? 'text-bg-danger' : 'text-bg-success');

  new Toast(toastElement, { delay: 3000 }).show();
}

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.showToastMessage('Please enter a search query', true);
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
