// import { Component, OnInit } from '@angular/core';
// interface Day {
//   date: number;
//   name: string;
//   isToday?: boolean;
// }

// @Component({
//   selector: 'app-diet-dashboard',
//   imports: [],
//   templateUrl: './diet-dashboard.html',
//   styleUrl: './diet-dashboard.scss'
// })
// export class DietDashboard implements OnInit {
//   weekDays: Day[] = [];

//   ngOnInit(): void {
//     this.generateWeek();
//   }

//   generateWeek() {
//   const today = new Date();
//   const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  
//   // Calculate Monday of the current week
//   const weekStart = new Date(today);
//   const diffToMonday = (dayIndex === 0 ? -6 : 1 - dayIndex);
//   weekStart.setDate(today.getDate() + diffToMonday);

//   const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//   this.weekDays = []; // reset array
//   for (let i = 0; i < 7; i++) {
//     const d = new Date(weekStart);
//     d.setDate(weekStart.getDate() + i);

//     this.weekDays.push({
//       date: d.getDate(),
//       name: dayNames[d.getDay()],
//       isToday: d.toDateString() === today.toDateString(),
//     });
//   }
// }


//   selectDay(day: Day) {
//     this.weekDays.forEach(d => (d.isToday = false));
//     day.isToday = true;
//   }
// }
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { API_URL, ENDPOINTS } from '@src/app/core/const';
import { Footer } from "../../footer/footer";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";

interface Day {
  date: number;
  name: string;
  isToday?: boolean;
}

interface DietPlan {
  dietPlanId: number;
  title: string;
  description?: string;
  category?: string;
  durationDays?: number;
  caloriesPerDay?: number;
  targetAudience?: string;
  difficultyLevel?: string;
  mealType?: string;
  foodAllergies?: string;
  breakfastDetails?: string;
  lunchDetails?: string;
  dinnerDetails?: string;
  snacksDetails?: string;
  precautions?: string;
  benefits?: string;
  slug?: string;
  addedDate?: string;
  addedByAdminName?: string;
  imageUrls?: string[];
  primaryImageUrl?: string;
  active?: boolean;
   subscriptionType?: string | null;
}

interface ApiResponse {
  dietPlans: DietPlan[];
    userSubscriptionType?: string;
  totalPlans?: number;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

@Component({
  selector: 'app-diet-dashboard',
  standalone: true,
  imports: [TitleCasePipe,
    NgIf,
    NgFor,
    DatePipe, Footer, MobileFooterNavComponent],
  templateUrl: './diet-dashboard.html',
  styleUrls: ['./diet-dashboard.scss']
})
export class DietDashboard implements OnInit {
  weekDays: Day[] = [];
  dietPlans: DietPlan[] = [];
  selectedPlan?: DietPlan;
  loading = false;
  error: string | null = null;

  // Replace with provided endpoint 
  private readonly API_URLs = `${API_URL}${ENDPOINTS.DIET_DASHBOARD}?id=1073741824&username=string&password=string&authorities=%5B%7B%22authority%22%3A%22string%22%7D%5D&userType=string&enabled=true&accountNonExpired=true&accountNonLocked=true&credentialsNonExpired=true`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generateWeek();
    this.fetchDietPlans();
  }

  generateWeek() {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Sunday
    // Calculate Monday as week start
    const weekStart = new Date(today);
    const diffToMonday = (dayIndex === 0 ? -6 : 1 - dayIndex);
    weekStart.setDate(today.getDate() + diffToMonday);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);

      this.weekDays.push({
        date: d.getDate(),
        name: dayNames[d.getDay()],
        isToday: d.toDateString() === new Date().toDateString()
      });
    }
  }

  // fetchDietPlans() {
  //   this.loading = true;
  //   this.error = null;

  //   this.http.get<ApiResponse>(this.API_URLs).subscribe({
  //     next: (res) => {
  //       this.dietPlans = res?.dietPlans ?? [];
  //       // Pick the first active plan as selected by default (if any)
  //       this.selectedPlan = this.dietPlans.length ? this.dietPlans[0] : undefined;
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       console.error('Failed to load diet plans', err);
  //       this.error = 'Failed to load diet plans. Please try again later.';
  //       this.loading = false;
  //     }
  //   });
  // }
fetchDietPlans() {
    this.loading = true;
    this.error = null;

    // get token from storage (same approach you used previously)
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || null;

    let options: { headers?: HttpHeaders } = {};
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        // add Accept header to indicate JSON if you want
        Accept: 'application/json'
      });
      options = { headers };
    }

    this.http.get<ApiResponse>(this.API_URLs, options).subscribe({
      next: (res) => {
        // backend returns { dietPlans: [...] } as in your example
        this.dietPlans = Array.isArray(res?.dietPlans) ? res.dietPlans : [];

        // choose default selected plan:
        // prefer the first plan with active === true (if backend sets active)
        const activePlan = this.dietPlans.find(p => p.active === true);
        this.selectedPlan = activePlan ?? (this.dietPlans.length ? this.dietPlans[0] : undefined);

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load diet plans', err);
        this.error = 'Failed to load diet plans. Please try again later.';
        this.loading = false;
      }
    });
  }
  
  selectDay(day: Day) {
    this.weekDays.forEach(d => d.isToday = false);
    day.isToday = true;
  }

  selectPlan(plan: DietPlan) {
    this.selectedPlan = plan;
  }

  trackByDay(_index: number, item: Day) {
    return `${item.name}-${item.date}`;
  }
}
