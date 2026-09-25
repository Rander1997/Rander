importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية مع تخصيص اهتزاز فريد وتنبيه جذاب
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title || "متجر راندر";
    const notificationOptions = {
        body: payload.notification.body || "يوجد قصة جديدة بانتظارك!",
        icon: '/icon.png', // تأكد من مسار الأيقونة لديك
        badge: '/badge.png', // أيقونة صغيرة تظهر في شريط الإشعارات
        // نمط اهتزاز فريد ومميز (نبضتان قصيرتان ثم نبضة طويلة لجذب الانتباه)
        vibrate: [200, 100, 200, 100, 400], 
        tag: 'story-notification', // لكي لا تتراكم الإشعارات وتستبدل ببعضها
        requireInteraction: true, // يبقى الإشعار ظاهراً حتى يتفاعل معه الزبون
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
