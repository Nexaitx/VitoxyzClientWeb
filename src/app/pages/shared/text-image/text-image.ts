import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-text-image',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './text-image.html',
  styleUrls: ['./text-image.scss']
})
export class TextImageComponent {
  @Input() imageUrl: string = '';
  @Input() imageAlt: string = 'Image';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() description: string = '';
  @Input() buttonText: string = '';
  @Input() buttonLink: string = '#';
  @Input() reverse: boolean = false;
  @Input() backgroundColor: string = 'transparent';
  @Input() textColor: string = 'inherit';
  @Input() buttonType: 'primary' | 'secondary' | 'outline' = 'primary';
}