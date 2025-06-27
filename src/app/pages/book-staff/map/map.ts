import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { environment } from '../../../../environments/environment.development';

declare const google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrls: ['./map.scss'],
  imports: [GoogleMapsModule]
})
export class MapComponent implements AfterViewInit, OnInit {
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;

  userLat = 28.6139; // fallback
  userLng = 77.2090;
  map: any;

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLat = position.coords.latitude;
          this.userLng = position.coords.longitude;
          this.initMap();
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.initMap(); // Load with fallback
        }
      );
    } else {
      console.warn('Geolocation not supported');
      this.initMap();
    }
  }

  ngAfterViewInit(): void {
    if (!navigator.geolocation) {
      this.initMap(); // fallback if geolocation not supported
    }
  }

  initMap(): void {
    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: this.userLat, lng: this.userLng },
      zoom: 12
    });

    new google.maps.Marker({
      map: this.map,
      position: { lat: this.userLat, lng: this.userLng },
      title: 'You are here'
    });

    // Click listener to get coordinates
    this.map.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      alert(`Clicked location:\nLatitude: ${lat}\nLongitude: ${lng}`);
    });
  }
}

