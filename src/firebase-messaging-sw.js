importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js')

firebase.initializeApp({
    apiKey: "AIzaSyBzo5M9iMNNvMp1rgPBBFn1yV9wAckYS90",
    authDomain: "ashta-siddhanta-saram.firebaseapp.com",
    projectId: "ashta-siddhanta-saram",
    storageBucket: "ashta-siddhanta-saram.firebasestorage.app",
    messagingSenderId: "588931765727",
    appId: "1:588931765727:web:b6a3b9fd16a3950566a06a",
    measurementId: "G-Y8JJ8VM8RW"
  });

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/assets/icons/icon-192x192.png',
    }).catch(err => {
      console.error('Error showing notification:', err);
    });
});