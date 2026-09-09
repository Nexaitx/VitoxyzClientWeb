import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

  year = new Date().getFullYear();

  goToPlayStore(): void {
    window.open(
      'https://play.google.com/store/apps/',
      '_blank'
    );
  }

  goToAppStore(): void {
    window.open(
      'https://apps.apple.com/app/id1234567890',
      '_blank'
    );
  }

}