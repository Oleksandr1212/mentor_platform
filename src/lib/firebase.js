import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// TODO: Замініть на вашу актуальну конфігурацію проекту Firebase
// Ви можете отримати ці дані в Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyDaZZnQ-LRTyF9BQ_yA-jn1jWpRwp7txe8",
  authDomain: "mentor-2a62e.firebaseapp.com",
  projectId: "mentor-2a62e",
  storageBucket: "mentor-2a62e.firebasestorage.app",
  messagingSenderId: "1020422399470",
  appId: "1:1020422399470:web:0fa85e3cab6696851b9aff",
  measurementId: "G-9BQEW6GYGR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
