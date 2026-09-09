import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { API_URL } from '@src/app/core/const';
import { Authorization } from '../../pages/authorization/authorization';

import { Toast } from 'bootstrap';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    Authorization,
    RouterOutlet
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header1 implements OnInit {

  currentLocation: string = 'Detecting...';
  isMobileMenuOpen: boolean = false;

  // =========================
  // AUTH
  // =========================

  authMode: 'login' | 'signup' = 'login';

  isLoggedIn: boolean = false;

  isProfileMenuOpen: boolean = false;

profileMenuItems: any[] = [
  { label: 'My Profile', path: '/user-profile' },
  { label: 'My Orders', path: '/orders' },
  { label: 'Booked staff', path: '/view-staff' },
  { label: 'Staff Booking History', path: '/view-staff-booking-history' },
  { label: 'Logout', path: '/logout' }
];

  redirectAfterLogin: string | null = null;

  toggleMobileMenu(): void {
  this.isMobileMenuOpen = !this.isMobileMenuOpen;
}

closeMobileMenu(): void {
  this.isMobileMenuOpen = false;
}


  constructor(
    public router: Router,
    private http: HttpClient
  ) {}


logout(): void {

  const token =
    localStorage.getItem('authToken');

  if (token) {

    this.http.post(
      `${API_URL}/user/logoutUser`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({

      next: (res: any) => {

        console.log(
          'Logout API success:',
          res
        );

        this.clearSessionAndRedirect();
      },

      error: (err) => {

        console.error(
          'Logout API failed:',
          err
        );

        // Keep the old behavior:
        // logout locally even if API fails
        this.clearSessionAndRedirect();
      }

    });

  } else {

    this.clearSessionAndRedirect();

  }
}


private clearSessionAndRedirect(): void {

  localStorage.removeItem('authToken');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('justLoggedIn');

  this.isLoggedIn = false;
  this.isProfileMenuOpen = false;

  this.router.navigate(['/']);
}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.detectLocation();
  }

  toggleProfileMenu(): void {
  this.isProfileMenuOpen = !this.isProfileMenuOpen;
}

closeProfileMenu(): void {
  this.isProfileMenuOpen = false;
}


  // =========================
  // LOGIN / AUTH
  // =========================

  setAuthMode(mode: 'login' | 'signup'): void {
    this.authMode = mode;
  }


checkLoginStatus(): void {

  const token =
    localStorage.getItem('authToken');

  this.isLoggedIn = !!token;


  // =========================
  // CHECK REDIRECT AFTER LOGIN
  // =========================

  if (this.isLoggedIn) {

    const redirectPath =
      localStorage.getItem('redirectAfterLogin');

    if (redirectPath) {

      // Remove it FIRST so it doesn't redirect again
      localStorage.removeItem(
        'redirectAfterLogin'
      );

      // =========================
      // DIET PLANS
      // =========================

      if (redirectPath === '/diet-plans') {

        const hasPlan =
          this.hasActiveDietPlan();

        if (hasPlan) {

          this.router.navigate([
            '/diet-charts'
          ]);

        } else {

          this.router.navigate([
            '/diet-plans'
          ]);
        }

        return;
      }


      // =========================
      // OTHER REDIRECTS
      // =========================

      this.router.navigate([
        redirectPath
      ]);
    }
  }
}


  // =========================
  // SEARCH
  // =========================

  onSearch(value: string): void {

    const query = value.trim();

    if (!query) {

      this.showToastMessage(
        'Please enter a search query',
        true
      );

      return;
    }

    this.router.navigate(['/search'], {
      queryParams: {
        q: query
      }
    });
  }


  // =========================
  // QUICK ORDER
  // =========================

  onQuickOrder(): void {

    this.router.navigate([
      '/order-prescription'
    ]);
  }

  private hasActiveDietPlan(): boolean {

  const profileStr =
    localStorage.getItem('userProfile');

  if (!profileStr) {
    return false;
  }

  try {

    const profile =
      JSON.parse(profileStr);

    return profile?.hasActiveSubscription === true;

  } catch {

    return false;
  }
}

navigateToDiet(event: MouseEvent): void {

  // VERY IMPORTANT:
  // Stop the browser from opening /diet-plans
  event.preventDefault();
  event.stopPropagation();

  const token = localStorage.getItem('authToken');

  // =========================
  // NOT LOGGED IN
  // =========================
  if (!token) {

    // Remember where user wanted to go
    localStorage.setItem(
      'redirectAfterLogin',
      '/diet-plans'
    );

    const modalEl =
      document.getElementById('loginModal') ||
      document.getElementById('authModal');

    if (modalEl) {

      const modal =
        (window as any).bootstrap.Modal.getOrCreateInstance(
          modalEl
        );

      this.setAuthMode('login');

      modal.show();
    }

    return;
  }

  // =========================
  // LOGGED IN
  // =========================

  if (this.hasActiveDietPlan()) {

    this.router.navigate(['/diet-charts']);

  } else {

    this.router.navigate(['/diet-plans']);

  }
}

isDietPlanActive(): boolean {
  return this.router.url === '/diet-plans';
}


  // =========================
  // LOCATION
  // =========================

  async detectLocation(): Promise<void> {

    if (!navigator.geolocation) {

      this.currentLocation =
        'Location unavailable';

      return;
    }

    this.currentLocation =
      'Detecting...';

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const lat =
          position.coords.latitude;

        const lon =
          position.coords.longitude;

        try {

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );

          const data =
            await response.json();

          if (data.address) {

            this.currentLocation =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              'Your Location';

          } else {

            this.currentLocation =
              'Unknown Location';
          }

        } catch (error) {

          console.error(
            'Error fetching location:',
            error
          );

          this.currentLocation =
            'Unable to fetch location';
        }
      },

      (error) => {

        console.error(
          'Geolocation error:',
          error
        );

        this.currentLocation =
          'Location permission denied';
      }
    );
  }
  
navigateToSkinCare(event: MouseEvent): void {

  // Stop the normal /skin-care navigation
  event.preventDefault();
  event.stopPropagation();

  this.router.navigate(['/products'], {
    queryParams: {
      category: 'Skin Care',
      forms: [
        'Cream',
        'Lotion',
        'Gel',
        'Face Wash',
        'Face Pack',
        'Scrub',
        'Toner',
        'Serum',
        'Cleanser',
        'Moisturiser',
        'Body Wash',
        'Ointment',
        'Face Cream',
        'Face Gel',
        'Soap'
      ].join(',')
    }
  });
}

isSkinCareActive(): boolean {
  const urlTree = this.router.parseUrl(this.router.url);

  const category =
    urlTree.queryParams['category'];

  return (
    urlTree.root.children['primary']?.segments[0]?.path === 'products' &&
    category === 'Skin Care'
  );
}

navigateToElderCare(event: MouseEvent): void {

  event.preventDefault();
  event.stopPropagation();

  this.router.navigate(['/products'], {
    queryParams: {
      category: 'Elder Care',
      forms: [
        // Put the SAME Elder Care apiValue items
        // that your Medicines page uses here
      ].join(',')
    }
  });
}


isElderCareActive(): boolean {

  const urlTree =
    this.router.parseUrl(this.router.url);

  const category =
    urlTree.queryParams['category'];

  return (
    urlTree.root.children['primary']?.segments[0]?.path === 'products' &&
    category === 'Elder Care'
  );
}

  // =========================
  // TOAST
  // =========================

  private showToastMessage(
    message: string,
    isError: boolean = false
  ): void {

    const toastElement =
      document.getElementById('loginToast');

    if (!toastElement) {
      return;
    }

    const toastBody =
      toastElement.querySelector('.toast-body');

    if (toastBody) {
      toastBody.textContent = message;
    }

    toastElement.classList.remove(
      'text-bg-success',
      'text-bg-danger'
    );

    toastElement.classList.add(
      isError
        ? 'text-bg-danger'
        : 'text-bg-success'
    );

    const toast =
      new (Toast as any)(toastElement, {
        delay: 3000
      });

    toast.show();
  }

}
