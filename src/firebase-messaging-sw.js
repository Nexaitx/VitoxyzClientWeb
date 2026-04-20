
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA7T4I991z3Cl-5tlPyz79igpLkKWaNzDI",
  authDomain: "nexaitxclient.firebaseapp.com",
  projectId: "nexaitxclient",
  storageBucket: "nexaitxclient.firebasestorage.app",
  messagingSenderId: "675568857186",
  appId: "1:377640293333:web:47b6b851d7f3e842bde35c",
  measurementId: "G-RGQFPXFWB0"

});

const messaging = firebase.messaging();

// optional: background message handler
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const title = (payload.notification && payload.notification.title) || payload.data?.title || 'New Notification';
  const body = (payload.notification && payload.notification.body) || payload.data?.body || '';
  const icon = payload.notification?.icon || '/assets/icons/icon-192x192.png';
  const url = payload.data?.url || '/';

  const options = {
    body,
    icon,
    data: { url },
  };

  self.registration.showNotification(title, options);
});

// Generic push event fallback (when push data is raw)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'New Notification', body: event.data?.text() || '' };
  }

  const title = data.title || 'New Notification';
  const body = data.body || '';
  const url = data.url || '/';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/assets/icons/icon-192x192.png',
      data: url,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data || '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then(windowClients => {
    for (let client of windowClients) {
      if (client.url === url && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(url);
    }
  }));
}); 

//Log the received push message in the service worker console
  try {
    console.log('[firebase-messaging-sw] push event received:', data);
  } catch (e) {}
 
  // Send message to all client pages (Angular app)
  self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
    clients.forEach(client => {
      // Post the entire payload so the app can inspect notification + custom data
      try {
        client.postMessage({ from: 'service-worker', payload: data });
      } catch (e) {}
    });
  });
 
  // Show Notification (use payload.notification if present)
  const notif = data.notification || { title: 'New Notification', body: '' };
  event.waitUntil(
    self.registration.showNotification(notif.title, {
      body: notif.body,
      data: data.data || {}
    })
  );
