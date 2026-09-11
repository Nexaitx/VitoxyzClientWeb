import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationLoaderService } from '../../core/services/navigation-loader.service';

@Component({
  selector: 'app-navigation-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation-loader.html',
  styleUrl: './navigation-loader.scss'
})
export class NavigationLoader {

  loading$;

  constructor(
    private loader: NavigationLoaderService
  ) {
    this.loading$ = this.loader.loading$;
  }

}