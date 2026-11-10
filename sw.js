/**
 * Charles' Bible - PWA Service Worker (sw.js)
 * 1단계(실시간 웹앱 알림) & 2단계(앱 종료 시 백그라운드 Web Push) 통합 처리
 */

const SW_VERSION = 'v9.7';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 2단계: 앱이 완전히 꺼져 있을 때 Google FCM / Apple APNs로부터 Web Push 수신
self.addEventListener('push', (event) => {
  let payload = {
    title: '찰스 바이블 🌿',
    body: '새로운 소식이나 응원이 도착했어요!',
    icon: './icon-192.png',
    badge: './favicon-32x32.png',
    tag: 'charles-push-' + Date.now(),
    url: './index.html?openMessages=1'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        title: parsed.title || payload.title,
        body: parsed.body || parsed.content || payload.body,
        icon: parsed.icon || payload.icon,
        badge: parsed.badge || payload.badge,
        tag: parsed.tag || payload.tag,
        url: parsed.url || payload.url
      };
    } catch (e) {
      const txt = event.data.text();
      if (txt) payload.body = txt;
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    vibrate: [200, 100, 200],
    renotify: true,
    data: {
      url: payload.url || './index.html?openMessages=1'
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// 휴대폰 알림창에서 알림 터치 시 웹앱 열기 및 알림함 모달 자동 오픈
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html?openMessages=1';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({ type: 'OPEN_MESSAGES_MODAL' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

