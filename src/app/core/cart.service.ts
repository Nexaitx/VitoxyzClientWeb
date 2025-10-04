// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// export interface CartItem {
//    id: string;
//   name: string;
//   image?: string;
//   qty?: string;       
//   price: number;     
//   mrp?: number;      
//   count: number;
// }

// @Injectable({ providedIn: 'root' })
// export class CartService {
 
//     private items: CartItem[] = [];

//   getItems(): CartItem[] {
//   return [...this.items];
//   }

//    addItem(item: Partial<CartItem>) {
//     const safeItem: CartItem = {
//       id: String(item.id ?? ''),
//       name: String(item.name ?? 'Unknown product'),
//       image: item.image ?? 'assets/no-image.png',
//       qty: item.qty ?? '',
//       price: Number(item.price ?? 0),
//       mrp: typeof item.mrp !== 'undefined' ? Number(item.mrp) : undefined,
//       count: Number(item.count ?? 1)
//     };

//     const existing = this.items.find(i => i.id === safeItem.id);
//     if (existing) {
//       existing.count = (existing.count || 0) + safeItem.count;
//       // optionally update price/mrp if needed:
//       existing.price = safeItem.price;
//       if (safeItem.mrp) existing.mrp = safeItem.mrp;
//     } else {
//       this.items.push(safeItem);
//     }
//   }

//   removeItem(id: string) {
//     this.items = this.items.filter(i => i.id !== id);
//   }

//   updateItem(item: CartItem) {
//     const idx = this.items.findIndex(i => i.id === item.id);
//     if (idx > -1) {
//       this.items[idx] = { ...item };
//     }
//   }

//   clearCart() {
//     this.items = [];
//   }
// }


import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  image?: string;
  qty?: string;
  price: number;
  mrp?: number;
  count: number;
  productType?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private API_BASE = 'https://vitoxyzbackend-az2e.onrender.com/api/cart';
  
  // Observable to track cart items
  private _cart$ = new BehaviorSubject<CartItem[]>([]);
  cart$ = this._cart$.asObservable();

  constructor() {}

 fetchCart() {
  const token = localStorage.getItem('authToken');
  return this.http.get<any>(`${this.API_BASE}/my`, {
    headers: { Authorization: `Bearer ${token}` }
  }).pipe(
    tap((res) => {
      if (res && res.data) {
        const items = res.data.map((item: any) => {
          // fix image: take the first image URL if multiple are returned
          let imageUrl = 'assets/no-image.png';
          if (item.imageUrl) {
            imageUrl = item.imageUrl.split('|')[0].trim();
          }

          return {
            id: item.medicineId,
            name: item.productName,
            image: imageUrl,
            qty: item?.quantity?.toString() || '1',
            price: item.price,
            mrp: item.mrp || item.price,   // use mrp if provided, else fallback to price
            count: item.quantity || 1,
            productType: item.productType
          };
        });
        this._cart$.next(items);
      } else {
        this._cart$.next([]);
      }
    })
  );
}


removeItem(id: string) {
  const token = localStorage.getItem('authToken');
  return this.http.delete<any>(`${this.API_BASE}/remove/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).pipe(
    tap(() => this.fetchCart())
  );
}


addItem(item: { medicineId: string; quantity: number; productType: string }) {
  
  const token = localStorage.getItem('authToken'); // get token
  console.log("tokensdsasd",token );

  return this.http.post<any>(`${this.API_BASE}/add`, item, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).pipe(
    tap(() => this.fetchCart())
  );
}

   incrementQty(medicineId: string) {
    const token = localStorage.getItem('authToken');
    return this.http.put<any>(`${this.API_BASE}/increment/${medicineId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => this.fetchCart().subscribe())
    );
  }

 decrementQty(medicineId: string) {
    const token = localStorage.getItem('authToken');
    return this.http.put<any>(`${this.API_BASE}/decrement/${medicineId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => this.fetchCart().subscribe())
    );
  }

   updateQty(medicineId: string, quantity: number, productType: string) {
    const token = localStorage.getItem('authToken');
    return this.http.post<any>(`${this.API_BASE}/update`, { medicineId, quantity, productType }, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => this.fetchCart().subscribe())
    );
  }

}
