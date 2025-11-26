import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { API_URL } from '@src/app/core/const';
import { Footer } from "../../footer/footer";
import { CartService } from '@src/app/core/cart.service';
import { MatCard, MatCardContent } from "@angular/material/card";
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [CommonModule, Footer, MatCard, MatCardContent, MobileFooterNavComponent],
  templateUrl: './search-result.html',
  styleUrls: ['./search-result.scss']
})
export class SearchResultComponent implements OnInit {
  medicines: any[] = [];
  query: string = '';
  loading = true;

 quantities: { [key: string]: number } = {};
  addedProducts = new Set<number | string>();
  addingProducts = new Set<number | string>();
  loadingStates: { [key: string]: boolean } = {};
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  endpoint = 'otc'; // default for productType
 
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router , private cartService: CartService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) {
        this.fetchResults(this.query);
      }
    });
  }

  fetchResults(query: string) {
    this.loading = true;
    const url = `${API_URL}/search/quick-fast?q=${query}&type=combined&page=0&size=20`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        // this.medicines = res?.data?.medicines || [];
        const data = res?.data || {};
        this.medicines = data.medicines?.length ? data.medicines : data.products || [];
        this.loading = false;
          // initialize quantity state
        this.medicines.forEach(med => {
          const id = (med.id ?? med.productId)?.toString();
          if (id && !(id in this.quantities)) {
            this.quantities[id] = 0;
          }
        });
      },
      error: (err) => {
        console.error('Search error:', err);
        this.loading = false;
      }
    });
  }
addToCart(product: any, event: Event) {
    event.stopPropagation();
    
    const productId = product.id ?? product.productId;
    if (!productId) {
      console.error('Cannot add to cart: Product ID missing', product);
      this.showCustomToast('Failed to add product to cart', 'error');
      return;
    }

    this.addingProducts.add(productId);
    this.quantities[productId] = 1;

    const cartItem = {
      id: productId.toString(),
      name: product.name,
      price: product.mrp,
      mrp: product.mrpOld || product.mrp,
      image: this.getFirstImage(product.imageUrl),
      qty: product.packaging || '1',
      count: 1,
      productType: this.endpoint.includes('otc') ? 'otc' : 'otc',
    };
console.log("cartItem my one", cartItem.id);
    // ✅ Add to local cart
    this.cartService.addToLocalCart(cartItem);

    this.showCustomToast(`${product.name} added to cart successfully!`);

    // Update UI states
    this.addingProducts.delete(productId);
    this.addedProducts.add(productId);

    // ✅ Optional: Sync to backend if logged in
    if (this.cartService.isLoggedIn()) {
      this.cartService
        .addItem({
          medicineId: productId.toString(),
          quantity: 1,
          productType: this.endpoint.includes('otc') ? 'otc' : 'otc',
        })
        .subscribe({
          next: () => console.log('Item synced with backend'),
          error: (err: any) => console.error('Failed to sync with backend:', err)
        });
    }

    // Reset "added" visual state
    setTimeout(() => {
      this.addedProducts.delete(productId);
    }, 2000);
  }

  increment(product: any) {
    const productId = (product.id ?? product.productId).toString();
    this.quantities[productId] = (this.quantities[productId] || 0) + 1;
    //  this.cartService.updateQuantity(productId, this.quantities[productId]);
    console.log(
      `Incremented quantity for product ${productId}: ${this.quantities[productId]}`
    );
  }

  decrement(product: any) {
    const productId = (product.id ?? product.productId).toString();
    const current = this.quantities[productId] || 0;
    if (current > 1) {
      this.quantities[productId] = current - 1;
      //  this.cartService.updateQuantity(productId, this.quantities[productId]);
      console.log(
        `Decremented quantity for product ${productId}: ${this.quantities[productId]}`
      );
    } else {
      this.quantities[productId] = 0;
       this.cartService.removeFromLocalCart(productId);
      console.log(`Removed product ${productId} from cart`);
    }
  }

  private showCustomToast(
    message: string,
    type: 'success' | 'error' = 'success'
  ) {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  isLoading(productId: string): boolean {
    return this.loadingStates[productId] || false;
  }
  // ✅ navigate to detail
  goToMedicine(med: any) {
     const id = med.productId || med.id;
    this.router.navigate([`/medicine/${id}`], {
      queryParams: { type: med.type || 'otc' }
    });
  }

  // getFirstImage(images: string[]): string {
  //   if (!images || images.length === 0) return 'assets/img/default.avif';
  //     if (Array.isArray(imageUrl)) return imageUrl[0]?.split('|')[0].trim();
  //   return images[0].split('|')[0].trim();
  // }
    getFirstImage(imageUrl: string | string[]): string {
    // if (!imageUrl) return 'assets/default.avif';
    // if (Array.isArray(imageUrl)) return imageUrl[0]?.split('|')[0].trim();
    if (!imageUrl || imageUrl.length === 0) return 'assets/default.avif';
    return imageUrl[0].split('|')[0].trim();
  }
}
