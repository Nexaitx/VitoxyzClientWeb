
import { Component, inject, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CdkMenuModule } from '@angular/cdk/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Authorization } from '../../pages/authorization/authorization';
import { ProfileService } from '@src/app/core/services/profile.service';
import { FormsModule } from '@angular/forms';
import { CartService } from '@src/app/core/cart.service';
import { HttpClient } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '@src/app/core/const';
import { Search } from "../search/search";
import { MatCard } from "@angular/material/card";
declare var bootstrap: any;
interface Category {
  name: string;
  apiValue: string[]; // API mein bhej jaane wali value (e.g., 'skin_care' agar zarurat ho)
  cssClass: string;
 
  altText: string;
}
@Component({
  selector: 'app-header',
  
  imports: [
    MatButtonModule,
    CommonModule,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatTabsModule,
    Authorization,
    CdkMenuModule,
    RouterLink,
    Search,
    MatCard
],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit, OnDestroy {
  aadhaarNumber!: string;
  otp!: string;
  refId!: string;
  verificationResult: any;
constructor(private http: HttpClient) {}
  private profileService = inject(ProfileService);
   private cartService = inject(CartService);
  public router = inject(Router);
  authMode: 'login' | 'signup' = 'login';
  isLoggedIn: boolean = false;
  isSidebarOpen = false;
  isMobileMenuOpen = signal(false);
cartCount: number = 0;
  currentLocation: string = '';
  searchQuery: string = '';
  openSubmenus = new Set<number>();
  redirectAfterLogin: string | null = null; 
  openCategoryIndex: number | null = null;


// ✅ added for redirection after login
 categories: Category[] = [
    {
      name: 'Skin Care', apiValue: ["Cream", "Lotion", "Gel", "Face Wash", "Face Pack",
        "Scrub", "Toner", "Serum", "Cleanser", "Moisturiser", "Body Wash", "Ointment", "Face Cream", "Face Gel",
        "Soap",], cssClass: 'skin-care-bg',  altText: 'Skin Care Products'
    },
    {
      name: 'Women Care', apiValue: ["Sanitary Pad", "Pad", "Panty", "Tampon", "Menstrual Cup",
        "Nursing Bra", "Pumping Bra", "Breast Pad", "Breast Pump",
        "Cup", "Belt", "Corset", "Panty Liner", "Vaginal Cream",
        "Vaginal Gel", "Vaginal Ointment", "Vaginal Capsule",
        "Vaginal Spray", "Vaginal Wash", "Legium"], cssClass: 'hair-care-bg',  altText: 'Hair Care Products'
    },
    {
      name: 'Sexual Wellness', apiValue: [
        "Condom", "Lubricant", "Capsule", "Tablet",
        "Massage Oil", "Cream", "Tonic", "Patch", "Sublingual Spray",
        "Test Kit", "Self Test Kit"
      ], cssClass: 'sexual-wellness-bg',  altText: 'Sexual Wellness Products'
    },
    {
      name: 'Oral Care', apiValue: [
        "Toothpaste", "Toothbrush", "Tongue Cleaner", "Mouth Wash",
        "Mouth Spray", "Mouth Paint", "Gum Paint", "Dental Gel",
        "Floss", "Dental Brush"
      ], cssClass: 'Oralcare-bg', altText: 'Oral care Wellness Products'
    },
    {
      name: 'Elder Care', apiValue: [
        "Knee Support", "Heel Cushion", "Foot Support", "Stocking", "Bed Pan", "Wheelchair", "Walker",
        "Mask", "Glove", "Cushion", "Sock", "Elastic Bandage",
        "Crepe Bandage", "Gel Pack", "Support Belt", "Urine Pot"
      ], cssClass: 'Eldercare-bg', altText: 'Oral care Wellness Products'
    },
    {
      name: 'Baby Care', apiValue: [
        "Baby Lotion", "Baby Powder", "Diaper", "Feeding Bottle", "Bottle Cleaning Brush", "Pacifier",
        "Teether", "Nipple", "Baby Oil",
        "Baby Soap", "Baby Shampoo", "Wipe", "Cup", "Toy", "Sipper"
      ], cssClass: 'Oralcare-bg',  altText: 'Oral care Wellness Products'
    },
    // { name: 'daily dose of health', apiValue: 'Jar', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/jarsdose.avif', altText: 'Oral care Wellness Products' },
    {
      name: 'Men Care', apiValue: [
        "Beard Oil", "Shaving Cream", "Shaving Gel", "After Shave Lotion",
        "Deodorant", "Body Wash", "Face Wash", "Soap", "Shampoo",
        "Cream", "Spray", "Gel"
      ], cssClass: 'Oralcare-bg',  altText: 'Oral care Wellness Products'
    },
    {
      name: 'Ayurveda', apiValue: [
        "Churna", "Churna (Powder)", "Bhasma", "Majoon", "Asava",
        "Arishta", "Taila", "Kwath", "Lehyam", "Guggulu", "Tablet",
        "Capsule", "Syrup", "Tonic", "Arka", "Linctus", "Ointment", "Flower", "Root", "Leaf",
        "Seed", "Powder", "Extract", "Herbal Juice", "Herbal Gel"
      ], cssClass: 'Oralcare-bg',  altText: 'Oral care Wellness Products'
    },

    {
      name: 'Pet Care', apiValue: [
        "Pet Food", "Pet Spray", "Dog Bone", "Pet Shampoo", "Pet Conditioner",
        "Belt", "Cotton", "Pet Lotion", "Pet Soap"
      ], cssClass: 'Oralcare-bg',  altText: 'Oral care Wellness Products'
    },


    // { name: 'Caring for every tiny move', apiValue: 'Diaper', cssClass: 'Oralcare-bg', imageUrl: 'assets/medicines/babycare.avif', altText: 'Oral care Wellness Products' },

  ];
  menuItems = [
    { label: 'Medicines', icon: 'fi-rr-medicine' , path: '/medicines' },
    {
      label: 'Book Staff',
      icon: 'fi-rr-together-people',
       path: '/book-staff'
      // dropdown: true,
      // dropdownItems: [
      //   { label: 'Nurse', path: '/book-staff' },
      //   { label: 'Physiotherapist', path: '/book-staff' },
      //   { label: 'Baby-Sitter', path: '/book-staff' },
      //   { label: 'Security Guard', path: '/book-staff' },
      //   { label: 'Psychiatrist', path: '/book-staff' }, diet/user-onboarding
      // ]
    },
    { label: 'Diet Plans', icon: 'fi-rr-salad',  path: 'diet/user-onboarding' },
    // { label: 'Diet Plans', icon: 'fi-rr-salad',  path: '/diet' },
    {
    label: 'Staff Booking History',
    icon: 'fi-rr-clipboard-list',
    path: '/view-staff-booking-history',
    mobileOnly: true
  },
    {
      label: 'Profile',
      icon: 'fi-rr-user-pen',
      dropdown: true,
      dropdownItems: [
        { label: 'My Profile', path: '/user-profile' },
        { label: 'My Orders', path: '/orders' },
        { label: 'Booked staff', path: '/view-staff' },
        { label: 'Staff Booking History', path: '/view-staff-booking-history' },
        // { label: 'Manage Payments', path: '' },
        // { label: 'Settings', path: '/settings' },
        { label: 'Logout', path: '/logout' }
      ]
    },
    { label: 'Need Help?', icon: 'fi-rr-exclamation', path: '/help' },
  
  ];
profileMenuItems: any[] = [];

ngOnInit(): void {
  this.checkLoginStatus();
   this.detectLocation();
  // Count only distinct products in the cart
  this.cartService.cart$.subscribe(cart => {
    const uniqueProducts = new Set(cart.map(item => item.id));
    this.cartCount = uniqueProducts.size;
  });
    // ✅ extract profile dropdown items ONCE
  const profileItem = this.menuItems.find(item => item.label === 'Profile');
  this.profileMenuItems = profileItem?.dropdownItems || [];
}


  ngOnDestroy(): void {
   
    document.body.classList.remove('no-scroll');
  }

  // checkLoginStatus(): void {
  //   const token = localStorage.getItem('authToken');
  //   this.isLoggedIn = !!token;
  // }
   checkLoginStatus(): void {
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;

    if (this.isLoggedIn && this.redirectAfterLogin) {
      const redirectPath = this.redirectAfterLogin;
      this.redirectAfterLogin = null;
      if (redirectPath === '/diet') {
      this.navigateToDiet(); // ✅ smart redirect
    } else {
      this.router.navigate([redirectPath]);
    }

    }
  }
  setAuthMode(mode: 'login' | 'signup') {
    this.authMode = mode;
  }
 
   onSearch() {
    if (!this.searchQuery.trim()) {
      // this.showToastMessage('Please enter a search query', true);
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
  // logout() {
  //   localStorage.removeItem('authToken');
  //   this.isLoggedIn = false;
  //   this.router.navigate(['/']);
  // }
  logout(){
    const token = localStorage.getItem('authToken');
    if(token){
      this.http.post('https://vitoxyzbackend-az2e.onrender.com/Backend/api/user/logoutUser',{},{
       headers :{
        Authorization:`Bearer ${token}`
       }
      }).subscribe({
        next:(res:any)=>{
          console.log('Logout API success:', res);
           localStorage.setItem('authToken', "");
          this.clearSessionAndRedirect();
        },
          error: (err) => {
        console.error('Logout API failed:', err);
        // Even if API fails, still logout locally
        this.clearSessionAndRedirect();
      }
      });
    }else {
    this.clearSessionAndRedirect();
  }
  }
  private clearSessionAndRedirect(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('justLoggedIn');

  this.isLoggedIn = false;
  this.router.navigate(['/']);
}


private hasActiveDietPlan(): boolean {
  const profileStr = localStorage.getItem('userProfile');
  if (!profileStr) return false;

  try {
    const profile = JSON.parse(profileStr);
    return profile?.hasActiveSubscription === true;
  } catch {
    return false;
  }
}

navigateToDiet() {
  const token = localStorage.getItem("authToken");

  // 1. USER NOT LOGGED IN
  if (!token) {
    this.redirectAfterLogin = "/diet";

    const modalEl =
      document.getElementById("loginModal") ||
      document.getElementById("authModal");

    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
      this.setAuthMode("login");
      modal.show();
    }
    return;
  }

  // 2️⃣ Logged in → check backend subscription flag
  const hasPlan = this.hasActiveDietPlan();

  if (hasPlan) {
    this.router.navigate(['/diet-charts']);
  } else {
    this.router.navigate(['/diet/user-onboarding']);
  }
}

  goToCart() {
    this.router.navigate(['/cart']);
  }
 handleMenuNavigation(path?: string) {
   if (!path) return;
    this.closeSidebar();


    if (!this.isLoggedIn) {
      this.redirectAfterLogin = path;
      // Not logged in → open auth modal
      const modalEl = document.getElementById('authModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        this.setAuthMode('login');
        modal.show();
      }
    } else {
      // Logged in → navigate normally
      this.router.navigate([path]);
    }
  }
 
toggleCategoryDropdown(index: number, event: MouseEvent) {
  event.stopPropagation();
  this.openCategoryIndex =
    this.openCategoryIndex === index ? null : index;
}

selectCategory(form: string, event: MouseEvent) {
  event.stopPropagation();
  this.fetchProductsByCategory([form]);
  this.openCategoryIndex = null; // close after select
}
@HostListener('document:click')
closeCategoryDropdown() {
  this.openCategoryIndex = null;
}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.isMobileMenuOpen.update(m => !m);

    if (this.isSidebarOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    this.isMobileMenuOpen.set(false);
    document.body.classList.remove('no-scroll');
    this.openSubmenus.clear();
  }

  toggleSubmenu(idx: number) {
    if (this.openSubmenus.has(idx)) this.openSubmenus.delete(idx);
    else this.openSubmenus.add(idx);
  }

  isSubmenuOpen(idx: number): boolean {
    return this.openSubmenus.has(idx);
  }

  toggleNavbar() {
    const navbar = document.getElementById('navbarNav');
    this.isMobileMenuOpen.update(menu => !menu);
    if (!navbar) return;
    try {
      const instance = bootstrap.Collapse.getOrCreateInstance(navbar);
      if (navbar.classList.contains('show')) {
        instance.hide();
      } else {
        instance.show();
      }
    } catch (err) {
      navbar.classList.toggle('show');
    }
  }
  fetchProductsByCategory(categoryApiValues: string[]): void {
    console.log('🔄 Fetching products for category API values:', categoryApiValues);

    const categoryName = this.getCategoryNameByApiValues(categoryApiValues);
    console.log('🔄 Fetching products for category API values:', categoryApiValues);

    this.router.navigate(['/products'], {
      queryParams: {
        category: categoryName,
        forms: categoryApiValues.join(',')
      }
    });
  }




  private getCategoryNameByApiValues(apiValues: string[]): string {
    console.log('🔍 Searching for category with API values:', apiValues);

    // Create a map of all categories for better lookup
    const allCategories = [
      ...this.categories,
     
    ];

    // Try exact match first (when clicked category has specific values)
    let category = allCategories.find(cat => {
      // Check if this category was specifically clicked (exact match of apiValues)
      const isExactMatch = apiValues.every(value => cat.apiValue.includes(value));
      console.log(`🔍 Exact match check for "${cat.name}":`, isExactMatch);
      return isExactMatch;
    });

    // If no exact match, try partial match (for backward compatibility)
    if (!category) {
      category = allCategories.find(cat => {
        const hasAnyMatch = apiValues.some(value => cat.apiValue.includes(value));
        console.log(`🔍 Partial match check for "${cat.name}":`, hasAnyMatch);
        return hasAnyMatch;
      });
    }

    console.log('🔍 Found category:', category?.name || 'Products');
    return category ? category.name : 'Products';
  }

}
