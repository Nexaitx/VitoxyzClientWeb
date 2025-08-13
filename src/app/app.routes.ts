import { Routes } from '@angular/router';
import { Header } from './layouts/header/header';
import { BillingDetailsComponent } from './core/toasts/billing-details/billing-details.component';

export const routes: Routes = [
  {
    path: '',
    component: Header,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/medicines/medicines-module').then(m => m.MedicinesModule),
      },
      {
        path: 'book-staff',
        loadComponent: () => import('./pages/book-staff-process/book-staff/book-staff').then(m => m.BookStaff),
      },
      {
        path: 'diet/user-onboarding',
        loadComponent: () => import('./pages/Diet-Plan/user-onboarding/user-onboarding').then(m => m.UserOnboarding),
      },
      {
        path: 'user-profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
      },
      {
        path: 'diet-plans',
        loadComponent: () => import('./pages/Diet-Plan/plans/plans').then(m => m.Plans),
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
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: 'view-staff',
        loadComponent: () => import('./pages/view-staff/view-staff').then(m => m.ViewStaff),
      },
    ]
  },
  // {
  //   path: 'billing', 
  //   //loadComponent: () => import('src/app/core/toasts/billing-details').then(m => m.BillingDetails),

  //   component: BillingDetailsComponent,
  //   data: { initialGstNumber: 'TESTGST1234567', paymentAmount: 500 }
  // },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];