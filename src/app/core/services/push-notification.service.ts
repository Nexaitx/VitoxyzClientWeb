import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '../const';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '@src/environments/environment.development';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private firebaseApp = initializeApp(environment.firebase);
  private messaging = getMessaging(this.firebaseApp);
  private backendUrl = `${API_URL}${ENDPOINTS.SUBSCRIBEAPI}`; // change to your backend base UR
  // readonly VAPID_PUBLIC_KEY =
  //   'BK1xDYZHhz8hjPEy4vKKAuTnjGvp6LQzzckyvfQiPT4VG0hrQRjURZIO7iRuGyCJyotFO5m4tN7TmOyBCr2HWnk';

  // constructor(private swPush: SwPush, private http: HttpClient) {}
constructor(private http: HttpClient) {}
async requestPermission(): Promise<string | null> {

    console.log("[Push] Requesting browser notification permission...");

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn("[Push] Permission denied.");
      return null;
    }

    return this.getFcmToken();
  }

  // -------------------------------
  // Get FCM Token
  // -------------------------------
  async getFcmToken(): Promise<string | null> {
    try {
      console.log("[Push] Fetching FCM Token...");

      // Register firebase-messaging-sw.js
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      console.log("[Push] SW registered: ", registration.scope);

      const token = await getToken(this.messaging, {
        vapidKey: environment.fcmVapidKey,
        serviceWorkerRegistration: registration
      });

      console.log("[Push] FCM Token =", token);

      if (!token) {
        console.warn("[Push] FCM token is NULL");
        return null;
      }

      return token;

    } catch (err) {
      console.error("[Push] Error fetching FCM token:", err);
      return null;
    }
  }

  // -------------------------------
  // Foreground notifications
  // -------------------------------
  listen() {
    onMessage(this.messaging, payload => {
      console.log("[Push] Foreground message received:", payload);
    });
  }
// subscribe() {
//     if (!this.swPush.isEnabled) {
//        console.log("Service Worker is not enabled");
//        return;
//      }
//     this.swPush.requestSubscription({
//       serverPublicKey: this.VAPID_PUBLIC_KEY
//     })
//     .then(sub => {
//       console.log("Subscription:", sub);
//       this.http.post(`${API_URL}${ENDPOINTS.SUBSCRIBEAPI}`, sub)
//         .subscribe(() => console.log("Subscription sent to server"));
//     })
//     .catch(err => console.error("Subscription error", err));
//   }
// async requestPermissionAndSave(userId: number | string) : Promise<string | null> {
//     try {
//       const permission = await Notification.requestPermission();
//       if (permission !== 'granted') {
//         console.warn('Notification permission not granted');
//         return null;
//       }
//          // Register the firebase SW at the app root if not yet registered
//       // IMPORTANT: firebase-messaging-sw.js must be available at the root URL
//       let registration: ServiceWorkerRegistration | undefined;
//       if ('serviceWorker' in navigator) {
//         try {
//           // Register at root - ensure this file is copied to dist root (see instructions below)
//           registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
//           console.log('Service worker registration successful:', registration.scope);
//         } catch (swErr) {
//           console.warn('Service worker registration failed:', swErr);
//         }
//       }
//       const token = await getToken(this.messaging, { vapidKey: environment.fcmVapidKey ,serviceWorkerRegistration: registration});
//       if (!token) {
//         console.warn('No registration token available. Request permission to generate one.');
//         return null;
//       }

//       // send token to backend to save (associate with userId)
//       // send token to backend to save (associate with userId)
//       try {
//         await firstValueFrom(this.http.post(`${this.backendUrl}/save-token`, { userId, token }));
//         console.log('Saved token to backend:', token);
//       } catch (err) {
//         console.error('Failed to save token to backend:', err);
//       }

//       return token;
//     } catch (err) {
//       console.error('Error requesting permission or fetching token', err);
//       return null;
//     }
//   }

//   listenMessages() {
//     onMessage(this.messaging, (payload) => {
//       console.log('Message received. ', payload);
//       // You can show in-app toast/notification here
//         const title = payload.notification?.title || 'Notification';
//       const body = payload.notification?.body || '';
//       // show a simple notification (will NOT appear when browser tab is unfocused/background)
//       try {
//         new Notification(title, { body });
//       } catch (err) {
//         console.warn('Unable to show Notification via Notification API:', err);
//       }
//     });
//   }

//   // Optional: remove token delete endpoint
//   async deleteToken(token: string) {
//     return firstValueFrom(this.http.post(`${this.backendUrl}/delete-token`, { token }));
//   }

}

 

