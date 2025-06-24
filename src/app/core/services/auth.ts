import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor() { }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  login(token: string, role?: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role || 'user');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
}
