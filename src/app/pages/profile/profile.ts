import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MobileFooterNavComponent } from "@src/app/layouts/mobile-footer-nav/mobile-footer-nav";

@Component({
  selector: 'app-profile',
  imports: [
    RouterLink,
    MobileFooterNavComponent
],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
editField: string | null = null; // which field is in edit mode

  startEdit(field: string) {
    this.editField = field;
  }

  submitEdit(field: string) {
    // save logic here (API call, etc.)
    console.log(`${field} updated!`);
    this.editField = null;
  }
}
