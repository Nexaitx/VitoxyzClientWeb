import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  searchQuery: string = '';
  selectedLocation: string = 'Chandigarh'; // default

  constructor(private router: Router) {}

  onSearch() {
    if (!this.searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
  }
}
