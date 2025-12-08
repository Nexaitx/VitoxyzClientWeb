import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'medicines', pathMatch: 'full' },
  { path: 'medicines', loadComponent: () => import('./medicines').then(m => m.Medicines) },
  { path: 'medicines/:id/:type', loadComponent: () => import('./view-medicine/view-medicine').then(m => m.ViewMedicine) },
  { 
    path: 'products/:category', 
    loadComponent: () => import('./category-products/category-products').then(m => m.CategoryProductsComponent) 
  },
  // { path: 'cart', loadComponent: () => import('./cart-items/cart-items').then(m => m.CartItems) },
  // { path: 'order', loadComponent: () => import('./order/order').then(m => m.Order) },

    { path: 'order-prescription', loadComponent: () => import('./order-prescription/order-prescription').then(m => m.OrderPrescription) },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicinesRoutingModule { }
