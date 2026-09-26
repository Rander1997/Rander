importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyA53KoefZuP2DkgzHXpHDNlB23DVuK503I",
    authDomain: "rander-43b8f.firebaseapp.com",
    projectId: "rander-43b8f",
    storageBucket: "rander-43b8f.firebasestorage.app",
    messagingSenderId: "45881930163",
    appId: "1:45881930163:web:985cc23d7dac31c957dbc6",
    measurementId: "G-EJGNEBYPR3"
  };

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية مع تخصيص اهتزاز فريد وتنبيه جذاب
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title || "متجر راندر";
    const notificationOptions = {
        body: payload.notification.body || "يوجد قصة جديدة بانتظارك!",
        icon: '/icon.png', 
        badge: '/badge.png', 
        vibrate: [200, 100, 200, 100, 400], 
        tag: 'story-notification', 
        requireInteraction: true, 
        data: { url: payload.notification.click_action || '/' }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// عند النقر على الإشعار في الهاتف، يتم فتح المتجر مباشرة
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
