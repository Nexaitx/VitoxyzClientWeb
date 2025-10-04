import { Component, ElementRef, inject, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LayoutModule } from "@angular/cdk/layout";
import { Router, RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { AfterViewInit } from "@angular/core";
import { Footer } from "../footer/footer";
import { Header } from "./header/header";
import { HttpClient } from "@angular/common/http";
import { API_URL, ENDPOINTS } from "@src/app/core/const";
import { CartService } from "@src/app/core/cart.service";
import { Observable } from "rxjs";
import { CommonFilterComponent } from "../shared/common-filter-component/common-filter-component";
import { HealthCarouselComponent } from "../shared/health-carousel/health-carousel";
declare var bootstrap: any;
export interface Medicine {
  id: string;
  name: string;
  form: string;
  description: string;
  use: string;
  package: string;
  mrp: string;
  image: string;
  rating: string; // hardcoded/dummy (API doesn’t provide)
  originalPrice: string; // fake original price (12% off)
  discountPercentage: number; // dummy for now
  deliveryTime: number;
}
interface otcMedicine {
  id: string;
  name: string;
  type: string;
  packaging: string;
  packageInfo: string;
  qty: string;
  productForm: string;
  mrp: number;
  productHighlights: string;
  information: string;
  keyIngredients: string;
  keyBenefits: string;
  directionsForUse: string;
  safetyInformation: string;
  manufacturerAddress: string;
  countryOfOrigin: string;
  manufacturerDetails: string;
  marketerDetails: string;
  expiration: string;
  image: string;
}

interface Category {
  name: string;
  apiValue: string; // API mein bhej jaane wali value (e.g., 'skin_care' agar zarurat ho)
  cssClass: string; 
  imageUrl: string; 
  altText: string;
}
@Component({
  selector: "app-dashboard",
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
    Footer,
    CommonFilterComponent,
    HealthCarouselComponent
],
  templateUrl: "./medicines.html",
  styleUrls: ["./medicines.scss"],
})
export class Medicines implements AfterViewInit {

  medicines = [
    {
      id: 1,
      description: "Dettol Antiseptic",
      volume: "30 ml Shampoo",
      deliveryTime: 30,
      discountedPrice: 378,
      originalPrice: 499,
      discountPercentage: 12,
      rating: 4.4,
      image: "https://placehold.co/150x150/0000FF/FFFFFF?text=Med1",
    },
    {
      id: 2,
      description: "Band-Aid First Aid",
      volume: "10 count",
      deliveryTime: 25,
      discountedPrice: 150,
      originalPrice: 180,
      discountPercentage: 15,
      rating: 4.6,
      image: "https://placehold.co/150x150/FF0000/FFFFFF?text=Med2",
    },
    {
      id: 3,
      description: "Tylenol Pain Reliever",
      volume: "50 tablets",
      deliveryTime: 40,
      discountedPrice: 250,
      originalPrice: 300,
      discountPercentage: 17,
      rating: 4.8,
      image: "https://placehold.co/150x150/00FF00/FFFFFF?text=Med3",
    },
    {
      id: 4,
      description: "Cold-Eeze Lozenges",
      volume: "24 pack",
      deliveryTime: 35,
      discountedPrice: 199,
      originalPrice: 220,
      discountPercentage: 9,
      rating: 4.2,
      image: "https://placehold.co/150x150/FFFF00/FFFFFF?text=Med4",
    },
    {
      id: 5,
      description: "Zyrtec Allergy Relief",
      volume: "30 count",
      deliveryTime: 30,
      discountedPrice: 450,
      originalPrice: 500,
      discountPercentage: 10,
      rating: 4.7,
      image: "https://placehold.co/150x150/00FFFF/FFFFFF?text=Med5",
    },
    {
      id: 6,
      description: "Pepto-Bismol",
      volume: "16 oz bottle",
      deliveryTime: 20,
      discountedPrice: 320,
      originalPrice: 350,
      discountPercentage: 8,
      rating: 4.5,
      image: "https://placehold.co/150x150/FF00FF/FFFFFF?text=Med6",
    },
    {
      id: 7,
      description: "Advil Pain Reliever",
      volume: "40 tablets",
      deliveryTime: 25,
      discountedPrice: 280,
      originalPrice: 330,
      discountPercentage: 15,
      rating: 4.9,
      image: "https://placehold.co/150x150/A020F0/FFFFFF?text=Med7",
    },
    {
      id: 8,
      description: "Benadryl Itch Cream",
      volume: "1 oz tube",
      deliveryTime: 30,
      discountedPrice: 120,
      originalPrice: 150,
      discountPercentage: 20,
      rating: 4.3,
      image: "https://placehold.co/150x150/F08080/FFFFFF?text=Med8",
    },
  ];
  cities: string[] = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
  ];

  brands = [
    {
      name: "Brand 1",
      image: "../../../assets/medicines/brand-1.png",
    },
    {
      name: "Brand 2",
      image: "../../../assets/medicines/brand-1.png",
    },
    {
      name: "Brand 3",
      image: "../../../assets/medicines/brand-1.png",
    },
    {
      name: "Brand 4",
      image: "../../../assets/medicines/brand-1.png",
    },
    {
      name: "Brand 5",
      image: "../../../assets/medicines/brand-1.png",
    },
    {
      name: "Brand 2",
      image: "../../../assets/medicines/brand-1.png",
    },
    {
      name: "Brand 3",
      image: "../../../assets/medicines/brand-1.png",
    },
    {
      name: "Brand 4",
      image: "../../../assets/medicines/brand-1.png",
    },
    {
      name: "Brand 5",
      image: "../../../assets/medicines/brand-1.png",
    },
  ];
  // personal care add same to next 
  // for testing
  //  private readonly API_BASE_URL = 'http://localhost:8080/api/products/filter';
    // private readonly FILTER_ENDPOINT = '/products/filter';


  //  ngOnInit(): void {
  //      this.API_BASE_URL = `${API_URL}/products/filter`; 

  // }
  // Products ko store karne ke liye
  products$: Observable<any> | undefined; 

  //copy this and make same others category
  categories: Category[] = [
    { name: 'Skin Care', apiValue: 'Face Wash', cssClass: 'skin-care-bg', imageUrl: 'assets/medicines/skincare.avif', altText: 'Skin Care Products' },
    { name: 'Hair Care', apiValue: 'Shampoo', cssClass: 'hair-care-bg', imageUrl: 'assets/medicines/haircare.avif', altText: 'Hair Care Products' },
    { name: 'Sexual Wellness', apiValue: 'Condom', cssClass: 'sexual-wellness-bg', imageUrl: 'assets/medicines/sexcare.avif', altText: 'Sexual Wellness Products' },
    { name: 'Oral Care', apiValue: 'Oral Gel', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/oralcare.avif', altText: 'Oral care Wellness Products' },
        { name: 'Elder Care', apiValue: 'Mother Tincture', cssClass: 'Eldercare-bg', imageUrl: 'assets/medicines/eldercare.avif', altText: 'Oral care Wellness Products' },
    { name: 'Baby Care', apiValue: 'Nipple', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/babycare.avif', altText: 'Oral care Wellness Products' },
        { name: 'Men Care', apiValue: 'Mouth Wash', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/mencare.avif', altText: 'Oral care Wellness Products' },
    { name: 'Women Care', apiValue: 'Face Pack', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/womencare.avif', altText: 'Oral care Wellness Products' },
    { name: 'Pet Care', apiValue: 'Pet Food', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/petcare.avif', altText: 'Oral care Wellness Products' },

    // { name: 'Oral Care', apiValue: 'Oralcare', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/babycare.avif', altText: 'Oral care Wellness Products' },

  ];

   categories2: Category[] = [
    { name: 'Best offers', apiValue: 'Butter', cssClass: 'skin-care-bg', imageUrl: 'assets/medicines/bestoffer.avif', altText: 'Skin Care Products' },
    { name: 'Vitamins & Supplements', apiValue: 'Powder', cssClass: 'hair-care-bg', imageUrl: 'assets/medicines/vitamins.avif', altText: 'Hair Care Products' },
    { name: 'Nutritional Drinks', apiValue: 'Juice', cssClass: 'sexual-wellness-bg', imageUrl: 'assets/medicines/drinks.avif', altText: 'Sexual Wellness Products' },
    { name: 'Skin Care', apiValue: 'Body Wash', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/skin1.avif', altText: 'Oral care Wellness Products' },
        { name: 'Hair Care', apiValue: 'Hair Mask', cssClass: 'Eldercare-bg', imageUrl: 'assets/medicines/hair1.avif', altText: 'Oral care Wellness Products' },
    { name: 'Sexual Wellness', apiValue: 'Condom', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/sexual.avif', altText: 'Oral care Wellness Products' },
        { name: 'Ayurveda Products', apiValue: 'Mouth Wash', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/ayurveda.avif', altText: 'Oral care Wellness Products' },
    { name: 'Pain Relief', apiValue: 'Spray', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/pain.avif', altText: 'Oral care Wellness Products' },
    { name: 'Homeopathy', apiValue: 'Flower', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/homopathy.avif', altText: 'Oral care Wellness Products' },

    // { name: 'Oral Care', apiValue: 'Oralcare', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/babycare.avif', altText: 'Oral care Wellness Products' },

  ];
  constructor(private cartService: CartService) {}
  
  @ViewChild("slider", { static: false }) slider!: ElementRef;

  selectedCity: string = "Mumbai";
  searchTerm: string = "";
  filteredMedicines = [...this.medicines];
  private router: Router = inject(Router);
  selectedMedicine: any;
  private http = inject(HttpClient);
  fdaMedicines: any[] = [];
  medicineList: Medicine[] = [];
  otcmedicineList: otcMedicine[] = [];
  // medicineList: { [label: string]: any }[] = [];
  cols: { id: string; label: string; type: string }[] = [];
  isLoaded = false;
  hasError = false;
 
 

  fetchMedicines(page: number = 0, size: number = 10) {
    this.http
      .get(`${API_URL}${ENDPOINTS.MEDICINES}?page=${page}&size=${size}`)
      .subscribe({
        next: (res: any) => {
          const rawList = res?.data?.content ?? [];
          console.log("rawList", rawList);

          this.medicineList = rawList.map(
            (item: any): Medicine => ({
              id: item.productId,
              name: item.productName,
              form: item.productForm,
              description: item.description,
              use: item.primaryUse,
              package: item.packageInfo || item.packagingDetail,
              mrp: item.mrp,
              image:
                item.imageUrls && item.imageUrls.length > 0
                  ? item.imageUrls[0].split("|")[0].trim()
                  : null,
              rating: "4.4", // hardcoded/dummy (API doesn’t provide)
              originalPrice: (parseFloat(item.mrp) * 1.12).toFixed(2), // fake original price (12% off)
              discountPercentage: 12, // dummy for now
              deliveryTime: 30, // dummy for now
            })
          );

          this.isLoaded = true;
        },
        error: (err) => {
          console.error("Error fetching medicines", err);
          this.hasError = true;
          this.isLoaded = true;
        },
      });
  }

  fetchOtcMedicines(page: number = 0, size: number = 10) {
    this.http
      .get(`${API_URL}${ENDPOINTS.OTC_MEDICINES}?page=${page}&size=${size}`)
      .subscribe({
        next: (res: any) => {
          this.otcmedicineList =
            res?.data?.content?.map(
              (item: any): otcMedicine => ({
                id: item.id,
                name: item.name,
                type: item.type,
                packaging: item.packaging,
                packageInfo: item.packageInfo,
                qty: item.qty,
                productForm: item.productForm,
                mrp: item.mrp,
                productHighlights: item.productHighlights,
                information: item.information,
                keyIngredients: item.keyIngredients,
                keyBenefits: item.keyBenefits,
                directionsForUse: item.directionsForUse,
                safetyInformation: item.safetyInformation,
                manufacturerAddress: item.manufacturerAddress,
                countryOfOrigin: item.countryOfOrigin,
                manufacturerDetails: item.manufacturerDetails,
                marketerDetails: item.marketerDetails,
                expiration: item.expiration,
                image:
                  item.imageUrls && item.imageUrls.length > 0
                    ? item.imageUrls[0].split("|")[0].trim()
                    : null,
              })
            ) || [];
        },
        // error: () => {
        //   this.hasError = true;
        //  this.isLoaded = true;
        // }
      });
  }

  filterMedicines(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredMedicines = this.medicines.filter(
      (med) =>
        med.description.toLowerCase().includes(term) ||
        med.description.toLowerCase().includes(term)
    );
  }

  onCityChange(city: string): void {
    this.selectedCity = city;
  }

  ngAfterViewInit(): void {
    const carouselEl = document.querySelector("#healthConcernCarousel");
    if (carouselEl) {
      new bootstrap.Carousel(carouselEl, {
        interval: 3000,
        ride: "carousel",
        pause: false,
        wrap: true,
      });
    }
  }

  goToDetails(id: string) {
    console.log("Navigating to medicine with ID:", id);

    this.router.navigate(["/medicines", id], {
      queryParams: { type: "health" },
    });
  }

  goToOtcDetails(id: string) {
    console.log("Navigating to medicine with ID:", id);
    this.router.navigate(["medicines", id], { queryParams: { type: "otc" } });

    // this.router.navigate(['/medicines', id]);
  }

  viewDetails(): void {
    this.router.navigate(["/medicines/medicines", this.selectedMedicine.id]);
  }
  scrollLeft() {
    this.slider.nativeElement.scrollBy({ left: -200, behavior: "smooth" });
  }

  scrollRight() {
    this.slider.nativeElement.scrollBy({ left: 200, behavior: "smooth" });
  }

//here new slider code
  // personal care
   fetchProductsByCategory(categoryApiValue: string): void {
        const fullApiUrl = `${API_URL}${ENDPOINTS.PRODUCT_FILTER}`;

    // const url = `${this.API_BASE_URL}?productForm=${categoryApiValue}&page=0&size=10`;
        const url = `${fullApiUrl}?productForm=${categoryApiValue}&page=0&size=10`;

    
    console.log('Calling API:', url); // Check karne ke liye

    // this.products$ = this.http.get(url);
    this.router.navigate(['/products', categoryApiValue]);

        console.log(`Redirecting to category page for: ${categoryApiValue}`);



  }

 // Slider/Carousel Container ko reference karne ke liye
  @ViewChild("categoryCarouselWrapper", { static: false }) 
  carouselWrapper!: ElementRef<HTMLDivElement>;

   scrollCarousel(direction: 'left' | 'right'): void {
    if (this.carouselWrapper) {
      const element = this.carouselWrapper.nativeElement;
      const scrollAmount = 180 * 4; 
      
      if (direction === 'left') {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }


 

goToCategory(category: string) {
  this.router.navigate(['/products', category], { queryParams: { endpoint: 'products/filter' } });
}

healthItems = [
  { image: '../../../assets/medicines/1.png', label: 'Diabetes', link: '/products/Lancet' },
  { image: '../../../assets/medicines/2.png', label: 'Heart Rate', link: '/products/HeartRate' },
  { image: '../../../assets/medicines/3.png', label: 'Stomach Care', link: '/products/StomachCare' },
  { image: '../../../assets/medicines/4.png', label: 'Liver Care', link: '/products/LiverCare' },
  { image: '../../../assets/medicines/5.png', label: 'Eye Care', link: '/products/EyeCare' },
  { image: '../../../assets/medicines/6.png', label: 'Bone & Joint', link: '/products/BoneJoint' },
  { image: '../../../assets/medicines/7.png', label: 'Kidney Care', link: '/products/KidneyCare' },
  { image: '../../../assets/medicines/8.png', label: 'Derma Care', link: '/products/DermaCare' },
];


goToPage(url: string): void {
    // Example: 'pharmacy' -> '/pharmacy' or 'lab-tests' -> '/lab-tests'
    
    // Safety check, although the router is robust
    if (url) { 
        this.router.navigate([`/${url}`]); 
    }
  }

}
