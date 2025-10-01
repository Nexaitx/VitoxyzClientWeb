import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { API_URL } from '@src/app/core/const';

@Component({
  selector: 'app-search-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-product.html',
  styleUrls: ['./search-product.scss']
})
export class SearchProductComponent {
  private searchTerms = new Subject<string>();
  results$: Observable<any[]> = of([]);
  searchTerm: string = '';

  @Output() productSelected = new EventEmitter<any>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.results$ = this.searchTerms.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => this.searchProducts(term))
    );
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.searchTerms.next(term);
  }

  searchProducts(term: string): Observable<any[]> {
    if (!term || term.length < 2) {
      return of([]);
    }

    const url = `${API_URL}/search?q=${term}&type=combined&page=0&size=20`;

    return this.http.get<any>(url).pipe(
      switchMap((res: any) => {
        // मान लो API response कुछ ऐसा आता है: { data: [...] }
        if (res && res.data && Array.isArray(res.data)) {
          return of(res.data);
        }
        return of([]);
      }),
      catchError(() => of([]))
    );
  }

  selectProduct(product: any) {
    this.productSelected.emit(product);
    this.searchTerm = '';
    this.results$ = of([]);
  }
}
