import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { API_URL, ENDPOINTS } from '../const';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  readonly VAPID_PUBLIC_KEY =
    'BK1xDYZHhz8hjPEy4vKKAuTnjGvp6LQzzckyvfQiPT4VG0hrQRjURZIO7iRuGyCJyotFO5m4tN7TmOyBCr2HWnk';

  constructor(private swPush: SwPush, private http: HttpClient) {}

//   subscribeToNotifications() {
//     if (!this.swPush.isEnabled) {
//       console.log("Service Worker is not enabled");
//       return;
//     }

//     this.swPush.requestSubscription({
//       serverPublicKey: this.VAPID_PUBLIC_KEY
//     })
//     .then(sub => {
//       console.log("Subscription: ", sub);

//       // Send subscription to backend
//       this.http.post('/api/subscribe', sub).subscribe();
//     })
//     .catch(err => console.error("Could not subscribe", err));
//   }
subscribe() {
    if (!this.swPush.isEnabled) {
       console.log("Service Worker is not enabled");
       return;
     }
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      console.log("Subscription:", sub);
      this.http.post(`${API_URL}${ENDPOINTS.SUBSCRIBEAPI}`, sub)
        .subscribe(() => console.log("Subscription sent to server"));
    })
    .catch(err => console.error("Subscription error", err));
  }


}

 

