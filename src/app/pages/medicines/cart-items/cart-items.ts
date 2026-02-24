// cart-items.component.ts (UPDATED with Type Safety)
import { Component, inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../../footer/footer';
import { Header } from '../header/header';
import { CartItem, CartService } from '@src/app/core/cart.service';
import { AddressService, Address, AddressRequest } from '@src/app/core/address.service';
import { OrderService, CreateOrderRequest } from '@src/app/core/order.service';
import { CommonModule } from '@angular/common';
import { Authorization } from '../../authorization/authorization';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav"; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL1 } from '@src/app/core/const';

declare var Razorpay: any;
declare var google: any;
//  Payment Method Types with proper typing
export type PaymentMethod = 'ONLINE' | 'CASH_ON_DELIVERY';

//  Payment Method Interface
interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-cart-items',
  imports: [Footer, CommonModule, Header, Authorization, MatProgressSpinnerModule, MatSnackBarModule, FormsModule, MobileFooterNavComponent],
  standalone: true,
  templateUrl: './cart-items.html',
  styleUrls: ['./cart-items.scss']
})
export class CartItems implements OnInit, OnDestroy {
  cart: CartItem[] = [];
  shippingFee = 70;
  showAuthPopup = false;
  showAddressModal = false;
  showNewAddressForm = false;
  showPaymentMethodModal = false;
  isPaymentLoading = false;
  isLoading = false;
  debugInfo: string = '';
  itemLoadingStates: {[key: string]: boolean} = {};
  //  Address related properties
  isEditingAddress = false;
  editingAddress: Address = this.getEmptyAddress();
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  newAddress: Address = this.getEmptyAddress();
  map: any;
marker: any;
geocoder: any;
  //  Payment method related properties with proper typing
  selectedPaymentMethod: PaymentMethod = 'ONLINE';
  paymentMethods: PaymentMethodOption[] = [
    { value: 'ONLINE', label: 'Online Payment', description: 'Pay securely with Razorpay', icon: '💳' },
    { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', description: 'Pay when you receive the order', icon: '💰' }
  ];
  
  // Success notification message
  successMessage: string = '';

isPharmacistLoading = false;
pharmacistsAvailable = false;

showPharmacistPopup = false;
popupMessage = '';

// successMessage: string = '';

  private readonly razorpayKeyId = 'rzp_test_RARA6BGk8D2Y2o';
  private router = inject(Router);
  private cartService = inject(CartService);
  private addressService = inject(AddressService);
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);
  
  // Subscriptions to manage
  private cartSubscription!: Subscription;
  private loadingSubscription!: Subscription;
  private itemLoadingSubscription!: Subscription;
  private notificationSubscription!: Subscription;
  private addressesSubscription!: Subscription;
 constructor(private http: HttpClient) {}
  ngOnInit() {
       console.log("item",this.cart);

    console.log('🛒 Cart component initialized');
    this.updateDebugInfo('Component initialized');
    
    //  Listen for cart changes
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      console.log('🔄 Cart updated in component:', cart);
      this.cart = cart;

      this.updateDebugInfo(`Cart updated: ${cart.length} items`);
    });

    // Listen to loading states
    this.loadingSubscription = this.cartService.loading$.subscribe(loading => {
      this.isLoading = loading;
      console.log('🔄 Global loading state:', loading);
    });

    //  Listen to individual item loading states
    this.itemLoadingSubscription = this.cartService.itemLoadingStates$.subscribe(states => {
      this.itemLoadingStates = states;
      console.log('🔄 Item loading states:', states);
    });

    // Listen to success notifications
    this.notificationSubscription = this.cartService.successNotification$.subscribe(message => {
      if (message) {
        this.successMessage = message;
        this.showSuccessAlert(message);
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }
    });

    // Listen to addresses
    this.addressesSubscription = this.addressService.addresses$.subscribe(addresses => {
      this.addresses = addresses;
      console.log('🏠 Addresses updated:', addresses);
    });

    // Listen to selected address
    this.addressService.selectedAddress$.subscribe(address => {
      this.selectedAddress = address;
      console.log('📍 Selected address:', address);
    });

    this.refreshCart();
    this.loadUserAddresses();
  }

  ngOnDestroy() {
    //  Clean up subscriptions
    if (this.cartSubscription) this.cartSubscription.unsubscribe();
    if (this.loadingSubscription) this.loadingSubscription.unsubscribe();
    if (this.itemLoadingSubscription) this.itemLoadingSubscription.unsubscribe();
    if (this.notificationSubscription) this.notificationSubscription.unsubscribe();
    if (this.addressesSubscription) this.addressesSubscription.unsubscribe();
  }

loadGoogleMap() {

  if (!(window as any).google) {
    console.error('Google map not loaded');
    return;
  }

  this.geocoder = new google.maps.Geocoder();

  const mapDiv = document.getElementById('map');
  if (!mapDiv) {
    console.error('Map div not found');
    return;
  }

  this.map = new google.maps.Map(mapDiv, {
    center: { lat: 17.385044, lng: 78.486671 }, // Hyderabad default
    zoom: 12
  });

  this.marker = new google.maps.Marker({
    map: this.map,
    draggable: true
  });

  // click on map
  this.map.addListener('click', (event: any) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.setLocation(lat, lng);
  });

  // drag marker
  this.marker.addListener('dragend', (event: any) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.setLocation(lat, lng);
  });
}
onAddressInputChange() {

  const address = this.newAddress.mapSelectedAddress;
  if (!address) return;

  this.geocoder.geocode({ address: address }, (results: any, status: any) => {
    if (status === 'OK' && results[0]) {

      const location = results[0].geometry.location;
      const lat = location.lat();
      const lng = location.lng();

      this.setLocation(lat, lng);
    }
  });
}

setLocation(lat: number, lng: number) {

  if (!this.map || !this.marker) return;

  this.map.setCenter({ lat, lng });
  this.map.setZoom(15);

  this.marker.setPosition({ lat, lng });

  this.newAddress.latitude = lat;
  this.newAddress.longitude = lng;
  this.newAddress.useMapLocation = true;

  this.geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
    if (status === 'OK' && results[0]) {
      this.newAddress.mapSelectedAddress = results[0].formatted_address;
    }
  });
}
  //  Get empty address template
  private getEmptyAddress(): Address {
    return {
      fullName: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      addressType: 'HOME',
       latitude: 0,
    longitude: 0,
    useMapLocation: true,
    mapSelectedAddress: ''
    };
  }

  // Load user addresses
  private loadUserAddresses() {
    if (this.cartService.isLoggedIn()) {
      this.addressService.getUserAddresses().subscribe({
        next: (response) => {
          console.log('✅ Addresses loaded:', response);
        },
        error: (error) => {
          console.error('❌ Failed to load addresses:', error);
        }
      });
    }
  }

  private updateDebugInfo(message: string) {
    this.debugInfo = `${new Date().toLocaleTimeString()}: ${message}`;
    console.log('🔧 ' + message);
  }

  private showSuccessAlert(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorAlert(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  //  Refresh cart with better loading
  refreshCart() {
    console.log('🔄 Refreshing cart...');
    this.updateDebugInfo('Refreshing cart...');
    
    this.cartService.fetchCart().subscribe({
      next: () => {
        console.log('✅ Cart refresh completed');
        this.updateDebugInfo('Cart refresh completed');
      },
      error: (err) => {
        console.error('❌ Failed to fetch cart:', err);
        this.updateDebugInfo('Failed to fetch cart');
        this.showErrorAlert('Failed to load cart. Please try again.');
      }
    });
  }
   private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      '';

    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
// ===== FIND PHARMACIST =====
findPharmacist() {

  console.log('Find pharmacist clicked');
const headers = this.getAuthHeaders();
  // 🔴 Check address selected
   if (!this.selectedAddress || !this.selectedAddress.id) {
    console.error('Address not selected or invalid');
    return;
  }

  this.isPharmacistLoading = true;

  const payload = {
   addressId: this.selectedAddress.id,
    useCurrentLocation: true,
    latitude: 0.1,
    longitude: 0.1,
    serviceType: 'MEDICINE',
    description: 'Pharmacy booking request',
    radiusKm: 10
  };

  console.log('Payload:', payload);

  this.http.post<any>(`${API_URL1}/pharmacy-bookings/create`,payload,{ headers })
    .subscribe({

      next: (response) => {
        console.log('API Response:', response);

        this.isPharmacistLoading = false;

        // 🟢 Always open popup if API responds
        this.pharmacistsAvailable = response?.pharmacistsAvailable ?? false;
        this.popupMessage = response?.message || 'Unable to check pharmacist';
        this.showAddressModal = false;
        this.showPharmacistPopup = true;
      },

      error: (err) => {
        console.error('Pharmacist API error:', err);
        this.isPharmacistLoading = false;

        this.pharmacistsAvailable = false;
        this.popupMessage = 'Something went wrong. Please try again.';
        this.showPharmacistPopup = true;
      }

    });
    // this.showAddressModal = false;
}


// ===== CLOSE POPUP =====
closePopup() {
  this.showPharmacistPopup = false;
}


// ===== CONTINUE FROM POPUP =====
proceedFromPopup() {
  this.closePopup();
  this.onProceedToPayment();
}

  // Check what's in local storage
  checkLocalStorage() {
    const localCart = localStorage.getItem('localCart');
    console.log('💾 Local storage cart:', localCart);
    this.updateDebugInfo(`Local storage: ${localCart ? JSON.parse(localCart).length + ' items' : 'empty'}`);
    return localCart ? JSON.parse(localCart) : [];
  }

  //  Manual sync for debugging
  // manualSync() {
  //   console.log('🔄 Manual sync triggered');
  //   this.updateDebugInfo('Manual sync started');
    
  //   const localCart = this.checkLocalStorage();
  //   if (localCart.length > 0) {
  //     this.cartService.syncLocalCartToBackend().subscribe({
  //       next: (result) => {
  //         console.log('✅ Manual sync result:', result);
  //         this.updateDebugInfo(`Manual sync: ${result?.success ? 'success' : 'failed'}`);
  //         this.showSuccessAlert('Cart synced successfully!');
  //         this.refreshCart();
  //       },
  //       error: (error) => {
  //         console.error('❌ Manual sync error:', error);
  //         this.updateDebugInfo('Manual sync error');
  //         this.showErrorAlert('Failed to sync cart. Please try again.');
  //       }
  //     });
  //   } else {
  //     this.updateDebugInfo('No local items to sync');
  //     this.showErrorAlert('No local cart items to sync.');
  //   }
  // }

  // Manual sync with SMART MERGE logic
manualSync() {
  console.log('🔄 Manual sync triggered (SMART MERGE mode)');
  this.updateDebugInfo('Manual sync started (SMART MERGE mode)');
  
  const localCart = this.checkLocalStorage();
  
  if (localCart.length === 0) {
    this.updateDebugInfo('No local items to sync');
    this.showErrorAlert('No local cart items to sync.');
    return;
  }

  // User ko batayein kya hoga
  if (!confirm('This will SMART MERGE your local cart with backend cart:\n\n' +
               '• Same products: Higher quantity will be kept\n' + 
               '• New products: Will be added\n' +
               '• Existing backend products: Will remain as-is\n\n' +
               'Continue?')) {
    this.updateDebugInfo('Sync cancelled by user');
    return;
  }

  const syncPayload = {
    items: localCart.map((item: { id: any; count: any; productType: any; }) => ({
      medicineId: item.id,
      quantity: item.count,
      productType: item.productType || 'otc'
    }))
  };

  this.cartService.syncLocalCartSmartMerge(syncPayload).subscribe({
    next: (result: any) => {
      console.log('✅ Smart merge result:', result);
      this.updateDebugInfo(`Smart merge completed`);
      
      if (result?.status) {
        const data = result.data;
        const message = `Cart merged successfully!` +
          `\n• ${data.mergedCount} items already in cart` +
          `\n• ${data.addedCount} new items added` +
          `\n• ${data.updatedCount} items updated with higher quantities`;
        
        this.showSuccessAlert(message);
        
        // Local cart clear karein after successful sync
        localStorage.removeItem('localCart');
        console.log('🗑️ Local cart cleared after successful sync');
      } else {
        this.showErrorAlert('Merge completed with warnings.');
      }
      
      this.refreshCart();
    },
    error: (error) => {
      console.error('❌ Smart merge error:', error);
      this.updateDebugInfo('Smart merge error');
      this.showErrorAlert('Failed to merge cart. Please try again.');
    }
  });
}

//  Auth success handler with SMART MERGE
onAuthSuccess() {
  console.log('✅ Login successful! Starting SMART MERGE sync...');
  this.updateDebugInfo('Login successful, starting smart merge');
  
  const localCart = this.checkLocalStorage();
  console.log('🛒 Local cart before sync:', localCart);
  
  if (localCart.length === 0) {
    console.log('ℹ️ No local cart items to sync');
    this.updateDebugInfo('No local items to sync');
    this.showAuthPopup = false;
    this.refreshCart();
    this.loadUserAddresses();
    return;
  }
  
  this.isLoading = true;
  this.updateDebugInfo('Smart merging cart with backend...');
  
  const syncPayload = {
    items: localCart.map((item: { id: any; count: any; productType: any; }) => ({
      medicineId: item.id,
      quantity: item.count,
      productType: item.productType || 'otc'
    }))
  };

  this.cartService.syncLocalCartSmartMerge(syncPayload).subscribe({
    next: (result: any) => {
      console.log('✅ Smart merge completed:', result);
      this.updateDebugInfo(`Smart merge completed`);
      this.showAuthPopup = false;
      this.isLoading = false;
      
      if (result?.status) {
        const data = result.data;
        const message = `Cart merged! ${data.addedCount} new items added, ${data.updatedCount} quantities updated`;
        this.showSuccessAlert(message);
        
        // Local cart clear karein
        localStorage.removeItem('localCart');
      }
      
      this.loadUserAddresses();
      
      setTimeout(() => {
        this.refreshCart();
      }, 1500);
    },
    error: (error: any) => {
      console.error('❌ Smart merge failed:', error);
      this.updateDebugInfo('Smart merge failed');
      this.showAuthPopup = false;
      this.isLoading = false;
      this.showErrorAlert('Cart merge failed. Using local cart.');
      this.loadUserAddresses();
    }
  });
}

  //  Remove item with confirmation
  // removeItem(id: string) {
  //   const item = this.cart.find(item => item.id === id);
  //   if (!item) return;

   
  //   console.log('🗑️ Removing item from cart:', id);
  //   this.updateDebugInfo(`Removing item: ${id}`);
    
  //   this.cartService.removeItem(id).subscribe({
  //     next: () => {
  //       console.log('✅ Item removed successfully');
  //       this.updateDebugInfo('Item removed');
  //       this.showSuccessAlert('Item removed from cart');
  //     },
  //     error: (err) => {
  //       console.error('❌ Failed to remove item:', err);
  //       this.updateDebugInfo('Failed to remove item');
  //       this.showErrorAlert('Failed to remove item. Please try again.');
  //     }
  //   });
  // }
  //  Remove item with confirmation - UPDATED with better debugging
removeItem(id: string) {
  const item = this.cart.find(item => item.id === id);
  if (!item) return;

  console.log('🗑️ Removing item from cart:', {
    id: id,
    name: item.name,
    cartLength: this.cart.length
  });
  
  this.updateDebugInfo(`Removing item: ${item.name} (${id})`);
  
  // if (!confirm(`Remove "${item.name}" from cart?`)) {
  //   return;
  // }
  
  this.cartService.removeItem(id).subscribe({
    next: () => {
      console.log('✅ Item removed successfully');
      this.updateDebugInfo(`Removed: ${item.name}`);
      this.showSuccessAlert('Item removed from cart');
    },
    error: (err) => {
      console.error('❌ Failed to remove item:', err);
      this.updateDebugInfo(`Failed to remove: ${item.name}`);
      
      // Additional debugging
      console.log('🔧 Current cart state:', this.cart);
      console.log('🔧 Local storage cart:', this.checkLocalStorage());
      
      this.showErrorAlert('Failed to remove item from server, but removed locally.');
    }
  });
}

  //  Increase quantity with loading state
  increaseQty(item: CartItem) {
    if (this.isItemLoading(item.id)) return;

    console.log('➕ Increasing quantity for:', item.id);
    this.cartService.incrementQty(item.id).subscribe({
      next: () => {
        console.log('✅ Quantity increased');
        this.updateDebugInfo('Quantity increased');
      },
      error: (err) => {
        console.error('❌ Failed to increase quantity:', err);
        this.updateDebugInfo('Failed to increase quantity');
        this.showErrorAlert('Failed to increase quantity. Please try again.');
      }
    });
  }

  //  Decrease quantity with loading state
  decreaseQty(item: CartItem) {
    if (this.isItemLoading(item.id)) return;

    console.log('➖ Decreasing quantity for:', item.id);
    if (item.count > 1) {
      this.cartService.decrementQty(item.id).subscribe({
        next: () => {
          console.log('✅ Quantity decreased');
          this.updateDebugInfo('Quantity decreased');
        },
        error: (err) => {
          console.error('❌ Failed to decrease quantity:', err);
          this.updateDebugInfo('Failed to decrease quantity');
          this.showErrorAlert('Failed to decrease quantity. Please try again.');
        }
      });
    } else {
      this.removeItem(item.id);
    }
  }

  // Check if item is loading
  isItemLoading(itemId: string): boolean {
    return this.itemLoadingStates[itemId] || false;
  }

  //  Proceed to payment - Now opens address modal first
  onProceedToPayment() {
    console.log('💰 Proceed to payment clicked');
    this.updateDebugInfo('Proceed to payment clicked');
    
    const localItems = this.checkLocalStorage();
    console.log('🛒 Current cart items:', this.cart.length, 'Local items:', localItems.length);
    
    if (this.cart.length === 0 && localItems.length === 0) {
      this.showErrorAlert('Your cart is empty. Please add items before proceeding to payment.');
      return;
    }
    
    if (!this.cartService.isLoggedIn()) {
      console.log('🔐 Showing auth popup');
      this.updateDebugInfo('Showing auth popup');
      this.showAuthPopup = true;
      return;
    }
    
    //  Show address selection modal
    this.showAddressModal = true;
    console.log('🏠 Showing address modal');
  }

  //  NEW: Address selection handlers
  onSelectAddress(address: Address) {
    this.addressService.selectAddress(address);
    console.log('📍 Address selected:', address);
  }

  //  Add new address
  onAddNewAddress() {
    this.showNewAddressForm = true;
    this.newAddress = this.getEmptyAddress();
     // wait modal render then load map
  setTimeout(() => {
    this.loadGoogleMap();
  }, 400);
  }

  // Save new address
  onSaveNewAddress() {
    // if (!this.isValidAddress(this.newAddress)) {
    //   this.showErrorAlert('Please fill all required fields');
    //   return;
    // }
const addressRequest: AddressRequest = {
  ...this.newAddress,
  latitude: this.newAddress.latitude,
  longitude: this.newAddress.longitude,
  useMapLocation: true,
  mapSelectedAddress: this.newAddress.mapSelectedAddress
};
    this.addressService.addAddress(addressRequest).subscribe({
      next: (response) => {
        console.log('✅ New address saved:', response);
        this.showSuccessAlert('Address added successfully!');
        this.showNewAddressForm = false;
        this.newAddress = this.getEmptyAddress();
      },
      error: (error) => {
        console.error('❌ Failed to save address:', error);
        this.showErrorAlert('Failed to save address. Please try again.');
      }
    });
  }

  //  Validate address
  private isValidAddress(address: Address): boolean {
    return !!(address.fullName && 
              address.phoneNumber && 
              address.addressLine1 && 
              address.city && 
              address.state && 
              address.pincode);
  }

  //  Cancel new address form
  onCancelNewAddress() {
    this.showNewAddressForm = false;
    this.newAddress = this.getEmptyAddress();
  }

  // Proceed with selected address - Now shows payment method modal
  onProceedWithAddress() {
    if (!this.selectedAddress) {
      this.showErrorAlert('Please select a delivery address');
      return;
    }

    console.log('✅ Proceeding with address:', this.selectedAddress);
    this.showAddressModal = false;
    
    //  Show payment method selection modal
    this.showPaymentMethodModal = true;
    console.log('💳 Showing payment method modal');
  }

  //  Select payment method with type safety
  onSelectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod = method;
    console.log('💳 Payment method selected:', method);
  }

  // //  Confirm payment method and proceed
  // onConfirmPaymentMethod() {
  //   if (!this.selectedPaymentMethod) {
  //     this.showErrorAlert('Please select a payment method');
  //     return;
  //   }

  //   console.log('✅ Confirming payment method:', this.selectedPaymentMethod);
  //   this.showPaymentMethodModal = false;
    
  //   // Now create order and process payment based on selected method
  //   this.createOrderAndProcessPayment();
  // }
onConfirmPaymentMethod() {
  if (!this.selectedPaymentMethod) {
    this.showErrorAlert('Please select a payment method');
    return;
  }

  console.log('✅ Confirming payment method:', this.selectedPaymentMethod);

  if (this.selectedPaymentMethod === 'ONLINE') {
    // Step 1: open Razorpay first
    this.startOnlinePaymentBeforeCreatingOrder();
  } else {
    // Step 2: COD path, create order directly
    this.createOrderAndProcessPayment();
  }
}
  // Cancel payment method selection
  onCancelPaymentMethod() {
    this.showPaymentMethodModal = false;
    console.log('❌ Payment method selection cancelled');
  }
private async startOnlinePaymentBeforeCreatingOrder() {
  if (!this.selectedAddress) {
    this.showErrorAlert('Please select a delivery address');
    return;
  }

  if (!this.razorpayKeyId) {
    this.showErrorAlert('Razorpay Key ID is missing.');
    return;
  }

  const amountInINR = this.getPayableAmount();
  if (!(amountInINR > 0)) {
    this.showErrorAlert('Invalid amount. Please check your order.');
    return;
  }

  try {
    console.log('💳 Starting Razorpay payment for amount:', amountInINR);
    this.isPaymentLoading = true;
    await this.loadRazorpaySdk();

    const userProfile = localStorage.getItem('userProfile');
    const profile = userProfile ? JSON.parse(userProfile) : {};
    const userName = profile?.name || '';
    const userEmail = profile?.email || '';

    const options: any = {
      key: this.razorpayKeyId,
      amount: Math.round(amountInINR * 100),
      currency: 'INR',
      name: 'Vitoxyz',
      description: 'Order payment',
      prefill: {
        name: userName,
        email: userEmail,
        contact: this.selectedAddress?.phoneNumber || ''
      },
      theme: { color: '#0d6efd' },
      handler: (razorpayResponse: any) => {
        console.log('✅ Payment success:', razorpayResponse);
        this.isPaymentLoading = false;
        // Step 2: Create order after payment
        this.createOrderAfterSuccessfulPayment(razorpayResponse, amountInINR);
      },
      modal: {
        ondismiss: () => {
          console.log('❌ Payment modal dismissed');
          this.isPaymentLoading = false;
          this.showErrorAlert('Payment was cancelled.');
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (resp: any) => {
      console.error('❌ Payment failed:', resp);
      this.isPaymentLoading = false;
      const msg = resp?.error?.description || 'Payment failed. Please try again.';
      this.showErrorAlert(msg);
    });
    rzp.open();
  } catch (err) {
    console.error('Payment init error:', err);
    this.isPaymentLoading = false;
    this.showErrorAlert('Unable to start payment. Please try again.');
  }
}

// Step 2: Create order after successful payment
private createOrderAfterSuccessfulPayment(razorpayResponse: any, paidAmount: number) {
  if (!razorpayResponse?.razorpay_payment_id) {
    this.showErrorAlert('Invalid payment response. Please contact support.');
    return;
  }

  if (!this.selectedAddress) {
    this.showErrorAlert('No address selected');
    return;
  }

  const orderData: any = {
    paymentMethod: this.selectedPaymentMethod,
    shippingAddress: {
      fullName: this.selectedAddress.fullName,
      phoneNumber: this.selectedAddress.phoneNumber,
      addressLine1: this.selectedAddress.addressLine1,
      addressLine2: this.selectedAddress.addressLine2 || '',
      landmark: this.selectedAddress.landmark || '',
      city: this.selectedAddress.city,
      state: this.selectedAddress.state,
      pincode: this.selectedAddress.pincode,
      addressType: this.selectedAddress.addressType
    },
    paymentDetails: {
      provider: 'RAZORPAY',
      paymentId: razorpayResponse.razorpay_payment_id,
      orderId: razorpayResponse.razorpay_order_id || null,
      signature: razorpayResponse.razorpay_signature || null,
      amount: paidAmount
    }
  };

  console.log('📦 Creating order after payment:', orderData);
  this.isLoading = true;

  this.orderService.createOrder(orderData).subscribe({
    next: (response) => {
      this.isLoading = false;
      console.log('✅ Order created after payment:', response);

      if (response.status && response.data) {
        this.showSuccessAlert(`Payment successful! Order #${response.data.orderNumber} placed.`);
        this.cartService.clearCart().subscribe({
          next: () => {
            console.log('🛒 Cart cleared');
            setTimeout(() => this.router.navigate(['/orders']), 1500);
          },
          error: (err) => {
            console.error('❌ Cart clear failed:', err);
            this.router.navigate(['/orders']);
          }
        });
      } else {
        this.showErrorAlert('Payment succeeded but order creation failed. Please contact support.');
      }
    },
    error: (err) => {
      this.isLoading = false;
      console.error('❌ API error after payment:', err);
      this.showErrorAlert('Payment succeeded but order creation failed. Please contact support.');
    }
  });
}
  // Create order and then process payment with better error handling
  private createOrderAndProcessPayment() {
    if (!this.selectedAddress) {
      this.showErrorAlert('No address selected');
      return;
    }

    // Check authentication before creating order
    if (!this.orderService.isAuthenticated()) {
      this.showErrorAlert('Please login to create order');
      return;
    }

    console.log('🔄 Creating order...');
    this.isLoading = true;

    const orderData: CreateOrderRequest = {
      paymentMethod: this.selectedPaymentMethod, 
      shippingAddress: {
        fullName: this.selectedAddress.fullName,
        phoneNumber: this.selectedAddress.phoneNumber,
        addressLine1: this.selectedAddress.addressLine1,
        addressLine2: this.selectedAddress.addressLine2 || '',
        landmark: this.selectedAddress.landmark || '',
        city: this.selectedAddress.city,
        state: this.selectedAddress.state,
        pincode: this.selectedAddress.pincode,
        addressType: this.selectedAddress.addressType
      },
      specialInstructions: ''
    };

    console.log('📦 Order data being sent:', orderData);

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('✅ Order creation API response:', response);
        this.isLoading = false;
        
        if (response.status && response.data) {
          this.showSuccessAlert('Order created successfully!');
          
          // Process payment based on selected method
          if (this.selectedPaymentMethod === 'ONLINE') {
            // Online payment - show Razorpay
            setTimeout(() => {
              this.processOnlinePayment(response.data);
            }, 1000);
          } else {
            // Cash on Delivery - order is already placed
            this.handleCashOnDeliverySuccess(response.data);
          }
        } else {
          console.error('❌ Order creation failed in API response:', response);
          this.showErrorAlert('Failed to create order. Please try again.');
        }
      },
      error: (error) => {
        console.error('❌ Order creation API error:', error);
        this.isLoading = false;
        
        if (error.status === 401) {
          this.showErrorAlert('Session expired. Please login again.');
          localStorage.removeItem('authToken');
        } else if (error.status === 400) {
          this.showErrorAlert('Invalid order data. Please check your cart.');
        } else {
          this.showErrorAlert('Failed to create order. Please try again.');
        }
      }
    });
  }

  //  Process online payment
  private async processOnlinePayment(orderData: any) {
    try {
      if (!this.razorpayKeyId) {
        this.showErrorAlert('Razorpay Key ID is missing.');
        return;
      }

      const amountInINR = orderData.finalAmount || this.getPayableAmount();
      if (!(amountInINR > 0)) {
        this.showErrorAlert('Invalid amount. Please check your order.');
        return;
      }

      console.log('💳 Starting online payment process for order:', orderData.orderNumber, 'amount:', amountInINR);
      this.isPaymentLoading = true;
      await this.loadRazorpaySdk();

      const userProfile = localStorage.getItem('userProfile');
      let userName = '';
      let userEmail = '';

      if (userProfile) {
        const profile = JSON.parse(userProfile);
        userName = profile.name || '';
        userEmail = profile.email || '';
      }

      const options: any = {
        key: this.razorpayKeyId,
        amount: Math.round(amountInINR * 100),
        currency: 'INR',
        name: 'Vitoxyz',
        description: `Order #${orderData.orderNumber}`,
        prefill: {
          name: userName,
          email: userEmail,
          contact: this.selectedAddress?.phoneNumber || ''
        },
        theme: { color: '#0d6efd' },
        handler: (response: any) => {
          this.onOnlinePaymentSuccess(response, amountInINR, orderData);

        },
        modal: {
          ondismiss: () => {
            console.log('❌ Payment modal dismissed');
            this.isPaymentLoading = false;
            this.showErrorAlert('Payment was cancelled. Your order is still created with Cash on Delivery.');
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (resp: any) => this.onOnlinePaymentFailed(resp, orderData));
      rzp.open();

    } catch (err) {
      console.error('Payment init error:', err);
      this.showErrorAlert('Unable to start payment. Please try again.');
      this.isPaymentLoading = false;
    }
  }

  //  Handle Cash on Delivery success
  private handleCashOnDeliverySuccess(orderData: any) {
    console.log('✅ Cash on Delivery order placed successfully:', orderData);
    this.showSuccessAlert(`Order #${orderData.orderNumber} placed successfully! You will pay ₹${orderData.finalAmount} on delivery.`);
    
    // Clear cart after successful order
    this.cartService.clearCart().subscribe({
      next: () => {
        console.log('🛒 Cart cleared after COD order');
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Failed to clear cart after COD order:', err);
        this.router.navigate(['/orders']);
      }
    });
  }

  // ED: Online payment success handler
  private onOnlinePaymentSuccess(response: any, amountInINR: number, orderData: any) {
    console.log('✅ Online payment success:', response);
    console.log('✅ Order details:', orderData);
    this.isPaymentLoading = false;
    
    this.showSuccessAlert(`Payment successful! Order #${orderData.orderNumber} has been placed.`);
      // this.createOrderAndProcessPayment();
    // Clear cart after successful payment
    this.cartService.clearCart().subscribe({
      next: () => {
        console.log('🛒 Cart cleared after successful payment');
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Failed to clear cart after payment:', err);
        this.router.navigate(['/orders']);
      }
    });
  }

  //  Online payment failed handler
  private onOnlinePaymentFailed(resp: any, orderData: any) {
    console.error('❌ Online payment failed:', resp);
    console.error('❌ Order:', orderData);
    this.isPaymentLoading = false;
    
    const msg = resp?.error?.description || 'Payment failed. Please try again.';
    this.showErrorAlert(`${msg} Your order is still created with Cash on Delivery.`);
  }

  private loadRazorpaySdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
      document.body.appendChild(script);
    });
  }

  // ✅ Auth success handler (updated)
  // onAuthSuccess() {
  //   console.log('✅ Login successful! Starting cart sync...');
  //   this.updateDebugInfo('Login successful, starting sync');
    
  //   const localCart = this.checkLocalStorage();
  //   console.log('🛒 Local cart before sync:', localCart);
    
  //   if (localCart.length === 0) {
  //     console.log('ℹ️ No local cart items to sync');
  //     this.updateDebugInfo('No local items to sync');
  //     this.showAuthPopup = false;
  //     this.refreshCart();
  //     this.loadUserAddresses();
  //     return;
  //   }
    
  //   this.isLoading = true;
  //   this.updateDebugInfo('Syncing cart to backend...');
    
  //   this.cartService.syncLocalCartToBackend().subscribe({
  //     next: (result: any) => {
  //       console.log('✅ Cart sync completed:', result);
  //       this.updateDebugInfo(`Sync completed: ${result?.message}`);
  //       this.showAuthPopup = false;
  //       this.isLoading = false;
        
  //       if (result?.success) {
  //         this.showSuccessAlert('Cart synced successfully!');
  //       }
        
  //       this.loadUserAddresses();
        
  //       setTimeout(() => {
  //         console.log('🔄 Refreshing cart after sync...');
  //         this.updateDebugInfo('Refreshing after sync');
  //         this.refreshCart();
  //       }, 1500);
  //     },
  //     error: (error: any) => {
  //       console.error('❌ Cart sync failed:', error);
  //       this.updateDebugInfo('Sync failed');
  //       this.showAuthPopup = false;
  //       this.isLoading = false;
  //       this.showErrorAlert('Cart sync failed. Please try again.');
  //       this.loadUserAddresses();
  //     }
  //   });
  // }

  onAuthClose() {
    console.log('❌ Auth popup closed');
    this.updateDebugInfo('Auth popup closed');
    this.showAuthPopup = false;
  }

  // Cart calculation methods
  getDiscount(item: CartItem): number {
    if (item.mrp && item.mrp > item.price) {
      return Math.round(((item.mrp - item.price) / item.mrp) * 100);
    }
    return 0;
  }

  // getItemTotal(): number {
  //   return this.cart.reduce((sum, i) => sum + (i.price * i.count), 0);
  // }

getItemTotal(): number {
  console.log("Cart data:", this.cart);

  if (!this.cart || !Array.isArray(this.cart)) {
    return 0;
  }

  return this.cart.reduce((sum, item) => {
    const mrp = Number(item.mrp) || 0;
    const count = Number(item.count) || 0;
    return sum + mrp * count;
  }, 0);
}


  getTotalDiscount(): number {
    return this.cart.reduce((sum, i) => sum + ((i.mrp ? i.mrp - i.price : 0) * i.count), 0);
  }

  getFinalAmount(): number {
    return this.getItemTotal() + this.shippingFee;
  }

  getPayableAmount(): number {
    return this.getFinalAmount();
  }

  getTotalSavings(): number {
    return this.getTotalDiscount();
  }

  isCartEmpty(): boolean {
    return this.cart.length === 0;
  }

  getTotalItemsCount(): number {
    return this.cart.reduce((total, item) => total + item.count, 0);
  }

  continueShopping() {
    this.router.navigate(['/medicines']);
  }

  clearCart() {
    if (this.cart.length === 0) {
      this.showErrorAlert('Cart is already empty.');
      return;
    }

    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    this.cartService.clearCart().subscribe({
      next: () => {
        this.showSuccessAlert('Cart cleared successfully!');
        this.refreshCart();
      },
      error: (err) => {
        console.error('❌ Failed to clear cart:', err);
        this.showErrorAlert('Failed to clear cart. Please try again.');
      }
    });
  }



  // : Edit address
  onEditAddress(address: Address) {
    this.isEditingAddress = true;
    this.editingAddress = { ...address }; // Create a copy for editing
    console.log('✏️ Editing address:', address);
  }

  // Update address
  onUpdateAddress() {
    if (!this.isValidAddress(this.editingAddress)) {
      this.showErrorAlert('Please fill all required fields');
      return;
    }

    if (!this.editingAddress.id) {
      this.showErrorAlert('Invalid address ID');
      return;
    }

    const addressRequest: AddressRequest = {
      fullName: this.editingAddress.fullName,
      phoneNumber: this.editingAddress.phoneNumber,
      addressLine1: this.editingAddress.addressLine1,
      addressLine2: this.editingAddress.addressLine2 || '',
      landmark: this.editingAddress.landmark || '',
      city: this.editingAddress.city,
      state: this.editingAddress.state,
      pincode: this.editingAddress.pincode,
      addressType: this.editingAddress.addressType,
      isDefault: this.editingAddress.isDefault || false,
      latitude: this.editingAddress.latitude,
  longitude: this.editingAddress.longitude,
  useMapLocation: true,
  mapSelectedAddress: this.editingAddress.mapSelectedAddress

    };

    this.addressService.updateAddress(this.editingAddress.id, addressRequest).subscribe({
      next: (response) => {
        console.log('✅ Address updated:', response);
        this.showSuccessAlert('Address updated successfully!');
        this.isEditingAddress = false;
        this.editingAddress = this.getEmptyAddress();
      },
      error: (error) => {
        console.error('❌ Failed to update address:', error);
        this.showErrorAlert('Failed to update address. Please try again.');
      }
    });
  }

  //  Delete address
  onDeleteAddress(address: Address) {
    if (address.isDefault) {
      this.showErrorAlert('Cannot delete default address. Set another address as default first.');
      return;
    }

    if (!confirm(`Are you sure you want to delete this address?\n${address.fullName}, ${address.city}`)) {
      return;
    }

    if (!address.id) {
      this.showErrorAlert('Invalid address ID');
      return;
    }

    this.addressService.deleteAddress(address.id).subscribe({
      next: (response) => {
        console.log('✅ Address deleted:', response);
        this.showSuccessAlert('Address deleted successfully!');
        
        // If deleted address was selected, clear selection
        if (this.selectedAddress?.id === address.id) {
          this.selectedAddress = null;
        }
      },
      error: (error) => {
        console.error('❌ Failed to delete address:', error);
        this.showErrorAlert('Failed to delete address. Please try again.');
      }
    });
  }

  //  Cancel edit
  onCancelEdit() {
    this.isEditingAddress = false;
    this.editingAddress = this.getEmptyAddress();
  }

  //  Close address modal (updated)
  onCloseAddressModal() {
    this.showAddressModal = false;
    this.showNewAddressForm = false;
    this.isEditingAddress = false;
    this.newAddress = this.getEmptyAddress();
    this.editingAddress = this.getEmptyAddress();
  }

  //  Cancel new address (reset forms)
  // onCancelNewAddress() {
  //   this.showNewAddressForm = false;
  //   this.isEditingAddress = false;
  //   this.newAddress = this.getEmptyAddress();
  //   this.editingAddress = this.getEmptyAddress();
  // }
}
