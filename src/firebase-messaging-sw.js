
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDujboFt_5CS8y1EH7EN5Kzdof0cZbnXaw",
  authDomain: "vitoxyzclientweb.firebaseapp.com",
  projectId: "vitoxyzclientweb",
  storageBucket: "vitoxyzclientweb.firebasestorage.app",
  messagingSenderId: "675568857186",
  appId: "1:675568857186:web:0a1f84cec64e7f8f0be13b"
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