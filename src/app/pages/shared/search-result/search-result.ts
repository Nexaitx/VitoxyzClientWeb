import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { API_URL } from '@src/app/core/const';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-result.html',
  styleUrls: ['./search-result.scss']
})
export class SearchResultComponent implements OnInit {
  query: string = '';
  medicines: any[] = [];
  loading = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) {
        this.fetchResults(this.query);
      }
    });
  }

  fetchResults(query: string) {
    this.loading = true;
    const url = `${API_URL}/search?q=${query}&type=combined&page=0&size=20`; 
        // for testing


    // const url = `http://localhost:8080/api/search?q=${query}&type=combined&page=0&size=20`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.medicines = res.data?.medicines || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.loading = false;
      }
    });
  }

  getFirstImage(images: string[]): string {
    if (!images?.length) return 'https://via.placeholder.com/150';
    return images[0].split('|')[0].trim();
  }
}
