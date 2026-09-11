import { Component } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';

import { SpinnerToastComponent } from "./core/toasts/spinner-toast/spinner-toast.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatSupport } from './pages/chat-support/chat-support';
import { NotificationComponent } from './pages/medicines/notification/notification';
import { PushNotificationService } from './core/services/push-notification.service';
import { NavigationLoader } from './components/navigation-loader/navigation-loader';
import { NavigationLoaderService } from './core/services/navigation-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    ChatSupport,
    NotificationComponent,
    NavigationLoader
  ],

  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected title = 'VitoxyzAdmin';

  time: Date | null = null;

  defaultOpenValue = new Date(0, 0, 0, 0, 0, 0);

  token = localStorage.getItem('authToken');

  constructor(
    private notif: PushNotificationService,
    private router: Router,
    private navigationLoader: NavigationLoaderService
  ) {}

  ngOnInit(): void {

    console.log('[App] ngOnInit: starting');

    // =========================
    // PUSH NOTIFICATIONS
    // =========================

    try {

      this.notif.listen();

      console.log('[App] listenMessages() called');

    } catch (err) {

      console.error(
        '[App] listenMessages failed:',
        err
      );

    }


    // =========================
    // ROUTER LOADING
    // =========================

    this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {

        this.navigationLoader.show();

      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {

        this.navigationLoader.hide();

      }

    });

  }


  enable(): void {

    console.log(
      '[App] enable() pressed — requesting permission'
    );

    this.notif.requestPermission()
      .then(token => {

        console.log(
          '[App] requestPermission returned:',
          token
        );

        if (!token) {

          console.warn(
            '[App] No token received. Check SW errors.'
          );

        } else {

          console.log(
            '[App] FCM token acquired:',
            token
          );

        }

      })
      .catch(err => {

        console.error(
          '[App] requestPermission threw:',
          err
        );

      });

  }

}