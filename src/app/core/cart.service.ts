import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, forkJoin, of, Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import { API_URL } from './const';

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
 // private API_BASE = 'http://localhost:8080/api/cart';
  private API_BASE = `${API_URL}/cart`;
  
  


  // Observable to track cart items
  private _cart$ = new BehaviorSubject<CartItem[]>([]);
  cart$ = this._cart$.asObservable();

  //  Loading states
  private _loading$ = new BehaviorSubject<boolean>(false);
  loading$ = this._loading$.asObservable();

  //  Individual item loading states
  private _itemLoadingStates$ = new BehaviorSubject<{[key: string]: boolean}>({});
  itemLoadingStates$ = this._itemLoadingStates$.asObservable();

  //  Success notification subject
  private _successNotification$ = new BehaviorSubject<string | null>(null);
  successNotification$ = this._successNotification$.asObservable();

  private notificationService = inject(NotificationService);

  private readonly LOCAL_STORAGE_KEY = 'localCart';

  constructor() {
    this.loadLocalCart();
  }

  // Set loading state for specific item
  private setItemLoading(itemId: string, loading: boolean) {
    const currentStates = this._itemLoadingStates$.value;
    if (loading) {
      this._itemLoadingStates$.next({...currentStates, [itemId]: true});
    } else {
      const newStates = {...currentStates};
      delete newStates[itemId];
      this._itemLoadingStates$.next(newStates);
    }
  }

  //  Set global loading state
  private setLoading(loading: boolean) {
    this._loading$.next(loading);
  }

  //  Show success notification
  showSuccessNotification(message: string) {
    this._successNotification$.next(message);
    // Auto hide after 3 seconds
    setTimeout(() => {
      this._successNotification$.next(null);
    }, 3000);
  }

  // Load cart from localStorage
  loadLocalCart() {
    const localCart = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (localCart) {
      const parsedCart = JSON.parse(localCart);
      console.log('🛒 Loading local cart from storage:', parsedCart);
      this._cart$.next(parsedCart);
    } else {
      console.log('🛒 No local cart found in storage');
    }
  }

  // Save cart to localStorage
  private saveLocalCart(cart: CartItem[]) {
    console.log('💾 Saving cart to local storage:', cart);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(cart));
    this._cart$.next(cart);
  }

  // Add item to local cart
  addToLocalCart(item: CartItem) {
    console.log('Adding to local cart:', item);
    const currentCart = this._cart$.value;
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.id);

    let updatedCart: CartItem[];
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      updatedCart = [...currentCart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        count: updatedCart[existingItemIndex].count + (item.count || 1)
      };
    } else {
      // Add new item
      updatedCart = [...currentCart, { ...item, count: item.count || 1 }];
    }

    this.saveLocalCart(updatedCart);
  }

  // Remove item from local cart
  removeFromLocalCart(id: string) {
    console.log('🗑️ Removing from local cart:', id);
    const currentCart = this._cart$.value;
    const updatedCart = currentCart.filter(item => item.id !== id);
    this.saveLocalCart(updatedCart);
  }

  // Update quantity in local cart
  updateLocalCartQuantity(id: string, count: number) {
    console.log('📝 Updating local cart quantity:', id, count);
    const currentCart = this._cart$.value;
    const updatedCart = currentCart.map(item => 
      item.id === id ? { ...item, count } : item
    );
    this.saveLocalCart(updatedCart);
  }

  //  Sync local cart to backend with loading states
  syncLocalCartToBackend(): Observable<any> {
    const localCart = this._cart$.value;
    const token = localStorage.getItem('authToken');
    
    console.log('🔄 Starting cart sync...');
    console.log('🔑 Token exists:', !!token);
    console.log('🛒 Local cart items to sync:', localCart);

    if (!token) {
      console.log('❌ No token found, skipping sync');
      this.showSuccessNotification('Please login to sync your cart');
      return of({ success: false, message: 'No authentication token' });
    }

    if (localCart.length === 0) {
      console.log('ℹ️ Local cart is empty, skipping sync');
      return of({ success: true, message: 'Empty cart' });
    }

    this.setLoading(true);

    // Use the new bulk sync endpoint
    const itemsToSync = localCart.map(item => ({
      medicineId: item.id,
      quantity: item.count,
      productType: item.productType || 'otc'
    }));

    console.log('📤 Syncing items to backend via bulk API:', itemsToSync);

    return this.http.post<any>(`${this.API_BASE}/sync-local`, { items: itemsToSync }, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap({
        next: (response) => {
          console.log('✅ Sync API response:', response);
          this.setLoading(false);
          
          if (response.status) {
            console.log('🎯 Sync successful, clearing local cart');
            this.showSuccessNotification('Cart synced successfully!');
            // Clear local cart only after successful sync
            localStorage.removeItem(this.LOCAL_STORAGE_KEY);
            console.log('🗑️ Local cart cleared from storage');
            
            // Wait a bit before fetching from backend
            setTimeout(() => {
              this.fetchCartFromBackend().subscribe();
            }, 1000);
          } else {
            console.error('❌ Sync failed in API response:', response.message);
            this.showSuccessNotification('Cart sync failed. Using local cart.');
            // Don't clear local cart if sync fails
          }
        },
        error: (error) => {
          console.error('❌ Sync API error:', error);
          this.setLoading(false);
          this.showSuccessNotification('Cart sync failed. Using local cart.');
          // Don't clear local cart if sync fails
        }
      })
    );
  }

  // Fetch cart from backend with loading states
  // private fetchCartFromBackend(): Observable<any> {
  //   const token = localStorage.getItem('authToken');
  //   if (!token) {
  //     console.log('❌ No token for backend fetch');
  //     return of(null);
  //   }

  //   console.log('📥 Fetching cart from backend...');
  //   this.setLoading(true);
    
  //   return this.http.get<any>(`${this.API_BASE}/my`, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   }).pipe(
  //     tap((res) => {
  //       console.log('📦 Backend cart response:', res);
  //       this.setLoading(false);
        
  //       if (res && res.status) {
  //         if (res.data && Array.isArray(res.data) && res.data.length > 0) {
  //           const items = res.data.map((item: any) => {
  //             let imageUrl = 'assets/no-image.png';
  //             if (item.imageUrl) {
  //               imageUrl = item.imageUrl.split('|')[0].trim();
  //             }

  //             return {
  //               id: item.medicineId,
  //               name: item.productName,
  //               image: imageUrl,
  //               qty: item?.quantity?.toString() || '1',
  //               price: item.price,
  //               mrp: item.mrp || item.price,
  //               count: item.quantity || 1,
  //               productType: item.productType
  //             };
  //           });
  //           console.log('✅ Processed backend cart items:', items);
  //           this._cart$.next(items);
  //         } else {
  //           console.log('ℹ️ Backend cart is empty');
  //           this._cart$.next([]);
            
  //           // Check if we have local cart items that failed to sync
  //           const localCart = localStorage.getItem(this.LOCAL_STORAGE_KEY);
  //           if (localCart && JSON.parse(localCart).length > 0) {
  //             console.log('⚠️ Local cart items still exist, sync might have failed');
  //             console.log('🔄 Loading local cart as fallback');
  //             this.loadLocalCart();
  //           }
  //         }
  //       } else {
  //         console.error('❌ Invalid backend response format');
  //         this._cart$.next([]);
  //       }
  //     }),
  //     tap({
  //       error: (error) => {
  //         console.error('❌ Error fetching backend cart:', error);
  //         this.setLoading(false);
  //         // Fallback to local cart if backend fails
  //         console.log('🔄 Falling back to local cart due to backend error');
  //         this.loadLocalCart();
  //       }
  //     })
  //   );
  // }

  // Fetch cart from backend with loading states - UPDATED
private fetchCartFromBackend(): Observable<any> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('❌ No token for backend fetch');
    return of(null);
  }

  console.log('📥 Fetching cart from backend...');
  this.setLoading(true);
  
  return this.http.get<any>(`${this.API_BASE}/my`, {
    headers: { Authorization: `Bearer ${token}` }
  }).pipe(
    tap((res) => {
      console.log('📦 Backend cart response:', res);
      this.setLoading(false);
      
      if (res && res.status) {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const items = res.data.map((item: any) => {
            let imageUrl = 'assets/no-image.png';
            if (item.imageUrl) {
              imageUrl = item.imageUrl.split('|')[0].trim();
            }

            // ✅ IMPORTANT: id field में medicineManagementId use करें
            return {
              id: item.medicineManagementId || item.medicineId, // ✅ medicineManagementId को priority दें
              medicineId: item.medicineId, // original medicineId भी store करें
              name: item.productName,
              image: imageUrl,
              qty: item?.quantity?.toString() || '1',
              price: item.price,
              mrp: item.mrp || item.price,
              count: item.quantity || 1,
              productType: item.productType
            };
          });
          console.log('✅ Processed backend cart items:', items);
          this._cart$.next(items);
        } else {
          console.log('ℹ️ Backend cart is empty');
          this._cart$.next([]);
        }
      } else {
        console.error('❌ Invalid backend response format');
        this._cart$.next([]);
      }
    }),
    tap({
      error: (error) => {
        console.error('❌ Error fetching backend cart:', error);
        this.setLoading(false);
        console.log('🔄 Falling back to local cart due to backend error');
        this.loadLocalCart();
      }
    })
  );
}

addItem(product: any, quantity: number = 1): Observable<any> {
  const token = localStorage.getItem('authToken');
  
  const cartItem: CartItem = {
    id: product.managementId || product.id || product.productId || product.medicineId,
    name: product.name,
    price: product.price || product.discountPrice || product.originalPrice,
    mrp: product.originalPrice,
    image: product.image || this.getFirstImageUrl(product.imageUrls),
    qty: product.productForm || product.packaging || '1',
    count: quantity,
    productType: product.productType || 'otc'
  };

  console.log('🛒 Adding item to cart - Token exists:', !!token);
  console.log('📦 Product details:', product);

  if (!token) {
    this.addToLocalCart(cartItem);
    this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
    return of(cartItem);
  }

  // ✅ managementId को priority दें (आपके response के according)
  const managementId = product.managementId;
  const medicineId = product.medicineId || product.id || product.productId;
  
  if (!managementId && !medicineId) {
    console.error('❌ Both managementId and medicineId are missing', product);
    this.addToLocalCart(cartItem);
    this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
    return of(cartItem);
  }

  const identifier = managementId || medicineId;
  this.setItemLoading(identifier.toString(), true);

  // ✅ Backend payload - managementId को priority दें
  const backendPayload: any = {
    quantity: quantity,
    productType: product.productType || 'otc'
  };

  // Priority: managementId > medicineId (आपके API के according)
  if (managementId) {
    backendPayload.medicineManagementId = managementId;
  } else if (medicineId) {
    backendPayload.medicineId = medicineId;
  }

  console.log('📤 Backend payload:', backendPayload);

  return this.http.post<any>(`${this.API_BASE}/add`, backendPayload, {
    headers: { Authorization: `Bearer ${token}` }
  }).pipe(
    tap({
      next: (response) => {
        this.setItemLoading(identifier.toString(), false);
        
        if (response && response.status) {
          this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
          setTimeout(() => {
            this.fetchCartFromBackend().subscribe();
          }, 500);
        } else {
          console.warn('⚠️ Backend add failed, using local cart');
          this.addToLocalCart(cartItem);
          this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
        }
      },
      error: (error) => {
        this.setItemLoading(identifier.toString(), false);
        console.error('❌ Backend add error:', error);
        this.addToLocalCart(cartItem);
        this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
      }
    })
  );
}

// Helper method for image URL
private getFirstImageUrl(imageUrls: any): string {
  if (!imageUrls) return 'assets/no-image.png';
  
  if (Array.isArray(imageUrls)) {
    return imageUrls.length > 0 ? imageUrls[0] : 'assets/no-image.png';
  }
  
  if (typeof imageUrls === 'string') {
    return imageUrls.split('|')[0].trim() || 'assets/no-image.png';
  }
  
  return 'assets/no-image.png';
}
  //  addItem(product: any, quantity: number = 1): Observable<any> {
  //   const token = localStorage.getItem('authToken');
    
  //   const cartItem: CartItem = {
  //     id: product.id || product.productId,
  //     name: product.name,
  //     price: product.price,
  //     mrp: product.mrp,
  //     image: product.image || product.imageUrl,
  //     qty: product.form || product.packaging,
  //     count: quantity,
  //     productType: product.productType || 'otc'
  //   };

  //   console.log('🛒 Adding item to cart - Token exists:', !!token);

  //   if (!token) {
  //     this.addToLocalCart(cartItem);
  //     this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
  //     return of(cartItem);
  //   }

  //   const medicineId = product.id || product.productId;
    
  //   if (!medicineId) {
  //     this.addToLocalCart(cartItem);
  //     this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
  //     return of(cartItem);
  //   }

  //   this.setItemLoading(medicineId, true);

  //   const backendPayload = {
  //     medicineId: medicineId,
  //     quantity: quantity,
  //     productType: product.productType || 'otc'
  //   };

  //   return this.http.post<any>(`${this.API_BASE}/add`, backendPayload, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   }).pipe(
  //     tap({
  //       next: (response) => {
  //         this.setItemLoading(medicineId, false);
          
  //         if (response && response.status) {
  //           this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
  //           setTimeout(() => {
  //             this.fetchCartFromBackend().subscribe();
  //           }, 500);
  //         } else {
  //           this.addToLocalCart(cartItem);
  //           this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
  //         }
  //       },
  //       error: (error) => {
  //         this.setItemLoading(medicineId, false);
  //         this.addToLocalCart(cartItem);
  //         this.notificationService.showSuccess(`${product.name} added to cart successfully!`);
  //       }
  //     })
  //   );
  // }



  //  Remove item with loading state
  // removeItem(id: string): Observable<any> {
  //   const token = localStorage.getItem('authToken');
    
  //   console.log('🗑️ Removing item:', id);
  //   this.setItemLoading(id, true);

  //   // Always remove from local storage first
  //   this.removeFromLocalCart(id);

  //   if (!token) {
  //     console.log('👤 User not logged in, removed from local storage only');
  //     this.setItemLoading(id, false);
  //     this.showSuccessNotification('Item removed from cart');
  //     return of(null);
  //   }

  //   // Also remove from backend if logged in
  //   console.log('👤 User logged in, removing from backend');
  //   return this.http.delete<any>(`${this.API_BASE}/remove/${id}`, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   }).pipe(
  //     tap({
  //       next: () => {
  //         this.setItemLoading(id, false);
  //         console.log('✅ Backend remove successful');
  //         this.showSuccessNotification('Item removed from cart');
  //         this.fetchCartFromBackend().subscribe();
  //       },
  //       error: (error) => {
  //         this.setItemLoading(id, false);
  //         console.error('❌ Backend remove failed:', error);
  //         this.showSuccessNotification('Item removed from cart');
  //       }
  //     })
  //   );
  // }

  //remove
  //  Smart remove item that tries multiple endpoints
removeItem(id: string): Observable<any> {
  const token = localStorage.getItem('authToken');
  
  console.log('🗑️ Removing item from cart:', id);
  this.setItemLoading(id, true);

  // Always remove from local storage first
  this.removeFromLocalCart(id);

  if (!token) {
    console.log('👤 User not logged in, removed from local storage only');
    this.setItemLoading(id, false);
    this.showSuccessNotification('Item removed from cart');
    return of(null);
  }

  // ✅ Try medicineManagementId endpoint first, then fallback to medicineId
  return this.tryRemoveWithManagementId(id).pipe(
    tap({
      next: () => {
        this.setItemLoading(id, false);
        console.log('✅ Remove successful with managementId endpoint');
        this.showSuccessNotification('Item removed from cart');
        this.fetchCartFromBackend().subscribe();
      },
      error: (error) => {
        console.error('❌ ManagementId remove failed, trying medicineId endpoint:', error);
        this.tryRemoveWithMedicineId(id).subscribe({
          next: () => {
            this.setItemLoading(id, false);
            console.log('✅ Remove successful with medicineId endpoint');
            this.showSuccessNotification('Item removed from cart');
            this.fetchCartFromBackend().subscribe();
          },
          error: (fallbackError) => {
            this.setItemLoading(id, false);
            console.error('❌ Both remove methods failed:', fallbackError);
            this.showSuccessNotification('Item removed from cart (local only)');
          }
        });
      }
    })
  );
}

// ✅ Try remove with medicineManagementId
private tryRemoveWithManagementId(managementId: string): Observable<any> {
  const token = localStorage.getItem('authToken');
  console.log('🔧 Trying remove with managementId endpoint');
  
  return this.http.delete<any>(`${this.API_BASE}/remove/${managementId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// ✅ Try remove with medicineId (fallback)
private tryRemoveWithMedicineId(medicineId: string): Observable<any> {
  const token = localStorage.getItem('authToken');
  console.log('🔧 Trying remove with medicineId endpoint');
  
  return this.http.delete<any>(`${this.API_BASE}/remove/${medicineId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

  //  Increment quantity with loading state
  // incrementQty(medicineId: string): Observable<any> {
  //   const token = localStorage.getItem('authToken');
    
  //   this.setItemLoading(medicineId, true);

  //   if (!token) {
  //     const currentCart = this._cart$.value;
  //     const item = currentCart.find(i => i.id === medicineId);
  //     if (item) {
  //       this.updateLocalCartQuantity(medicineId, item.count + 1);
  //     }
  //     this.setItemLoading(medicineId, false);
  //     return of(null);
  //   }

  //   return this.http.put<any>(`${this.API_BASE}/increment/${medicineId}`, {}, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   }).pipe(
  //     tap({
  //       next: () => {
  //         this.setItemLoading(medicineId, false);
  //         this.fetchCartFromBackend().subscribe();
  //       },
  //       error: (error) => {
  //         this.setItemLoading(medicineId, false);
  //         console.error('❌ Increment failed:', error);
  //       }
  //     })
  //   );
  // }

  // //  Decrement quantity with loading state
  // decrementQty(medicineId: string): Observable<any> {
  //   const token = localStorage.getItem('authToken');
    
  //   this.setItemLoading(medicineId, true);

  //   if (!token) {
  //     const currentCart = this._cart$.value;
  //     const item = currentCart.find(i => i.id === medicineId);
  //     if (item && item.count > 1) {
  //       this.updateLocalCartQuantity(medicineId, item.count - 1);
  //     } else if (item && item.count === 1) {
  //       this.removeFromLocalCart(medicineId);
  //     }
  //     this.setItemLoading(medicineId, false);
  //     return of(null);
  //   }

  //   return this.http.put<any>(`${this.API_BASE}/decrement/${medicineId}`, {}, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   }).pipe(
  //     tap({
  //       next: () => {
  //         this.setItemLoading(medicineId, false);
  //         this.fetchCartFromBackend().subscribe();
  //       },
  //       error: (error) => {
  //         this.setItemLoading(medicineId, false);
  //         console.error('❌ Decrement failed:', error);
  //       }
  //     })
  //   );
  // }

  //  Increment quantity with loading state - UPDATED
incrementQty(medicineId: string): Observable<any> {
  const token = localStorage.getItem('authToken');
  
  this.setItemLoading(medicineId, true);

  if (!token) {
    const currentCart = this._cart$.value;
    const item = currentCart.find(i => i.id === medicineId);
    if (item) {
      this.updateLocalCartQuantity(medicineId, item.count + 1);
    }
    this.setItemLoading(medicineId, false);
    return of(null);
  }

  // ✅ medicineManagementId के साथ increment API call
  return this.http.put<any>(`${this.API_BASE}/increment/${medicineId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).pipe(
    tap({
      next: () => {
        this.setItemLoading(medicineId, false);
        this.fetchCartFromBackend().subscribe();
      },
      error: (error) => {
        this.setItemLoading(medicineId, false);
        console.error('❌ Increment failed with managementId, trying fallback:', error);
        
        // Fallback to old endpoint
        this.http.put<any>(`${this.API_BASE}/increment/${medicineId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: () => {
            this.fetchCartFromBackend().subscribe();
          },
          error: (fallbackError) => {
            console.error('❌ Both increment methods failed:', fallbackError);
          }
        });
      }
    })
  );
}

//  Decrement quantity with loading state - UPDATED
decrementQty(medicineId: string): Observable<any> {
  const token = localStorage.getItem('authToken');
  
  this.setItemLoading(medicineId, true);

  if (!token) {
    const currentCart = this._cart$.value;
    const item = currentCart.find(i => i.id === medicineId);
    if (item && item.count > 1) {
      this.updateLocalCartQuantity(medicineId, item.count - 1);
    } else if (item && item.count === 1) {
      this.removeFromLocalCart(medicineId);
    }
    this.setItemLoading(medicineId, false);
    return of(null);
  }

  // ✅ medicineManagementId के साथ decrement API call
  return this.http.put<any>(`${this.API_BASE}/decrement/${medicineId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).pipe(
    tap({
      next: () => {
        this.setItemLoading(medicineId, false);
        this.fetchCartFromBackend().subscribe();
      },
      error: (error) => {
        this.setItemLoading(medicineId, false);
        console.error('❌ Decrement failed with managementId, trying fallback:', error);
        
        // Fallback to old endpoint
        this.http.put<any>(`${this.API_BASE}/decrement/${medicineId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: () => {
            this.fetchCartFromBackend().subscribe();
          },
          error: (fallbackError) => {
            console.error('❌ Both decrement methods failed:', fallbackError);
          }
        });
      }
    })
  );
}

  // Update quantity with loading state
  updateQty(medicineId: string, quantity: number, productType: string = 'otc'): Observable<any> {
    const token = localStorage.getItem('authToken');
    
    this.setItemLoading(medicineId, true);

    if (!token) {
      this.updateLocalCartQuantity(medicineId, quantity);
      this.setItemLoading(medicineId, false);
      return of(null);
    }

    return this.http.post<any>(`${this.API_BASE}/update`, { 
      medicineId, 
      quantity, 
      productType 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap({
        next: () => {
          this.setItemLoading(medicineId, false);
          this.fetchCartFromBackend().subscribe();
        },
        error: (error) => {
          this.setItemLoading(medicineId, false);
          console.error('❌ Update quantity failed:', error);
        }
      })
    );
  }

  //  Clear cart with loading state
  clearCart(): Observable<any> {
    const token = localStorage.getItem('authToken');
    
    this.setLoading(true);

    // Always clear local storage
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    this._cart$.next([]);

    if (!token) {
      console.log('👤 User not logged in, cleared local storage only');
      this.setLoading(false);
      this.showSuccessNotification('Cart cleared successfully!');
      return of(null);
    }

    return this.http.delete<any>(`${this.API_BASE}/clear`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap({
        next: () => {
          this.setLoading(false);
          this.showSuccessNotification('Cart cleared successfully!');
        },
        error: (error) => {
          this.setLoading(false);
          console.error('❌ Clear cart failed:', error);
          this.showSuccessNotification('Cart cleared successfully!');
        }
      })
    );
  }

  //  Smart cart fetching with loading states
  fetchCart(): Observable<CartItem[]> {
    const token = localStorage.getItem('authToken');
    console.log('🔄 fetchCart called, logged in:', !!token);
    
    if (!token) {
      console.log('👤 User not logged in, using local cart');
      this.loadLocalCart();
      return this.cart$;
    }

    console.log('👤 User logged in, fetching from backend');
    return this.fetchCartFromBackend();
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Get current cart items
  getCurrentCart(): CartItem[] {
    return this._cart$.value;
  }

  // Get cart item count
  getCartItemCount(): number {
    return this._cart$.value.reduce((total, item) => total + item.count, 0);
  }

  // Check if item is in cart
  isItemInCart(productId: string): boolean {
    return this._cart$.value.some(item => item.id === productId);
  }

  //  Get item by ID
  getItemById(productId: string): CartItem | undefined {
    return this._cart$.value.find(item => item.id === productId);
  }

  //  Check if any operation is loading
  isLoading(): boolean {
    return this._loading$.value;
  }

  // Check if specific item is loading
  isItemLoading(itemId: string): boolean {
    return this._itemLoadingStates$.value[itemId] || false;
  }

  // Get total cart value
  getTotalCartValue(): number {
    return this._cart$.value.reduce((total, item) => total + (item.price * item.count), 0);
  }

  //  Get total savings
  getTotalSavings(): number {
    return this._cart$.value.reduce((total, item) => {
      if (item.mrp && item.mrp > item.price) {
        return total + ((item.mrp - item.price) * item.count);
      }
      return total;
    }, 0);
  }




//  Local aur backend cart ko intelligently merge karein
syncLocalCartSmartMerge(payload: any): Observable<any> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return of({ success: false, message: 'No authentication token' });
  }

  return this.http.post<any>(`${this.API_BASE}/sync-local-smart-merge`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
//addtocart issue


}
