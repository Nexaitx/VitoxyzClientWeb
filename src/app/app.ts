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

  `
})
export class App {
  protected title = 'VitoxyzAdmin';
  time: Date | null = null;
  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);
  token = localStorage.getItem('authToken')
  constructor(private pushService: PushNotificationService) {}
  ngOnInit() { 
    //  this.pushService.subscribeToNotifications();
    this.pushService.subscribe();
  }
}
