import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_URL } from '@src/app/core/const';
import { MapComponent } from '@src/app/pages/book-staff-process/map/map';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
declare var google: any;
@Component({
  selector: 'app-add-address',
  imports: [
        CommonModule,
    FormsModule,
    MapComponent,
  ],
  templateUrl: './add-address.html',
  styleUrl: './add-address.scss',
})
export class AddAddress implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
@ViewChild('mapSearch') mapSearch!: ElementRef;
  map: any;
marker: any;
geocoder: any;
private addressSearch$ = new Subject<string>();
@ViewChild(MapComponent) mapComponent!: MapComponent;

address: any = {
    fullName: '',
    phone: '',
    pincode: '',
    state: '',
    city: '',
    house: '',
    area: '',
    type: 'Home',
    latitude: null,
  longitude: null,
  useMapLocation: true,
  mapSelectedAddress: ''
  };

  constructor(private router: Router,  private http: HttpClient) {}
//   ngAfterViewInit() {
//   this.loadGoogleMap();
// }
ngOnInit() {
    this.getUserLocation();
     this.addressSearch$
.pipe(
  debounceTime(1000),        // 1 request per second
  distinctUntilChanged()
)
.subscribe(address => {
  this.searchAddressAndMoveMap(address);
});
}
// loadGoogleMap() {

//   if (!(window as any).google) {
//     console.error('Google map not loaded');
//     return;
//   }

//   this.geocoder = new google.maps.Geocoder();

//   const mapDiv = document.getElementById('map');
//   if (!mapDiv) {
//     console.error('Map div not found');
//     return;
//   }

//   this.map = new google.maps.Map(mapDiv, {
//     center: { lat: 17.385044, lng: 78.486671 }, // Hyderabad default
//     zoom: 10
//   });

//   this.marker = new google.maps.Marker({
//     map: this.map,
//     draggable: true
//   });

//   // click on map
//   this.map.addListener('click', (event: any) => {
//     const lat = event.latLng.lat();
//     const lng = event.latLng.lng();
//     this.setLocation(lat, lng);
//   });

//   // drag marker
//   this.marker.addListener('dragend', (event: any) => {
//     const lat = event.latLng.lat();
//     const lng = event.latLng.lng();
//     this.setLocation(lat, lng);
//   });
//   setTimeout(() => {
//   google.maps.event.trigger(this.map, 'resize');
// }, 300);
// }
// onAddressInputChange() {

//   const address = this.address.mapSelectedAddress;
//   if (!address) return;

//   this.geocoder.geocode({ address: address }, (results: any, status: any) => {
//     if (status === 'OK' && results[0]) {

//       const location = results[0].geometry.location;
//       const lat = location.lat();
//       const lng = location.lng();

//       this.setLocation(lat, lng);
//     }
//   });
// }

setLocation(lat: number, lng: number) {

  if (!this.map || !this.marker) return;

  this.map.setCenter({ lat, lng });
  this.map.setZoom(15);

  this.marker.setPosition({ lat, lng });

  this.address.latitude = lat;
  this.address.longitude = lng;
  this.address.useMapLocation = true;

  this.geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
    if (status === 'OK' && results[0]) {
      this.address.mapSelectedAddress = results[0].formatted_address;
    }
  });
}
onAddressInputChange(value: string) {
  this.addressSearch$.next(value);
}
  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.getAddressFromCoords(lat, lng);
        },
        error => {
          console.error('Geolocation failed:', error);
        }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
    }
  }
getAddressFromCoords(lat: number, lng: number) {
  // store coordinates
 this.address.latitude = lat;
  this.address.longitude = lng;

  const url = 'https://nominatim.openstreetmap.org/reverse';

  const params = {
    format: 'jsonv2',
    lat: lat.toString(),
    lon: lng.toString()
  };

  const headers = new HttpHeaders({
    Accept: 'application/json',
    // ✅ REQUIRED by Nominatim (especially for mobile)
    'User-Agent': 'vitoxyz.com/0.0.0 (support@vitoxyz.com)'
  });

  this.http.get<any>(url, { params, headers }).subscribe({
    next: (response) => {
      if (response?.display_name) {
       this.address.mapSelectedAddress = response.display_name;
      }
    },
    error: (error) => {
      console.error('Reverse geocoding failed:', error);
    }
  });
}

searchAddressAndMoveMap(address: string): void {
  if (!address || address.length < 3) return;

  const url = 'https://nominatim.openstreetmap.org/search';

  const params = {
    format: 'json',
    q: address,
    limit: '1'
  };

  const headers = new HttpHeaders({
    Accept: 'application/json',
    'User-Agent': 'vitoxyz.com/0.0.0 (support@vitoxyz.com)'
  });

  this.http.get<any[]>(url, { params, headers }).subscribe({
    next: (res) => {
      if (!res?.length) return;

      const lat = parseFloat(res[0].lat);
      const lng = parseFloat(res[0].lon);

      // update form
      this.address.latitude = lat;
this.address.longitude = lng;

      // update map
      this.mapComponent?.setLocation(lat, lng);
    },
    error: err => console.error('Address search failed', err)
  });
}
  goBack() {
    this.router.navigate(['/']);
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
saveAddress() {

  if (!this.address.fullName ||
      !this.address.phone ||
      !this.address.pincode ||
      !this.address.state ||
      !this.address.city ||
      !this.address.house ||
      !this.address.area) {
    return;
  }
    console.log('Find pharmacist clicked');
const headers = this.getAuthHeaders();

  const payload = {
    fullName: this.address.fullName,
    phoneNumber: this.address.phone,
    addressLine1: this.address.house,
    addressLine2: this.address.area,
    landmark: '',
    city: this.address.city,
    state: this.address.state,
    pincode: this.address.pincode,
    addressType: this.address.type,
    isDefault: true,
    isaddress: true,
    latitude: this.address.latitude,
    longitude: this.address.longitude,
    useMapLocation: true,
    mapSelectedAddress: this.address.mapSelectedAddress
  };

  this.http.post<any>(
    `${API_URL}/address/add`,
    payload,{headers}
  ).subscribe(response => {

    if (response.status) {
      this.router.navigate(['/']);
    }

  });

}
}
