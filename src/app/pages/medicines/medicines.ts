import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AfterViewInit } from '@angular/core';
import { Footer } from '../footer/footer';
import { Header } from './header/header';
import { HttpClient } from '@angular/common/http';
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
    Header,
    Footer
  ],
  templateUrl: './medicines.html',
  styleUrls: ['./medicines.scss']
})
export class Medicines implements AfterViewInit {
  medicines = [
    { id: 1, description: 'Dettol Antiseptic', volume: '30 ml Shampoo', deliveryTime: 30, discountedPrice: 378, originalPrice: 499, discountPercentage: 12, rating: 4.4, image: 'https://placehold.co/150x150/0000FF/FFFFFF?text=Med1' },
    { id: 2, description: 'Band-Aid First Aid', volume: '10 count', deliveryTime: 25, discountedPrice: 150, originalPrice: 180, discountPercentage: 15, rating: 4.6, image: 'https://placehold.co/150x150/FF0000/FFFFFF?text=Med2' },
    { id: 3, description: 'Tylenol Pain Reliever', volume: '50 tablets', deliveryTime: 40, discountedPrice: 250, originalPrice: 300, discountPercentage: 17, rating: 4.8, image: 'https://placehold.co/150x150/00FF00/FFFFFF?text=Med3' },
    { id: 4, description: 'Cold-Eeze Lozenges', volume: '24 pack', deliveryTime: 35, discountedPrice: 199, originalPrice: 220, discountPercentage: 9, rating: 4.2, image: 'https://placehold.co/150x150/FFFF00/FFFFFF?text=Med4' },
    { id: 5, description: 'Zyrtec Allergy Relief', volume: '30 count', deliveryTime: 30, discountedPrice: 450, originalPrice: 500, discountPercentage: 10, rating: 4.7, image: 'https://placehold.co/150x150/00FFFF/FFFFFF?text=Med5' },
    { id: 6, description: 'Pepto-Bismol', volume: '16 oz bottle', deliveryTime: 20, discountedPrice: 320, originalPrice: 350, discountPercentage: 8, rating: 4.5, image: 'https://placehold.co/150x150/FF00FF/FFFFFF?text=Med6' },
    { id: 7, description: 'Advil Pain Reliever', volume: '40 tablets', deliveryTime: 25, discountedPrice: 280, originalPrice: 330, discountPercentage: 15, rating: 4.9, image: 'https://placehold.co/150x150/A020F0/FFFFFF?text=Med7' },
    { id: 8, description: 'Benadryl Itch Cream', volume: '1 oz tube', deliveryTime: 30, discountedPrice: 120, originalPrice: 150, discountPercentage: 20, rating: 4.3, image: 'https://placehold.co/150x150/F08080/FFFFFF?text=Med8' },
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

  brands = [
    {
      name: 'Brand 1',
      image: '../../../assets/medicines/brand-1.png'
    },
    {
      name: 'Brand 2',
      image: '../../../assets/medicines/brand-1.png'
    },
    {
      name: 'Brand 3',
      image: '../../../assets/medicines/brand-1.png'
    },
    {
      name: 'Brand 4',
      image: '../../../assets/medicines/brand-1.png'
    },
    {
      name: 'Brand 5',
      image: '../../../assets/medicines/brand-1.png'
    },
    {
      name: 'Brand 2',
      image: '../../../assets/medicines/brand-1.png'
    },
    {
      name: 'Brand 3',
      image: '../../../assets/medicines/brand-1.png'
    },
    {
      name: 'Brand 4',
      image: '../../../assets/medicines/brand-1.png'
    },
    {
      name: 'Brand 5',
      image: '../../../assets/medicines/brand-1.png'
    }
  ]

  selectedCity: string = 'Mumbai';
  searchTerm: string = '';
  filteredMedicines = [...this.medicines];
  private router: Router = inject(Router);
  selectedMedicine: any;
  private http = inject(HttpClient);
  fdaMedicines: any[] = [];


  ngOnInit(): void {
    this.filteredMedicines = [...this.medicines];
    // this.getOpenFDAMedicines();
    // this.getGovMed();
    // this.getRapidAPI();
  }

  getRapidAPI() {
    this.http.get('https://endlessmedicalapi1.p.rapidapi.com/InitSession', {
      headers: {
        'X-RapidAPI-Key': '42e5de4446mshe40107c87b9eda9p158850jsn6f71b343d85f',
        'X-RapidAPI-Host': 'endlessmedicalapi1.p.rapidapi.com'
      }, withCredentials: true
    }).subscribe((data: any) => {
      console.log(data);
    });
  }

  getOpenFDAMedicines() {
    this.http.get('https://api.fda.gov/drug/label.json').subscribe((data: any) => {
      this.fdaMedicines = data.results;
    });
  }
  getGovMed() {
    this.http.get('https://rxnav.nlm.nih.gov/REST/RxTerms/allconcepts.xml').subscribe((data: any) => {

    })
  }
  filterMedicines(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredMedicines = this.medicines.filter(med =>
      med.description.toLowerCase().includes(term) || med.description.toLowerCase().includes(term)
    );
  }

  onCityChange(city: string): void {
    this.selectedCity = city;
  }

  ngAfterViewInit(): void {
    const carouselEl = document.querySelector('#healthConcernCarousel');
    if (carouselEl) {
      new bootstrap.Carousel(carouselEl, {
        interval: 3000,
        ride: 'carousel',
        pause: false,
        wrap: true,
      });
    }
  }

  viewDetails(): void {
    this.router.navigate(['/medicines', this.selectedMedicine.id]);
  }

}
