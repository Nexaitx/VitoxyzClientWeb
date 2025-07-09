import { Routes } from '@angular/router';
import { Header } from './layouts/header/header';
import { Authorization } from './pages/authorization/authorization'; // Make sure to import Authorization component

export const routes: Routes = [
  {
    path: '',
    component: Header,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'book-staff',
        loadComponent: () => import('./pages/book-staff/book-staff').then(m => m.BookStaff),
        children: [
          {
            path: 'book-nurse',
            loadComponent: () => import('./pages/book-staff/book-nurse/book-nurse').then(m => m.BookNurse)
          },
          {
            path: 'book-physiotherapist',
            loadComponent: () => import('./pages/book-staff/book-physiotherapist/book-physiotherapist').then(m => m.BookPhysiotherapist)
          },
          {
            path: 'book-baby-sitter',
            loadComponent: () => import('./pages/book-staff/book-baby-sitter/book-baby-sitter').then(m => m.BookBabySitter)
          },
          {
            path: 'book-security-guard',
            loadComponent: () => import('./pages/book-staff/book-security-guard/book-security-guard').then(m => m.BookSecurityGuard)
          },
          {
            path: 'book-psychiatrist',
            loadComponent: () => import('./pages/book-staff/book-psychiatrist/book-psychiatrist').then(m => m.BookPsychiatrist)
          },
          {
            path: '', // Default child route for 'book-staff'
            redirectTo: 'book-nurse', // Redirect to 'book-nurse' if only 'book-staff' is accessed
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'user-onboarding',
        loadComponent: () => import('./pages/user-onboarding/user-onboarding').then(m => m.UserOnboarding),
      },
      {
        path: 'user-profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
      },
      {
        path: 'plans',
        loadComponent: () => import('./pages/plans/plans').then(m => m.Plans),
      },
      {
        path: 'meera-ai',
        loadComponent: () => import('./pages/meera-ai/meera-ai').then(m => m.MeeraAi),
      },
      {
        path: 'support',
        loadComponent: () => import('./pages/support/support').then(m => m.Support),
      },
      {
        path: 'plans',
        loadComponent: () => import('./pages/plans/plans').then(m => m.Plans),
      },
      {
        path: 'user-onboarding',
        loadComponent: () => import('./pages/user-onboarding/user-onboarding').then(m => m.UserOnboarding),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'view-staff',
    loadComponent: () => import('./pages/view-staff/view-staff').then(m => m.ViewStaff),
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];