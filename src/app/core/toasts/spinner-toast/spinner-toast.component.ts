// spinner-toast.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerToastService } from './spinner-toast.service';

@Component({
  standalone: true,
  selector: 'app-spinner-toast',
  imports: [CommonModule],
  templateUrl: './spinner-toast.component.html',
  styleUrls: ['./spinner-toast.component.scss']
})
export class SpinnerToastComponent {
  isLoading = false;

  constructor(private spinnerService: SpinnerToastService) {
    this.spinnerService.loading$.subscribe(status => this.isLoading = status);
  }
}
