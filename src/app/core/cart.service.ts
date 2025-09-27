import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
   id: string;
  name: string;
  image?: string;
  qty?: string;       
  price: number;     
  mrp?: number;      
  count: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
 
    private items: CartItem[] = [];

  getItems(): CartItem[] {
  return [...this.items];
  }

   addItem(item: Partial<CartItem>) {
    const safeItem: CartItem = {
      id: String(item.id ?? ''),
      name: String(item.name ?? 'Unknown product'),
      image: item.image ?? 'assets/no-image.png',
      qty: item.qty ?? '',
      price: Number(item.price ?? 0),
      mrp: typeof item.mrp !== 'undefined' ? Number(item.mrp) : undefined,
      count: Number(item.count ?? 1)
    };

    const existing = this.items.find(i => i.id === safeItem.id);
    if (existing) {
      existing.count = (existing.count || 0) + safeItem.count;
      // optionally update price/mrp if needed:
      existing.price = safeItem.price;
      if (safeItem.mrp) existing.mrp = safeItem.mrp;
    } else {
      this.items.push(safeItem);
    }
  }

  removeItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
  }

  updateItem(item: CartItem) {
    const idx = this.items.findIndex(i => i.id === item.id);
    if (idx > -1) {
      this.items[idx] = { ...item };
    }
  }

  clearCart() {
    this.items = [];
  }
}
