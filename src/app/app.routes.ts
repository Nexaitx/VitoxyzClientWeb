import { Routes } from '@angular/router';
import { Header } from './layouts/header/header';
import { BillingDetailsComponent } from './core/toasts/billing-details/billing-details.component';
import { UserOnboarding } from './pages/user-onboarding/user-onboarding';
import { ViewMedicine } from './pages/medicines/view-medicine/view-medicine';
import { SearchResultComponent } from '../app/pages/shared/search-result/search-result';
import { MultiproductsformComponent } from './pages/medicines/multiproductsform/multiproductsform';
import { MedicineFilterComponent } from './pages/medicines/medicine-filter/medicine-filter';

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
    path: 'view-medicine/:id',
    component: ViewMedicine
  },
        { path: 'products', component: MultiproductsformComponent },
          { path: 'medicine', component: MedicineFilterComponent },



      {
        path: 'products/:category', 
        loadComponent: () => import('./pages/medicines/category-products/category-products') 
          .then(m => m.CategoryProductsComponent),
      },
        { path: 'search', component: SearchResultComponent },

      {
        path: 'book-staff',
        loadComponent: () => import('./pages/book-staff-process/book-staff/book-staff').then(m => m.BookStaff),

      },
      {
        path: 'diet/user-onboarding',
        component: UserOnboarding
      },
      // {
      //   path: 'diet/user-onboarding',
      //   loadComponent: () => import('./pages/Diet-Plan/user-onboarding/user-onboarding').then(m => m.UserOnboarding),
      // },
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
        path: 'termsandconditions',
        loadComponent: () => import('./pages/termsandconditions/termsandconditions').then(m => m.Termsandconditions),
      },
       {
        path: 'return-refund',
        loadComponent: () => import('./pages/return-refund/return-refund').then(m => m.ReturnRefund),
      },
      {
        path: 'subscription-plans',
        loadComponent: () => import('./pages/Diet-Plan/plans/plans').then(m => m.Plans),
      },
      {
        path: 'payment',
        loadComponent: () => import('./pages/Diet-Plan/payment-screen/payment-screen').then(m => m.PaymentScreen),
      },
      {path: 'PaymentSuccessComponent',
        loadComponent: () => import('./payment/payment').then(m => m.PaymentSuccessComponent),

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
        { path: 'cart', loadComponent: () => import('./pages/medicines/cart-items/cart-items').then(m => m.CartItems) },
 { path: 'medicines/:id', loadComponent: () => import('./pages/medicines/view-medicine/view-medicine').then(m => m.ViewMedicine) },
      {
        path: 'orders',
        loadComponent: () => import('./pages/medicines/order-history/order-history').then(m => m.OrderHistoryComponent),
      },
      {
        path: 'help',
        loadComponent: () => import('./pages/help/help').then(m => m.Help),
      },
     { path: 'medicine/:id', component: ViewMedicine }, 

 { 
    path: 'order/:orderId', 
    loadComponent: () => import('./pages/shared/order-details').then(c => c.OrderDetailsComponent)
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
      {
        path:'pharmacy',
        loadComponent: () => import('./pages/pharmacy/pharmacy').then(m => m.Pharmacy),
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
