import { Component } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-locate-nurse',
  imports: [GoogleMapsModule ],
  templateUrl: './locate-nurse.html',
  styleUrl: './locate-nurse.scss'
})
export class LocateNurse {
center: google.maps.LatLngLiteral = { lat: 34.052235, lng: -118.243683 }; // Example: Los Angeles
          zoom = 12;
}
