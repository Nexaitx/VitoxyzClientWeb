import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinnerToastComponent } from "./core/toasts/spinner-toast/spinner-toast.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatSupport } from './pages/chat-support/chat-support';
import { NotificationComponent } from './pages/medicines/notification/notification';
import { PushNotificationService } from './core/services/push-notification.service';

@Component({
  selector: 'app-root',
    standalone: true,

  imports: [RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    ChatSupport,RouterOutlet, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  template: `
      <router-outlet></router-outlet>

      <app-notification></app-notification>
    <div style="position:fixed; right:16px; bottom:16px; z-index:10000;">
      <button class="btn btn-primary" (click)="enable()" type="button">Enable Notifications</button>
    </div>
  `
})
export class App {
  protected title = 'VitoxyzAdmin';
  time: Date | null = null;
  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);
  token = localStorage.getItem('authToken')
  constructor(private notif: PushNotificationService) {}
  // ngOnInit() { 
  //   //  this.pushService.subscribeToNotifications();
  //   // this.pushService.subscribe();
  // }
    ngOnInit() {
   console.log('[App] ngOnInit: starting');          // <-- confirm component boots
    try {
      this.notif.listen();
      console.log('[App] listenMessages() called');
    } catch (err) {
      console.error('[App] listenMessages failed:', err);
    }
  }

 enable() {
  console.log('[App] enable() pressed — requesting permission');

  this.notif.requestPermission().then(token => {
    console.log('[App] requestPermission returned:', token);

    if (!token) {
      console.warn('[App] No token received. Check SW errors.');
    } else {
      console.log('[App] FCM token acquired:', token);
    }
  })
  .catch(err => {
    console.error('[App] requestPermission threw:', err);
  });
}
}
