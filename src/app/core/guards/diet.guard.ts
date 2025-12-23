import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_URL } from '../const';

@Injectable({ providedIn: 'root' })
export class DietGuard implements CanActivate {

  private CHECK_DIET_API = `${API_URL}/user/active/my-all-dietplans`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {

    const token = localStorage.getItem('authToken');

    // 🔒 Not logged in → onboarding
    if (!token) {
      return of(this.router.createUrlTree(['diet/user-onboarding']));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(this.CHECK_DIET_API, { headers }).pipe(
      map(res => {
        const plans = res?.dietPlans ?? [];

        // ✅ Has active/bought plan
        if (plans.length > 0) {
          // ✅ FIXED PATH
          return this.router.createUrlTree(['diet-charts']);
        }

        // ❌ No plan
        return this.router.createUrlTree(['diet/user-onboarding']);
      }),
      catchError(() =>
        of(this.router.createUrlTree(['diet/user-onboarding']))
      )
    );
  }
}
