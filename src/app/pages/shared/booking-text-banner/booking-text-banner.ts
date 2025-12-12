import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-booking-text-banner',
  imports: [CommonModule],
  templateUrl: './booking-text-banner.html',
  styleUrl: './booking-text-banner.scss',
})
export class BookingTextBanner {
    @Input() image: string = '';            // Banner background image
    @Input() title: string = 'Your Title';  // Heading text
    @Input() subtitle: string = '';         // Subtext
    @Input() buttonText: string = 'Click';  // Button label
    //  @Input() buttonLink: string = '/book-staff';
  
  
     @Output() buttonClick = new EventEmitter<void>();
  
    onButtonClick() {
      this.buttonClick.emit();
    }

}
