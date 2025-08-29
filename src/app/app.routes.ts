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
      }, {
        path: 'privacy-policy',
        loadComponent: () => import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy),
      },
      {
        path: 'about-us',
        loadComponent: () => import('./pages/about-us/about-us').then(m => m.AboutUs),
      },
      {
        path:'termsandconditions',
        loadComponent:() => import('./pages/termsandconditions/termsandconditions').then(m => m.Termsandconditions),
      },
      {
        path: 'subscription-plans',
        loadComponent: () => import('./pages/Diet-Plan/plans/plans').then(m => m.Plans),
      },
      {
        path: 'payment',
        loadComponent: () => import('./pages/Diet-Plan/payment-screen/payment-screen').then(m => m.PaymentScreen),
      },
      {
        path: 'contact-us',
        loadComponent: () => import('./pages/contact-us/contact-us').then(m => m.ContactUs),
      },
      {
        path: 'diet-charts',
        loadComponent: () => import('./pages/Diet-Plan/diet-dashboard/diet-dashboard').then(m => m.DietDashboard),
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
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders').then(m => m.Orders),
      },
      {
        path: 'help',
        loadComponent: () => import('./pages/help/help').then(m => m.Help),
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