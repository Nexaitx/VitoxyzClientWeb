// import { Component, inject, OnInit } from "@angular/core";
// import { ActivatedRoute } from "@angular/router";
// import { Footer } from "../../footer/footer";
// import { Header } from "../header/header";
// import { HttpClient } from "@angular/common/http";
// import { CommonModule } from "@angular/common";
// import { FormsModule } from "@angular/forms";
// import { API_URL, ENDPOINTS } from "@src/app/core/const";
// import { CartItem, CartService } from "@src/app/core/cart.service";

// @Component({
//   selector: "app-view-medicine",
//   imports: [CommonModule, FormsModule, Footer, Header],
//   standalone: true,
//   templateUrl: "./view-medicine.html",
//   styleUrls: ["./view-medicine.scss"],
// })
// export class ViewMedicine implements OnInit {
//   private http: HttpClient = inject(HttpClient);
//    private cartService = inject(CartService);
//   isLoaded = false;
//   hasError = false;
//   medicine: any;
//   selectedImage!: string;
//   selectedQty!: string;

//   constructor(private route: ActivatedRoute) {}

//   ngOnInit() {
//     const id = this.route.snapshot.paramMap.get("id");
//     console.log("Medicine ID:", id);

//     this.http.get<any>(`${API_URL}${ENDPOINTS.MEDICINE_BY_ID(id!)}`).subscribe({
//       next: (res) => {
//         if (res && res.status && res.data) {
//           const data = res.data;

//           // -----------------------------
//           // FIX: Split pipe-separated image string into array
//           let images: string[] = [];

//           if (
//             data.imageUrls &&
//             data.imageUrls.length > 0 &&
//             data.imageUrls[0]
//           ) {
//             images = data.imageUrls[0]
//               .split("|")
//               .map((img: string) => img.trim());
//           }

//           this.medicine = {
//             id: data.productId,
//             name: data.productName,
//             manufacturer: data.marketer,
//             rating: 4.5,
//             reviewsCount: 0,
//             reviewTextCount: 0,
//             highlights: [
//               data.primaryUse,
//               data.saltComposition,
//               data.productForm,
//               data.medicineType,
//             ].filter(Boolean),
//             price: data.mrp,
//             mrp: data.mrp,
//             discount: 0,
//             packSizes: [data.packagingDetail || "1 Pack"],
//             images: images,
//             deliveryTime: "2 days delivery",
//             description: data.description,
//             introduction: data.introduction,
//             howToUse: data.howToUse,
//             safetyAdvise: data.safetyAdvise,
//             commonSideEffect: data.commonSideEffect,
//             storage: data.storage,
//           };

//           // Initialize selected image and quantity
//           this.selectedImage = images[0] || "";
//           this.selectedQty = this.medicine.packSizes[0];

//           console.log("Processed images:", this.medicine.images);

//           this.isLoaded = true;
//         } else {
//           this.hasError = true;
//         }
//       },
//       error: (err) => {
//         console.error("Error fetching medicine:", err);
//         this.hasError = true;
//       },
//     });
//   }
//   //   addToCart() {
//   //   const cartItem = {
//   //     id: this.medicine.productId,
//   //     name: this.medicine.productName,
//   //     price: this.medicine.mrp,
//   //     qty: this.selectedQty,
//   //     image: this.medicine.imageUrls?.[0] || 'assets/img/default.png'
//   //   };
//   //   this.cartService.addItem(cartItem);
//   //   alert(`${this.medicine.productName} added to cart!`);
//   // }
//  addToCart() {
  
//   if (!this.medicine) return;

//   const cartItem: Partial<CartItem> = {
//     id: this.medicine.id,
//     name: this.medicine.name,
//     price: Number(this.medicine.price ?? this.medicine.mrp ?? 0),
//     mrp: Number(this.medicine.mrp ?? this.medicine.price ?? 0),
//     qty: this.selectedQty,
//     image: (this.medicine.images && this.medicine.images[0]) || 'assets/img/default.png',
//     count: 1
//   };

//   this.cartService.addItem(cartItem);
//   alert(`${cartItem.name} added to cart!`);
// }
// }




import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Footer } from "../../footer/footer";
import { Header } from "../header/header";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { API_URL, ENDPOINTS } from "@src/app/core/const";
import { CartItem, CartService } from "@src/app/core/cart.service";

@Component({
  selector: "app-view-medicine",
  imports: [CommonModule, FormsModule, Footer, Header],
  standalone: true,
  templateUrl: "./view-medicine.html",
  styleUrls: ["./view-medicine.scss"],
})
export class ViewMedicine implements OnInit {
  private http: HttpClient = inject(HttpClient);
  private cartService = inject(CartService);

  isLoaded = false;
  hasError = false;

  medicine: any;
  product:any;
  selectedImage!: string;
  selectedQty!: string;


    medicineType: string | null = null;

  constructor(private route: ActivatedRoute) {}

 ngOnInit() {
  const id = this.route.snapshot.paramMap.get("id");
  this.medicineType = this.route.snapshot.queryParamMap.get("type"); 

  if (id) {
    console.log("this.medicineType",this.medicineType);
    
    if (this.medicineType === "otc") {
      this.getOTCMedicineById(id);
    } else {
     
      this.getMedicineById(id);
    }
  } else {
    this.hasError = true; 
  }
}


  private getMedicineById(id: string) {
        console.log("id234",id);

    this.http.get<any>(`${API_URL}${ENDPOINTS.MEDICINE_BY_ID(id)}`).subscribe({
      next: (res) => {
        if (res && res.status && res.data) {
          const data = res.data;

          let images: string[] = [];
          if (data.imageUrls && data.imageUrls.length > 0 && data.imageUrls[0]) {
            images = data.imageUrls[0].split("|").map((img: string) => img.trim());
          }

          this.medicine = {
            id: data.productId,
            name: data.productName,
            manufacturer: data.marketer,
            rating: 4.5,
            reviewsCount: 0,
            reviewTextCount: 0,
            highlights: [
              data.primaryUse,
              data.saltComposition,
              data.productForm,
              data.medicineType,
            ].filter(Boolean),
            price: data.mrp,
            mrp: data.mrp,
            discount: 0,
            packSizes: [data.packagingDetail || "1 Pack"],
            images: images,
            deliveryTime: "2 days delivery",
            description: data.description,
            introduction: data.introduction,
            howToUse: data.howToUse,
            safetyAdvise: data.safetyAdvise,
            commonSideEffect: data.commonSideEffect,
            storage: data.storage,
          };

          this.selectedImage = images[0] || "";
          this.selectedQty = this.medicine.packSizes[0];
          this.isLoaded = true;
        } else {
          this.hasError = true;
        }
      },
      error: (err) => {
        console.error("Error fetching medicine:", err);
        this.hasError = true;
      },
    });
  }

 
  private getOTCMedicineById(id: string) {
    console.log("id",id);
    
    this.http.get<any>(`${API_URL}${ENDPOINTS.OTC_MEDICINE_BY_ID(id)}`).subscribe({
      next: (res) => {
        if (res && res.status && res.data) {
                    console.log("datasdf",res);

          const data = res.data;
          console.log("data",data);
          
           let images: string[] = [];
          if (data.imageUrls && data.imageUrls.length > 0 && data.imageUrls[0]) {
            images = data.imageUrls[0].split("|").map((img: string) => img.trim());
          }

          this.product = {
            id: data.id,
            name: data.name,
            manufacturer: data.manufacturers,
            rating: 4.2,
            reviewsCount: 0,
            reviewTextCount: 0,
            highlights: [data.productHighlights, data.productForm, data.type].filter(Boolean),
            price: data.mrp,
            mrp: data.mrp,
            discount: 0,
            packSizes: [data.packageInfo || "1 Pack"],
            images: images,
            deliveryTime: "3 days delivery",
            description: data.information,
            introduction: data.information,
            howToUse: data.directionsForUse,
            safetyAdvise: data.safetyInformation,
            commonSideEffect: "",
            storage: "",
          };

                    this.selectedImage = images[0] || "";

          // this.selectedImage = this.product.images[0] || "";
          this.selectedQty = this.product.packSizes[0];
          this.isLoaded = true;
        } else {
          this.hasError = true;
        }
      },
      error: (err) => {
        console.error("Error fetching OTC medicine:", err);
        this.hasError = true;
      },
    });
  }

 
  addToCart() {
    if (!this.medicine) return;

    const cartItem: Partial<CartItem> = {
      id: this.medicine.id,
      name: this.medicine.name,
      price: Number(this.medicine.price ?? this.medicine.mrp ?? 0),
      mrp: Number(this.medicine.mrp ?? this.medicine.price ?? 0),
      qty: this.selectedQty,
      image: (this.medicine.images && this.medicine.images[0]) || "assets/img/default.png",
      count: 1,
    };

    this.cartService.addItem(cartItem);
    alert(`${cartItem.name} added to cart!`);
  }
  addToCarOtc() {
    if (!this.product) return;

    const cartItem: Partial<CartItem> = {
      id: this.product.id,
      name: this.product.name,
      price: Number(this.product.price ?? this.product.mrp ?? 0),
      mrp: Number(this.product.mrp ?? this.product.price ?? 0),
      qty: this.selectedQty,
      image: (this.product.images && this.product.images[0]) || "assets/img/default.png",
      count: 1,
    };

    this.cartService.addItem(cartItem);
    alert(`${cartItem.name} added to cart!`);
  }
}


