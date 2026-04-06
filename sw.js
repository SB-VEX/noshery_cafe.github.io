const CACHE = 'noshery-v1';

/* Install — cache core assets */
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/', '/index.html']).catch(() => {})
    )
  );
});

/* Activate */
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

/* Fetch — network first, fallback to cache */
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

/* Push notification received */
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'The Noshery';
  const options = {
    body: data.body || 'Your order is ready for collection!',
    icon: data.icon || '/noshery_cafe.github.io/icon.png',
    badge: data.badge || '/noshery_cafe.github.io/icon.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'order-ready',
    requireInteraction: true,
    actions: [
      { action: 'directions', title: '📍 Get Directions' },
      { action: 'dismiss',    title: 'Dismiss' }
    ],
    data: { url: data.url || '/noshery_cafe.github.io/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

/* Notification click */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'directions') {
    e.waitUntil(clients.openWindow('https://maps.google.com/?q=491A+London+Road+Isleworth+TW7+4DA'));
  } else {
    e.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
        if (cs.length > 0) { cs[0].focus(); return; }
        clients.openWindow(e.notification.data.url || '/');
      })
    );
  }
});

/* Show notification from page (triggered by postMessage) */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = e.data;
    self.registration.showNotification(title || 'The Noshery', {
      body: body || 'Your order is ready for collection!',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'order-ready',
      requireInteraction: true,
      actions: [
        { action: 'directions', title: '📍 Get Directions' }
      ]
    });
  }
});
