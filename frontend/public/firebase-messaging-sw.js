importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyDmFbma9cdB7e7wOq1C-jSqVjVqGziSXD8",
    authDomain: "medsense-a43ee.firebaseapp.com",
    projectId: "medsense-a43ee",
    storageBucket: "medsense-a43ee.firebasestorage.app",
    messagingSenderId: "393460843097",
    appId: "1:393460843097:web:ca596bdc3a5ff4c9afa748"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});