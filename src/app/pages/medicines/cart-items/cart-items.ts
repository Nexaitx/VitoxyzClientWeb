

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../../footer/footer';
import { Header } from '../header/header';
import { CartItem, CartService } from '@src/app/core/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-items',
  imports: [Footer, CommonModule, Header],
  standalone: true,
  templateUrl: './cart-items.html',
  styleUrls: ['./cart-items.scss']
})
export class CartItems implements OnInit {

 cart: CartItem[] = [];
  shippingFee = 70;

  private router = inject(Router);
  private cartService = inject(CartService);

  ngOnInit() {
    this.refreshCart();
  }
  refreshCart() {
    this.cart = this.cartService.getItems();
  }
  goToMedicines() {
    this.router.navigateByUrl('/medicines');
  }

  goToViewMedicines() {
    this.router.navigateByUrl('/medicines/1');
  }

  removeItem(id: string) {
    this.cartService.removeItem(id);
    this.refreshCart();
  }

   increaseQty(item: CartItem) {
    item.count = (item.count || 1) + 1;
    this.cartService.updateItem(item);
    this.refreshCart();
  }

   decreaseQty(item: CartItem) {
    if ((item.count || 1) > 1) {
      item.count--;
      this.cartService.updateItem(item);
      this.refreshCart();
    }
  }

  getDiscount(item: CartItem): number {
    if (item.mrp && item.mrp > item.price) {
      return Math.round(((item.mrp - item.price) / item.mrp) * 100);
    }
    return 0;
  }

  getItemTotal(): number {
    return this.cart.reduce((sum, i) => sum + (i.price * i.count), 0);
  }

  getTotalDiscount(): number {
    return this.cart.reduce((sum, i) => sum + ((i.mrp ? i.mrp - i.price : 0) * i.count), 0);
  }

  getFinalAmount(): number {
    return this.getItemTotal() + this.shippingFee - this.getTotalDiscount();
  }
}

