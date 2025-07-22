import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { environment } from '../../../../environments/environment.development';

declare const google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrls: ['./map.scss'],
  standalone: true,
  imports: [GoogleMapsModule]
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
  userLat = 28.6139;
  userLng = 77.2090;
  map: any;

  ngAfterViewInit(): void {
    this.loadGoogleMaps();
  }

  loadGoogleMaps(): void {
    if (typeof google === 'undefined') {
      // Load Google Maps API if not already loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&loading=async&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => this.initMap();
      document.head.appendChild(script);
    } else {
      this.initMap();
    }
  }

  initMap(): void {
    if (!this.mapElement?.nativeElement) {
      console.error('Map element not found');
      return;
    }

    if (!google?.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: this.userLat, lng: this.userLng },
      zoom: 12
    });

   const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
  map: this.map,
  position: { lat: this.userLat, lng: this.userLng },
  title: 'You are here'
});


    this.map.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      this.locationSelected.emit({ lat, lng });
    });
  }
}
