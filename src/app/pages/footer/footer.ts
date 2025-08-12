import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
year = new Date().getFullYear();

goToPlayStore() {
  window.open('https://play.google.com/store/apps/', '_blank');
}

goToAppStore() {
  window.open('https://apps.apple.com/app/id1234567890', '_blank');
}

}
