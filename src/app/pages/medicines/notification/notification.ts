import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '@src/app/core/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div *ngIf="notificationService.notification$ | async as notification" 
         class="notification"
         [class]="'notification--' + notification.type">
      <div class="notification-content">
        <mat-icon class="notification-icon">
          {{ getIcon(notification.type) }}
        </mat-icon>
        <span class="notification-message">{{ notification.message }}</span>
        <button class="notification-close" (click)="clear()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      min-width: 300px;
      max-width: 500px;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }

    .notification--success {
      background: #4caf50;
      color: white;
    }

    .notification--error {
      background: #f44336;
      color: white;
    }

    .notification--warning {
      background: #ff9800;
      color: white;
    }

    .notification--info {
      background: #2196f3;
      color: white;
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notification-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .notification-message {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }

    .notification-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationComponent {
  
  constructor(public notificationService: NotificationService) {}

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type] || 'info';
  }

  clear() {
    this.notificationService.clear();
  }
}
