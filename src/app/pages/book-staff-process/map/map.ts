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
  imports: [GoogleMapsModule]
})
export class MapComponent implements AfterViewInit, OnInit {
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
    map!: google.maps.Map;
  marker!: google.maps.Marker;
  userLat = 28.6139; // fallback
  userLng = 77.2090;
  // map: any;

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
    if (!this.map) {
      this.initMap();
    }
  }

 initMap(): void {
    if (!this.mapElement?.nativeElement || !google?.maps) return;

    const center = { lat: this.userLat, lng: this.userLng };

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center,
      zoom: 14
    });

    // ✅ SINGLE marker (reused)
    this.marker = new google.maps.Marker({
      position: center,
      map: this.map,
      draggable: false
    });

    // ✅ Map click
    this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      this.updateLocation(lat, lng);
    });
  }
  public setLocation(lat: number, lng: number): void {
  if (!this.map || !this.marker) return;

  const position = { lat, lng };

  this.marker.setPosition(position);
  this.map.panTo(position);
}

  private updateLocation(lat: number, lng: number): void {
    const position = { lat, lng };

    // ✅ Move marker
    this.marker.setPosition(position);

    // ✅ Move map view
    this.map.panTo(position);

    // ✅ Emit to parent
    this.locationSelected.emit(position);
  }
}

