import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notification$ = new BehaviorSubject<Notification | null>(null);
  notification$ = this._notification$.asObservable();

  showSuccess(message: string, duration: number = 3000) {
    this._notification$.next({ message, type: 'success', duration });
    setTimeout(() => this.clear(), duration);
  }

  showError(message: string, duration: number = 5000) {
    this._notification$.next({ message, type: 'error', duration });
    setTimeout(() => this.clear(), duration);
  }

  clear() {
    this._notification$.next(null);
  }
}
