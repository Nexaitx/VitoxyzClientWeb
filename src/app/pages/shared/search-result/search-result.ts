import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { API_URL } from '@src/app/core/const';
import { Footer } from "../../footer/footer";

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [CommonModule, Footer],
  templateUrl: './search-result.html',
  styleUrls: ['./search-result.scss']
})
export class SearchResultComponent implements OnInit {
  medicines: any[] = [];
  query: string = '';
  loading = true;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

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
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.medicines = res?.data?.medicines || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.loading = false;
      }
    });
  }

  // ✅ navigate to detail
  goToMedicine(med: any) {
    this.router.navigate([`/medicine/${med.productId}`], {
      queryParams: { type: 'health' } // yaa 'otc' depending on API response
    });
  }

  getFirstImage(images: string[]): string {
    if (!images || images.length === 0) return 'assets/img/default.png';
    return images[0].split('|')[0].trim();
  }
}
