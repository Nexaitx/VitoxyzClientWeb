import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../../footer/footer';
import { Header } from '../header/header';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-medicine',
  imports: [
    CommonModule,
    Footer,
    Header
  ],
  standalone: true,   // add if using standalone components
  templateUrl: './view-medicine.html',
  styleUrls: ['./view-medicine.scss']
})
export class ViewMedicine implements OnInit {
  private router: Router = inject(Router);
  private http: HttpClient = inject(HttpClient);

  medicine: { [label: string]: any } = {};
  cols: { id: string; label: string; type: string }[] = [];
  isLoaded = false;
  hasError = false;

  ngOnInit() {
    const sheetId = '1_y6cpj0wDj8u6KRz9YopVnvGp8qi7BgAhe3seH7-Ysk';
    const gid = '0';  // sheet/tab id
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

    this.http.get(url, { responseType: 'text' })
      .subscribe(raw => {
        const match = raw.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\)/);
        if (!match || match.length < 2) {
          console.error('Unexpected Google Sheets JSON response format');
          this.hasError = true;
          return;
        }
        const data = JSON.parse(match[1]);
        this.cols = data.table.cols as any[];
        const rows = data.table.rows as any[];

        if (rows.length > 0) {
          const firstRow = rows[0];
          this.medicine = {};
          this.cols.forEach((colDef, idx) => {
            const cell = firstRow.c[idx];
            // If cell is null or cell.v missing, you can fallback
            this.medicine[colDef.label] = cell && cell.v != null ? cell.v : 'N/A';
          });
        } else {
          // No rows
          this.hasError = true;
        }

        this.isLoaded = true;
      }, err => {
        console.error('Error fetching sheet data', err);
        this.hasError = true;
      });
  }

  goToMedicines() {
    this.router.navigate(['medicines']);
  }

  addToCart() {
    this.router.navigate(['cart']);
  }
}
