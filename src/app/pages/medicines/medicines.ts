import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout'; // For responsiveness
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { RouterModule } from '@angular/router'; // For routerLink in HTML

// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav'; // For the side navigation
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list'; // For navigation items in sidenav
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AfterViewInit } from '@angular/core';
declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './medicines.html',
  styleUrls: ['./medicines.scss']
})
export class Medicines implements AfterViewInit  {
  medicines = [
    {
      name: 'Med-Supply',
      image: "data:image/jpeg;base64,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",
      description: 'Antiseptic liquid for first aid and cleaning.',
      price: 50,
    }
  ];
  cities: string[] = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Lucknow'
  ];

  selectedCity: string = 'Mumbai'; // Default city
  searchTerm: string = ''; // For search filter
  filteredMedicines = [...this.medicines];

  ngOnInit(): void {
    this.filteredMedicines = [...this.medicines]; // Initialize filtered list
  }

  // Filter medicines based on search term
  filterMedicines(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredMedicines = this.medicines.filter(med =>
      med.name.toLowerCase().includes(term) || med.description.toLowerCase().includes(term)
    );
  }

  // Optional: Handle city selection (e.g., for future functionality)
  onCityChange(city: string): void {
    this.selectedCity = city;
    console.log(`Selected city: ${city}`);
  }


 ngAfterViewInit(): void {
    const carouselEl = document.querySelector('#healthConcernCarousel');
    if (carouselEl) {
      new bootstrap.Carousel(carouselEl, {
        interval: 3000, //change  time interval what you need
        ride: 'carousel',
        pause: false,
        wrap: true,
      });
    }
  }

}
