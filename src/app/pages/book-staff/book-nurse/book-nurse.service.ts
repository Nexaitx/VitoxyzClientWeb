import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookNurseService {
  constructor(private http: HttpClient) {}

  searchStaff(apiUrl: string, payload: any): Observable<any> {
    return this.http.post<any>(apiUrl, payload);
  }
}
