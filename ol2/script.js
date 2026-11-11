// FIREBASE SOZLAMALARI — Firebase Console'dan olingan qiymatlarni shu yerga yozing
// Shuningdek, o'zingizning `window.FIREBASE_CONFIG` obyekti hamdan foydalanishingiz mumkin.
const FB = window.FIREBASE_CONFIG || {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  databaseURL: ""
};

const real = !!FB &&
  !!FB.apiKey &&
  !!FB.projectId &&
  !String(FB.apiKey).includes('PASTE') &&
  typeof firebase !== 'undefined';

if (!real) {
  console.warn('Firebase konfiguratsiyasi topilmadi. Firebase Console -> Project settings -> Your apps -> Web app dan qiymatlarni kiriting.');
}

let db = null, au = null;
if (real) {
  firebase.initializeApp(FB);
  db = firebase.firestore();
  au = firebase.auth();
}
