import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicinesRoutingModule } from './medicines-routing-module';
import { CategoryProductsComponent } from './category-products/category-products'; 


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    MedicinesRoutingModule,
    CategoryProductsComponent
  ]
})
export class MedicinesModule { }
