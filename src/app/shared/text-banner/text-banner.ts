import { Component, EventEmitter, Output } from '@angular/core';
import {  Input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-text-banner',
  imports: [CommonModule],

  templateUrl: './text-banner.html',
  styleUrl: './text-banner.scss'
})
export class TextBanner {
  @Input() image: string = '';            // Banner background image
  @Input() title: string = 'Your Title';  // Heading text
  @Input() subtitle: string = '';         // Subtext
  @Input() buttonText: string = 'Click';  // Button label
   @Input() buttonLink: string = '/book-staff';


   @Output() buttonClick = new EventEmitter<void>();

  onButtonClick() {
    this.buttonClick.emit();
  }
}
