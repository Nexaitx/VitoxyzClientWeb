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
import { BannerSliderComponent } from "@src/app/shared/banner-slider/banner-slider";
import { TextBanner } from "@src/app/shared/text-banner/text-banner";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";
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
  apiValue: string[]; // API mein bhej jaane wali value (e.g., 'skin_care' agar zarurat ho)
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
    HealthCarouselComponent,
    BannerSliderComponent,

    MobileFooterNavComponent
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
      image: "../../../assets/medicines/brand-1.avif",
    },
    {
      name: "Brand 2",
      image: "../../../assets/medicines/brand-1.avif",
    },
    {
      name: "Brand 3",
      image: "../../../assets/medicines/brand-1.avif",
    },
    {
      name: "Brand 4",
      image: "../../../assets/medicines/brand-1.avif",
    },
    {
      name: "Brand 5",
      image: "../../../assets/medicines/brand-1.avif",
    },
    {
      name: "Brand 2",
      image: "../../../assets/medicines/brand-1.avif",
    },
    {
      name: "Brand 3",
      image: "../../../assets/medicines/brand-1.avif",
    },
    {
      name: "Brand 4",
      image: "../../../assets/medicines/brand-1.avif",
    },
    {
      name: "Brand 5",
      image: "../../../assets/medicines/brand-1.avif",
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
    {
      name: 'Skin Care', apiValue: ["Cream", "Lotion", "Gel", "Face Wash", "Face Pack", 
        "Scrub", "Toner", "Serum", "Cleanser", "Moisturiser", "Body Wash","Ointment","Face Cream","Face Gel",
        "Soap",], cssClass: 'skin-care-bg', imageUrl: 'assets/medicines/skin care.avif', altText: 'Skin Care Products'
    },
    {
      name: 'Women Care', apiValue: ["Sanitary Pad", "Pad", "Panty", "Tampon", "Menstrual Cup",
        "Nursing Bra", "Pumping Bra", "Breast Pad", "Breast Pump",
        "Cup", "Belt", "Corset", "Panty Liner", "Vaginal Cream",
        "Vaginal Gel", "Vaginal Ointment", "Vaginal Capsule",
        "Vaginal Spray", "Vaginal Wash", "Legium"], cssClass: 'hair-care-bg', imageUrl: 'assets/medicines/women care.avif', altText: 'Hair Care Products'
    },
    {
      name: 'Sexual Wellness', apiValue: [
        "Condom", "Lubricant",  "Capsule", "Tablet",
         "Massage Oil", "Cream", "Tonic", "Patch", "Sublingual Spray",
        "Test Kit", "Self Test Kit"
      ], cssClass: 'sexual-wellness-bg', imageUrl: 'assets/medicines/sexual wellness.avif', altText: 'Sexual Wellness Products'
    },
    {
      name: 'Oral Care', apiValue: [
        "Toothpaste", "Toothbrush", "Tongue Cleaner", "Mouth Wash",
        "Mouth Spray", "Mouth Paint", "Gum Paint", "Dental Gel",
        "Floss", "Dental Brush"
      ], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/oral care.avif', altText: 'Oral care Wellness Products'
    },
    {
      name: 'Elder Care', apiValue: [
        "Knee Support", "Heel Cushion", "Foot Support", "Stocking", "Bed Pan", "Wheelchair", "Walker",
        "Mask", "Glove", "Cushion", "Sock", "Elastic Bandage",
        "Crepe Bandage", "Gel Pack", "Support Belt", "Urine Pot"
      ], cssClass: 'Eldercare-bg', imageUrl: 'assets/medicines/eldercare.avif', altText: 'Oral care Wellness Products'
    },
    {
      name: 'Baby Care', apiValue: [
        "Baby Lotion", "Baby Powder", "Diaper", "Feeding Bottle", "Bottle Cleaning Brush", "Pacifier",
        "Teether", "Nipple", "Baby Oil",
        "Baby Soap", "Baby Shampoo", "Wipe", "Cup", "Toy", "Sipper"
      ], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/Baby Care.avif', altText: 'Oral care Wellness Products'
    },
    // { name: 'daily dose of health', apiValue: 'Jar', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/jarsdose.avif', altText: 'Oral care Wellness Products' },
    {
      name: 'Men Care', apiValue: [
        "Beard Oil", "Shaving Cream", "Shaving Gel", "After Shave Lotion",
        "Deodorant", "Body Wash", "Face Wash", "Soap", "Shampoo",
        "Cream", "Spray", "Gel"
      ], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/mens care.avif', altText: 'Oral care Wellness Products'
    },
    {
      name: 'Ayurveda', apiValue: [
        "Churna", "Churna (Powder)", "Bhasma", "Majoon", "Asava",
        "Arishta", "Taila", "Kwath", "Lehyam", "Guggulu", "Tablet",
        "Capsule", "Syrup", "Tonic", "Arka", "Linctus", "Ointment","Flower","Root","Leaf",
        "Seed", "Powder", "Extract", "Herbal Juice", "Herbal Gel"
      ], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/ayurveda.avif', altText: 'Oral care Wellness Products'
    },
 
    {
      name: 'Pet Care', apiValue: [
        "Pet Food", "Pet Spray", "Dog Bone", "Pet Shampoo", "Pet Conditioner",
        "Belt", "Cotton", "Pet Lotion", "Pet Soap"
      ], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/petcare.avif', altText: 'Oral care Wellness Products'
    },


    // { name: 'Caring for every tiny move', apiValue: 'Diaper', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/babycare.avif', altText: 'Oral care Wellness Products' },

  ];

  categories2: Category[] = [
    { name: 'Best offers', apiValue: [ "Beard Oil","Yoga Mat","Soap",'Butter',"Oil","Knee Support","Body Wash", "Sanitary Pad", "Pad", "Panty","Face Wash", "Soap", "Shampoo"], cssClass: 'skin-care-bg', imageUrl: 'assets/medicines/bestoffer.avif', altText: 'Skin Care Products' },
    { name: 'Vitamins & Supplements', apiValue: ['Powder','Juice',"Tablet"], cssClass: 'hair-care-bg', imageUrl: 'assets/medicines/vitamins.avif', altText: 'Hair Care Products' },
    { name: 'Nutritional Drinks', apiValue: ['Protein Powder',"Nutritional Drink","Shake","Tea Bag","Energy Drink","Herbal Juice"], cssClass: 'sexual-wellness-bg', imageUrl: 'assets/medicines/drinks.avif', altText: 'Sexual Wellness Products' },
    { name: 'Skin Care', apiValue: ['Body Wash',"Cream", "Lotion", "Gel", "Face Wash", "Face Pack", 
        "Scrub", "Toner", "Serum", "Cleanser", "Moisturiser", "Body Wash",], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/skin1.avif', altText: 'Oral care Wellness Products' },
    { name: 'Hair Care', apiValue: ['Hair Mask'], cssClass: 'Eldercare-bg', imageUrl: 'assets/medicines/hair1.avif', altText: 'Oral care Wellness Products' },
    { name: 'Sexual Wellness', apiValue: ['Condom'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/sexual wellness.avif', altText: 'Oral care Wellness Products' },
    { name: 'Ayurveda Products', apiValue: ['Mouth Wash'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/ayurveda.avif', altText: 'Oral care Wellness Products' },
    { name: 'Pain Relief', apiValue: ['Spray'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/pain.avif', altText: 'Oral care Wellness Products' },
    { name: 'Homeopathy', apiValue: ['Flower'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/homopathy.avif', altText: 'Oral care Wellness Products' },
    { name: 'Ayurveda', apiValue: ['Face Pack', "Churna", "Churna (Powder)", "Bhasma", "Majoon", "Asava",
        "Arishta", "Taila", "Kwath", "Lehyam", "Guggulu", "Tablet",
        "Capsule", "Syrup", "Tonic", "Arka", "Linctus", "Ointment",
        "Oil", "Powder", "Extract", "Herbal Juice", "Herbal Gel"], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/ayurveda.avif', altText: 'Oral care Wellness Products' },
    { name: 'Caring for every tiny move', apiValue: ['Diaper'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/diapper-pants.avif', altText: 'Oral care Wellness Products' },
    { name: 'Top deals of nut& Dry Fruit', apiValue: ['Nut'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/high-muesli.avif', altText: 'Oral care Wellness Products' },

  ];
  categories4: Category[] = [
    { name: 'Top deals of Spray', apiValue: ['Spray'], cssClass: 'skin-care-bg', imageUrl: 'assets/medicines/top-spray.avif', altText: 'Skin Care Products' },
    { name: 'Small tablet, big relief', apiValue: ['Biochemic Tablet'], cssClass: 'hair-care-bg', imageUrl: 'assets/medicines/calcarea_fluorica.avif', altText: 'Hair Care Products' },
    { name: 'Testing product', apiValue: ['Paste'], cssClass: 'sexual-wellness-bg', imageUrl: 'assets/medicines/again-shijait-front.avif', altText: 'Sexual Wellness Products' },
    { name: 'Nature’s aloe, your daily boost', apiValue: ['Juice'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/juice.avif', altText: 'Oral care Wellness Products' },
    { name: 'Support that cares', apiValue: ['Walker'], cssClass: 'Eldercare-bg', imageUrl: 'assets/medicines/support-care.avif', altText: 'Oral care Wellness Products' },
    { name: 'A sweet way to stay healthy', apiValue: ['Murabba'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/dhampuramala.avif', altText: 'Oral care Wellness Products' },
    { name: 'Snack smart, live better', apiValue: ['Biscuit'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/ador-health-cookies.avif', altText: 'Oral care Wellness Products' },
    { name: 'testing Products', apiValue: ['Pillow'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/pillowfit.avif', altText: 'Oral care Wellness Products' },
    { name: 'Top deals of Dry Fruit', apiValue: ['Dry Fruit'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/nutsfood.avif', altText: 'Oral care Wellness Products' },

    // { name: 'Oral Care', apiValue: 'Oralcare', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/babycare.avif', altText: 'Oral care Wellness Products' },

  ];
  @ViewChild('brandCarouselWrapper', { static: false })
  brandCarouselWrapper!: ElementRef<HTMLDivElement>;

  brandsone = [
    { image: '../../../assets/medicines/cetaphil-brand.avif', name: 'Brand 1' },
    { image: '../../../assets/medicines/dabur-brand.avif', name: 'Brand 2' },
    { image: '../../../assets/medicines/morepen-brand.avif', name: 'Brand 3' },
    { image: '../../../assets/medicines/organic-brand.avif', name: 'Brand 4' },
    { image: '../../../assets/medicines/minimalist-brand.avif', name: 'Brand 5' },
    { image: '../../../assets/medicines/on-brand.avif', name: 'Brand 6' },
    { image: '../../../assets/medicines/protinex-brand.avif', name: 'Brand 7' },
    { image: '../../../assets/medicines/dettol-brand.avif', name: 'Brand 8' },
    { image: '../../../assets/medicines/himalaya.avif', name: 'Brand 9' },
    { image: '../../../assets/medicines/healthkart.avif', name: 'Brand 10' },
    { image: '../../../assets/medicines/mamaearth.avif', name: 'Brand 11' },
    { image: '../../../assets/medicines/nivea.avif', name: 'Brand 12' },
    { image: '../../../assets/medicines/pilgrim.avif', name: 'Brand 12' }
  ];

  scrollBrandCarousel(direction: 'left' | 'right'): void {
    if (this.brandCarouselWrapper) {
      const element = this.brandCarouselWrapper.nativeElement;
      // Scroll by the visible width minus a little gap so items align nicely
      const scrollAmount = Math.max(element.clientWidth - 80, 180);
      if (direction === 'left') {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }


  categories3: Category[] = [
    { name: 'Pet Medicine', apiValue: ['Face Wash'], cssClass: 'skin-care-bg', imageUrl: 'assets/medicines/petcare.avif', altText: 'Skin Care Products' },
    { name: 'Pet Supplements', apiValue: ['Shampoo'], cssClass: 'hair-care-bg', imageUrl: 'assets/medicines/.png', altText: 'Hair Care Products' },
    { name: 'Prescription Diet', apiValue: ['Condom'], cssClass: 'sexual-wellness-bg', imageUrl: 'assets/medicines/petcare.avif', altText: 'Sexual Wellness Products' },
    { name: 'Pet Food', apiValue: ['Oral Gel'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/petcare.avif', altText: 'Oral care Wellness Products' },
    { name: 'Pet Treats', apiValue: ['Mother Tincture'], cssClass: 'Eldercare-bg', imageUrl: 'assets/medicines/.avif', altText: 'Oral care Wellness Products' },

    { name: 'Pet Care', apiValue: ['Pet Food'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/petcare.avif', altText: 'Oral care Wellness Products' },

    // { name: 'Oral Care', apiValue: 'Oralcare', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/babycare.avif', altText: 'Oral care Wellness Products' },

  ];
  constructor(private cartService: CartService) { }

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

  fetchProductsByCategory(categoryApiValues: string[]): void {
    const categoryName = this.getCategoryNameByApiValues(categoryApiValues);
    this.router.navigate(['/products'], {
      queryParams: {
        category: categoryName,
        forms: categoryApiValues.join(',')
      }
    });
  }
  

  // private getCategoryNameByApiValues(apiValues: string[]): string {
  //   console.log("apiValues",apiValues);
    
  //   const category = this.categories.find(cat =>
  //     cat.apiValue.join(',') === apiValues.join(',')
  //   );
  //   console.log("categoryaame",category);
    
  //   return category ? category.name : 'Products';
  // }
  // Helper method to get category name from API values
  private getCategoryNameByApiValues(apiValues: string[]): string {
    const category = this.categories.find(cat => 
      cat.apiValue.join(',') === apiValues.join(',')
    );
    return category ? category.name : 'Products';
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
  @ViewChild("categoryCarouselWrapper2", { static: false })
  carouselWrapper2!: ElementRef<HTMLDivElement>;

  scrollCarousel2(direction: 'left' | 'right'): void {
    if (this.carouselWrapper2) {
      const element = this.carouselWrapper2.nativeElement;
      const scrollAmount = 180 * 4;

      if (direction === 'left') {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }
  @ViewChild("categoryCarouselWrapper3", { static: false })
  carouselWrapper3!: ElementRef<HTMLDivElement>;

  scrollCarousel3(direction: 'left' | 'right'): void {
    if (this.carouselWrapper3) {
      const element = this.carouselWrapper3.nativeElement;
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

  // healthItems = [
  //   { image: '../../../assets/medicines/1.avif', label: 'Diabetes', link: '/products/Granule' },
  //   { image: '../../../assets/medicines/2.avif', label: 'Heart Rate', link: '/products/Tablet' },
  //   { image: '../../../assets/medicines/3.avif', label: 'Stomach Care', link: '/products/Digestive Tablet' },
  //   { image: '../../../assets/medicines/4.avif', label: 'Liver Care', link: '/products/Tablet' },
  //   { image: '../../../assets/medicines/5.avif', label: 'Eye Care', link: '/products/Eye Drop' },
  //   { image: '../../../assets/medicines/6.avif', label: 'Bone & Joint', link: '/products/Bandage' },
  //   { image: '../../../assets/medicines/7.avif', label: 'Kidney Care', link: '/products/Tonic' },
  //   { image: '../../../assets/medicines/8.avif', label: 'Derma Care', link: '/products/Face Cream' },
  // ];

  // {
  //     name: 'Skin Care', apiValue: ["Cream", "Lotion", "Gel", "Face Wash", "Face Pack", 
  //       "Scrub", "Toner", "Serum", "Cleanser", "Moisturiser", "Body Wash","Ointment","Face Cream","Face Gel",
  //       "Soap",], cssClass: 'skin-care-bg', imageUrl: 'assets/medicines/skin care.avif', altText: 'Skin Care Products'
  //   },


 categories5: Category[] = [
    { name: 'Stomach Care', apiValue: ['Digestive Tablet',"Syrup","Suspension","Oral Suspension","Oral Solution","Oral Liquid","Oral Gel","Tonic","Granule","Powder for Oral Suspension","Powder for Oral Solution"] ,cssClass: 'skin-care-bg', imageUrl: 'assets/medicines/1.avif', altText: 'Diabetes Care Products' },
    { name: 'Heart Rate', apiValue: ['Capsule',"Tablet","Injection","Solution for Infusion","Syrup","Infusion"], cssClass: 'hair-care-bg', imageUrl: 'assets/medicines/2.avif', altText: 'Heart Rate Care Products' },
    { name: 'Diabetes', apiValue: ['Insulin Syringe (Syringe)',"Injection","Test Strip","Tablet",
      "Test kit","Lancet","Needle","Self Test Kit"
    ], cssClass: 'sexual-wellness-bg', imageUrl: 'assets/medicines/3.avif', altText: 'Stomach Care Products' },
    { name: 'Liver Care', apiValue: ['Tablet',"Capsule","Granule","Syrup","Tonic","Liver Care Juice"], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/4.avif', altText: 'Liver Care Products' },
    { name: 'Eye Care', apiValue: ['Eye Drop',"Eye Gel","Eye Cream","Eye Ointment","Eye Pad","Eye Capsule","Eye/Ear Drop","Ophthalmic Solution","Lens Solution","Reading Eyeglass"], cssClass: 'Eldercare-bg', imageUrl: 'assets/medicines/5.avif', altText: 'Eye Care Products' },
    { name: 'Bone & Joint', apiValue: ["Knee Support","Wrist Support","Massager","Liniment","Balm","Ointment","Bone & Joint Tablet","Bone & Joint Oil",'Bandage'], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/6.avif', altText: 'Bone & Joint Products' },
    { name: 'Kidney Care', apiValue: ['Tonic',"Kidney Tablet ","Tablet","Kidney Capsule ","Kidney Syrup ","Kidney Tonic ","Kidney Infusion ","Kidney Solution for Infusion ","Kidney Drop"," Juice"], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/7.avif', altText: 'Kidney Care Products' },
    { name: 'Derma Care', apiValue: ['Face Cream',"Face Pack","Lotion","Face Wash","Serum","Cream","Moisturiser","Dusting Powder","Body Wash","Conditioner","Wax","Scrub","Gel","Soap"], cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/8.avif', altText: 'Derma Care Products' },

    // { name: 'Oral Care', apiValue: 'Oralcare', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/babycare.avif', altText: 'Oral care Wellness Products' },


  ];


    @ViewChild("categoryCarouselWrapper5", { static: false })
  carouselWrapper5!: ElementRef<HTMLDivElement>;

  scrollCarousel5(direction: 'left' | 'right'): void {
    if (this.carouselWrapper3) {
      const element = this.carouselWrapper3.nativeElement;
      const scrollAmount = 180 * 4;

      if (direction === 'left') {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }
  //testing working 

  healthItems1 = [
    { image: '../../../assets/medicines/petcare.avif', label: 'Pet Care', link: '/products/Pet Food' },
    { image: '../../../assets/medicines/vitamins.avif', label: 'Vitamins & Supplements', link: '/products/Powder' },
    { image: '../../../assets/medicines/ayurveda.avif', label: 'Ayurvedic Wellness', link: '/products/Face Pack' },
    { image: '../../../assets/medicines/homopathy.avif', label: 'Homeopathic Medicine', link: '/products/Flower' },
    { image: '../../../assets/medicines/monitoring-devices.avif', label: 'Monitoring Devices', link: '/products/Device' },
    { image: '../../../assets/medicines/sexual wellness.avif', label: 'Sexual Wellness', link: '/products/Condom' },
    { image: '../../../assets/medicines/drinks.avif', label: 'Food & Nutrition', link: '/products/Juice' },
    { image: '../../../assets/medicines/FItness And health.avif', label: 'Fitness & Health', link: '/products/Juice' },
    { image: '../../../assets/medicines/skin care.avif', label: 'Skin Care', link: '/products/Cream' },
    { image: '../../../assets/medicines/mens care.avif', label: 'Men Care', link: '/products/Body Wash' },
    { image: '../../../assets/medicines/pain relief.avif', label: 'Pain Relief', link: '/products/Spray' },
    { image: '../../../assets/medicines/cardiaccare.avif', label: 'Cardiac Care', link: '/products/Tablet' },
    { image: '../../../assets/medicines/didestive and health.avif', label: 'Digestive HealthClean Environment Essentials ', link: '/products/Tablet' },
    { image: '../../../assets/medicines/daibities.avif', label: 'Diabetes', link: '/products/Granule' },
    { image: '../../../assets/medicines/hair care.avif', label: 'Hair Care', link: '/products/Hair Mask' },
    { image: '../../../assets/medicines/oral care.avif', label: 'Oral Care', link: '/products/Oral Gel' },
    { image: '../../../assets/medicines/didestive and health.avif', label: 'Respiratory Care', link: '/products/Tablet' },
    { image: '../../../assets/medicines/cardiaccare.avif', label: 'Mental Wellness ', link: '/products/Tablet' },
    { image: '../../../assets/medicines/Baby Care.avif', label: 'Baby Care ', link: '/products/Diaper' },
    { image: '../../../assets/medicines/women care.avif', label: 'Women Care', link: '/products/Vaginal Cream' },
    { image: '../../../assets/medicines/fiRST AID.avif', label: 'First Aid', link: '/products/Tablet' },
    { image: '../../../assets/medicines/Sup[port and braces.avif', label: 'Supports & Braces', link: '/products/Walker' },
    { image: '../../../assets/medicines/Colds, cough , and fever.avif', label: 'Cold, Cough & Fever ', link: '/products/Tablet' },



  ];


  goToPage(url: string): void {
    console.log(`Navigating to /${url}`);
    // Safety check, although the router is robust
    if (url) {
      this.router.navigate([`/${url}`]);
    }
  }

}
