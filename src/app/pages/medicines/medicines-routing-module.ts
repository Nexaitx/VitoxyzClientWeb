import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '', loadComponent: () => import('./medicines').then(m => m.Medicines) },
  { path: 'medicines/:id', loadComponent: () => import('./view-medicine/view-medicine').then(m => m.ViewMedicine) },
  { path: 'cart', loadComponent: () => import('./cart-items/cart-items').then(m => m.CartItems) },
  { path: 'order', loadComponent: () => import('./order/order').then(m => m.Order) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicinesRoutingModule { }